#!/usr/bin/env node
var redis = require('redis');
var redis_config = require('./redis_config')[process.env.NODE_ENVIRONMENT || 'development'];
var redisClient = redis.createClient(redis_config.port, redis_config.host);

setInterval(function() {
  redisClient.publish('bvip:general',"{'reset_timeout': 1}");
},5*60*1000);

console.log("keeper ready"); 