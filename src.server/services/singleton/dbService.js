const path = require('path')
const assert = require('assert');
const dbAdapter = require('../../adapters/FS-DB');
const { join } = require('path');

module.exports = ({ dbRoot }) => {
  const dbService = dbAdapter({
    dbRoot: join(__fsRoot, dbRoot)
  })

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
          'name'
        ].forEach(prop => {
          assert(dbService[db][prop], `dbService.${db}.${prop} missing!`)
        })

    })

  return dbService
}