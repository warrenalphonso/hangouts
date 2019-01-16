const streamVideo = function(stream) {
  var video = document.createElement('video');
  // video.setAttribute('id', 'userDisplay');
  video.srcObject = stream;
  video.play();
  return video;
};

const addVideoDiv = function() {
  videoDiv = document.createElement('div');
  videoDiv.setAttribute('id', 'videos');
  document.body.appendChild(videoDiv);
};


module.exports = {
  streamVideo,
  addVideoDiv
}
