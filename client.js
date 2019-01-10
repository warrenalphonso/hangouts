//this is prebrowserify bundle.js. public/js/home.js is browserified version of this file.
const wrtc = require('wrtc');
var getUserMedia = require('getusermedia');

var userVideoPromise = getUserMedia({
  audio: true,
  video: {facingMode: "user"}
}, function(err, stream) {
  if (err) return console.log(err)

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

  signalClient.on('discover', function(discoveryData) { //handles discovery confirmation from server
    console.log(discoveryData.message);
    console.log(discoveryData.allUsersArray);
  });

  //receive a call ; need an accept/reject button
  signalClient.on('request', async function(request) {
    const {
      peer,
      metadata
    } = await request.accept({
      callerID: signalClient.id
    }, {
      initiator: false,
      channelName: `test`,
      trickle: false,
      stream: stream,
      wrtc: wrtc
      //more stuff
    });
    peer.on('stream', function(stream) {
      var video = document.createElement('video')
      document.body.appendChild(video)
      video.setAttribute('id', 'incomingStream');
      video.srcObject = stream
      video.play()
    });

    peer.on('close', function() {
      document.body.getElementById('incomingStream').remove();
    });

    jQuery('#endCall').click(function() {
      peer.destroy();
    });
  });

  //initiate a call
  jQuery('#call').on('submit', async function(e) {
    e.preventDefault();
    const id = jQuery('#IDcall').val();
    const {
      peer,
      metadata
    } = await signalClient.connect(id, {
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
      video.setAttribute('id', 'incomingStream');
      document.body.appendChild(video);
      video.srcObject = stream;
      video.play();
    });

    peer.on('close', function() {
      document.body.getElementById('incomingStream').remove();
    });

    jQuery('#endCall').click(function() {
      peer.destroy();
    });

  });

  jQuery('#allCall').click(function() {
    //emit all call and server sends back all ids
    socket.emit('allCallReq');
  });



  //refresh user list for everyone when someone joins
  socket.on('refreshUsers', function(allUsersArray) {
    var ol = jQuery('<ol></ol>');

    allUsersArray.forEach(function(user) {
      ol.append(jQuery('<li></li>').text(`${user.clientName}: ${user.clientID}`));
    });

    jQuery('#users').html(ol);
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

});
