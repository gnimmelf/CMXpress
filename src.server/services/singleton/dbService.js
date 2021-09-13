const assert = require('assert');
const dbAdapter = require('../../adapters/FS-DB');

module.exports = ({ dbRoot }) => {
  const dbService = dbAdapter({ dbRoot })

    // Do a light "interface-check"
    ;[
      'schema',
      'site',
      'user',
      'content',
    ].forEach(db => {

      assert(dbService[db], `dbService.${db} missing!`)
        ;[
          'get',
          'set',
          'delete',
          'name',
          'jsonPath'
        ].forEach(prop => {
          assert(dbService[db][prop], `dbService.${db}.${prop} missing!`)
        })

    })

  return dbService
}