const debug = require('debug')('mf:routes:api.data')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const apiContent = makeInvoker(require('../../apis/content'));

// Data
router.get('/:schemaNameSuffix/list', apiContent('getObjectIds'));
router.get('/:schemaNameSuffix/:objId/:dottedPath?', apiContent('getObj'));
router.post('/:schemaNameSuffix/:objId?/:dottedPath?', apiContent('setObj'));
router.delete('/:schemaNameSuffix/:objId/:dottedPath?', apiContent('deleteObj'))

module.exports = router;

/*
http --session=~/tmp/session.json GET :3000/api/content/article/list
http --session=~/tmp/session.json GET :3000/api/content/article/a-test
http --session=~/tmp/session.json GET :3000/api/content/article/a-test.json

http --session=~/tmp/session.json GET :3000/api/content/product/list

http --session=~/tmp/session.json POST :3000/api/content/article/article-c title=title-c content=content-c
*/