const debug = require('debug')('mf:routes:api.authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/schema'));

router.get('/list/:globpattern?/:operation?', api('getSchemaNames'));
router.get('/:schemaName', api('getSchema'));

module.exports = router;

/*
http --session=~/tmp/session.json GET :3000/api/schema/list
http --session=~/tmp/session.json GET :3000/api/schema/list/content.*
http --session=~/tmp/session.json GET :3000/api/schema/content.article
http --session=~/tmp/session.json GET :3000/api/schema/content.article.json
*/