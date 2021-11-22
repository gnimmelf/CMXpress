const debug = require('debug')('mf:routes:api.data')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const apiContent = makeInvoker(require('../../apis/content'));

// Data
router.get('/:schemaPath/list', apiContent('getObjectIds'));
router.get('/:schemaPath/:objId/:propPath?', apiContent('getObj'));
router.post('/:schemaPath/:objId?/:propPath?', apiContent('setObj'));
router.delete('/:schemaPath/:objId/:propPath?', apiContent('deleteObj'))

module.exports = router;

/*
http --session=~/tmp/session.json GET :3000/api/content/article/list
http --session=~/tmp/session.json GET :3000/api/content/article/a-test
http --session=~/tmp/session.json GET :3000/api/content/article/a-test.json

http --session=~/tmp/session.json GET :3000/api/content/product/list

http --session=~/tmp/session.json POST :3000/api/content/article/article-c title=title-c content=content-c
*/