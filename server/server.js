const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');

const publicPath = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000; //process.env.PORT works for heroku
//heroku deployment: in package.json, added start and engines scripts

var app = express(); //configure app
var server = http.createServer(app)
var io = socketIO(server); //io is web socket server

const signalServer = require('simple-signal-server')(io);
var allUsers = new Set();

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static(publicPath)); //connect public folder

// app.get('/', (req, res) => res.sendFile(publicPath + '/index.html'));
//
// app.get('/home', (req, res) => {
//   res.sendFile(publicPath + '/home.html');
// })
//
// app.post('/home', (req, res) => {
//   const postBody = req.body.name;
//   console.log(postBody);
//   res.sendFile(publicPath + '/home.html');
// });


signalServer.on('discover', (request) => {
  const clientID = request.socket.id;
  const clientName = request.discoveryData.name;
  console.log(`Client with ID: ${clientID} and name: ${clientName} is trying to be discovered.`);
  allUsers.add({
    clientName,
    clientID
  });

  allUsersArray = Array.from(allUsers)

  request.discover(clientID, {
    allUsersArray,
    message: 'You were discovered.'
  });

  io.emit('refreshUsers', allUsersArray);
});

signalServer.on('request', (request) => {
  console.log(`${request.initiator} is requesting connection with ${request.target}.`);
  request.forward(request.target, request.metadata);
});

signalServer.on('disconnect', (socket) => {
  const clientID = socket.id;
  allUsers.forEach((user) => {
    if (user.clientID === clientID) {
      allUsers.delete(user);
    };
  });
  io.emit('refreshUsers', allUsersArray);
});



io.on('connection', (socket) => {
  console.log('New user connected');


  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
}); //io.on registers an event listener



server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
