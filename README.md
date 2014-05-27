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
  validateJSON: function * (schema, json) {
    // throw or return a rejected promise if not valid
  },
  getByIdAndType: function * (type, id) {
    return item; // A document (or a promise for it)
  },
  setByIdAndType: function * (type, id, object) {
    // ...
  },
  deleteByIdAndType: function * (type, id) {
    // ...
  },
  getByRefAndType: function * (type, id) {
    // gets all the ids of the docs referencing a document
    return items; // An array of documents (or a promise for it)
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
  semanticValidate: function * (doc) {
    // Additional semantic data validation
    // that cannot be done with a schema
    // Throw or return a rejected promise if not valid
  },
  // GET /users
  index: function * (getParams) {
    return {
      documents: [...],
      meta: {}
    };
  },
  consolidate: function * (doc) {
    return docToStore;
  },
  // OPTIONAL : by default JSON deep equality test
  // between new/old stored docs
  shouldTriggerUpdates: function * (newDoc, oldDoc) {
    return true || false;
  },
  outputFormat: function * (doc) {
    return formattedDoc;
  }
});
```

##API

You can/should **implement**, but you shoudn't **call** `index`, `semanticValidate`, `consolidate`, `shouldTriggerUpdates` and `outputFormat`.

<!--
###consolidateReferents(type1, type2, ...)
Trigger a consolidation of documents that reference `this` document. You can consolidate only certain types of referents by providing them to the function.

###consolidateById(id)
Trigger a consolidation on a document.
-->

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
