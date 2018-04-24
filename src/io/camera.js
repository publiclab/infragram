// This file was adapted from infragram-js:
// http://github.com/p-v-o-s/infragram-js.
module.exports = function Camera(options) {
  var canvas, 
      ctx;

  // Initialize getUserMedia with options
  function initialize() {
    getUserMedia(webRtcOptions, success, deviceError);

    // iOS Safari 11 compatibility: https://github.com/webrtc/adapter/issues/685
    webRtcOptions.videoEl.setAttribute('autoplay', 'autoplay');
    webRtcOptions.videoEl.setAttribute('playsinline', 'playsinline');

    window.webcam = webRtcOptions; // this is weird but maybe used for flash fallback?
    canvas = options.canvas || document.getElementById("image");
    ctx = canvas.getContext("2d");
    // Trigger a snapshot w/ button
    // -- move this to interface.js?
    $("#snapshot").show();
    $("#live-video").show();
    $("#webcam").show();
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
    var vendorURL, video;
    if (webRtcOptions.context === "webrtc") {
      video = webRtcOptions.videoEl;
      vendorURL = window.URL || window.webkitURL;
      if (navigator.mozGetUserMedia) {
        video.mozSrcObject = stream;
        console.log("mozilla???");
      } else {
        video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
      }
      return video.onerror = function(e) {
        return stream.stop();
      }
    } else {

    }
  }

  function deviceError(error) {
    alert("No camera available.");
    console.log(error);
    return console.error("An error occurred: [CODE " + error.code + "]");
  }

  // not doing anything now... for copying to a 2nd canvas
  function getSnapshot() {
    var video;
    // If the current context is WebRTC/getUserMedia (something
    // passed back from the shim to avoid doing further feature
    // detection), we handle getting video/images for our canvas 
    // from our HTML5 <video> element.
    if (webRtcOptions.context === "webrtc") {
      video = document.getElementsByTagName("video")[0];
      options.processor.updateImage(video);
      return $("#webcam").hide();
    // Otherwise, if the context is Flash, we ask the shim to
    // directly call window.webcam, where our shim is located
    // and ask it to capture for us.
    } else if (webRtcOptions.context === "flash") {
      return window.webcam.capture();
    } else {
      console.log("No context was supplied to getSnapshot()");
    }
  }

  return {
    getSnapshot: getSnapshot,
    initialize: initialize,
    onSaveGetUserMedia: onSaveGetUserMedia,
    webRtcOptions: webRtcOptions
  }
}
