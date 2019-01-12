const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const uniqid = require('uniqid');


const publicPath = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000; //process.env.PORT works for heroku
//heroku deployment: in package.json, added start and engines scripts

var app = express(); //configure app
var server = http.createServer(app)
var io = socketIO(server); //io is web socket server

const signalServer = require('simple-signal-server')(io);
// const {createRoom} = require('./public/js/utils.js');
var allUsers = new Set(); //keep track of all users
var allRooms = new Set(); //keep track of all rooms WITH AT LEAST ONE PERSON

app.use(bodyParser.urlencoded({ //this is used to capture data coming via a form https://fullstack-developer.academy/how-do-you-extract-post-data-in-node-js/
  extended: false
}));

app.use(express.static(publicPath)); //connect public folder

//server handles discover request from client
signalServer.on('discover', (request) => {
  const clientID = request.socket.id;
  const clientName = request.discoveryData.name;
  console.log(`Client with ID: ${clientID} and name: ${clientName} is trying to be discovered.`);

  //add user to allUsers set
  allUsers.add({
    clientName,
    clientID
  });

  allUsersArray = Array.from(allUsers);

  request.discover(clientID, {
    allUsersArray,
    message: 'You were discovered.'
  });

  //tell all discovered users to refresh their users array
  io.emit('refreshUsers', allUsersArray);
});

//server handles request to connect one client to another
signalServer.on('request', (request) => {
  console.log(`${request.initiator} and name ${request.metadata.name} is requesting connection with ${request.target}.`);
  request.forward(request.target, request.metadata);
});

//server handles user disconnecting
signalServer.on('disconnect', (socket) => {
  const clientID = socket.id;

  //deletes user from allUsers
  allUsers.forEach((user) => {
    if (user.clientID === clientID) {
      allUsers.delete(user);
    };
  });

  //tell all users to refresh users array
  io.emit('refreshUsers', allUsersArray);
});

//handles socket.io connection
io.on('connection', (socket) => {
  console.log('New user connected');

  //if a user accepts call server should create a room and add both initiator and receiver
  socket.on('createRoom', (room) => {
    //add room and its two users to list of rooms
    allRooms.add({
      roomID: room.roomID,
      users: room.users
    });
    //add receiver to room
    socket.join(room.roomID);
    io.emit('refreshRooms', Array.from(allRooms));
  });

  //caller joins receiver room
  socket.on('joinReceiverRoom', (roomID) => {
    socket.join(roomID);
  });

  //remove leaving user from room
  socket.on('leaveRoom', (roomAndUser) => {
    //leave socket room
    socket.leave(roomAndUser.roomID);
    //remove user from allRooms
    allRooms.forEach((room) => {
      if (room.roomID === roomAndUser.roomID) {
        room.users = room.users.filter(userID => userID !== roomAndUser.userID);
        console.log(room.users)
        //check if any users are in room
        if (room.users.length === 0) {
          allRooms.delete(room);
          io.emit('refreshRooms', Array.from(allRooms));
        };
      };
    });
  });

  //handles socket.io disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    //maybe remove them from calls!!! error handling takes way too long
  });
}); //io.on registers an event listener



server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
