const debug = require('debug')('cmx:routes:api.authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/authenticate'));

router.post('/request', api('requestLoginCodeByEmail'));
router.post('/exchange', api('exchangeLoginCode2Token'));
// TODO! Is exposing `api('authenticateToken')` dangerous?
router.post('/authenticate', api('authenticateToken'));


module.exports = router;

/*
http --session=~/tmp/session.json POST :3000/api/auth/request email=gnimmelf@gmail.com
http --session=~/tmp/session.json POST :3000/api/auth/exchange email=gnimmelf@gmail.com code=06856
http --session=~/tmp/session.json GET :3000/api/user/current
http --session=~/tmp/session.json GET :3000/api/user/logout
*/