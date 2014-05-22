KOAPI
=====

Easily build a REST API with [Koa](http://koajs.com)

#INSTALL

```
npm install koapi
```

#USE

Koapi is based on [Bluebird](https://github.com/petkaantonov/bluebird) promises, you can access Bluebird via
```javascript
var Promise = require('koapi').Promise;
```

```javascript
var koapi = require('koapi');

koapi.settings({
  validateJSON: function (schema, json) {
    return promiseForValidation;
  },
  getByIdAndType: function (type, id) {
    return promiseForItem;
  },
  setByIdAndType: function (type, id, object) {
    return promiseForInsertion;
  },
  deleteByIdAndType: function (type, id) {
    return promiseForDeletion;
  },
  getByRef: function (type, id) {
    // gets all the ids of the docs referencing a document
    return promiseForArray;
  }
});
```

`Ressource` inherits from [Koa Ressource Router](https://github.com/alexmingoia/koa-resource-router). But from that you just have to set `index`. Then you set `consolidate`. In it you can call `this.consolidateReferents()` and `otherRessource.consolidateById(id)`. These functions return promises.

```javascript
var Ressource = require('koapi').Ressource;

var users = new Resource('users', {
  schema: {
    // To validate data structure coming from the client
  },
  semanticValidate: function * (json) {
    // Additional semantic data validation
    // that cannot be done with a schema
  },
  // GET /users
  index: function * (next) {
    // You should write your documents to this.documents and metadata to this.meta
  },
  consolidate: function * (json) {
  },
  outputFormat: function * (next) {
    // Transform documents in this.documents
  }
});
```

##API

You can implement, but you shoudn't call `index`, `semanticValidate`, `consolidate` and `outputFormat`.

###consolidateReferents(type1, type2, ...)
Trigger a consolidation of documents that reference `this` document. You can consolidate only certain types of referents by providing them to the function.

###consolidateById(id)
Trigger a consolidation a document.

##NB :

These `koa-ressource-router`'s methods are not implemented (and IMHO should not be).

```javascript
  // GET /users/new
  new: function *(next) {
  },
  // GET /users/:id/edit
  edit: function *(next) {
  }
```

# Licence
MIT
