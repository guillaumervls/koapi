KOAPI
=====

Easily build a REST API with [Koa](http://koajs.com)

#INSTALL

```
npm install koapi
```

#USE

Koapi is based on [Bluebird](https://github.com/petkaantonov/bluebird) promises, you can access Bluebird via :

```javascript
var Promise = require('koapi').Promise;
```

First setup Koapi :

```javascript
var koapi = require('koapi');

koapi.setup({

  idKey: '_id',

  readonlyKey: '_readonly', // Where you put computed stuff every consolidation
                            // WARNING !
                            // This key is undefined in the doc passed to consolidate
                            // Be sure to explicitly put what you need in it
                            // possibly from the oldDoc if you don't need to recompute

  privateKey: '_private', // All data under this key in documents
                          // will be stripped from output
                          // (so you don't need to do it in outputFormat)
                          // NB: This key should be under "_readonly"
                          // (or the value of "readonlyKey")

  generateId: function * (type, json) { // defaults to Date.now().toString()
    // return id (or a promise for it)
  },

  validateJSON: function * (schema, json) { // defaults to always pass
    // throw or return a rejected promise if not valid
  },

  getByTypeAndId: function * (type, id) {
    return item; // A document (or a promise for it)
  },

  setByTypeAndId: function * (type, id, object) {
    // Be sure to allow "upsert" operations
  },

  deleteByTypeAndId: function * (type, id) {
  },

  getByTypeAndRef: function * (type, id) {
    // gets all the ids of the docs referencing a document
    return items; // An array of documents (or a promise for it)
  }

});
```

`Ressource` inherits from [Koa Ressource Router](https://github.com/alexmingoia/koa-resource-router). But from that you just have to set `index`. Then you set `index`, `semanticValidate`, `consolidate`, `shouldTriggerUpdates` and `outputFormat`. All these functions (or generators you can use `yield` inside of them) can return documents or promises.

```javascript
var Ressource = require('koapi').Ressource;

var type = new Resource('type', {

  schema: {
    // To validate data structure coming from the client
    // This schema will be extended :
    //   - to allow a "_readonly" (you can change that in setup)
    //     property, in which you put computed stuff
    //     from other properties.
  },

  // GET /type?a=x&b=y
  // getParams = {a:'x', b:'y'}
  index: function * (getParams) {
    return {
      documents: [...],
      meta: {}
    };
    // -- OR --
    return [...]; // documents (meta = {})
  },

  consolidate: function * (doc, oldDoc) {
    // WARNING !
    // doc._readonly is undefined
    // Be sure to explicitly put what you need in it everytime it is called
    // possibly from oldDoc if you don't need to recompute

    // Semantic validation (thow if necessary)
    // Include related docs
    // Compute stuff (put them in _readonly)
    return docToStore;
  },

  getStaleDocs: function * (doc, oldDoc) {
    // Return a list of docs ids and types that need
    // consolidation after consolidation of this one
    // (in this function doc is consolidated)
    return [[id1, type1], [id2, type2], ...]; // (or a promise for that)
  },

  shouldTriggerRemoteConsolidations: function * (doc, oldDoc) {
    // Should we try consolidating docs related to this one ?
    // by default JSON deep equality test
    // between new/old stored docs
    return true || false;
  },

  outputFormat: function * (doc) {
    // Koapi will delete anything under the "_private"
    // (can be changed in setup)
    // Put a falsy value in setup.privateKey to disable
    return formattedDoc;
  }

});
```

And at the end :

```javascript
var app = require('koa')();
app.use(type.middleware());
```

##API

You can/should **implement**, but you shoudn't **call** `index`, `consolidate`, `getStaleDocs`, `shouldTriggerUpdates` and `outputFormat`.

All these functions will be called in Koa's request/response context.

###Util

```javascript
var util = require('koapi').util;
```

- `util.mergeSchemas(schema1, schema2, schema3, ...)` : merge JSON-schemas

##NB :

These `koa-ressource-router`'s methods are not implemented (and IMHO should not be).

```javascript
  // GET /type/new
  new: function *(next) {
  },
  // GET /type/:id/edit
  edit: function *(next) {
  }
```

# Licence
MIT
