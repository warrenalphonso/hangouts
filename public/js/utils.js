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
  messagesDiv = document.createElement('div');
  messagesDiv.setAttribute('id', 'messages');
  chatDiv = document.createElement('div');
  chatDiv.setAttribute('id', 'chat');
  document.body.appendChild(videoDiv);
  document.body.appendChild(messagesDiv);
  document.body.appendChild(chatDiv);
};

const chatBox = function() {
  jQuery('#chat').html('<form id="messageForm"><input type="text" id="message"> <button>Send</button></form>');
};

module.exports = {
  streamVideo,
  openChat,
  chatBox
}
