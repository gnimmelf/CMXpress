const assert = require('assert');
const loggers = {}

exports.add = (name, logger) => {
  assert(!loggers[name], 'Logger allready registered by name: ' + name);

  console.log(`Adding logger: "${name}"...`);

  loggers[name] = logger;
  return logger;
};

exports.get = (name) => {
  assert(loggers[name], `Logger not registered: "${name}"`);
  return loggers[name];
}

exports.list = () => Object.keys(loggers);
