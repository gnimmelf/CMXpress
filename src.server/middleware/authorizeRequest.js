const debug = require('debug')('cmx:middleware:authorizeUser');
const intersect = require('intersect');
const normalizeBool = require('normalize-bool');
const {
  maybeThrow,
  requestFullUrl,
  makeSingleInvoker
} = require('../lib/utils');

const authorizeRequest = (allowedGroups = [], redirectUrl = '') => {
  return makeSingleInvoker(({ userService, accessService }) => {

    return (req, res, next) => {
      if (allowedGroups.length) {

        const authorized = accessService.authorize(userService.currentUser, allowedGroups);

        if (!authorized && redirectUrl) {
          res.redirect(`${redirectUrl}?origin=${req.originalUrl}`);
          return;
        }
        else {
          maybeThrow(!authorized, userService.currentUser ? 'Unauthorized' : 'Not logged in', 401);
        }
      }

      next();
    };



  });

};


module.exports = authorizeRequest;