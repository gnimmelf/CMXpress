const { join } = require('path');
const osTmpdir = require('os-tmpdir');
const sh = require('shelljs');
const dotProp = require('dot-prop')
const express = require('express');
const chai = require('chai');
const chaiHttp = require('chai-http');
const cmx = require('../index');
require('dotenv').config()

const SOURCE_DIR = join(__dirname, '../db.blueprint');
const TMP_DIR = join(osTmpdir(), 'mfs-site');

const INVALID_EMAIL = 'aaa@aaa.aaa'
const VALID_EMAIL = 'gnimmelf@gmail.com'

/**
 * Chai setup
 */

chai.use(chaiHttp);
const { expect } = chai;

const logChaiHttpRes = (res, dotKey = 'response') => {

  const value = dotProp.get(res.request, dotKey)

  console.log(dotKey, value)
}

/**
 * Set up test app
 */

sh.rm('-rf', TMP_DIR);
sh.mkdir('-p', TMP_DIR);
sh.cp('-r', SOURCE_DIR, join(TMP_DIR, process.env.DB_PATH))

const localApp = express()
localApp.use('/api', cmx.getApp({ fsRoot: TMP_DIR }))
localApp.use('/', (req, res) => res.send('Test App\n'));

const agent = chai.request.agent(localApp)

console.log({ TMP_DIR, ENV: __getEnv() })

/*
  sections
*/
const endpoints = {
  appRoot: { path: '/', method: 'GET' },
  inspect: { path: '/api/inspect', method: 'GET' },
  inspectText: { path: '/api/inspect/toText', method: 'GET' },
  inspectHtml: { path: '/api/inspect/toHtml', method: 'GET' },
  currentUser: { path: '/api/users/current', method: 'GET' },
  userList: { path: '/api/users/list', method: 'GET' },
  schemaList: { path: '/api/schemas/list', method: 'GET' },
  authRequest: { path: '/api/auth/request', method: 'POST' },
  authExchange: { path: '/api/auth/exchange', method: 'POST' },
  authenticate: { path: '/api/auth/authenticate', method: 'POST' },
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
      .forEach(({ path, method }) => {
        it(path, async () => {
          const res = await agent[method.toLowerCase()](path);
          expect(res).to.have.status(200);
        });
      });
  });

  describe('should have 401/UNAUTHORIZED at', () => {

    ([
      'userList',
      'currentUser',
    ])
      .map(name => endpoints[name])
      .forEach(({ path, method }) => {
        it(path, async () => {
          const res = await agent[method.toLowerCase()](path);
          expect(res).to.have.status(401);
        });
      });
  });

  describe('logging in ', () => {

    let loginCode;
    let authToken;

    describe('requests loginCode', () => {

      let { path, method } = endpoints['authRequest']

      describe(`at ${path} and`, () => {


        it('posts without email => 422/UNPROCESSABLE_ENTITY', async () => {
          const res = await agent[method.toLowerCase()](path).send({})
          expect(res).to.have.status(422);
        })

        it('posts with invalid email => 422/UNPROCESSABLE_ENTITY', async () => {
          const res = await agent[method.toLowerCase()](path).send({
            email: INVALID_EMAIL
          })
          expect(res).to.have.status(422);
        })

        it('posts with valid email => 200/OK', async () => {
          const res = await agent[method.toLowerCase()](path).send({
            email: VALID_EMAIL
          })
          expect(res).to.have.status(200)
          expect(res.body.loginCode).to.be.a('string');

          loginCode = res.body.loginCode
        });
      });

    });

    describe('exchanges logincode for an auth token', () => {

      let { path, method } = endpoints['authExchange']

      describe(`at ${path} and`, () => {

        it('posts with invalid email => 422/UNPROCESSABLE_ENTITY', async () => {
          const res = await agent[method.toLowerCase()](path).send({
            email: INVALID_EMAIL,
            code: loginCode
          })
          expect(res).to.have.status(422)
        });

        it('posts with valid email, invalid code => 422/UNPROCESSABLE_ENTITY', async () => {
          const res = await agent[method.toLowerCase()](path).send({
            email: VALID_EMAIL,
            code: loginCode + 99
          })
          expect(res).to.have.status(422)
        });

        it('posts with valid email, valid code => 200/OK + cookie', async () => {
          const res = await agent[method.toLowerCase()](path).send({
            email: VALID_EMAIL,
            code: loginCode
          })
          expect(res).to.have.status(200)
          expect(res.body.cookieName).to.be.a('string')
          expect(res).to.have.cookie(res.body.cookieName);

          authToken = dotProp.get(res.request, 'response.headers.set-cookie')
            .pop()
            .split(';')
            .map(cookieStr => cookieStr.split('=').map(part => part.trim()))
            .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})[res.body.cookieName]
        });
      })
    })


    describe('autheticates with recieved token', () => {

      let { path, method } = endpoints['authenticate']

      describe(`at ${path} and`, () => {

        it('posts with no token => 422/UNPROCESSABLE_ENTITY', async () => {
          const res = await agent[method.toLowerCase()](path).send({})
          expect(res).to.have.status(422)
        })

        it('posts with invalid token => 422/UNPROCESSABLE_ENTITY', async () => {
          const res = await agent[method.toLowerCase()](path).send({
            token: 'gibberish'
          })
          expect(res).to.have.status(422)
        })

        it('posts with valid token', async () => {
          const res = await agent[method.toLowerCase()](path).send({
            token: authToken
          })
          expect(res).to.have.status(200)
        })
      })
    });
  });
});

describe('Authenticated user', () => {

  // `agent` keeps the user logged in by preserving the `set-cookie` header

  describe('should have 200/OK at', () => {

    ([
      'userList',
      'currentUser',
      'schemaList'
    ])
      .map(name => endpoints[name])
      .forEach(({ path, method }) => {
        it(path, async () => {
          const res = await agent[method.toLowerCase()](path);
          expect(res).to.have.status(200);
        });
      });
  });

})

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