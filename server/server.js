const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000; //process.env.PORT works for heroku
//heroku deployment: in package.json, added start and engines scripts

var app = express(); //configure app
var server = http.createServer(app)
var io = socketIO(server); //io is web socket server

const signalServer = require('simple-signal-server')(io);
const allIDs = new Set();


app.use(express.static(publicPath)); //connect public folder

signalServer.on('discover', (request) => {
  const clientID = request.socket.id;
  console.log(`Client with ID: ${clientID} is trying to be discovered.`);
  console.log(request.discoveryData.name);
  allIDs.add(clientID);
  request.discover(clientID, {arrayIDs: Array.from(allIDs), message: 'You were discovered.'});
});

signalServer.on('request', (request) => {
  console.log(`${request.initiator} is requesting connection with ${request.target}.`);
  request.forward(request.target, request.metadata);
});

signalServer.on('disconnect', (socket) => {
  const clientID = socket.id;
  allIDs.delete(clientID);
});

// signalServer.on('discover', (request) => {
//   console.log('discovered');
//   const clientID = request.socket.id; //can change this to use any id
//   allIDs.add(clientID); //keep track of all connected peers
//   request.discover(clientID, Array.from(allIDs)); //respond with id and list of peers
// });
//
// signalServer.on('request', (request) => {
//   request.forward(); // forward all requests to connect
// });




io.on('connection', (socket) => {
  console.log('New user connected');

  socket.emit('blah');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
}); //io.on registers an event listener



server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
