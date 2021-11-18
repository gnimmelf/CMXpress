const assert = require('assert');

const ALLOWED_ENVS = ['production', 'development', 'test']

module.exports = (app, { nodeEnv }) => {

  assert(app, 'required!')
  assert(nodeEnv, 'required!')

  const getEnv = (vsEnvStr = '') => {

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

  // Get full env-name or `false` if mismatch with `ALLOWED_ENVS`
  nodeEnv = getEnv(nodeEnv);

  assert(nodeEnv, `'nodeEnv' must be one of ${ALLOWED_ENVS}!'`);

  /**
   * Set globals (YES, THEY ARE!)
   */

  if (nodeEnv == 'test') {
    // Must be set globally allready!
    assert(global.__fsRoot, '"global.__fsRoot" must be set when testing!');
  }
  else {
    // Set it to the folder of the main module, usually cwd
    global.__fsRoot = require.main.path;
  }

  // Set `getEnv` global
  global.__getEnv = getEnv

  // TODO! Assert required ENV-variables. `DB_ROOT`, `TOKEN_KEY`, `TOKEN_SECRET`, etc.

  // Standard config return, a list of [k,v] tuples
  return [
    ['ALLOWED_ENVS', ALLOWED_ENVS.join(', ')],
    ['nodeEnv', nodeEnv],
  ]

}