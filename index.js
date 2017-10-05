'use strict';

var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
const WebSocket = require('ws');

var fileServer = new(nodeStatic.Server)();
var server = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(8080);

const wss = new WebSocket.Server({ server });

wss.on('connection', function(socket) {

  socket.on('message', function(data) {
    console.log('Client said: ', data);
    // for a real app, would be room-only (not broadcast)
    // more or less a broadcast:
    wss.clients.forEach(function each(client) {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  console.log('Client connected');

  var numClients = wss.clients.size;
  console.log('Room now has ' + numClients + ' client(s)');

  // when first client connects set room as created
  // when second connects set as ready
  if (numClients === 1) {
    console.log('Client ID ' + socket.id + ' created room ');
    socket.send(JSON.stringify({event: 'created'}));
  } else {
    console.log('Client ID ' + socket.id + ' joined room ');
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({event: 'joined'}));
      }
    });
  }
});
