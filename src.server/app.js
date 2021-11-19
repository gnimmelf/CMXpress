const debug = require('debug')('mf:app');

const { join } = require('path');
const assert = require('assert');
const express = require('express');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { urlencoded, json } = require('body-parser');

require('dotenv').config()

const {
  configureAppEnv,
  configureLogging,
  configureContainer,
  configureErrorHandling,
} = require('./config');

const { loggers } = require('./lib/utils')

const createApp = ({
  fsRoot,
  apiPrefix,
}) => {
  assert(fsRoot, 'Required')

  const app = express();

  /**
   * Configurations
   */

  const configLogs = {}; // For logging

  // Node-env, INCLUDING GLOBALS!!
  configLogs['env'] = configureAppEnv(app, {
    nodeEnv: process.env.NODE_ENV || 'development',
  });

  // Loggers
  configLogs['logging'] = configureLogging(app, {
    logLevel: process.env.LOG_LEVEL || 'debug',
    logFileDir: join(fsRoot, '/logs/'),
  });

  // Awilix-container, set on `app`
  configLogs['container'] = configureContainer(app, {
    fsRoot,
  });

  /**
   * Log configs
   */

  const logger = loggers.get('default');

  Object.entries(configLogs).forEach(([category, configTuples]) => configTuples.forEach(([key, value]) => {
    logger.verbose(`(${category.toUpperCase()}) ${key} = ${value}`);
  }));

  /**
   * View engine setup
   * -Yes, pug/jade. Tried "all" others, they suck and really hamper coding effiency.
   */

  app.set('views', [join(__dirname, 'views'), join(fsRoot, 'views')]);
  app.set('view engine', 'pug');
  app.set('json spaces', 2);

  /**
   * Standard middleware
   */

  // CORS
  // NOTE! The manifested `localApp` must set it's own CORS when in production (see `../index.js`)
  // TODO! CORS - Something weird with pure rest clients and new chrome cors policy
  const corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "credentials": true,
  };
  logger.info(`CORS ${JSON.stringify(corsOptions)}`)
  app.use(cors(corsOptions));


  // Encoding
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(cookieParser());

  // TODO! Favicon: uncomment after placing your favicon... where? -Should prefer `app.localApp`...
  //app.use(favicon(join("public", 'favicon.ico')));

  /**
   * Custom middleware
   */

  app.use(require('./middleware/authenticateHeaderToken'));


  /**
   * Routes
   */

  app.use(`${apiPrefix}/`, require('./routes/api.inspect'));
  app.use(`${apiPrefix}/auth`, require('./routes/api.authenticate'));
  app.use(`${apiPrefix}/schemas`, require('./routes/api.schemas'));
  app.use(`${apiPrefix}/users`, require('./routes/api.users'));
  app.use(`${apiPrefix}/content`, require('./routes/api.content'));
  app.use(`${apiPrefix}/site`, require('./routes/api.site'));

  /**
   * Downstream errorhandling
   */

  configureErrorHandling(app)

  return app;
}

module.exports = createApp;