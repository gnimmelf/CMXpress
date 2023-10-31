const debug = require('debug')('cmx:sendApiResponse');
const RESTfulError = require('../RESTfulError');

const loggers = require('./loggers');

module.exports = (expressResponseObj, payload) => {
  debug('> payload', payload);

  const logger = loggers.get('default');

  let err, apiPayload, status = 200;

  if (payload instanceof Error) {

    status = isNaN(payload.code) ? 500 : payload.code;

    if (!(payload instanceof RESTfulError) && RESTfulError.getByTypeOrCode(payload.code)) {
      // Make it a `RESTfulError`
      err = new RESTfulError(payload.code, payload.message);
      debug('RESTfulError', err)
    }
    else {
      err = payload;
    }

    // Set the payload
    apiPayload = {
      msg: err.message || '',
      data: payload.data || false,
    };

    if (status >= 500) {
      logger.error(err)
      console.error(err)
    }
  }
  else {
    apiPayload = typeof payload == 'string'
      ? {
        msg: payload,
        data: undefined,
      }
      : payload || {};
  }

  debug(`> apiPayload: ${status}`, apiPayload);

  expressResponseObj.status(status).json(apiPayload);
}