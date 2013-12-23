$('button#raw').on('click', function() { set_mode("raw"); });
$('button#ndvi').on('click', function() { set_mode("ndvi"); });
$('button#nir').on('click', function() { set_mode("nir"); });
$('#download').on('click', function() { download(); });
$('#infragrammar_hsv').on('submit', function() { save_expressions_hsv($('#h_exp').val(),$('#s_exp').val(),$('#v_exp').val());set_mode("infragrammar"); });
$('#infragrammar').on('submit', function() { save_expressions($('#r_exp').val(),$('#g_exp').val(),$('#b_exp').val()); set_mode("infragrammar"); });
$('#infragrammar_mono').on('submit', function() { save_expressions($('#m_exp').val(),$('#m_exp').val(),$('#m_exp').val()); set_mode("infragrammar"); });

$('button#grey').on('click', function() { colormap = greyscale_colormap; update(image); });
$('button#color').on('click', function() { colormap = colormap1; update(image); });

// http://www.eyecon.ro/bootstrap-slider/
$('#slider').slider().on('slide', function(ev){
  save_expressions($('#r_exp').val(),$('#g_exp').val(),$('#b_exp').val());update(image,"infragrammar");
});

params = {}
// check for parameters and insert and run them:
if (window.location.href.split('?').length > 1) {
  $.each(window.location.href.split('?')[1].split('&'),function(i,param){
    if (param.split('=').length > 1) {
      key = param.split('=')[0]
      value = param.split('=')[1]
      params[key] = value
    }
  })
}
if (params['m']) $('#m_exp').val(params['m'])

if (params['r']) $('#r_exp').val(params['r'])
if (params['g']) $('#g_exp').val(params['g'])
if (params['b']) $('#b_exp').val(params['b'])

if (params['h']) $('#h_exp').val(params['h'])
if (params['s']) $('#s_exp').val(params['s'])
if (params['v']) $('#v_exp').val(params['v'])

/*
if (params['r'] || params['g'] || params['b']) { 
  $('#infragrammar_rgb').submit()
} else if (params['m']) {
  $('#infragrammar_mono').submit()
} else if (params['h']) {
  $('#infragrammar_hsv').submit()
}
*/

$I = {
  initialize: function() {
    // Initialize getUserMedia with options
    getUserMedia(this.options, this.success, this.deviceError);

    // Initialize webcam options for fallback
    window.webcam = this.options;

    this.canvas = document.getElementById("image");
    this.ctx = this.canvas.getContext("2d");
    this.image = this.ctx.getImageData(0, 0, this.options.width, this.options.height);

    // Trigger a snapshot w/ button
    $('#webcam-activate').hide();
    $('#snapshot').show();
    $('#snapshot').click(this.getSnapshot);
    $('#webcam').show();

  },
  // options contains the configuration information for the shim
  // it allows us to specify the width and height of the video
  // output we're working with, the location of the fallback swf,
  // events that are triggered onCapture and onSave (for the fallback)
  // and so on.
  options: {

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
    // 'callback ' where a callback is executed 
    // once data is available
    mode: "callback",

    // the flash fallback Url
    swffile: "fallback/jscam_canvas_only.swf",

    // quality of the fallback stream
    quality: 85,

    // a debugger callback is available if needed
    debug: function () {},

    // callback for capturing the fallback stream
    onCapture: function () {
        window.webcam.save();
    },

    // callback for saving the stream, useful for
    // relaying data further.
    onSave: function (data) {

      var col = data.split(";"),
        img = $I.image,
        tmp = null,
        w = this.width,
        h = this.height;

      for (var i = 0; i < w; i++) { 
        tmp = parseInt(col[i], 10);
        img.data[$I.pos + 0] = (tmp >> 16) & 0xff;
        img.data[$I.pos + 1] = (tmp >> 8) & 0xff;
        img.data[$I.pos + 2] = tmp & 0xff;
        img.data[$I.pos + 3] = 0xff;
        $I.pos += 4;
      }

      if ($I.pos >= 4 * w * h) { 
        $I.ctx.putImageData(img, 0, 0);
        $I.pos = 0;
      }

    },
    onLoad: function () {},
  },
  success: function (stream) {

    if ($I.options.context === 'webrtc') {

      var video = $I.options.videoEl;
      

          if ((typeof MediaStream !== "undefined" && MediaStream !== null) && stream instanceof MediaStream) {
            
            video.src = stream;
            return video.play();
          } else {
            var vendorURL = window.URL || window.webkitURL;
            video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
          }

      video.onerror = function () {
        stream.stop();
        streamError();
      };

    } else{
      // flash context
    }
    
  },

  deviceError: function (error) {
    alert('No camera available.');
    console.log(error);
    console.error('An error occurred: [CODE ' + error.code + ']');
  },

  // not doing anything now... for copying to a 2nd canvas
  getSnapshot: function () {
    // If the current context is WebRTC/getUserMedia (something
    // passed back from the shim to avoid doing further feature
    // detection), we handle getting video/images for our canvas 
    // from our HTML5 <video> element.
    if ($I.options.context === 'webrtc') {
      var video = document.getElementsByTagName('video')[0]; 
      $I.canvas.width = video.videoWidth;
      $I.canvas.height = video.videoHeight;
      $I.canvas.getContext('2d').drawImage(video, 0, 0);
      //image = new Image(data, video.videoWidth, video.videoHeight);
      image = $I.canvas.getContext('2d').getImageData(0, 0, $I.canvas.width, $I.canvas.height);
      $('#webcam').hide();

    // Otherwise, if the context is Flash, we ask the shim to
    // directly call window.webcam, where our shim is located
    // and ask it to capture for us.
    } else if($I.options.context === 'flash'){
        window.webcam.capture();
    }
    else{
        alert('No context was supplied to getSnapshot()');
    }
  }
}

