#!/usr/bin/env node
var http = require('http');
var WebSocketServer = require('./node_modules/websocket/lib/websocket').server;
var redis = require('redis');

var redis_config = require('./redis_config')[process.env.NODE_ENVIRONMENT || 'development'];
var globalRedisClient = redis.createClient(redis_config.port, redis_config.host);

function prettyLog(title, content) {
  console.log('['+Date()+']',
    '['+title.toUpperCase()+']',
    content
  )
}

function redisSubcription(user_info) {
  this.redis_client = redis.createClient(redis_config.port, redis_config.host);
  this.redis_client.current_subscription = this;
  this.redis_client.on("message", function(channel, message) {
    if(typeof this.current_subscription.connection !== 'undefined' ) {
      prettyLog('to user '+user_info.user_id, "channel: "+channel+'; message: '+message.substring(0,100));
      if(/disconnect/.test(channel)) { this.current_subscription.connection.close(); }
      else { this.current_subscription.connection.sendUTF(message); }
    }
    else { this.end(); }
  });

  this.redis_client.subscribe("bvip:general_changes",  
    "bvip:user_changes:" + user_info.user_id,
    "bvip:company_changes:" + user_info.company_id,
    "bvip:disconnect:" + user_info.user_id,
    "bvip:disconnect_device:" + user_info.device_id);
}

app = http.createServer(function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Hello World\n');
}).listen(process.env.PORT);

var wsServer = new WebSocketServer({
    httpServer: app,
    fragmentOutgoingMessages: false
});

var connections = [];

wsServer.on('request', function(request) {
  auth_token = request.resourceURL.query.auth_token;

  globalRedisClient.hgetall('bvip:auth_token:' + auth_token, function(err, result) {
    if(result) {
      var connection = request.accept(null, request.origin);
      connections.push(connection);

      request_info = JSON.stringify({'address': request.httpRequest.headers['x-real-ip'],
        'user_agent': request.httpRequest.headers['x-real-user-agent'],
        'protocol_version': connection.webSocketVersion
      });

      prettyLog('connected', request_info); 

      connection.subscription = new redisSubcription(result);
      connection.subscription.connection = connection;
      connection.request_info = request_info;

      prettyLog('user found', 'id: '+result.user_id+'; company_id: '+result.company_id+'; device_id: '+result.device_id); 

      connection.on('close', function() {
          prettyLog('disconnected', this.request_info); 
          connection.subscription.redis_client.end();
          var index = connections.indexOf(connection);
          if (index !== -1) { connections.splice(index, 1); }
      });
    }
    else {request.reject();}
  });
});

console.log("app ready"); 