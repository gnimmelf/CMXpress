const assert = require('assert');

const ALLOWED_ENVS = ['production', 'development', 'test']

const makeGetEnv = (nodeEnv) => (vsEnvStr = '') => {

  if (!vsEnvStr) {
    // Set vs-string to passed `nodeEnv`
    vsEnvStr = nodeEnv;
  }

  const checkLen = Math.min(nodeEnv.length, vsEnvStr.length);

  if (vsEnvStr.substr(0, checkLen).toLowerCase() == nodeEnv.substr(0, checkLen).toLowerCase()) {
    // Return the full env-name
    return ALLOWED_ENVS.find(allowedEnv => vsEnvStr == allowedEnv.substr(0, vsEnvStr.length));;
  }
  return false;

};

module.exports = (app, { nodeEnv }) => {

  global.__getEnv = makeGetEnv(nodeEnv)

  // Get full env-name or `false` if mismatch with `ALLOWED_ENVS`
  nodeEnv = __getEnv(nodeEnv);

  assert(nodeEnv, `'nodeEnv' must be one of ${ALLOWED_ENVS}!'`);

  // Standard config return, a list of [k,v] tuples
  return [
    ['ALLOWED_ENVS', ALLOWED_ENVS.join(', ')],
    ['nodeEnv', nodeEnv],
  ]
}