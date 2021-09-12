const debug = require('debug')('mf:make-single-invoker');

module.exports = (cradleScopeFn) =>
// https://github.com/talyssonoc/awilix-express/blob/master/lib/invokers.js
{
  return function singleInvoker(req, res, next) {
    const inner_fn = cradleScopeFn(req.container.cradle);
    return inner_fn(req, res, next);
  }
}