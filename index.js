/**
 * Export the Manifester app.
 */
const http = require('http');
const assert = require('assert');

const createApp = require('./src.server/app')

require('dotenv').config()

const DEFAULT_PORT = 3000;

// Server
let server, port;

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


function getApp({ fsRoot, apiPrefix } = {}) {
  fsRoot = fsRoot || require.main.path
  apiPrefix = apiPrefix || ''
  return createApp({
    fsRoot, apiPrefix
  })
}

function serve(app) {
  port = normalizePort(process.env.PORT || DEFAULT_PORT);
  server = http.createServer(app);
  server.on('error', onError);
  server.on('listening', onListening);
  server.listen(port);
}

/**
 * Export stuff needed to create client code.
 */


if (require.main === module) {
  // This package is not imported, but run from commandline
  serve(getApp({ apiPrefix: '/api' }))
}
else {
  module.exports = {
    serve,
    getApp,
  }
}