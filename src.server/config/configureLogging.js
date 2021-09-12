const assert = require('assert');
const { join } = require('path');
const morgan = require('morgan');
const mkdirp = require('mkdirp').sync;
const {
  format,
  transports,
  createLogger,
} = require("winston");

/**
 * NOTE! We're not adding loggers to `winston`, but a custom `loggers` module
 * - Because `winston.loggers.add` does only accepts a configuration-object, not an instance,
 *   and that is a bad choice...
 */
const { loggers } = require('../lib/utils');


module.exports = (app, { logFileDir, logLevel }) => {

  assert(app, 'required!');
  assert(logFileDir, 'required!')
  assert(logLevel, 'required!')

  mkdirp(logFileDir);

  const logFilePath = join(logFileDir, 'app.log');

  /**
   * Winston
   */

  const myTransports = [];

  myTransports.push(new transports.Console({
    level: logLevel,
    handleExceptions: true,
    colorize: true,
  }));


  if (!__getEnv('test')) {
    // Not testing (When testing the `logFilePath` cannot be safely determined...)
    myTransports.push(new transports.File({
      level: logLevel,
      filename: logFilePath,
      handleExceptions: true,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      colorize: false,
    }));
  }

  // Add new logger
  loggers.add('default', createLogger({
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.colorize({ all: true }),
      format.json(),
      format.printf(({ level, timestamp, message, ...data }) => {
        return `${timestamp} [${level}] ${message} ${Object.keys(data).length ? JSON.stringify(data) : ''}`
      }),
    ),
    transports: myTransports,
    exitOnError: false,
    emitErrors: false,
  }));


  /**
   * Morgan
   */

  const morganProfile = 'dev';

  if (!__getEnv('test')) {
    // Not testing, so add loggers
    app.use(morgan(morganProfile, {
      skip: function (req, res) {
        return res.statusCode < 400
      },
      stream: process.stderr,
    }));

    app.use(morgan(morganProfile, {
      skip: function (req, res) {
        return res.statusCode >= 400
      },
      stream: process.stdout,
    }));
  }
  // Standard config return, a list of [k,v] tuples
  return [
    ['logFilePath', logFilePath],
    ['logLevel', logLevel],
    ['morganProfile', morganProfile],
  ];
}