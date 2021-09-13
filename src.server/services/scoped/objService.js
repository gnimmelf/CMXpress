const debug = require('debug')('mf:service:objService');
const Ajv = require('ajv');
const jsonPointer = require('js-pointer');
const slug = require('slug');
const {
  maybeThrow,
  dotProp,
  objDiff,
  deepAssign,
  makeSchemaName,
  makeMapKey,
} = require('../../lib/utils');

module.exports = ({ dbService, schemaService }) => {

  // TODO! Fixme, needs to be dynamic to reflect updates to the site-data...
  const siteSettings = Object.freeze({
    ...dbService.site.get('settings.public.json', { raw: true }),
    ...dbService.site.get('settings.private.json', { raw: true }),
  });

  return {

    makeMapKey,

    getSiteSettings: (propPath = null) => {
      // NOTE! Direct access! -Only for internal use!
      return propPath
        ? dotProp.get(siteSettings, propPath)
        : siteSettings
    },

    getObjectIds: (dbKey, { schemaNameSuffix }, { owner = null, noAuth = false } = {}) => {
      debug('getObjectIds', { dbKey, schemaNameSuffix, owner })

      const schemaName = makeSchemaName(dbKey, schemaNameSuffix);

      return schemaService.getSchema(schemaName, 'read', { owner, noAuth })
        .then(schema => {

          const mapKey = (owner ? owner.userId + '/' : '') + schemaNameSuffix;

          const data = dbService[dbKey].get(mapKey);

          return data ? Object.keys(data) : [];
        });
    },

    getObj: (dbKey, { schemaNameSuffix, objId, propPath, raw }, { owner = null, noAuth = false } = {}) => {
      debug('getObj >', { dbKey, schemaNameSuffix, objId, propPath, owner });

      const schemaName = makeSchemaName(dbKey, schemaNameSuffix);

      return schemaService.getSchema(schemaName, 'read', { owner, noAuth })
        .then(schema => {

          const mapKey = makeMapKey(
            owner?.userId,
            schemaNameSuffix || schemaName,
            objId
          );

          debug('getObj', mapKey);

          const data = dbService[dbKey].get(mapKey, propPath, { raw: !!parseInt(raw) });

          maybeThrow(!data, `ObjId '${objId}' not found`, 404);

          return data;
        });
    },

    createObj: (dbKey, data, { schemaNameSuffix } = {}, { owner = null, noAuth = false } = {}) => {
      debug('createObj >', { data, dbKey, schemaNameSuffix, owner, noAuth });

      const schemaName = makeSchemaName(dbKey, schemaNameSuffix);

      return schemaService.getSchema(schemaName, 'create', { owner, noAuth })
        .then(schema => {
          // Validate `data` vs `schema`
          const ajv = schemaService.ajvFactory();
          const isValid = ajv.validate(schema, data);
          maybeThrow(!isValid, ajv.errors, 400);

          // Set `objId` based on `idProperty`
          const idPropertyValue = jsonPointer.get(data, schema.idProperty);
          const objId = slug(idPropertyValue.toLowerCase());
          maybeThrow(!objId, `Expected "${schema.idProperty}" to create objId`, 400);

          const mapKey = makeMapKey(
            owner?.userId,
            schemaNameSuffix || schemaName,
            objId
          );

          debug('createObj >', { schemaName, idProperty: schema.idProperty, idPropertyValue, mapKey })

          // Check if `objId` already exists
          maybeThrow(dbService[dbKey].get(mapKey), `objId '${idPropertyValue}' already exists`, 400);

          // Update Db
          const success = dbService[dbKey].set(mapKey, data);
          maybeThrow(!success, 'Could not create object', 424);

          // Write commits to disk
          dbService[dbKey].push();

          // Return data
          return {
            created: {
              objId: objId,
              data: data,
            }
          };
        });
    },

    updateObj: (dbKey, data, { schemaNameSuffix, objId, propPath = null }, { owner = null, noAuth = false } = {}) => {
      debug('updateObj >', data, dbKey, schemaNameSuffix, owner);

      const schemaName = makeSchemaName(dbKey, schemaNameSuffix);

      return schemaService.getSchema(schemaName, 'update', { owner, noAuth })
        .then(schema => {

          const mapKey = makeMapKey(
            owner?.userId,
            schemaNameSuffix || schemaName,
            objId
          );

          // Get object-clone from db
          const dbObj = dbService[dbKey].get(mapKey, { clone: true });

          // Check that it exists
          maybeThrow(!dbObj, `ObjId '${objId}' not found`, 404);

          // Saturate `data`
          if (propPath) {

            // Extract `value` from `data`, or use entire `data`-object when `value`-prop not found
            const value = dotProp.set({}, propPath, data.value || data);

            debug('updateObj', 'propPath', `${propPath} = ${value}`);

            data = deepAssign({}, dbObj, value);
          }
          else {
            data = deepAssign({}, dbObj, data);
          }

          // Validate saturated `data` vs `schema`
          const ajv = schemaService.ajvFactory();
          const isValid = ajv.validate(schema, data);
          maybeThrow(!isValid, ajv.errors, 400);

          // Update Db
          const success = dbService[dbKey].set(mapKey, data);
          maybeThrow(!success, 'Could not update object', 424);

          // Write commits to disk
          dbService[dbKey].push();

          // Return updated data
          return {
            updated: {
              data: objDiff.updatedDiff(dbObj, data),
              objId: objId,
            }
          };;
        });
    },

    deleteObj: (dbKey, { schemaNameSuffix, objId, propPath }, { owner = null, noAuth = false } = {}) => {
      debug('deleteObj >', data, dbKey, schemaNameSuffix, owner);

      const schemaName = makeSchemaName(dbKey, schemaNameSuffix);

      return schemaService.getSchema(schemaName, 'delete', { owner, noAuth })
        .then(schema => {

          const mapKey = makeMapKey(
            owner?.userId,
            schemaNameSuffix || schemaName,
            objId
          );

          // Get object-clone from db
          const dbObj = dbService[dbKey].get(mapKey, { clone: true });

          // Check that it exists
          maybeThrow(!dbObj, `ObjId '${objId}' not found`, 404);

          if (propPath) {
            // De-saturate `dbObj` by deleting `propPath`
            dotProp.delete(dbObj, propPath)

            // Validate `dbObj` vs `schema`
            const isValid = ajv.validate(schema, dbObj);
            maybeThrow(!isValid, ajv.errors, 400);
          }

          // Update Db
          const success = dbService[dbKey].delete(mapKey, propPath);
          maybeThrow(!success, 'Could not delete object', 424);

          // Write commits to disk
          dbService[dbKey].push();

          return success;
        });

    },

  };

};