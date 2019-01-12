const streamVideo = function(stream) {
  var video = document.createElement('video');
  // video.setAttribute('id', 'userDisplay');
  video.srcObject = stream;
  video.play();
  return video;
};

const openChat = function() {
  videoDiv = document.createElement('div');
  videoDiv.setAttribute('id', 'videos');
  chatDiv = document.createElement('div');
  chatDiv.setAttribute('id', 'chat');
  document.body.appendChild(videoDiv);
  document.body.appendChild(chatDiv);
};

module.exports = {
  streamVideo,
  openChat
}
