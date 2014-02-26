var koa = require('koa');
var supertest = require('supertest');
var dtrace = require('./');

describe('Koa DTrace', function () {

  it('works with Koa', function (done) {
    var app = koa();
    app.use(dtrace());

    app.use(function *(){
      this.body = 'dtrace!';
    });

    supertest(app.listen())
      .get('/')
      .expect(200, done);
  });

});