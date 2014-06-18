var nodeUtil = require('util');
var koapiUtil = require('./util');
var Resource = require('koa-resource-router');
var settings = require('./settings');
var Promise = require('bluebird');
var _ = require('lodash');

var _resources = {};

function * identity(doc) {
  return doc;
}

function * deepEqual(doc1, doc2) {
  return !_.isEqual(doc1, doc2);
}

module.exports = function (type, config) {
  config = config || {};

  var consolidate = Promise.coroutine(config.consolidate || identity);
  var getStaleDocs = Promise.coroutine(config.getStaleDocs || function * () {
    return [];
  });
  var shouldTriggerRemoteConsolidations = Promise.coroutine(config.shouldTriggerRemoteConsolidations || deepEqual);

  var processConsolidations = this.processConsolidations = Promise.coroutine(function * (doc, options) {
    if (!doc) return;
    options = options || {};
    var newDoc;
    var oldDoc = options.isNotFirstPass ? doc : yield settings.getByTypeAndId(type, doc[settings.idKey]);
    if (options.isDeletion && !oldDoc) this.throw(404);
    try {
      newDoc = yield consolidate.call(this, doc, oldDoc);
      if (options.isDeletion) newDoc = null;
    } catch (e) {
      if (!options.isNotFirstPass) {
        throw e;
      }
    }
    yield settings[newDoc ? 'setByTypeAndId' : 'deleteByTypeAndId'](type, doc[settings.idKey], newDoc);
    if (yield shouldTriggerRemoteConsolidations.call(this, newDoc, oldDoc)) {
      var ctx = this;
      yield[
        Promise.map(_.keys(_resources), function (type) {
          return settings.getByTypeAndRef(type, doc[settings.idKey]).map(function (doc) {
            return _resources[type].processConsolidations.call(ctx, doc, {
              isNotFirstPass: true
            });
          });
        }),
        getStaleDocs.call(this, newDoc, oldDoc).map(Promise.coroutine(function * (docIdAndType) {
          var docId = docIdAndType[0],
            type = docIdAndType[1];
          return _resources[type].processConsolidations.call(ctx, settings.getByTypeAndId(type, docId), {
            isNotFirstPass: true
          });
        }))
      ];
    }
    return newDoc;
  });

  var outputFormat = Promise.coroutine(function * (doc) {
    yield Promise.coroutine(config.outputFormat || identity).call(this, doc);
    if (settings.privateKey) delete doc[settings.privateKey];
    return doc;
  });

  var minSchema = {
    type: 'object',
    properties: {}
  };
  minSchema.properties[settings.readonlyKey] = {
    type: 'object',
    additionalProperties: true,
    properties: {}
  };
  var schema = koapiUtil.mergeSchemas(config.schema || {}, minSchema);
  var validate = function * (next) {
    this.request.body = this.request.body || {};
    this.request.body[settings.idKey] = this.params.id || this.request.body[settings.idKey] || (yield settings.generateId(type, this.request.body));
    try {
      yield settings.validateJSON(schema, this.request.body);
    } catch (err) {
      this.throw(400, err.message);
    }
    yield next;
  };

  var upsert = function * () {
    var doc = JSON.parse(JSON.stringify(this.request.body));
    delete doc[settings.readonlyKey];
    var consolidatedDoc = yield processConsolidations.call(this, doc);
    this.body = yield outputFormat.call(this, consolidatedDoc);
  };

  var resourceConfig = {

    // GET /type/:id
    show: function * () {
      var doc = yield settings.getByTypeAndId(type, this.params.id);
      if (!doc) {
        this.throw(404);
      }
      this.body = yield outputFormat.call(this, doc);
    },

    // DELETE /type/:id
    destroy: function * () {
      var doc = this.request.body || {};
      doc[settings.idKey] = this.params.id;
      yield processConsolidations.call(this, doc, {
        isDeletion: true
      });
      this.body = null;
    },

    // POST /type
    create: [validate, upsert],
    // PUT /type/:id
    update: [validate, upsert],
  };

  // GET /type
  if (config.index) {
    resourceConfig.index = function * () {
      var indexResult = yield Promise.coroutine(config.index).call(this, this.query);
      if (indexResult instanceof Array) {
        indexResult = {
          documents: indexResult
        };
      }
      this.body = {
        meta: indexResult.meta || {},
        documents: yield indexResult.documents.map(outputFormat, this)
      };
    };
  }

  Resource.call(this, type, resourceConfig, {
    id: 'id'
  });
  _resources[type] = this;
};

nodeUtil.inherits(module.exports, Resource);