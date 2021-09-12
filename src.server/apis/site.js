const debug = require('debug')('mf:api:site');

const {
  sendApiResponse,
} = require('../lib/utils');

module.exports = ({ objService, schemaService }) =>
/*
  NOTE! All site-data are "singletons"
  -So per "site.*"-schema, there is only one corresponding ".json"-data-file designated by the suffix after "site.".
*/ {

  return {

    getObjectIds: (req, res) => {
      debug('getObjectIds', req.params)

      schemaService.getSchemaNames('site.*')
        .then(schemaNames => {
          sendApiResponse(res, schemaNames)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    getObj: (req, res) => {
      debug('getObj', req.params)

      objService.getObj('site', req.params)
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

      objService[method]('site', req.body, req.params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    },

    deleteObj: (req, res) => {
      debug('deleteObj', req.params);

      objService.deleteObj('site', req.params)
        .then(data => {
          sendApiResponse(res, data)
        })
        .catch(err => {
          sendApiResponse(res, err)
        });
    }

  };
};