const debug = require('debug')('mf:service:accessService');
const { join } = require('path');
const intersect = require('intersect');
const {
  maybeThrow
} = require('../../lib/utils');

const IS_PARSED = Symbol('parsed');

module.exports = ({ dbService }) => {

  const accessGroups = dbService.site.get('groups.json');

  const parseUser = (user) => user && user[IS_PARSED] ? user : ({
    id: (user ? user.userId : false),
    groups: (user ? user.groups : []),
    [IS_PARSED]: true,
  });

  const getRestrictionLevel = (allowedGroups = []) =>
  /*
    Zero is most secure `accessLevel`, so
    - Start with zero and increase the level to the maximum `accessLevel` of the groups
  */ {
    let restrictionLevel = 0;

    if (~allowedGroups.indexOf("*")) {
      // Wildcard means everybody, eg. any and no group
      restrictionLevel = Number.MAX_SAFE_INTEGER;
    }
    else {
      restrictionLevel = allowedGroups.reduce((currentLevel, group) => {
        const accessGroup = accessGroups.find(accessGroup => accessGroup.key == group);
        return (accessGroup ? Math.max(accessGroup.accessLevel, currentLevel) : currentLevel);
      }, restrictionLevel);
    }

    return restrictionLevel;
  };

  const getAccessLevel = (userGroups = []) =>
  /*
    `MAX_SAFE_INTEGER` is lest secure `accessLevel`, so
    - Start with `MAX_SAFE_INTEGER` and decrease the level to the minimum `accessLevel` of the groups
  */ {
    let accessLevel = Number.MAX_SAFE_INTEGER;

    accessLevel = userGroups.reduce((currentLevel, group) => {
      const accessGroup = accessGroups.find(x => x.key == group);
      return (accessGroup ? Math.min(accessGroup.accessLevel, currentLevel) : currentLevel);
    }, accessLevel);

    return accessLevel;
  }

  const authorizeByGroups = (user, allowedGroups = []) => {
    user = parseUser(user);

    const accessLevel = getAccessLevel(user.groups);
    const restrictionLevel = getRestrictionLevel(allowedGroups);
    const isAuthorized = accessLevel <= restrictionLevel;

    debug('authorizeByGroups', {
      user: {
        ...user,
        accessLevel: accessLevel,
      },
      restriction: {
        allowedGroups: allowedGroups,
        restrictionLevel: restrictionLevel,
      },
      isAuthorized: isAuthorized,
    })

    return isAuthorized;
  };

  const authorizeByACLg = (user, ACLg = {}, operation, { owner = null, noAuth = false } = {}) => {
    user = parseUser(user);
    owner = parseUser(owner);

    const isOwner = (user.id && owner.id ? user.id == owner.id : false);

    let isAuthorized = isOwner

    if (!isAuthorized) {
      // Get all ACLg groupKeys that match `operation`
      const allowedGroups = Object.entries(ACLg)
        .filter(([groupKey, permissions]) => !!intersect(permissions, [operation, "*"]).length)
        .map(([groupKey, permissions]) => groupKey)

      //isAuthorized = getAccessLevel(user.groups) <= getRestrictionLevel(allowedGroups); // Brief
      isAuthorized = authorizeByGroups(user, allowedGroups); // Verbose
    }

    if (!noAuth) {
      maybeThrow(!isAuthorized, user ? 'Unauthorized' : 'Not logged in', 401)
    }

    debug('authorizeByACLg', isAuthorized, isOwner)

    return user;
  };

  return {
    authorize: (...args) => (args[1] instanceof Array ? authorizeByGroups(...args) : authorizeByACLg(...args)),
    getRestrictionLevel: getRestrictionLevel,
    getAccessLevel: getAccessLevel,
    authorizeByGroups: authorizeByGroups,
    authorizeByACLg: authorizeByACLg,
  }
};