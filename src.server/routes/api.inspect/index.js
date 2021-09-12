const debug = require('debug')('mf:routes:api.inspect');
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/inspect'));

router.get('/inspect', api('getEndpoints'));
router.get('/inspect/toHtml', api('getEndpointsAsHtml'));
router.get('/inspect/toText', api('getEndpointsAsText'));

module.exports = router;

/*
http --session=~/tmp/session.json GET :3000/api/inspect
http --session=~/tmp/session.json GET :3000/api/inspect/toText
*/