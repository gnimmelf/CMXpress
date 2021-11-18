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

module.exports = (app) => {

  assert(app, 'required!')

  const container = createContainer();

  container.register({
    'app': asValue(app),
    'tokenKeyName': asValue(process.env.TOKEN_KEY),
    'dbRoot': asValue(process.env.DB_ROOT),
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

  ;[
    'mail-login-code.pug',
  ].forEach(templateService.set);

  app.set('container', container);
  app.use(scopePerRequest(container));

  // Standard config return, a list of [k,v] tuples
  return [
    ['templateService.templates', Object.keys(templateService).join(',')],
  ]

}