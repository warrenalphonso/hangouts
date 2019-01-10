const streamVideo = function(stream) {
  //if user wants to send video
  var video = document.createElement('video');
  video.setAttribute('id', 'userDisplay');
  video.srcObject = stream;
  video.play();
  return video;
};


module.exports = {
  streamVideo
}
