/**
 * Module dependencies
 */

var dtrace;
var debug = require('debug')('koa:dtrace');

/**
 * Globals
 */

var provider;
var probes = {
  // id, method, url
  routeStart: ['int', 'char *', 'char *'],
  // id, statusCode
  routeEnd: ['int', 'int']
};

var ID = 0;
var MAX_INT = Math.pow(2, 32) - 1;

/**
 * Init our provider
 */

try {
  dtrace = require('dtrace-provider');
  provider = dtrace.createDTraceProvider('koa');
} catch (e) {
  provider = {
    fire: function () {
      debug('Fire');
    },
    enable: function () {
      debug('Enable');
    },
    addProbe: function () {
      debug('Add probe');
      var p = {
        fire: function () {
        }
      };
      return (p);
    },
    removeProbe: function () {
      debug('Remove probe');
    },
    disable: function () {
      debug('Disable');
    }
  };
}

Object.keys(probes).forEach(function (probe) {
  provider.addProbe.apply(provider, probes[probe]);
});

/**
 * nextId
 */

function nextId() {
  if (++ID >= MAX_INT) {
    ID = 1;
  }
  return ID;
}

/**
 * staticProvider
 */

var staticProvider = function () {
  return function *dtrace(next) {

    var dtraceId = nextId();

    provider.fire('routeStart', function () {
      return [dtraceId, this.method, this.url];
    });

    try {
      yield next;
    } catch (err) {
      // log uncaught downstream errors
      log(this, start, null, err);
      throw err;
    }

    provider.fire('routeEnd', function () {
      return [dtraceId, this.status || 404];
    });

  }
}();

/**
 * Expose `staticProvider`.
 */

module.exports = staticProvider;
