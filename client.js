//this is prebrowserify bundle.js

var socket = io();

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});



const SimpleSignalClient = require('simple-signal-client');
var signalClient = new SimpleSignalClient(socket);


signalClient.discover({name: 'Warren Alphonso'});

signalClient.on('discover', (discoveryData) => {
  console.log(discoveryData.message);
  console.log(discoveryData.arrayIDs);
});


// signalClient.on('discover', async (allIDs) => {
//   const id = await promptUserForID(allIDs);
//   const {peer} = await signalClient.connect(id);
//   console.log(signalClient.id);
//   peer;
// });
//
// signalClient.on('request', async (request) => {
//   const {peer} = await request.accept();
//   peer;
// });
