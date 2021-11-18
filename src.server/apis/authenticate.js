const debug = require('debug')('mf:api:authenticate');

const {
  sendApiResponse
} = require('../lib/utils');

module.exports = ({ authService, tokenKeyName }) => {


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
          res.cookie(tokenKeyName, payload, {
            httpOnly: true,
            sameSite: "Strict"
          })
          sendApiResponse(res, { cookieName: tokenKeyName })
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    authenticateToken: (req, res) => {
      var token = req.params.token;

      authService.authenticateToken(token)
        .then(payload => {
          sendApiResponse(res, payload);
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

  };
};