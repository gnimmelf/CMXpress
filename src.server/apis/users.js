const debug = require('debug')('mf:api:users');

const {
  sendApiResponse,
  dotProp,
  maybeThrow,
  throwNotImplemented,
} = require('../lib/utils');

const RE_RE_USER_SCHEMA_MASK = new RegExp(/^user\./);

module.exports = ({ userService, authService, objService, tokenKeyName }) => {

  const getUserByHandle = (handle) => {
    return new Promise((resolve) => {
      const user = userService.getUserBy('handle', handle);

      maybeThrow(!user, `No user found by handle '${handle}'`, 404)

      debug('getUserByHandle', user)

      resolve(user);
    })
  }

  return {

    getUserList: (req, res) => {
      return new Promise((resolve, reject) => {
        resolve(userService.users);
      })
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    getCurrentUser: (req, res) => {
      return new Promise((resolve, reject) => {
        const user = userService.currentUser;
        const { propPath } = req.params

        maybeThrow(!user, 'Not logged in', 401)

        resolve(propPath
          ? dotProp.set({}, propPath, dotProp.get(user, propPath))
          : user)
      })
        .then(payload => {
          sendApiResponse(res, payload)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });

    },

    getCurrentUserGroups: (req, res) => {
      return new Promise((resolve, reject) => {
        const user = userService.currentUser;

        maybeThrow(!user, 'Not logged in', 401)

        resolve(user.groups);
      })
        .then(payload => {
          sendApiResponse(res, payload)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    invalidateSession: (req, res) => {
      var token = req.params.token || req.cookies[tokenKeyName];

      authService.authenticateToken(token)
        .then(decoded => {
          res.clearCookie(tokenKeyName);
          return authService.invalidateToken(decoded.email);
        })
        .then(payload => {
          sendApiResponse(res, payload);
        })
        .catch(err => {
          sendApiResponse(res, err);
        });
    },

    getObjectIds: (req, res) => {
      debug('getObjectIds', req.params)

      const { userHandle, ...params } = req.params;

      getUserByHandle(userHandle)
        .then((owner) => {
          return objService.getObjectIds('user', params, { owner });
        })
        .then(data => {
          sendApiResponse(res, data);
        })
        .catch(err => {
          sendApiResponse(res, err);
        });
    },

    getObj: (req, res) => {
      debug('getObj', req.params)

      const { userHandle, ...params } = req.params;

      getUserByHandle(userHandle)
        .then((owner) => {
          return objService.getObj('user', params, { owner });
        })
        .then(data => {
          sendApiResponse(res, data);
        })
        .catch(err => {
          sendApiResponse(res, err);
        });
    },

    setObj: (req, res) => {
      debug('setObj', req.params);

      const { userHandle, ...params } = req.params;

      const method = req.params.objId ? 'updateObj' : 'createObj';

      getUserByHandle(userHandle)
        .then((owner) => {

          const data = objService[method]('user', req.body, params, { owner });

          return data
        })
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    deleteObj: (req, res) => {
      debug('deleteObj', req.params);

      const { userHandle, ...params } = req.params;

      getUserByHandle(userHandle)
        .then((owner) => {
          return objService.deleteObj('user', params, { owner });
        })
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    registerUser: (req, res) => {
      debug('registerUser', req.params);

      new Promise((resolve) => {

        throwNotImplemented()

        const { email, ...body } = req.body
        const node = userService.getUserBy('email', email)
        maybeThrow(node, 'User already registered by given email', 403)

        // TODO! Access! Only `process.env.ROOT_USER_EMAIL` can register with `noAuth`
        // TODO! Access! Only admins can register new users?
        const user = objService.createObj('user', { email, ...body }, {}, { noAuth: true })

        resolve(user)
      })
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    updateUser: (req, res) => {
      debug('updateUser', req.params);

      new Promise((resolve) => {

        throwNotImplemented()

        const { userHandle, ...params } = req.params;

        // TODO! Make sure email is unique
        const { email, ...body } = req.body
        const node = userService.getUserBy('email', email)
        maybeThrow(node, 'User already registered by given email', 403)

        // TODO! Access! Only `currentUser` can update `currentUser` unless admin!
        if (userService.currentUser.id) {
          userService.setCurrentUserBy('email', currentUser.email)
        }

        return getUserByHandle(userHandle)
      })
        .then((owner) => {
          return objService.getObj('user', params, { owner });
        })
        .then(data => {
          sendApiResponse(res, data);
        })
        .catch(err => {
          sendApiResponse(res, err);
        });
    }

  };
};