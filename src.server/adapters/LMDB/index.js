const { join } = require('path');
const { open } = require('lmdb-store');
const {
    loggers,
    ensureDir,
} = require('../utils');

module.exports = ({ fsRoot, dbPath }) => {

    ensureDir(fsRoot)

    const root = open(join(fsRoot, dbPath), {
        name: 'root',
        dupSort: false,
        useVersions: false,
    })

    return {
        schema: root.openDB('schema'),
        site: root.openDB('site'),
        user: root.openDB('user', {
            sharedStructuresKey: Symbol.for('structures'),
        }),
        content: root.openDB('content', {
            sharedStructuresKey: Symbol.for('structures'),
        }),
    }
}