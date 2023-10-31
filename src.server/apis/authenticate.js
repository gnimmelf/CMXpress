const debug = require('debug')('cmx:api:authenticate');

const {
  sendApiResponse
} = require('../lib/utils');
const authenticateHeaderToken = require('../middleware/authenticateHeaderToken');

module.exports = ({ authService, tokenKey }) => {


  return {

    requestLoginCodeByEmail: (req, res) => {

      authService.requestLoginCodeByEmail(req.body.email)
        .then(loginCode => {

          const data = { email: req.body.email }

          if (!__getEnv('prod')) {
            data.loginCode = loginCode
            if (!__getEnv('test')) {
              console.log({ loginCode })
            }
          }

          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });

    },

    exchangeLoginCode2Token: (req, res) => {

      authService.exchangeLoginCode2Token(req.body.email, req.body.code)
        .then(payload => {
          res.cookie(tokenKey, payload, {
            httpOnly: true,
            sameSite: "Strict"
          })
          sendApiResponse(res, { cookieName: tokenKey })
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    authenticateToken: (req, res) => {
      const token = req.body.token;

      debug('authenticateHeaderToken', { token })

      authService.authenticateToken(token)
        .then(({ email }) => {
          sendApiResponse(res, { email });
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

  };
};