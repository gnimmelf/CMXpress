const { join } = require('path');
const osTmpdir = require('os-tmpdir');
const sh = require('shelljs');

const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../index');

const DB_BLUEPRINT = join(__dirname, '../');
const DB_TEST = join(osTmpdir(), 'mfs-site');

/**
 * Chai setup
 */

chai.use(chaiHttp);
const { expect } = chai;


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
const sections = {
  inspect: '/api/inspect',
  currentUser: '/api/user/current',
  userList: '/api/users/list',
  schemaList: '/api/schemas/list',

}

// TODO! Start here! Write tests

describe('not logged in', () => {

  describe('200/Ok sections', () => {

    ([
      'inspect',
      'schemaList',
    ])
      .map(name => sections[name])
      .forEach(path => {
        it(sections.inspect, async () => {
          const res = await agent.get(sections.inspect);
          expect(res).to.have.status(200);
        });

      });

  });

  describe('401/Unauthorized sections', () => {

    it(sections.currentUser, async () => {
      const res = await agent.get(sections.currentUser)
      expect(res).to.have.status(401);
    });

  });

});

describe('logged in')