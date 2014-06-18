var Promise = require('bluebird');
var settings = module.exports = {};

module.exports.setup = function (args) {
  if (typeof args.getByTypeAndId !== 'function') throw new Error('getByTypeAndId function not provided');
  if (typeof args.setByTypeAndId !== 'function') throw new Error('setByTypeAndId function not provided');
  if (typeof args.deleteByTypeAndId !== 'function') throw new Error('deleteByTypeAndId function not provided');
  if (typeof args.getByTypeAndRef !== 'function') throw new Error('getByTypeAndRef function not provided');

  settings.getByTypeAndId = Promise.coroutine(args.getByTypeAndId);
  settings.setByTypeAndId = Promise.coroutine(args.setByTypeAndId);
  settings.deleteByTypeAndId = Promise.coroutine(args.deleteByTypeAndId);
  settings.getByTypeAndRef = Promise.coroutine(args.getByTypeAndRef);

  settings.validateJSON = Promise.coroutine(args.validateJSON || function * () {});
  settings.generateId = Promise.coroutine(args.generateId || function * () {
    return Date.now().toString();
  });

  settings.idKey = args.idKey || '_id';
  settings.readonlyKey = args.readonlyKey || '_readonly';
  settings.privateKey = args.privateKey || '_private';
};