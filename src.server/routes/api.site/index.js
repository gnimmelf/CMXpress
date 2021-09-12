const debug = require('debug')('mf:routes:api.data')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/site'));

// Site
router.get('/list', api('getObjectIds'));

// TODO! Make these work
router.get('/:schemaNameSuffix/:dottedPath?', api('getObj'));
router.post('/:schemaNameSuffix/:dottedPath?', api('setObj'));

module.exports = router;

/*
http --session=~/tmp/session.json GET :3000/api/site/*.public/list
http --session=~/tmp/session.json GET :3000/api/site/list/
http --session=~/tmp/session.json GET :3000/api/site/settings.public
*/