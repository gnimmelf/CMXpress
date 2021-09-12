const { join } = require('path');
const osTmpdir = require('os-tmpdir');
const sh = require('shelljs');

const chai = require('chai');
const chaiHttp = require('chai-http');

/**
 * Need to accuratly set the `__localAppRoot` that manifester depends on to `TARGET_DIR`
 * - So only way to do that is `global.__localAppRoot`, since `TARGET_DIR` is not known
 *   outside here, and there is no way of passing it programatically...
 */

const SOURCE_DIR = join(__dirname, '../generators/create-site/templates');
const TARGET_DIR = join(osTmpdir(), 'mfs-site');

global.__localAppRoot = TARGET_DIR;

const manifester = require('../index');


/**
 * Chai setup
 */

chai.use(chaiHttp);
const { expect } = chai;


/**
 * Set up test app
 */

sh.rm('-rf', TARGET_DIR);
sh.mkdir(TARGET_DIR);
sh.cp('-R', `${SOURCE_DIR}/*`, TARGET_DIR);

manifester.use('/', (req, res) => res.send('Test App\n'));
manifester.run({
  createServer: false,
});

const agent = chai.request.agent(manifester.mainApp)


/*
  Paths
*/
const paths = {
  inspect: '/api/inspect',
  currentUser: '/api/user/current',
  userList: '/api/user/list',
  schemaList: '/api/schema/list',

}

describe('not logged in', () => {

  describe('200/Ok paths', () => {

    ([
      'inspect',
      'schemaList',
    ])
    .map(name => paths[name])
    .forEach(path => {

      it(paths.inspect, async () => {
        const res = await agent.get(paths.inspect);
        expect(res).to.have.status(200);
      });

    });

  });

  describe('401/Unauthorized paths', () => {

    it(paths.currentUser, async () => {
      const res = await agent.get(paths.currentUser)
      expect(res).to.have.status(401);
    });

  });

});
/*
┌────────┬──────────────────────────────────────────────────────────────────┐
│ Method │ url                                                              │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/inspect                                                     │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/inspect/toHtml                                              │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/inspect/toText                                              │
├────────┼──────────────────────────────────────────────────────────────────┤
│ POST   │ /api/auth/request                                                │
├────────┼──────────────────────────────────────────────────────────────────┤
│ POST   │ /api/auth/exchange                                               │
├────────┼──────────────────────────────────────────────────────────────────┤
│ POST   │ /api/auth/authenticate                                           │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/schema/list/:globpattern?/:operation?                       │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/schema/:schemaName                                          │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/user/list                                                   │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/user/current                                                │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/user/current/groups                                         │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/user/logout                                                 │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/user/:userHandle/data/:schemaNameSuffix/list                │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/user/:userHandle/data/:schemaNameSuffix/:objId              │
├────────┼──────────────────────────────────────────────────────────────────┤
│ POST   │ /api/user/:userHandle/data/:schemaNameSuffix/:objId/:dottedPath? │
├────────┼──────────────────────────────────────────────────────────────────┤
│ DELETE │ /api/user/:userHandle/data/:schemaNameSuffix/:objId/:dottedPath? │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/data/content/:schemaNameSuffix/list                         │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/data/content/:schemaNameSuffix/:objId/:dottedPath?          │
├────────┼──────────────────────────────────────────────────────────────────┤
│ POST   │ /api/data/content/:schemaNameSuffix/:objId?/:dottedPath?         │
├────────┼──────────────────────────────────────────────────────────────────┤
│ DELETE │ /api/data/content/:schemaNameSuffix/:objId/:dottedPath?          │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/data/singleton/:dbKey/list/:globpattern?                    │
├────────┼──────────────────────────────────────────────────────────────────┤
│ GET    │ /api/data/singleton/:dbKey/:schemaNameSuffix/:dottedPath?        │
├────────┼──────────────────────────────────────────────────────────────────┤
│ POST   │ /api/data/singleton/:dbKey/:schemaNameSuffix/:dottedPath?        │
└────────┴──────────────────────────────────────────────────────────────────┘
*/

