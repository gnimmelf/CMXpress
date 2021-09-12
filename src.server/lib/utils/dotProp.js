const debug = require('debug')('mf:dotProp');

const dotProp = require('dot-prop');
const isObj = require('is-obj');

// Make `dotProp.set` return `obj` and accept empty `path`
const dotProp_set = dotProp.set;
dotProp.set = (obj, path, value) => {

  path = path || '';

  debug(path+':before', dotProp.get(obj, path));

  if (path) {
    dotProp_set(obj, path, value);
  }
  else if (isObj(value)){
    Object.assign(obj, value);
  }

  debug(path+':after', dotProp.get(obj, path))

  return obj;
}
module.exports = dotProp;