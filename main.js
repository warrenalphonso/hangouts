var Peer = require('simple-peer')

// get video/voice stream
navigator.getUserMedia({ video: true, audio: false }, gotMedia, function () {})

function gotMedia (stream) {
  var peer1 = new Peer({ initiator: true, stream: stream })
  var peer2 = new Peer()

  peer1.on('signal', function (data) {
    peer2.signal(data)
  })

  peer2.on('signal', function (data) {
    peer1.signal(data)
  })

  peer2.on('stream', function (stream) {
    // got remote video stream, now let's show it in a video tag
    var video = document.createElement('video')
    document.body.appendChild(video)

    video.srcObject = stream
    video.play()
  })
}
