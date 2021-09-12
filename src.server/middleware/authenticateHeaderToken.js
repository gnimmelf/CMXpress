const debug = require('debug')('mf:middleware:authenticateHeaderToken');
const { asValue, asFunction } = require('awilix');
const { makeSingleInvoker, maybeThrow } = require('../lib/utils');

module.exports = makeSingleInvoker(({ tokenKeyName, authService, userService }) => {

  return (req, res, next) => {
    debug("cookies", req.cookies)

    // Token can be passed as header or as cookie
    let token = req.headers[tokenKeyName] || req.cookies[tokenKeyName];

    authService.authenticateToken(token)
      .then(decoded => {
        debug('autheticated', decoded.email);

        // TODO! Not too happy about this one, but most dependencies are circular, so no other way in...
        const currentUser = userService.setCurrentUserBy('email', decoded.email);

        next();
      })
      .catch(err => {
        debug('unauthenticated', err.message)

        delete req.headers[tokenKeyName];
        delete req.cookies[tokenKeyName];

        next();
      });
  };

});