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

const PUBLIC_SETTINGS_PATH = 'settings.public.json'
const PRIVATE_SETTINGS_PATH = 'settings.private.json'

module.exports = ({ dbService, schemaService }) => {


  const makeObjPath = () => {

  }


  return {

    getSiteSettings: (propPath = null) => {
      // NOTE! Direct access! -Only for internal use!
      const siteSettings = {
        ...dbService.site.get(PUBLIC_SETTINGS_PATH, { primitivesAsObj: false }),
        ...dbService.site.get(PRIVATE_SETTINGS_PATH, { primitivesAsObj: false }),
      };
      return propPath
        ? dotProp.get(siteSettings, propPath)
        : siteSettings
    },

    getObjectIds: (mapKey, { schemaPath }, { owner = null, noAuth = false } = {}) => {
      debug('getObjectIds', { mapKey, schemaPath, owner })

      const schemaName = makeSchemaName(mapKey, schemaPath);

      return schemaService.getSchema(schemaName, 'read', { owner, noAuth })
        .then(schema => {

          const dbPath = (owner ? owner.userId + '/' : '') + schemaPath;

          const data = dbService[mapKey].get(dbPath);

          return data ? Object.keys(data) : [];
        });
    },

    getObj: (mapKey, { schemaPath, objId, propPath }, { owner = null, noAuth = false } = {}) => {
      debug('getObj >', { mapKey, schemaPath, objId, propPath, owner });

      const schemaName = makeSchemaName(mapKey, schemaPath);

      return schemaService.getSchema(schemaName, 'read', { owner, noAuth })
        .then(schema => {

          const dbPath = (owner ? owner.userId + '/' : '') + (schemaPath || schemaName) + (objId ? addFileExt('/' + objId) : '');

          debug('getObj', dbPath);

          const data = dbService[mapKey].get(dbPath, propPath);

          maybeThrow(!data, `ObjId '${objId}' not found`, 404);

          return data;
        });
    },

    createObj: (mapKey, data, { schemaPath } = {}, { owner = null, noAuth = false } = {}) => {
      debug('createObj >', { data, mapKey, schemaPath, owner, noAuth });

      const schemaName = makeSchemaName(mapKey, schemaPath);

      return schemaService.getSchema(schemaName, 'create', { owner, noAuth })
        .then(schema => {
          // Validate `data` vs `schema`
          const ajv = schemaService.ajvFactory();
          const isValid = ajv.validate(schema, data);
          maybeThrow(!isValid, ajv.errors, 400);

          // TODO! Figure out if this is smart even if the `idProperty` is later updated...
          // Set `objId` based on `idProperty`
          const idPropertyValue = jsonPointer.get(data, schema.idProperty);
          const objId = slug(idPropertyValue.toLowerCase());
          maybeThrow(!objId, `Expected "${schema.idProperty}" to create objId`, 400);

          const dbPath = (owner ? owner.userId + '/' : '') + (schemaPath || schemaName) + addFileExt('/' + objId);

          debug('createObj >', { schemaName, idProperty: schema.idProperty, idPropertyValue, dbPath })

          // Check if `objId` already exists
          maybeThrow(dbService[mapKey].get(dbPath), `objId '${idPropertyValue}' already exists`, 400);

          // Update Db
          const success = dbService[mapKey].set(dbPath, data);
          maybeThrow(!success, 'Could not create object', 424);

          // Write commits to disk
          dbService[mapKey].push();

          // Return data
          return {
            created: {
              objId: objId,
              data: data,
            }
          };
        });
    },

    updateObj: (mapKey, data, { schemaPath, objId, propPath = null }, { owner = null, noAuth = false } = {}) => {
      debug('updateObj >', data, mapKey, schemaPath, owner);

      const schemaName = makeSchemaName(mapKey, schemaPath);

      return schemaService.getSchema(schemaName, 'update', { owner, noAuth })
        .then(schema => {

          const dbPath = (owner ? owner.userId + '/' : '') + (schemaPath || schemaName) + addFileExt('/' + objId);

          const dbObj = dbService[mapKey].get(dbPath);

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
          const success = dbService[mapKey].set(dbPath, data);
          maybeThrow(!success, 'Could not update object', 424);

          // Write commits to disk
          dbService[mapKey].push();

          // Return updated data
          return {
            updated: {
              data: objDiff.updatedDiff(dbObj, data),
              objId: objId,
            }
          };;
        });
    },

    deleteObj: (mapKey, { schemaPath, objId, propPath }, { owner = null, noAuth = false } = {}) => {
      debug('deleteObj >', data, mapKey, schemaPath, owner);

      const schemaName = makeSchemaName(mapKey, schemaPath);

      return schemaService.getSchema(schemaName, 'delete', { owner, noAuth })
        .then(schema => {

          const dbPath = (owner ? owner.userId + '/' : '') + (schemaPath || schemaName) + addFileExt('/' + objId);

          // Get object-clone from db
          const dbObj = dbService[mapKey].get(dbPath, { clone: true });

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
          const success = dbService[mapKey].delete(dbPath, propPath);
          maybeThrow(!success, 'Could not delete object', 424);

          // Write commits to disk
          dbService[mapKey].push();

          return success;
        });

    },

  };

};