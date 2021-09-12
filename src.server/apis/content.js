const debug = require('debug')('mf:api:content');

const {
  sendApiResponse,
} = require('../lib/utils');

module.exports = ({ objService }) => {

  return {

    getObjectIds: (req, res) => {
      debug('getObjectIds', req.params)

      objService.getObjectIds('content', req.params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    getObj: (req, res) => {
      debug('getObj', req.params)

      objService.getObj('content', req.params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    setObj: (req, res) => {
      debug('setObj', req.params);

      const method = req.params.objId ? 'updateObj' : 'createObj';

      objService[method]('content', req.body, req.params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    deleteObj: (req, res) => {
      debug('deleteObj', req.params);

      objService.deleteObj('content', req.params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    }

  };
};