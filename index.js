module.exports = {
  Promise: require('bluebird'),
  Resource: require('./lib/resource'),
  setup: require('./lib/settings').setup,
  util: require('./lib/util')
};
