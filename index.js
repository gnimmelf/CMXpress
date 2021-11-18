/**
 * Export the Manifester app.
 */
const http = require('http');
const {
  join,
  dirname,
  resolve,
  parse
} = require('path');

const assert = require('assert');
const caller = require('caller');
const { asValue } = require('awilix');
const mainApp = require('./src.server/app');

const DEFAULT_PORT = 3000;

// Server
let server;

function normalizePort(val)
// Get port from environment and store in Express.
{
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('\nListening on ' + bind);
}

/**
 * Export stuff needed to create client code.
 */

module.exports = Object.assign(mainApp.localApp, {
  mainApp,
  run: (options = {}) => {

    const { createServer } = {
      createServer: true,
      ...options,
    }

    const port = normalizePort(process.env.PORT || DEFAULT_PORT);

    mainApp.set('port', port);

    if (createServer) {
      server = http.createServer(mainApp);
      server.on('error', onError);
      server.on('listening', onListening);
      server.listen(port);
    }
  },
})

if (require.main === module) {
  // This package is not imported, but run from commandline
  module.exports.run()
}