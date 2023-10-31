const debug = require('debug')('cmx:routes:api.authenticate')
const { Router } = require('express');
const { makeInvoker } = require('awilix-express');

const router = Router();
const api = makeInvoker(require('../../apis/users'));

const authorizeRequest = require('../../middleware/authorizeRequest');

// User
router.get('/list', authorizeRequest(['user']), api('getUserList'));
router.get('/current/:propPath?', api('getCurrentUser'));
router.get('/current/groups', api('getCurrentUserGroups'));
router.get('/logout', api('invalidateSession'));
router.post('/register', api('registerUser'));
router.post('/update/:userHandle', api('updateUser'));

// User-content
router.get('/:userHandle/content/:schemaPath/list', api('getObjectIds'));
router.get('/:userHandle/content/:schemaPath/:objId', api('getObj'));
router.post('/:userHandle/content/:schemaPath/:objId/:propPath?', api('setObj'));
router.delete('/:userHandle/content/:schemaPath/:objId/:propPath?', api('deleteObj'));

module.exports = router;

/*
http --session=~/tmp/session.json POST :3000/api/user/register email=gnimmelf@gmail.com
http --session=~/tmp/session.json GET :3000/api/user/current
http --session=~/tmp/session.json GET :3000/api/user/logout
http --session=~/tmp/session.json GET :3000/api/user/gnimmelf/content/blog/list
http --session=~/tmp/session.json GET :3000/api/user/gnimmelf/content/blog/a-test
*/