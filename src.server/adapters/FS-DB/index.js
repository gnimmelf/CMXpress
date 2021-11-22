const debug = require('debug')('mf:adapters');
const jsonPath = require('jsonpath');
const { join } = require('path');
const Db = require('./FS-DB');

const {
    loggers,
    ensureDir,
    deasync,
} = require('../../lib/utils');

const invalidateCache = (fsPath) => {
    fsPath = getRelFsPath(fsPath);
    debug("removed from cache", fsPath);
    delete cache[fsPath];
};

const proxyHandler = {
    get: (target, name) => {
        if (name === 'jsonPath') {
            return (pathExpression) => {
                return jsonPath.nodes(target.tree, pathExpression)
            }
        }
        else return target[name]
    },
}

const logger = loggers.get('default');

module.exports = deasync(async ({ fsRoot, dbPath }) => {

    fsRootPath = join(fsRoot, dbPath)

    debug('fsRootPath', fsRootPath)

    const dbs = await Promise.all([
        new Db({
            root: ensureDir(join(fsRootPath, 'schemas')),
            name: 'schemas',
        }).promise,
        new Db({
            root: ensureDir(join(fsRootPath, 'site')),
            name: 'site',
        }).promise,
        new Db({
            root: ensureDir(join(fsRootPath, 'users')),
            name: 'users',
            instantPush: true,
        }).promise,
        new Db({
            root: ensureDir(join(fsRootPath, 'content')),
            name: 'content',
        }).promise,
    ])
        .then(dbs => {
            return dbs.map(db => new Proxy(db, proxyHandler))
        })
        .then(([schema, site, user, content]) => {
            const dbs = {
                schema,
                site,
                user,
                content,
            }
            return dbs
        })
        .catch(err => err)

    // Add watchers to schema files
    dbs['schema'].watcher.on('change', invalidateCache);
    dbs['schema'].watcher.on('unlink', invalidateCache);

    logger.verbose('dbService loaded!', { mapKeys: Object.keys(dbs).join(', ') });

    return dbs
})

