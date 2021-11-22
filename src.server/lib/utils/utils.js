const path = require('path');
const join = path.join;
const mkdirp = require('mkdirp').sync;
const { loopWhile } = require('deasync')
const RESTfulError = require('../RESTfulError');
const { inspect } = require('util');

exports.inspect = (obj) => console.log(inspect(obj, { colors: true, depth: 5 }));

exports.isObject = (a) => (!!a) && (a.constructor === Object);
exports.isArray = (a) => (!!a) && (a.constructor === Array);

exports.getRequestFullUrl = (expressRequestObj) => {
  const req = expressRequestObj;
  const secure = req.connection.encrypted || req.headers['x-forwarded-proto'] === 'https'
  return `http${(secure ? 's' : '')}://${req.headers.host}${req.originalUrl}`;
};

exports.maybeThrow = (predicate, messageOrData, RestErrorTypeOrCode) => {
  const message = typeof messageOrData == 'string' ? messageOrData : undefined;
  const data = message ? undefined : messageOrData;

  if (predicate) {
    if (RestErrorTypeOrCode && RESTfulError.getByTypeOrCode(RestErrorTypeOrCode)) {
      const err = new RESTfulError(RestErrorTypeOrCode, message);
      if (data) err.data = data;
      throw err;
    }
    else if (message) {
      throw new Error(message);
    }
    else if (predicate instanceof Error) {
      throw predicate;
    }
  }
}
const maybeThrow = exports.maybeThrow

exports.throwNotImplemented = (msg = 'Work in progress') =>
  maybeThrow(true, msg, 'NOT_IMPLEMENTED')

exports.ensureDir = (dirPath) => {
  mkdirp(dirPath);
  return dirPath;
}


exports.deasync = (asyncFn) => {
  let done = false
  let err
  let retVal

  return (...params) => {
    asyncFn(...params)
      .then(res => {
        retVal = res
        done = true
      })
      .catch(e => {
        done = true;
        err = e;
      });

    loopWhile(() => !done)

    if (err) throw err;
    return retVal
  }
}

exports.makeMapKey = (...parts) => {
  const mapKey = parts
    .filter(x => x)
    .join('/')
  return mapKey.endsWith('.json') ? mapKey : mapKey + '.json';
}

exports.makeSchemaName = (mapKey, schemaPath) =>
  `${mapKey}.${schemaPath ? '.' + schemaPath : ''}`.replace(/\.+/g, '.');