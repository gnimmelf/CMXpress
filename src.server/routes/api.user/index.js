const debug = require('debug')('mf:routes:api.authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/user'));

const authorizeRequest = require('../../middleware/authorizeRequest');

// User
router.get('/list', authorizeRequest(['user']), api('getUserList'));
router.get('/current', api('getCurrentUser'));
router.get('/current/groups', api('getCurrentUserGroups'));
router.get('/logout', api('invalidateSession'));
router.post('/register', api('registerUser'));

// User-data
router.get('/:userHandle/data/:schemaNameSuffix/list', api('getObjectIds'));
router.get('/:userHandle/data/:schemaNameSuffix/:objId', api('getObj'));
router.post('/:userHandle/data/:schemaNameSuffix/:objId/:dottedPath?', api('setObj'));
router.delete('/:userHandle/data/:schemaNameSuffix/:objId/:dottedPath?', api('setObj'));

module.exports = router;

/*
http --session=~/tmp/session.json POST :3000/api/user/register email=gnimmelf@gmail.com
http --session=~/tmp/session.json GET :3000/api/user/current
http --session=~/tmp/session.json GET :3000/api/user/logout
http --session=~/tmp/session.json GET :3000/api/user/gnimmelf/data/blog/list
http --session=~/tmp/session.json GET :3000/api/user/gnimmelf/data/blog/a-test
*/