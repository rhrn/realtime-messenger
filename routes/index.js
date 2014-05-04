var rootHandler = function (request, reply) {

  reply.view('index', {
    pageTitle: 'Chat entry point',
    room: null,
  });

};

var roomHandler = function (request, reply) {

  var room = request.params.room;
  if (!room.match(/[a-z0-9]+/i)) {
    room = 'main';
  }

  reply.view('index', {
    pageTitle: 'room: ' + room,
    room: room
  });

};

module.exports = [
  {
    method: 'GET',
    path: '/favicon.ico',
    handler: {
      file: './public/static/favicon.ico'
    }
  },
  {
    method: 'GET',
    path: '/static/{path*}',
    handler: {
      directory: {path: './public/static', listing: false, index: true}
    }
  },
  {
    method: 'GET',
    path: '/',
    handler: rootHandler
  },
  {
    method: 'GET',
    path: '/chat/room/{room*}',
    handler: roomHandler
  }
];
