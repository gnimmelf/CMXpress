const { join } = require('path');
const osTmpdir = require('os-tmpdir');
const sh = require('shelljs');

const chai = require('chai');
const chaiHttp = require('chai-http');

<<<<<<< HEAD
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

=======
const server = require('../index');

const DB_BLUEPRINT = join(__dirname, '../');
const DB_TEST = join(osTmpdir(), 'mfs-site');

>>>>>>> 4647b9c0febfe4cb88e685d77e7072aa1880fe0c
/**
 * Chai setup
 */

chai.use(chaiHttp);
const { expect } = chai;

<<<<<<< HEAD
/**
 * Set up test app
 */
=======
>>>>>>> 4647b9c0febfe4cb88e685d77e7072aa1880fe0c

sh.rm('-rf', TARGET_DIR);
sh.mkdir(TARGET_DIR);
sh.cp('-R', `${SOURCE_DIR}/*`, TARGET_DIR);

server.use('/', (req, res) => res.send('Test App\n'));
server.run({
  createServer: false,
});

const agent = chai.request.agent(server.mainApp)

/*
  sections
*/
<<<<<<< HEAD
const endpoints = {
  appRoot: '/',
=======
const sections = {
>>>>>>> 4647b9c0febfe4cb88e685d77e7072aa1880fe0c
  inspect: '/api/inspect',
  inspectText: '/api/inspect/toText',
  inspectHtml: '/api/inspect/toHtml',
  currentUser: '/api/user/current',
<<<<<<< HEAD
  userList: '/api/user/list',
  schemaList: '/api/schema/list',
  authRequest: '/api/auth/request',
}

describe('Unauthenticated user', () => {
=======
  userList: '/api/users/list',
  schemaList: '/api/schemas/list',

}

// TODO! Start here! Write tests

describe('not logged in', () => {

  describe('200/Ok sections', () => {
>>>>>>> 4647b9c0febfe4cb88e685d77e7072aa1880fe0c

  describe('should have 200/OK at', () => {
    ([
      'appRoot',
      'inspect',
      'inspectText',
      'inspectHtml',
      'schemaList',
    ])
<<<<<<< HEAD
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
=======
      .map(name => sections[name])
      .forEach(path => {
        it(sections.inspect, async () => {
          const res = await agent.get(sections.inspect);
          expect(res).to.have.status(200);
        });

>>>>>>> 4647b9c0febfe4cb88e685d77e7072aa1880fe0c
      });
  });

<<<<<<< HEAD
  describe('loggin in', () => {

    const endpoint = endpoints['authRequest']
    let loginCode;

    describe(`at ${endpoint} and`, () => {

      describe('requests loginCode', () => {
=======
  });

  describe('401/Unauthorized sections', () => {

    it(sections.currentUser, async () => {
      const res = await agent.get(sections.currentUser)
      expect(res).to.have.status(401);
    });
>>>>>>> 4647b9c0febfe4cb88e685d77e7072aa1880fe0c

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

describe('logged in')