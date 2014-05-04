var app = angular.module('rtm', []);

app.factory('messenger', ['$rootScope', '$q', '$location', function($rootScope, $q, $location) {

  var clientId  = Math.random().toString().substr(2);
  var client    = new Messaging.Client($location.host(), 3005, clientId); 
  var messenger = $rootScope.$new();
  var deferred  = $q.defer();

  var onConnect = function() {
    console.log ('connection success');
    deferred.resolve(messenger);
  };

  var onFailure = function() {
    console.log ('connection fail');
    deferred.reject();
  };
  
  var onMessageArrived = function(message) {
    try {
      var data = JSON.parse(message.payloadString);
      messenger.$emit('message', data);
    } catch(e) {
      console.log ('json parse error', message)
    }
  };

  client.onConnect = onConnect;
  client.onMessageArrived = onMessageArrived;

  messenger.clientId = clientId;
  messenger.room = null;

  messenger.subscribe = function(room) {
    room = '/' + room;
    client.subscribe(room);
    this.room = room;
  };

  messenger.unsubscribe = function(room) {
    client.unsubscribe('/' + room);
    this.room = null;
  };

  messenger._send = function(data) {

    data.username = localStorage.getItem('username');
    data.clientId = this.clientId;
    data.date = new Date();

    message = new Messaging.Message(JSON.stringify(data));
    message.destinationName = this.room;
    client.send(message);
  };

  messenger.sendTyping = function() {

    var data = {
      type: 'typing'
    };
    this._send(data);
  };

  messenger.sendMessage = function(message) {

    if (this.room === null) {
      console.log ('subscribe first');
      return;
    }

    var data = {
      type: 'message',
      text: message
    }
    this._send(data);
  };

  messenger.connect = function() {
    client.connect({
      onSuccess: onConnect,
      onFailure: onFailure
    });
  };

  messenger.connect();

  return deferred.promise;

}]);

app.controller('usernameController', ['$rootScope', function($rootScope) {

  $rootScope.setUsername = function(name) {
    console.log ('set username', name);
    $rootScope.user.name = name;
    localStorage.setItem('username', name);
  };

  $rootScope.clearUsername = function() {
    $rootScope.user.name = '';
    localStorage.removeItem('username');
  };

}]);

app.controller('newroomController', ['$rootScope', 'messenger', function($rootScope, messenger) {

  messenger.then(function(messenger) {

    $rootScope.joinToRoom = function(name) {
      console.log ('join to room', name);
      messenger.subscribe(name);
      $rootScope.user.room = name;
      localStorage.setItem('room', name);
    };

    $rootScope.leaveRoom = function() {
      var name = messenger.room;
      console.log ('leave room', name);
      messenger.unsubscribe(name);
      localStorage.removeItem('room');
      $rootScope.user.room = '';
    };

  });

}]);

app.controller('messagesController', ['$rootScope', '$scope', 'messenger', function($rootScope, $scope, messenger) {

  $scope.messages = [];

  messenger.then(function(messenger) {

    messenger.subscribe(localStorage.getItem('room'));

    $rootScope.sendMessage = function(message) {
      console.log ('send message', message);
      messenger.sendMessage(message);
      $rootScope.user.message = '';
    };

    messenger.$on('message', function(event, message) {

      console.log ('messenger.onMessage', message);

      $scope.$apply(function() {
        $scope.messages.push(message);
      });

    });

  });

}]);

app.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$apply(function (){
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});

app.run(['$rootScope', '$location', 'messenger', function($rootScope, $location, messenger) {

  var absUrl = $location.absUrl();
  var chatMark = 'chat/room';
  var chatMarkLength = chatMark.length
  var chatMarkIndex = absUrl.indexOf(chatMark);
 
  if (chatMarkIndex !== -1) {
    localStorage.setItem('room', absUrl.substr(chatMarkIndex + chatMarkLength + 1));
  }

  $rootScope.user = {
    nameModel: '',
    roomModel: '',
    message: '',
    name: localStorage.getItem('username'),
    room: localStorage.getItem('room'),
    chatMarkIndex: chatMarkIndex
  };

}]);
