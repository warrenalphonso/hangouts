//this is prebrowserify bundle.js. public/js/home.js is browserified version of this file.

var socket = io();
const SimpleSignalClient = require('simple-signal-client');
var signalClient = new SimpleSignalClient(socket);


socket.on('connect', function() {
  console.log('Connected to server');

  var params = jQuery.deparam(window.location.search);
  signalClient.discover({
    name: params.name
  });
});

signalClient.on('discover', function(discoveryData) { //handles discovery confirmation from server
  console.log(discoveryData.message);
  console.log(discoveryData.arrayIDs);
});

signalClient.on('request', async function(request) {
  const {peer} = await request.accept();
  console.log(request.initiator);
});

jQuery('#call').on('submit', async function(e) {
  e.preventDefault();
  const id = jQuery('#IDcall').val();
  var {peer} = await signalClient.connect(id, {callerID: signalClient.id}, {
    initiator: true
    //more stuff
  });
  console.log(peer)
});



socket.on('disconnect', function() {
  console.log('Disconnected from server');
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
