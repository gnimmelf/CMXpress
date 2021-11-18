const debug = require('debug')('mf:api:inspect');

const expressListEndpoints = require('express-list-endpoints');

const Table = require('cli-table')

const {
  sendApiResponse,
  requestFullUrl
} = require('../lib/utils');

module.exports = ({ app }) => {
  const endpoints = {
    asObj: expressListEndpoints(app)
      .filter(endpoint => endpoint.methods && endpoint.path)
  };

  const table = new Table({
    head: ['Method', 'url'],
  });

  table.push(...endpoints.asObj.map(endpoint => ([endpoint.methods[0], endpoint.path])));

  endpoints.asText = table.toString();
  endpoints.asHtml = ['<pre>', table.toString().replace(/\x1B[[(?);]{0,2}(;?\d)*./g, ''), '</pre>'].join('\n');

  return {

    getEndpoints: (req, res) => sendApiResponse(res, endpoints.asObj),
    getEndpointsAsHtml: (req, res) => res.send(endpoints.asHtml),
    getEndpointsAsText: (req, res) => res.send(endpoints.asText),

  };
};