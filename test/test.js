const { join } = require('path');
const osTmpdir = require('os-tmpdir');
const sh = require('shelljs');

const chai = require('chai');
const chaiHttp = require('chai-http');

const SOURCE_DIR = join(__dirname, '../db.blueprint');
const TARGET_DIR = join(osTmpdir(), 'mfs-site');

const INVALID_EMAIL = 'aaa@aaa.aaa'
const VALID_EMAIL = 'gnimmelf@gmail.com'

/**
 * Need to accuratly set the `__fsRoot` that manifester depends on to `TARGET_DIR`
 * - So only way to do that is `global.__fsRoot`, since `TARGET_DIR` is not known
 *   outside here, and there is no way of passing it programatically...
 */
global.__fsRoot = TARGET_DIR;

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
  sections
*/
const endpoints = {
  appRoot: '/',
  inspect: '/api/inspect',
  inspectText: '/api/inspect/toText',
  inspectHtml: '/api/inspect/toHtml',
  currentUser: '/api/user/current',
  userList: '/api/user/list',
  schemaList: '/api/schema/list',
  authRequest: '/api/auth/request',
}

describe('Unauthenticated user', () => {

  describe('should have 200/OK at', () => {
    ([
      'appRoot',
      'inspect',
      'inspectText',
      'inspectHtml',
      'schemaList',
    ])
      .map(name => endpoints[name])
      .forEach(path => {
        it(path, async () => {
          const res = await agent.get(path);
          expect(res).to.have.status(200);
        });
      });
  });

  describe('should have 401/UNAUTHORIZED at', () => {
    ([
      'currentUser',
      'userList',
    ])
      .map(name => endpoints[name])
      .forEach(path => {
        it(path, async () => {
          const res = await agent.get(path);
          expect(res).to.have.status(401);
        });
      });
  });

  describe('loggin in', () => {

    const endpoint = endpoints['authRequest']
    let loginCode;

    describe(`at ${endpoint} and`, () => {

      describe('requests loginCode', () => {

        it('posts without email => 422/UNPROCESSABLE_ENTITY', async () => {
          const res = await agent
            .post(endpoints['authRequest'])
            .send({ email: INVALID_EMAIL })
          expect(res).to.have.status(422);
        })

        it('posts with non-existing email => 422/UNPROCESSABLE_ENTITY', async () => {
          const res = await agent.post(endpoints['authRequest']);
          expect(res).to.have.status(422);
        })

        it('posts with valid email => 200/OK', async () => {
          const res = await agent
            .post(endpoints['authRequest'])
            .send({ email: VALID_EMAIL })
          expect(res).to.have.status(200)
          expect(res.body.loginCode).to.be.a('string');

          loginCode = res.body.loginCode
        });
      });

      describe('exchanges logincode for an auth token', () => { })

      describe('autheticates with auth-token', () => { })
    });
  });
});
/*
┌────────┬─────────────────────────────────────────────────────────────────┐
│ Method │ url                                                             │
├────────┼─────────────────────────────────────────────────────────────────┤
│ GET    │ /api/inspect                                                    │
├────────┼─────────────────────────────────────────────────────────────────┤
│ GET    │ /api/inspect/toHtml                                             │
├────────┼─────────────────────────────────────────────────────────────────┤
│ GET    │ /api/inspect/toText                                             │
├────────┼─────────────────────────────────────────────────────────────────┤
│ POST   │ /api/auth/request                                               │
├────────┼─────────────────────────────────────────────────────────────────┤
│ POST   │ /api/auth/exchange                                              │
├────────┼─────────────────────────────────────────────────────────────────┤
│ POST   │ /api/auth/authenticate                                          │
├────────┼─────────────────────────────────────────────────────────────────┤
│ GET    │ /api/schemas/list/:globpattern?/:operation?                     │
├────────┼─────────────────────────────────────────────────────────────────┤
│ GET    │ /api/schemas/:schemaName                                        │
├────────┼─────────────────────────────────────────────────────────────────┤
│ GET    │ /api/users/list                                                 │
├────────┼─────────────────────────────────────────────────────────────────┤
│ GET    │ /api/users/current/:propPath?                                   │
├────────┼─────────────────────────────────────────────────────────────────┤
│ GET    │ /api/users/current/groups                                       │
├────────┼─────────────────────────────────────────────────────────────────┤
│ GET    │ /api/users/logout                                               │
├────────┼─────────────────────────────────────────────────────────────────┤
│ POST   │ /api/users/register                                             │
├────────┼─────────────────────────────────────────────────────────────────┤
│ POST   │ /api/users/update/:userHandle                                   │
├────────┼─────────────────────────────────────────────────────────────────┤
│ GET    │ /api/users/:userHandle/data/:schemaNameSuffix/list              │
├────────┼─────────────────────────────────────────────────────────────────┤
│ GET    │ /api/users/:userHandle/data/:schemaNameSuffix/:objId            │
├────────┼─────────────────────────────────────────────────────────────────┤
│ POST   │ /api/users/:userHandle/data/:schemaNameSuffix/:objId/:propPath? │
├────────┼─────────────────────────────────────────────────────────────────┤
│ GET    │ /api/content/:schemaNameSuffix/list                             │
├────────┼─────────────────────────────────────────────────────────────────┤
│ GET    │ /api/content/:schemaNameSuffix/:objId/:propPath?                │
├────────┼─────────────────────────────────────────────────────────────────┤
│ POST   │ /api/content/:schemaNameSuffix/:objId?/:propPath?               │
├────────┼─────────────────────────────────────────────────────────────────┤
│ GET    │ /api/site/list                                                  │
├────────┼─────────────────────────────────────────────────────────────────┤
│ GET    │ /api/site/:schemaNameSuffix/:propPath?                          │
└────────┴─────────────────────────────────────────────────────────────────┘
*/