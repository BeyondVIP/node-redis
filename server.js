#!/usr/bin/env node
var http = require('http');
var WebSocketServer = require('./node_modules/websocket/lib/websocket').server;
var redis = require('redis');

var redis_config = require('./redis_config')[process.env.NODE_ENVIRONMENT || 'development'];
var globalRedisClient = redis.createClient(redis_config.port, redis_config.host);

function redisSubcription(user_info) {
  this.redis_client = redis.createClient(redis_config.port, redis_config.host);
  this.redis_client.current_subscription = this;
  this.redis_client.on("message", function(channel, message) {
    if(typeof this.current_subscription.connection !== 'undefined' ) {
      console.log("user "+user_info.user_id+' received ( '+message+' ) from '+channel); // log
      if(/disconnect/.test(channel))
      {
        console.log("user "+user_info.user_id+' disconnected'); // log
        this.current_subscription.connection.close();
      }
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
}).listen(8814);

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
      console.log(connection.remoteAddress + " connected - Protocol Version " + connection.webSocketVersion); // log

      connection.subscription = new redisSubcription(result);
      connection.subscription.connection = connection;

      console.log('user_id: '+result.user_id+'; company_id: '+result.company_id+'; device_id: '+result.device_id);

      connection.on('close', function() {
          console.log(connection.remoteAddress + " disconnected"); // log
          connection.subscription.redis_client.end();
          var index = connections.indexOf(connection);
          if (index !== -1) { connections.splice(index, 1); }
      });
    }
    else {request.reject();}
  });
});

console.log("test app ready"); // log