const debug = require('debug')('mf:service:authService');
const { join } = require('path');
const jwt = require('jsonwebtoken');
const makeLoginCode = require('../../lib/makeLoginCode');
const {
  maybeThrow,
  logger,
} = require('../../lib/utils');

const AUTH_FILE = 'auth.json';

const hashSecret = process.env.TOKEN_SECRET

module.exports = ({ dbService, templateService, mailService, objService }) => {
  // NOTE! `userService` is too high-level to use for authentification!
  const userDb = dbService.user;

  const maybeGetAuthPath = (email) => {
    const node = userDb.jsonPath(`$[*]['user.json']`)
      .find(node => node.value.email == email);

    maybeThrow(!node, 'No user found by given email', 422);

    const userId = node.path[1]

    return join(userId, AUTH_FILE);
  }

  return {

    requestLoginCodeByEmail: (email) => {
      return new Promise((resolve, reject) => {

        const dbPath = maybeGetAuthPath(email);

        const loginCode = makeLoginCode(5);
        const siteSettings = objService.getSiteSettings();

        userDb.set(dbPath, 'loginCode', loginCode);

        templateService['mail-login-code']
          .render({
            ...siteSettings,
            loginCode: loginCode,
          })
          .then(html => {

            if (__getEnv('production')) {
              // If 'dev' or 'test', don't sent email, just make sure it gets printed to console
              mailService.sendMail({
                senderName: siteSettings.siteName,
                recieverEmail: email,
                subjectStr: 'Your requested loginCode',
                textOrHtml: html,
              });
            }

            resolve(loginCode)
          })
          .catch(err => reject(err))

      });

    },

    exchangeLoginCode2Token: (email, loginCode, renewtoken) => {
      return new Promise((resolve, reject) => {

        const dbPath = maybeGetAuthPath(email);

        const authData = userDb.get(dbPath);

        maybeThrow(!authData.loginCode, 'No login-code requested', 422);
        maybeThrow(authData.loginCode != loginCode, 'Login-code incorrect', 422);

        userDb.set(dbPath, 'loginCode', '');

        // Create new token
        const authToken = jwt.sign({ email: email, salt: makeLoginCode(20) }, hashSecret);
        userDb.set(dbPath, 'authToken', authToken);

        resolve(authToken)
      });

    },

    authenticateToken: (token) => {
      return new Promise((resolve, reject) => {

        maybeThrow(!token, 'No token passed', 422);

        const decoded = jwt.verify(token, hashSecret);

        const dbPath = maybeGetAuthPath(decoded.email);

        const authData = userDb.get(dbPath);

        maybeThrow(!authData, 'Token not found', 404)
        maybeThrow(!authData.authToken, 'No matching token found', 401)
        maybeThrow(authData.authToken != token, 'Token mismatch', 401)
        // TODO! Implement other security measures!
        // https://github.com/auth0/node-jsonwebtoken

        resolve(decoded);
      });
    },

    invalidateToken: (email) => {
      return new Promise((resolve, reject) => {

        const dbPath = maybeGetAuthPath(email);

        userDb.delete(dbPath, 'authToken');

        resolve("Token invalidated");
      });
    },

  };

};
