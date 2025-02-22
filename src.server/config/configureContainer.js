/**
 * "composition root":
 * https://medium.com/@Jeffijoe/dependency-injection-in-node-js-2016-edition-part-3-c01471c09c6d
 */
const path = require('path');
const assert = require('assert');
const {
  createContainer,
  Lifetime,
  ResolutionMode,
  asValue,
  asFunction,
  asClass
} = require('awilix');
const { scopePerRequest } = require('awilix-express');
const { join } = require('path');

module.exports = (app, {
  fsRoot
}) => {
  const container = createContainer();


  assert(fsRoot, 'fsRoot not set')
  assert(process.env.DB_PATH, 'DB_PATH not set')
  assert(process.env.TOKEN_KEY, 'TOKEN_KEY not set')
  assert(process.env.TOKEN_SECRET, 'TOKEN_SECRET not set')

  container.register({
    'app': asValue(app),
    'fsRoot': asValue(fsRoot),
    'dbPath': asValue(process.env.DB_PATH),
    'tokenKey': asValue(process.env.TOKEN_KEY),
    'tokenSecret': asValue(process.env.TOKEN_SECRET),
    'nodemailerTransport': asValue({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHERAL_USER,
        pass: process.env.ETHERAL_PASS
      }
    })
  });

  container.loadModules([
    ['scoped/*.js', Lifetime.SCOPED],
    ['singleton/*.js', {
      injector: () => ({ app: app }),
      lifetime: Lifetime.SINGLETON,
    }],
  ]
    , {
      formatName: 'camelCase',
      cwd: join(__dirname, '../services'),
    });

  /**
   * Register `templateService & default templates
   */
  const templateService = container.resolve('templateService');
  templateService['mail-login-code'] = join(__dirname, '../views', 'mail-login-code.pug');

  app.set('container', container);
  app.use(scopePerRequest(container));

  // Standard config return, a list of [k,v] tuples
  return [
    ['templateService.templates', Object.keys(templateService).join(',')],
  ]

}