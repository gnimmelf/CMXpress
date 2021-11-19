const debug = require('debug')('mf:service:templateService');
const { parse, join } = require('path');
const fs = require('fs');
const assert = require('assert');

const viewTemplates = {}

module.exports = ({ app }) => {

  class Template {

    constructor(templatePath) {
      this.templatePath = templatePath
      debug('adding template', this.templatePath)
    }

    render(context, callback) {

      debug('render', this.templatePath)

      return new Promise((resolve, reject) => {
        app.render(this.templatePath, context, (err, res) => {
          debug('rendered', { err, res })
          err ? reject(err) : resolve(res);
          (callback && callback(err, res));
        });

      });

    }
  }

  /**
   * Proxy object to allow `templateService.set('./path/tpl.ext')`, and not `templateService['get']...`
   */

  const templatesProxy = new Proxy(viewTemplates, {
    get(target, prop) {
      return target[prop];
    },
    set(target, prop, value) {
      debug('templatesProxy::set', { prop, value })
      target[prop] = new Template(value)
    }
  });

  return templatesProxy;
}