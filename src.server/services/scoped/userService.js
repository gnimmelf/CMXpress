const debug = require('debug')('mf:service:userService');
const { join } = require('path');
const assert = require('assert');

// Symbols
const USERID = Symbol('userId');
const GROUPS = Symbol('groups');

const AUTH_PATH = 'auth.json';
const USER_PATH = 'user.json';
const JSON_PATH_USERS = "$[*]['user.json']"

module.exports = ({ dbService }) => {

  const userDb = dbService.user;

  // Scoped variables
  let currentUser, userList;

  class User {
    constructor(userId) {
      this[USERID] = userId;
      Object.assign(this, userDb.get(join(userId, USER_PATH)));
    }

    get userId() {
      return this[USERID];
    }

    get groups() {
      if (!this[GROUPS]) {
        const groups = userDb.get(join(this[USERID], AUTH_PATH), 'groups');

        console.log({ groups })

        // Set groups, automatically add `user`-group
        this[GROUPS] = groups.concat('user')
      }

      return this[GROUPS];
    }
  };

  const getUserBy = (key, value) => {
    let user;

    assert(key, 'No key passed!')

    if (value) {
      const node = userDb.jsonPath(JSON_PATH_USERS)
        .find(node => node.value[key] == value);

      // The `userId` is the second element of the `node.path`
      if (node) user = new User(node.path[1])
    }

    debug('getUserBy', key, value, '=>', user?.email);

    return user;
  }

  const getUserList = () => {
    if (userList == undefined) {
      userList = userDb.jsonPath(JSON_PATH_USERS)
        .map(node => ({
          handle: node.path[1],
          name: `${node.value.firstName} ${node.value.lastName}`,
        }));
    }
    return userList;
  }

  return {
    // Functions

    // TODO! Refresh `currentUser` after updating user

    setCurrentUserBy: (key, value) => {
      debug('setCurrentUserBy', key, value, `(was '${currentUser?.email})'`);
      currentUser = getUserBy(key, value);
    },
    getUserBy,
    // Getters
    get currentUser() { return currentUser },
    get users() { return getUserList() },
  }

};
