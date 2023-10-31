const debug = require('debug')('cmx:service:schemaService');
const { join, relative } = require('path');
const assert = require('assert');
const $RefParser = require('json-schema-ref-parser');
const minimatch = require('minimatch');
const Ajv = require('ajv');
const draft06 = require('ajv/lib/refs/json-schema-draft-06.json');
const {
  maybeThrow,
  makeSchemaName,
  makeMapKey,
} = require('../../lib/utils');

const getRelFsPath = (fsPath) => relative(process.cwd(), fsPath);

module.exports = ({ dbService, accessService, userService }) =>
/*
  IMPORTANT!
  `getSchema` *must* dereference relative on the filesystem, but `getSchemaNames` *must* use the `dbService`.
  1. If `getSchema` dereferencing (`$RefParser`) uses the `dbService`, the `cwd` will not match relative schema-paths.
  2. This also makes the schemas starting with "." hidden, but parsable due to the `ignored: /(^|[\/\\])\../` db-setting behind `dbService`
*/ {
  const schemaDb = dbService.schema;

  const ajvFactory = (ajvOptions = {}) => {
    const ajv = new Ajv({
      allErrors: true,
      jsonPointers: true,
      removeAdditional: true,
      ...ajvOptions,
    });
    // TODO! Make into an option
    ajv.addMetaSchema(draft06);
    return ajv;
  };

  return {

    makeSchemaName,

    ajvFactory,

    getSchema: (schemaName, operation = 'read', { owner = null, noAuth = false } = {}) => {
      return new Promise((resolve, reject) => {
        schemaName = makeMapKey(schemaName);

        maybeThrow(!schemaDb.get(schemaName), `Schema '${schemaName}' not found`, 404)

        // TODO! Move into dbService as it is provider-dependent
        const fsPath = getRelFsPath(join(schemaDb.root, schemaName));


        $RefParser.dereference(fsPath)
          .then(schema => {

            // Force no additional properties
            schema.additionalProperties = false;

            /*
              TODO! Validate `schema` (AJV?)
              - Figure out how to validate the schemas themselves, against my own schema "extension"?
              - Make properly: required ["ACLg", "title", "idProperty"]
                - `idProperty can be `false` for "singleton"-schemas, like `site.*`-schemas & data...
            */

            if (!schema.isSingleton) {
              maybeThrow(!schema.idProperty, `Invalid schema: No 'idProperty' found on '${schemaName}'`, 424);
            }
            resolve(schema);

          })
          .catch(err => reject(err));
      })
        .then(schema => {
          if (!noAuth) {
            accessService.authorize(userService.currentUser, schema.ACLg, operation, { owner, noAuth });
          }
          return schema;
        });
    },

    getSchemaNames: (globpattern = '*', operation = 'read') => {
      return new Promise((resolve, reject) => {
        const schemaNames = Object.entries(schemaDb.tree)
          .filter(([schemaName, schema]) => minimatch(schemaName, globpattern))
          .filter(([schemaName, schema]) => accessService.authorize(userService.currentUser, schema.ACLg, operation, { noAuth: true }))
          .map(([schemaName, schema]) => schemaName);

        schemaNames.sort();

        resolve(schemaNames)
      });
    },

  }
};