var uniqid = require('uniqid');

const streamVideo = function(stream) {
  var video = document.createElement('video');
  video.setAttribute('id', 'userDisplay');
  video.srcObject = stream;
  video.play();
  return video;
};

const createRoom = function(user1, user2) {
  //unique id based on time, process, and machine name
  roomID = uniqid();
  //add to server list of rooms
  allRooms.add({
    roomID,
    users: [user1, user2]
  });
  //tell user1 and user2 to refresh their list of active rooms
  io.emit('refreshRooms', )
};


module.exports = {
  streamVideo,
  createRoom
}
