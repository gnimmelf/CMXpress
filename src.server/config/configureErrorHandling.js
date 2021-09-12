const assert = require('assert');
const {
  sendApiResponse,
  getRequestFullUrl,
  loggers,
} = require('../lib/utils');

module.exports = (app) => {

  assert(app, 'required!')

  const logger = loggers.get('default');

  // Catch 404 and forward to errorhandler
  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.code = 404;
    next(err);
  });

  // API-errorhandler: JSON-response
  app.use('/api', function (err, req, res, next) {
    err.data = {
      url: getRequestFullUrl(req),
      params: req.params,
    };

    sendApiResponse(res, err);
  });

  // Non-API-errorhandler: HTML-response
  app.use(function (err, req, res, next) {
    if (err.code >= 500 && app.checkEnv('dev')) {
      logger.error(err)
    }

    const statusCode = err.code || 500;

    res.status(statusCode);

    res.locals.error = {
      message: err.message,
      statusCode: statusCode,
    };

    if (__getEnv('development')) {
      // Show stack
      console.error(err)
      res.locals.error.stack = err.stack;
    }

    res.render('error');
  });

  // Standard config return, a list of [k,v] tuples
  return [];

}