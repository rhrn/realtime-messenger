var Hapi   = require('hapi');
var routes = require('./routes');
var mosca  = require('mosca');

var serverOptions = {
  host: 'localhost',
  port: 3005
};

var hapiOptions = {
  views: {
    engines: { jade: 'jade' },
    path: __dirname + '/views',
    compileOptions: {
      pretty: true
    }
  }
};

var ascoltatore = {
  type: 'mongo',
  url: 'mongodb://localhost:27017/mqtt',
  pubsubCollection: 'ascoltatori',
  mongo: {}
};

var mqttSettings = {
  backend: ascoltatore
};

var httpServer = new Hapi.Server(serverOptions.port, hapiOptions);
var mqttServer = new mosca.Server(mqttSettings);

mqttServer.attachHttpServer(httpServer.listener);

httpServer.route(routes);

mqttServer.on('ready', function() {
  console.log('Mosca server is up and running');
});

httpServer.start(function() {
  console.log('hapi (%s) start at %s',
    Hapi.version, httpServer.info.uri);
});
