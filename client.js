//this is prebrowserify bundle.js. public/js/home.js is browserified version of this file.
const wrtc = require('wrtc'); //wrtc property needed for node simple-peer
const getUserMedia = require('getusermedia');
const {streamVideo, openChat} = require('./public/js/utils.js');
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

//listen for refresh rooms
socket.on('refreshRooms', function(allRoomsArray) {
  var ol = jQuery('<ol></ol>');
  allRoomsArray.forEach(function(room) {
    ol.append(jQuery('<li></li>').text(`${room.roomID}`));
  });
  jQuery('#rooms').html(ol);
});

//initiate a call
jQuery('#call').on('submit', async function(e) {
  e.preventDefault();
  const id = jQuery('#IDcall').val();
  if (id === signalClient.id) return;
  //need to check if yall already in a call
  initiateCall({id, name});
});

//receive a call
signalClient.on('request', function(request) {
  //update incomingCalls
  var li = jQuery(`<li id=${request.initiator}></li>`);
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
          users: [signalClient.id, request.initiator]
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

        openChat();

        peer.on('stream', function(stream) {
          document.getElementById('videos').appendChild(streamVideo(stream));
        });

        //listen for leave call
        jQuery('#leaveCall').on('click', function(e) {
          socket.emit('leaveRoom', {
            roomID,
            userID: signalClient.id
          });
          // peer.destroy();
        });

        //delete video and chat if someone hangs up
        peer.on('close', function() {
          jQuery('#videos').remove();
          jQuery('#chat').remove();
          stream.getTracks().forEach(track => track.stop())
        });

        //if error need better for caller and receiver don't end whole call
        peer.on('error', function(err) {
          console.log(err);
          jQuery('#videos').remove();
          jQuery('#chat').remove();
          stream.getTracks().forEach(track => track.stop())
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
    jQuery(`#${request.initiator}`).remove();
  });
});



//user disconnects from web socket server
socket.on('disconnect', function() {
  console.log('Disconnected from server');
});

//data parameter is an object with id of other client, name
const initiateCall = function(data) {
  getUserMedia({audio: true, video: {facingMode: 'user'}}, async function(err, stream) {
    //handle error
    if (err) return console.log(err);

    //peer and metadata is stuff calling user sends!!
    const {peer, metadata} = await signalClient.connect(data.id, {
      name: data.name,
    }, {
      initiator: true,
      stream: stream, //this is stream to send
      trickle: false,
      wrtc: wrtc,
      channelName: 'different'
      //USE STREAMS plural for multiple **************
      }); //have to change this

    if (!metadata.accept) {
      //check if call was rejected
      return alert('Call Rejected');
    } else {
      //join socket room
      socket.emit('joinReceiverRoom', metadata.roomID);
      //open chat and video divs
      openChat();
      //stream video to video div
      peer.on('stream', function(stream) {
        document.getElementById('videos').appendChild(streamVideo(stream));
      });
      //listen for leave call
      jQuery('#leaveCall').on('click', function(e) {
        socket.emit('leaveRoom', {
          roomID: metadata.roomID,
          userID: signalClient.id
        });
        // peer.destroy();
      });
      //delete video and chat if someone hangs up
      peer.on('close', function() {
        jQuery('#videos').remove();
        jQuery('#chat').remove();
        stream.getTracks().forEach(track => track.stop())
      });
      //if error
      peer.on('error', function(err) {
        console.log(err);
        jQuery('#videos').remove();
        jQuery('#chat').remove();
        stream.getTracks().forEach(track => track.stop())
      });
    };
  });
};
