const debug = require('debug')('mf:service:templateService');
const fs = require('fs');
const assert = require('assert');
const {
  dirname,
  basename,
  extname,
  join,
  resolve,
  normalize
} = require('path');

const viewTemplates = {}

const tryStat = (path) => {
  debug('stat "%s"', path);

  try {
    return fs.statSync(path);
  } catch (err) {
    return undefined;
  }
}

const destructureFilePath = (filePath) => {
  const parts = {
    dir: dirname(filePath),
    ext: extname(filePath),
    filePath: filePath,
  };
  parts.name = basename(filePath, parts.ext);
  return parts;
}

const extractAppDirs = (app) => {
  return {
    app: app,
    dirs: [].concat(app.get('views')).reduce((acc, cur) => {
      acc.push(cur);
      return acc;
    }, [])
  }
}

module.exports = ({ app }) =>
/*
  Serve the templates for admin core functions, like login and mail-templates.
  They should be overridable with fallback to original, and their original context must be hookable to provide
  extra data where overridden templates require it.
*/ {

  const appDirs = extractAppDirs(app);

  class Template {
    constructor({ name, filePath, ext, dir }) {
      this.staticHooks = [];
      this.hooks = [];
      this.name = name;
      this.filePath = filePath;
      this.ext = ext;
      this.dir = dir;
    }

    statickHook(fn)
    // Add a static context-hook function
    {
      assert(fn instanceof Function, 'hook is not a function');
      return this.hooks.push(fn);
    }

    hook(fn)
    // Add a context-hook function that is run once on render and the removed.
    {
      assert(fn instanceof Function, 'hook is not a function');
      this.hooks.push(fn)
      // Chainable
      return this;
    }

    render(context, ...rest) {
      let callback;

      if (rest.length && typeof rest[rest.length - 1] == 'function') {
        // Assume it's a callback
        callback = rest.pop()
      }

      return new Promise((resolve, reject) => {

        // Merge `rest` with `context`
        let renderOptions = Object.assign({}, context);
        while (rest.length) {
          renderOptions = Object.assign(rest.shift());
        }

        // Run static hooks
        renderOptions = this.staticHooks.reduce((ctx, hook, idx) => {
          return hook(ctx) || ctx;
        }, Object.assign({}, renderOptions))

        // Run dynamic hooks
        while (this.hooks.length) {
          renderOptions = this.hooks.shift()(Object.assign({}, renderOptions)) || renderOptions;
        }

        // TODO! Template caching?

        // Set `app` and `filePath` to first `filePath`-file found
        let stat, app, filePath;

        debug(`Looking for template '${this.filePath}'`);

        appDirs.every(obj => {
          obj.dirs.every(dir => {
            filePath = normalize(join(dir, this.filePath));
            stat = tryStat(filePath);
            app = stat && stat.isFile() ? obj.app : undefined;
            debug("filePath", filePath, stat && stat.isFile())
            // `every` breaks loop on `false`
            return !app;
          });
          // `every` breaks loop on `false`
          return !app;
        })

        if (!app) reject(`${filePath} not found`);

        // Let the "owner"-`app` do the rendering to merge its `app.locals`...
        // TODO! -Is all of this necessary? Besides, we're still not merging in the `req.locals`...
        app.render(filePath, renderOptions, (err, res) => {
          err ? reject(err) : resolve(res);
          (callback && callback(err, res));
        });
      });

    }
  }


  /**
   * Proxy object to allow `templateService.set('./path/tpl.ext')`, and not `templateService['get']...`
   */

  const proxySetter = (obj, value, prop = undefined) => {
    const parts = destructureFilePath(value)

    if (prop) {
      assert(prop == parts.name, `file basename must match property (${prop}): ${value} `)

    }

    obj[parts.name] = new Template(parts);

    return true;
  }

  const templatesProxy = new Proxy(viewTemplates, {
    get: (obj, prop) => {
      if (prop == 'set') {
        return (value) => {
          return proxySetter(obj, value)
        }
      }

      assert(obj[prop] instanceof Template, `${prop} is not a valid template!`)
      return obj[prop];
    },
    set: (obj, prop, value) => {
      if (prop != 'set') {
        proxySetter(obj, value, prop);
      }
    }
  });

  return templatesProxy;
}