const debug = require('debug')('cmx:service:authService');
const { join } = require('path');
const jwt = require('jsonwebtoken');
const makeLoginCode = require('../../lib/makeLoginCode');
const {
  maybeThrow,
  logger,
} = require('../../lib/utils');

const AUTH_PATH = 'auth.json';

module.exports = ({ dbService, templateService, mailService, objService, tokenSecret }) => {
  // NOTE! Using `userDB` because `userService` is too high-level to use for authentification...
  const userDb = dbService.user;

  const maybeGetAuthPath = (email) => {
    const node = userDb.jsonPath(`$[*]['user.json']`)
      .find(node => node.value.email == email);

    maybeThrow(!node, `No user found by given email (${email})`, 422);

    const userId = node.path[1]

    return join(userId, AUTH_PATH);
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
        const authToken = jwt.sign({ email: email, salt: makeLoginCode(20) }, tokenSecret);
        userDb.set(dbPath, 'authToken', authToken);

        resolve(authToken)
      });

    },

    authenticateToken: (token) => {
      return new Promise((resolve, reject) => {

        maybeThrow(!token, 'No token passed', 422);

        let decoded;
        try {
          decoded = jwt.verify(token, tokenSecret);
        } catch (err) {
          maybeThrow(true, err.message, 422)
        }

        const dbPath = maybeGetAuthPath(decoded.email);

        const authData = userDb.get(dbPath);

        const validToken = authData?.authToken === token

        maybeThrow(!validToken, 'Invalid token', 422)

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
