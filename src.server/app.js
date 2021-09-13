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

/**
 * Express apps
 */

const app = express();
app.localApp = express(); // The Express app for local development of the "head" in "headless"

/**
 * View engine setup
 * -Yes, pug/jade. Tried "all" others, they suck and really hamper coding effiency.
 */

app.set('views', [join(__dirname, 'views')]);
app.set('view engine', 'pug');
app.set('json spaces', 2);

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
  logFileDir: join(__localAppRoot, '/logs/'),
});

// Awilix-container, set on `app`
configLogs['container'] = configureContainer(app);

/**
 * Log configs
 */

const logger = loggers.get('default');

Object.entries(configLogs).forEach(([category, configTuples]) => configTuples.forEach(([key, value]) => {
  logger.verbose(`(${category.toUpperCase()}) ${key} = ${value}`);
}));

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

app.use('/api', require('./routes/api.inspect'));
app.use('/api/auth', require('./routes/api.authenticate'));
app.use('/api/schemas', require('./routes/api.schemas'));
app.use('/api/users', require('./routes/api.users'));
app.use('/api/content', require('./routes/api.content'));
app.use('/api/site', require('./routes/api.site'));
app.use(app.localApp); // Mount the `localApp` last, so that all its routes apply


/**
 * Downstream errorhandling
 */

configureErrorHandling(app)

module.exports = app;
