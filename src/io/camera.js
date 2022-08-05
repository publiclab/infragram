// This file was adapted from infragram-js:
// http://github.com/p-v-o-s/infragram-js.
module.exports = function Camera(options) {
  var canvas, 
      ctx;
  options.webcamVideoSelector = options.webcamVideoSelector || 'webcamVideoEl';
  options.webcamVideoEl = document.getElementById(options.webcamVideoSelector);
  
  // Initialize getUserMedia with options
  function initialize() {
    navigator.mediaDevices.getUserMedia(webRtcOptions).then(success).catch(deviceError);

    window.webcam = webRtcOptions; // this is weird but maybe used for flash fallback?
    canvas = options.canvas || document.getElementById("image");
    ctx = canvas.getContext("2d");
    // Trigger a snapshot w/ button
    // -- move this to interface.js?
    $("#snapshot").show();
    $("#live-video").show();
    $("#webcam").show();
  }
  
  function unInitialize() { //Initialize stream without webcam
    navigator.mediaDevices.getUserMedia(webRtcOptions).then(falseSuccess).catch(deviceError);
  }  

  // webRtcOptions contains the configuration information for the shim
  // it allows us to specify the width and height of the video
  // output we"re working with, the location of the fallback swf,
  // events that are triggered onCapture and onSave (for the fallback)
  // and so on.
  var webRtcOptions = options.webRtcOptions || {
    "audio": false,
    "video": true,
    // the element (by id) you wish to use for 
    // displaying the stream from a camera
    el: "webcam",
    extern: null,
    append: true,
    // height and width of the output stream
    // container
    width: 640,
    height: 480,
    // the recommended mode to be used is 
    // "callback " where a callback is executed 
    // once data is available
    mode: "callback",
    // a debugger callback is available if needed
    debug: function() {},
    // callback for capturing the fallback stream
    onCapture: function onWebRtcCapture() {
      return window.webcam.save();
    },
    // callback for saving the stream, useful for
    // relaying data further.
    onSave: onSaveGetUserMedia,
    onLoad: function onLoadGetUserMedia() {}
  }

  function onSaveGetUserMedia(data) {
    var col, h, i, img, j, ref, tmp, w, pos = 0;
    col = data.split("");
    img = camera.image;
    tmp = null;
    w = webRtcOptions.width;
    h = webRtcOptions.height;
    for (i = j = 0, ref = w - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      tmp = parseInt(col[i], 10);
      img.data[pos + 0] = (tmp >> 16) & 0xff;
      img.data[pos + 1] = (tmp >> 8) & 0xff;
      img.data[pos + 2] = tmp & 0xff;
      img.data[pos + 3] = 0xff;
      pos += 4;
    }
    if (pos >= 4 * w * h) {
      ctx.putImageData(img, 0, 0);
      return pos = 0;
    }
  }

  function success(stream) {
    window.localStream = stream;
    isOnCam = stream;
    isCamera = true;
    track = stream.getTracks()[0];
    webCamVideoEl.srcObject = stream;

    return webCamVideoEl.onerror = function (e) {
      return stream.stop();
    };
  }

  function deviceError(error) {
    alert("No camera available.");
    console.log(error);
    return console.error("An error occurred: [CODE " + error.code + "]");
  }

  function falseSuccess(stream) {
        //Stream for video processing
        stream.getVideoTracks()[0].stop();
  }  
  
  // not doing anything now... for copying to a 2nd canvas
  function getSnapshot() {
    var video;
      video = document.getElementsByTagName("video")[0];
      options.processor.updateImage(video);
      return $("#webcam").hide();
  }

  return {
    getSnapshot: getSnapshot,
    initialize: initialize,
    onSaveGetUserMedia: onSaveGetUserMedia,
    webRtcOptions: webRtcOptions,
    unInitialize: unInitialize,
  }
}
