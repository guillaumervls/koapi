var koapi = require('./index');

koapi.setup({
  getByIdAndType: function * () {
    console.log(this);
    return {
      x: 12
    };
  },
  setByIdAndType: function * () {},
  deleteByIdAndType: function * () {},
  getByRefAndType: function * () {}
});

var resource = new koapi.Resource('resources', {
  index: function * (getParams) {
    return koapi.Promise.resolve([getParams, getParams, getParams, getParams, getParams, getParams, getParams, getParams, getParams]);
  },
  outputFormat: function * (doc) {
    doc.test = this.query.a;
    return doc;
  }
});

var app = require('koa')();
app.use(resource.middleware());
app.listen(8080);