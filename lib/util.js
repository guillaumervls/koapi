var _ = require('lodash');

var merge2Schemas = function (schema1, schema2) {
  return _.merge(_.cloneDeep(schema1), schema2, function (a, b) {
    if (_.isArray(a) && _.isString(a[0])) {
      return _.isArray(b) ? a.concat(b) : a;
    }
  });
};

module.exports.mergeSchemas = function mergeSchemas() {
  var args = Array.prototype.slice.call(arguments);
  return _.reduce(args, merge2Schemas);
};