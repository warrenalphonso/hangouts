//this is prebrowserify bundle.js. public/js/home.js is browserified version of this file.
const wrtc = require('wrtc'); //wrtc property needed for node simple-peer
const getUserMedia = require('getusermedia');
const {streamVideo} = require('./public/js/utils.js');
const uniqid = require('uniqid');



var socket = io();
const SimpleSignalClient = require('simple-signal-client');
var signalClient = new SimpleSignalClient(socket);

//stores user's name
var name;

//user connects to web socket server
socket.on('connect', function() {
  console.log('Connected to server');

  //get user name from url params
  var params = jQuery.deparam(window.location.search);
  name = params.name;
  signalClient.discover({
    name: params.name
  });
});

//handles discovery confirmation from server
signalClient.on('discover', function(discoveryData) {
  console.log(discoveryData.message);
  console.log(discoveryData.allUsersArray);
});

//refresh user list for everyone when someone joins
socket.on('refreshUsers', function(allUsersArray) {
  var ol = jQuery('<ol></ol>');

  allUsersArray.forEach(function(user) {
    ol.append(jQuery('<li></li>').text(`${user.clientName}: ${user.clientID}`));
  });

  jQuery('#users').html(ol);
});

//initiate a call
jQuery('#call').on('submit', async function(e) {
  e.preventDefault();
  const id = jQuery('#IDcall').val();
  if (id === signalClient.id) return;
  callPeer({id, name});
});

jQuery('#allCall').click(function() {
  //emit all call and server sends back all ids
  socket.emit('allCallReq');
});

//receive a call
signalClient.on('request', function(request) {
  //update incomingCalls
  var li = jQuery('<li></li>');
  li.html(`${request.metadata.name} is calling. <button name="incomingCall" id="accept">Accept </button>
  <button name="incomingCall" id="reject">Reject</button>`);
  jQuery('#incomingCalls').html(li);
  jQuery('[name=incomingCall]').on('click', function(e) {
    //set peer and metadata variables -- receiving these from caller
    var peer, metadata;

    //call is accepted
    if (e.target.id === 'accept'){
      getUserMedia({audio: true, video: {facingMode: "user"}}, async function(err, stream) {
        //handle error
        if (err) return console.log(err);

        //create unique room ID
        roomID = uniqid();

        //server create a room and tell call initiator to join it
        socket.emit('createRoom', {
          roomID,
          user1: signalClient.id,
          user2: request.initiator
        });

        accept = await request.accept({
          accept: true,
          roomID
        }, {
          trickle: false,
          stream: stream,
          wrtc: wrtc,
          channelName: 'same'
        });

        peer = accept["peer"];
        metadata = accept["metadata"];

        peer.on('stream', function(stream) {
          document.body.appendChild(streamVideo(stream));
        });
      });

    //call is rejected
    } else if (e.target.id === 'reject'){
      getUserMedia({audio: false, video: false}, async function(err, stream) {
        accept = await request.accept({
          accept: false
        }, {
          stream: stream
          //empty cuz denied call idk if i need to pass in stuff here tho
        });
      });
    };
  });
});

//listen for refresh rooms
socket.on('addRoomToList', function(newRoomID) {
  var ol = jQuery('<ol></ol>');
  ol.append(jQuery('<li></li>').text(`${newRoomID}`));
  jQuery('#roomList').html(ol);
});

//user disconnects from web socket server
socket.on('disconnect', function() {
  console.log('Disconnected from server');
});

socket.on('allCallInfo', function(allUsersArray) {
  allUsersArray.forEach(async function(user) {
    if (signalClient.id === user.clientID) return //don't connect to yourself
    const {peer, metadata} = await signalClient.connect(user.clientID, {
      callerID: signalClient.id
    }, {
      initiator: true,
      channelName: `test`,
      trickle: false,
      stream: stream,
      wrtc: wrtc
      //more stuff
    });

    peer.on('stream', function(stream) {
      var video = document.createElement('video');
      document.body.appendChild(video);

      video.srcObject = stream;
      video.play();
    });
  });
});

//data parameter is an object with id of other client, name
const callPeer = function(data) {
  getUserMedia({audio: true, video: {facingMode: 'user'}}, async function(err, stream) {
    //handle error
    if (err) return console.log(err);

    //peer and metadata is stuff calling user sends!!
    const {peer, metadata} = await signalClient.connect(data.id, {
      name: data.name,
    }, {
      initiator: true,
      stream: stream,
      trickle: false,
      wrtc: wrtc,
      channelName: 'different'
      //USE STREAMS plural for multiple **************
      }); //have to change this

      if (!metadata.accept) {
        //check if call was rejected
        return alert('Call Rejected');
      } else {
        socket.emit('joinReceiverRoom', metadata.roomID);
        peer.on('stream', function(stream) {
          document.body.appendChild(streamVideo(stream));
        });
      };
  });
};
