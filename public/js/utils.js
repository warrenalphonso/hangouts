const streamVideo = function(stream) {
  var video = document.createElement('video');
  video.setAttribute('id', 'userDisplay');
  video.srcObject = stream;
  video.play();
  return video;
};


module.exports = {
  streamVideo
}
