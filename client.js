#!/usr/bin/env node
repl = require("repl");
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket client connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log(' Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
});

context = repl.start("> ").context;
context.client = client;
context.auth_token = 'VXbNYV9RBND1f_kcwTkZug';
context.pr_host = 'ws://localhost:8814/'
context.query_pp = '?auth_token='
//client.connect(pr_host+query_pp+auth_token);