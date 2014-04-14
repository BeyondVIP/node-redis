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

    // function sendNumber() {
    //     if (connection.connected) {
    //         var number = Math.round(Math.random() * 0xFFFFFF);
    //         connection.sendUTF(number.toString());
    //         setTimeout(sendNumber, 1000);
    //     }
    // }
    // sendNumber();
});

var auth_token = 'VXbNYV9RBND1f_kcwTkZug';

context = repl.start("> ").context;
context.client = client;
context.auth_token = auth_token;
context.host_with_param = 'ws://localhost:8814/?auth_token=';
// context.connect = function ()  { client.connect('ws://localhost:8814/?auth_token='+auth_token); }; 
//client.connect('ws://localhost:8814/?auth_token='+auth_token);