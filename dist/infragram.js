(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
function urlHash() {

function getUrlHashParameter(param) {

  var params = getUrlHashParameters();
  return params[param];

}

function getUrlHashParameters() {

  var sPageURL = window.location.hash;
  if (sPageURL) sPageURL = sPageURL.split('#')[1];
  var pairs = sPageURL.split('&');
  var object = {};
  pairs.forEach(function(pair, i) {
    pair = pair.split('=');
    if (pair[0] != '') object[pair[0]] = pair[1];
  });
  return object;
}

// accepts an object like { paramName: value, paramName1: value }
// and transforms to: url.com#paramName=value&paramName1=value
function setUrlHashParameters(params) {

  var keys = Object.keys(params);
  var values = Object.values(params);
  var pairs = [];
  keys.forEach(function(key, i) {
    if (key != '') pairs.push(keys[i] + '=' + values[i]);
  });
  var hash = pairs.join('&');
  window.location.hash = hash;

}

function setUrlHashParameter(param, value) {

  var params = getUrlHashParameters();
  params[param] = value;
  setUrlHashParameters(params);

}

return {
  getUrlHashParameter:   getUrlHashParameter,
  getUrlHashParameters:  getUrlHashParameters,
  setUrlHashParameter:   setUrlHashParameter,
  setUrlHashParameters:  setUrlHashParameters
}

}

module.exports = urlHash;

},{}],2:[function(require,module,exports){
window.Infragram = function Infragram(options) {
  options = options || {};
  options.uploader = options.uploader || false;
  options.processor = options.processor || 'javascript';
  options.camera = require('./io/camera')(options);
  options.colorized      = options.colorized      || false;
  options.mode           = options.mode           || "raw",
  options.video_live     = options.video_live     || false,
  options.webGlSupported = options.webGlSupported || false; // move into processor

  options.processors = {
    'webgl':           require('./processors/webgl'),
    'javascript':      require('./processors/javascript'),
  }

  options.processor = options.processors[options.processor]();
  options.logger = require('./logger')(options);

  var Interface = require('./interface')(options); // this can change processor based on URL hash
  options.processor.initialize();
  console.log('processor:', options.processor.type)

  options.colorize = function colorize() {
    options.processor.colorize();
  }

  // this should accept an object with parameters r,g,b,h,s,v,m and mode
  options.run = function run(mode) {
    options.logger.save_log();
    return options.processor.run(mode);
  }

  // split into processor.video() methods
  options.video = function video() {
    options.camera.initialize();
    if (options.webGlSupported) {
      setInterval(function() {
        if (image) {
          options.run(options.mode);
        }
        options.camera.getSnapshot();
        if (options.colorized) {
          return options.colorize();
        }
      }, 15);
    } else {
      setInterval(function() {
        if (image) {
          options.run(options.mode);
        }
        options.camera.getSnapshot();
        if (options.colorized) {
          return options.colorize();
        }
      }, 250);
    }
  }

  return {
    Camera: options.camera,
    Interface: Interface,
    logger: options.logger,
    run: options.run,
    colorize: options.colorize,
    processors: options.processors,
    options: options
  }
}
module.exports = Infragram;

},{"./interface":6,"./io/camera":7,"./logger":8,"./processors/javascript":9,"./processors/webgl":10}],3:[function(require,module,exports){
// This file was adapted from infragram-js:
// http://github.com/p-v-o-s/infragram-js.

module.exports = function Colormaps(options) {

  var greyscale_colormap = segmented_colormap([[0, [0,   0,   0  ], [255, 255, 255]], 
                                               [1, [255, 255, 255], [255, 255, 255]]]);

  var colormap1 = segmented_colormap([[0,    [0,   0,   255], [38,  195, 195]],
                                      [0.5,  [0,   150, 0  ], [255, 255, 0  ]],
                                      [0.75, [255, 255, 0  ], [255, 50,  50 ]]]);

  var colormap2 = segmented_colormap([[0,   [0,   0,   255], [0,   0,   255]], 
                                      [0.1, [0,   0,   255], [38,  195, 195]],
                                      [0.5, [0,   150, 0  ], [255, 255, 0  ]],
                                      [0.7, [255, 255, 0  ], [255, 50,  50 ]],
                                      [0.9, [255, 50,  50 ], [255, 50,  50 ]]]);

  var JsImage = require('../util/JsImage.js');

  function segmented_colormap(segments) {
    return function(x) {
      var i, l, len, m, ref, result, x0, x1, xstart, y0, y1;
      [y0, y1] = [0, 0];
      [x0, x1] = [segments[0][0], 1];
      if (x < x0) {
        return y0;
      }
      for (i = l = 0, len = segments.length; l < len; i = ++l) {
        [xstart, y0, y1] = segments[i];
        x0 = xstart;
        if (i === segments.length - 1) {
          x1 = 1;
          break;
        }
        x1 = segments[i + 1][0];
        if ((xstart <= x && x < x1)) {
          break;
        }
      }
      result = [];
      for (i = m = 0, ref = y0.length; 0 <= ref ? m < ref : m > ref; i = 0 <= ref ? ++m : --m) {
        result[i] = (x - x0) / (x1 - x0) * (y1[i] - y0[i]) + y0[i];
      }
      return result;
    }
  }

  function colorify(jsImage, colormap) {
    var b, data, g, i, j, l, n, r, ref;
    $('#btn-colorize').addClass('active');
    n = jsImage.width * jsImage.height;
    data = new Uint8ClampedArray(4 * n);
    j = 0;
    for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      [r, g, b] = colormap(jsImage.data[i]);
      data[j++] = r;
      data[j++] = g;
      data[j++] = b;
      data[j++] = 255;
    }
    return new JsImage(data, jsImage.width, jsImage.height, 4);
  }

  return {
    colorify: colorify,
    colormap1: colormap1,
    colormap2: colormap2,
    greyscale_colormap: greyscale_colormap,
    segmented_colormap: segmented_colormap
  }

}

},{"../util/JsImage.js":11}],4:[function(require,module,exports){
// This file was adapted from infragram-js:
// http://github.com/p-v-o-s/infragram-js.

module.exports = window.Converters = {

  // modified from:
  // http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
  hsv2rgb: function hsv2rgb(h, s, v) {
    var data, f, i, p, q, rgb, t;
    data = [];
    if (s === 0) {
      rgb = [v, v, v];
    } else {
      i = Math.floor(h * 6);
      f = h * 6 - i;
      p = v * (1 - s);
      q = v * (1 - f * s);
      t = v * (1 - (1 - f) * s);
      data = [v * (1 - s), v * (1 - s * (h - i)), v * (1 - s * (1 - (h - i)))];
      switch (i) {
        case 0:
          rgb = [v, t, p];
          break;
        case 1:
          rgb = [q, v, p];
          break;
        case 2:
          rgb = [p, v, t];
          break;
        case 3:
          rgb = [p, q, v];
          break;
        case 4:
          rgb = [t, p, v];
          break;
        default:
          rgb = [v, p, q];
      }
    }
    return rgb;
  },

  rgb2hsv: function rgb2hsv(r, g, b) {
    var d, h, max, min, s, v;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    h = s = v = max;
    d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return [h, s, v];
  }

}

},{}],5:[function(require,module,exports){
// Generated by CoffeeScript 2.1.0
// This file was adapted from infragram-js:
// http://github.com/p-v-o-s/infragram-js.
module.exports = window.FileUpload = {

  socket: null,
  file: null,
  serverFilename: "",

  isLoadedFromFile: function() {
    if (FileUpload.file) {
      return true;
    } else {
      return false;
    }
  },

  getFilename: function() {
    return FileUpload.serverFilename;
  },

  setFilename: function(name) {
    return FileUpload.serverFilename = name;
  },

  uploadThumbnail: function(src, callback) {
    var img;
    img = new Image();
    img.onload = function onImageLoad() {
      var canvas, ctx, dataUrl;
      canvas = document.createElement("canvas");
      ctx = canvas.getContext("2d");
      canvas.width = 260;
      canvas.height = 195;
      ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, canvas.width, canvas.height);
      callback = callback.toString();
      dataUrl = canvas.toDataURL("image/jpeg");
      return FileUpload.socket.emit("thumbnail_start", {
        "name": FileUpload.serverFilename,
        "data": dataUrl,
        "callback": callback
      });
    };
    return img.src = src;
  },

  fromFile: function(files, callback, upload) {
    var reader;
    if (files && files[0]) {
      $("#file-sel").prop("disabled", true);
      $("#save-modal-btn").prop("disabled", true);
      FileUpload.file = files[0];
      FileUpload.file.reader = new FileReader();
      if (upload) {
        FileUpload.file.reader.onload = function onReaderLoad(event) {
          return FileUpload.socket.emit("image_send", {
            "name": FileUpload.serverFilename,
            "size": FileUpload.file.size,
            "data": event.target.result
          });
        };
        FileUpload.socket.emit("image_send", {
          "name": files[0].name,
          "size": files[0].size
        });
      }
      FileUpload.file.uploaded = 0;
      reader = new FileReader();
      reader.onload = function onReaderLoad(event) {
        var img;
        img = new Image();
        img.onload = function onImageLoad() {
          return callback(this);
        };
        return img.src = event.target.result;
      };
      return reader.readAsDataURL(files[0]);
    }
  },

  duplicate: function(callback) {
    callback = callback.toString();
    return FileUpload.socket.emit("duplicate_start", {
      "name": FileUpload.serverFilename,
      "callback": callback
    });
  },

  fromBase64: function(name, data, callback) {
    callback = callback.toString();
    return FileUpload.socket.emit("base64_start", {
      "name": name,
      "data": data,
      "callback": callback
    });
  },

  initialize: function(options) {
    options = options || {};
    options.rememberTransport = options.rememberTransport || false;
    options.transports = options.transports || ['websocket', 'AJAX long-polling'];

    if (options.socket) {
      FileUpload.socket = io.connect(window.location.protocol + "//" + window.location.host, options);
      FileUpload.socket.on("image_request", function(data) {
        var file, newFile, txt;
        file = FileUpload.file;
        txt = $("#save-modal-btn").html().split(/\s-\s/g)[0];
        txt += " - " + Math.round((file.uploaded / file.size) * 100) + "%";
        $("#save-modal-btn").html(txt);
        newFile = file.slice(file.uploaded, file.uploaded + Math.min(data["chunk"], file.size - file.uploaded));
        FileUpload.file.uploaded += data["chunk"];
        FileUpload.serverFilename = data["name"];
        return file.reader.readAsDataURL(newFile);
      });
      FileUpload.socket.on("image_done", function(data) {
        var txt;
        if (data["error"]) {
          alert(data["error"]);
        } else {
          FileUpload.serverFilename = data["name"];
        }
        txt = $("#save-modal-btn").html().split(/\s-\s/g)[0];
        $("#save-modal-btn").html(txt);
        $("#file-sel").prop("disabled", false);
        return $("#save-modal-btn").prop("disabled", false);
      });
      FileUpload.socket.on("base64_done", function(data) {
        FileUpload.serverFilename = data["name"];
        eval("var callback=" + data["callback"]);
        return callback();
      });
      FileUpload.socket.on("duplicate_done", function(data) {
        if (data["error"]) {
          return alert(data["error"]);
        } else {
          FileUpload.serverFilename = data["name"];
          eval("var callback=" + data["callback"]);
          return callback();
        }
      });
      FileUpload.socket.on("thumbnail_done", function(data) {
        eval("var callback=" + data["callback"]);
        return callback();
      });
    }

  }
}

},{}],6:[function(require,module,exports){
module.exports = function Interface(options) {

  options.imageSelector = options.imageSelector || "#image-container";
  options.fileSelector = options.fileSelector || "#file-sel";

  var urlHash = require('urlhash')();
  var FileUpload = require('./file-upload');
  var logger = options.logger;
  var Colormaps = require('./color/colormaps');

  // saving inputs/expressions:

  function save_infragrammar_inputs() {
    options.mode = $('#modeSwitcher').val();
    return save_infragrammar_expressions({
      'r': $('#r_exp').val(),
      'g': $('#g_exp').val(),
      'b': $('#b_exp').val(),
      'm': $('#m_exp').val(),
      'h': $('#h_exp').val(),
      's': $('#s_exp').val(),
      'v': $('#v_exp').val()
    });
  }

  function save_infragrammar_expressions(args) {
    if (options.mode === "infragrammar") {
      options.processor.save_expressions(args['r'], args['g'], args['b']);
    } else if (options.mode === "infragrammar_mono") {
      options.processor.save_expressions(args['m'], args['m'], args['m']);
    } else if (options.mode === "infragrammar_hsv") {
      return options.processor.save_expressions_hsv(args['h'], args['s'], args['v']);
    }
  }

  $(document).ready(function() {

    if (options.uploadable) FileUpload.initialize({ socket: options.uploadable });

    $(options.imageSelector).ready(function() {

      if (urlHash.getUrlHashParameter("legacy") === "true") options.processor = options.processors.javascript();
      else options.processor = options.processors.webgl();

      if (options.processor === "webgl") {
        $("#webgl-activate").html("&laquo; Go back to JS version");
      }

      var src, idNameMap = {
        "#m_exp": "m",
        "#r_exp": "r",
        "#g_exp": "g",
        "#b_exp": "b",
        "#h_exp": "h",
        "#s_exp": "s",
        "#v_exp": "v"
      };

      // broken:  
      //urlHash.setUrlHashParameter(JSON.stringify(idNameMap));
      src = urlHash.getUrlHashParameter('src');
      if (src) {
        params = parametersObject(location.search.split('?')[1]);
        options.mode = params['mode'];
        fetch_image(src);
      }
      return true;
    });

    $(options.fileSelector).change(function() {
      $("#save-modal-btn").show();
      $("#save-zone").show();
      FileUpload.fromFile(this.files, options.processor.updateImage, options.uploadable);
      $('#preset-modal').modal('show');
      return true;
    });

    $("#preset_raw").click(function() {
      $('#modeSwitcher').val("infragrammar").change();
      $('#r_exp').val("R");
      $('#g_exp').val("G");
      $('#b_exp').val("B");
      $('#preset-modal').modal('hide');
      save_infragrammar_inputs();
      return options.run(options.mode);
    });

    $("#preset_ndvi_blue").click(function() {
      $('#modeSwitcher').val("infragrammar_mono").change();
      $('#m_exp').val("(R-B)/(R+B)");
      $('#preset-modal').modal('hide');
      save_infragrammar_inputs();
      return options.run(options.mode);
    });

    // we should explicitly set mode here... to ndvi?
    $("#preset_ndvi_blue_color").click(function() {
      $('#modeSwitcher').val("infragrammar_mono").change();
      $('#m_exp').val("(R-B)/(R+B)");
      $('#preset-modal').modal('hide');
      save_infragrammar_inputs();
      options.colorized = true;
      options.run(options.mode);
      return options.colorize();
    });

    $("#preset_ndvi_red").click(function() {
      $('#modeSwitcher').val("infragrammar_mono").change();
      $('#m_exp').val("(B-R)/(B+R)");
      $('#preset-modal').modal('hide');
      save_infragrammar_inputs();
      return options.run(options.mode);
    });

    $("#preset_ndvi_red_color").click(function() {
      $('#modeSwitcher').val("infragrammar_mono").change();
      $('#m_exp').val("(B-R)/(B+R)");
      $('#preset-modal').modal('hide');
      save_infragrammar_inputs();
      options.colorized = true;
      options.run(options.mode);
      return options.colorize();
    });

    $("#btn-colorize").click(function() {
      options.colorized = true;
      options.run(options.mode);
      return options.colorize();
    });


    // refactor colormaps based on list
    $("#default_colormap").click(function() {
      var colormap;
      if (options.webGlSupported) {
        glhandledefaultcolormap();
        glhandleonclickndvi();
      } else {
        options.colorized = true;
        colormap = Colormaps.colormap1;
        options.colorize();
      }
      return $("#btn-colorize").addClass("active");
    });

    $("#stretched_colormap").click(function() {
      var colormap;
      if (options.webGlSupported) {
        glHandleStretchedColormap();
        glHandleOnClickNdvi();
      } else {
        options.colorized = true;
        colormap = Colormaps.colormap2;
        options.colorize();
      }
      return $("#btn-colorize").addClass("active");
    });

    $("button#raw").click(function() {
      options.mode = "raw";
      logger.log.push("mode=raw");
      return options.run(options.mode);
    });

    $("button#ndvi").click(function() {
      options.mode = "raw";
      logger.log.push("mode=ndvi");
      return options.run(options.mode);
    });

    $("button#nir").click(function() {
      logger.log.push("mode=nir");
      $("#m_exp").val("R");
      $("#modeSwitcher").val("infragrammar_mono").change();
      if (options.webGlSupported) {
        glHandleOnSubmitInfraMono();
      } else {
        jsHandleOnSubmitInfraMono();
      }
      return true;
    });

    $("#download").click(function() {
      downloadImage();
      return true;
    });

    $("#save").click(function() {
      var img, sendThumbnail;
      sendThumbnail = function() {
        var img;
        img = getCurrentImage();
        return FileUpload.uploadThumbnail(img, function() {
          $("#form-filename").val(FileUpload.getFilename());
          $("#form-log").val(JSON.stringify(logger.log));
          return $("#save-form").submit();
        });
      };
      $("#save").prop("disabled", true);
      $("#save").html("Saving...");
      if (FileUpload.getFilename() === "") {
        img = getCurrentImage();
        FileUpload.fromBase64("camera", img, sendThumbnail);
      } else if (FileUpload.isLoadedFromFile() === false) {
        FileUpload.duplicate(sendThumbnail);
      } else {
        sendThumbnail();
      }
      return true;
    });

    $("#infragrammar_hsv").submit(function() {
      options.mode = "infragrammar_hsv";
      logger.log_hsv();
      save_infragrammar_inputs();
      options.run(options.mode);
      return true;
    });

    $("#infragrammar").submit(function() {
      options.mode = "infragrammar";
      logger.log_rgb();
      save_infragrammar_inputs();
      options.run(options.mode);
      return true;
    });

    $("#infragrammar_mono").submit(function() {
      options.mode = "infragrammar_mono";
      logger.log_mono();
      save_infragrammar_inputs();
      options.run(options.mode);
      return true;
    });

    // not sure about this one
    $("button#grey").click(function() {
      options.mode = "infragrammar_mono";
      logger.log.push("mode=ndvi");
      options.run(options.mode);
      return true;
    });

    $("button#colorify").click(function() {
      return options.colorize();
    });

    // redundant? 
    $("button#color").click(function() {
      logger.log.push("mode=ndvi&color=true");
      return options.colorize();
    });

    $("#webgl-activate").click(function() {
      var href;
      href = window.location.href;
      if (options.webGlSupported) {
        href = href.replace(/(?:\?|&)webgl=true/gi, "");
      } else {
        href += href.indexOf("?") >= 0 ? "&webgl=true" : "?webgl=true";
      }
      window.location.href = href;
      return true;
    });

    $("#webcam-activate").click(function() {
      $("#save-modal-btn").show();
      $("#save-zone").show();
      save_infragrammar_inputs();
      options.video();
      $('#preset-modal').modal('show');
      return true;
    });

    $("#snapshot").click(function() {
      options.camera.getSnapshot();
      return true;
    });

    $("#exit-fullscreen").click(function() {
      $("#image").css("display", "inline");
      $("#image").css("position", "relative");
      $("#image").css("height", "auto");
      $("#image").css("left", 0);
      $("#backdrop").hide();
      $("#exit-fullscreen").hide();
      $("#fullscreen").show();
      return true;
    });

    $("#fullscreen").click(function() {
      $("#image").css("display", "block");
      $("#image").css("height", "100%");
      $("#image").css("width", "auto");
      $("#image").css("position", "absolute");
      $("#image").css("top", "0px");
      $("#image").css("left", parseInt((window.innerWidth - $("#image").width()) / 2) + "px");
      $("#image").css("z-index", "2");
      $("#backdrop").show();
      $("#exit-fullscreen").show();
      $("#fullscreen").hide();
      return true;
    });

    $("#modeSwitcher").change(function() {
      $("#infragrammar, #infragrammar_mono, #infragrammar_hsv").hide();
      $("#" + $("#modeSwitcher").val()).css("display", "inline");
      return true;
    });

    $("[rel=tooltip]").tooltip()
    $("[rel=popover]").popover()
    return true;
  });
}

},{"./color/colormaps":3,"./file-upload":5,"urlhash":1}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
// refactor to access state, not dom
module.exports = function Logger(options) {

  var log = []; // a record of previous commands run

  function log_mono() {
    var logEntry;
    logEntry = "mode=infragrammar_mono";
    logEntry += $("#m_exp").val() ? "&m=" + $("#m_exp").val() : "";
    logEntry += options.colorized ? "&c=true" : ""; // no way to succinctly store the colormap... just offer range of colorizations at view-time?
    return log.push(logEntry);
  }

  function log_hsv() {
    var logEntry;
    logEntry = "mode=infragrammar_hsv";
    logEntry += $("#h_exp").val() ? "&h=" + $("#h_exp").val() : "";
    logEntry += $("#s_exp").val() ? "&s=" + $("#s_exp").val() : "";
    logEntry += $("#v_exp").val() ? "&v=" + $("#v_exp").val() : "";
    return log.push(logEntry);
  }

  function log_rgb() {
    var logEntry;
    logEntry = "mode=infragrammar";
    logEntry += $("#r_exp").val() ? "&r=" + $("#r_exp").val() : "";
    logEntry += $("#g_exp").val() ? "&g=" + $("#g_exp").val() : "";
    logEntry += $("#b_exp").val() ? "&b=" + $("#b_exp").val() : "";
    return log.push(logEntry);
  }

  function save_log() {
    if (options.mode === "infragrammar_mono") {
      return log_mono();
    } else if (options.mode === "infragrammar_hsv") {
      return log_hsv();
    } else if (options.mode === "infragrammar") {
      return log_rgb();
    }
  }

  return {
    log: log,
    log_hsv: log_hsv,
    log_mono: log_mono,
    log_rgb: log_rgb,
    save_log: save_log
  }

}

},{}],9:[function(require,module,exports){
// This file was adapted from infragram-js:
// http://github.com/p-v-o-s/infragram-js.

module.exports = function javascriptProcessor() {

  var b_exp = "",
      g_exp = "",
      get_channels,
      Colormaps = require('../color/colormaps')(JsImage),
      colormap = Colormaps.colormap1,
      converters = require('../color/converters'),
      image = null,
      jsHandleOnClickGrey,
      jsHandleOnClickNdvi,
      jsHandleOnClickRaw,
      jsHandleOnSlide,
      jsHandleOnSubmitInfra,
      jsHandleOnSubmitInfraHsv,
      jsHandleOnSubmitInfraMono,
      m_exp = "",
      mode = "raw",
      ndvi,
      r_exp = "",
      set_mode,
      update_colorbar;

  var JsImage = require('../util/JsImage.js');

  function histogram(array, [min, max], nbins) {
    var a, bins, d, i, l, len;
    bins = (function() {
      var l, ref, results;
      results = [];
      for (i = l = 0, ref = nbins; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        results.push(0);
      }
      return results;
    })();
    d = (max - min) / nbins;
    for (l = 0, len = array.length; l < len; l++) {
      a = array[l];
      i = Math.floor((a - min) / d);
      if ((0 <= i && i < nbins)) {
        bins[i]++;
      }
    }
    return bins;
  }

  function get_channels(jsImage) {
    var b, g, i, l, mkImage, n, r, ref;
    n = jsImage.width * jsImage.height;
    r = new Float32Array(n);
    g = new Float32Array(n);
    b = new Float32Array(n);
    for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      r[i] = jsImage.data[4 * i + 0];
      g[i] = jsImage.data[4 * i + 1];
      b[i] = jsImage.data[4 * i + 2];
    }
    function mkImage(d) {
      return new JsImage(d, jsImage.width, jsImage.height, 1);
    }
    return [mkImage(r), mkImage(g), mkImage(b)];
  }

  // replace with infragrammar expression
  function ndvi(nirJsImg, visJsImg) {
    var d, i, l, n, ref;
    n = nirJsImg.width * nirJsImg.height;
    d = new Float64Array(n);
    for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      d[i] = (nirJsImg.data[i] - visJsImg.data[i]) / (nirJsImg.data[i] + visJsImg.data[i]);
    }
    return new JsImage(d, nirJsImg.width, nirJsImg.height, 1);
  }

  function infragrammar(jsImage) {
    var b, g, i, l, n, o, r, ref;
    $('#btn-colorize').removeClass('active');
    n = jsImage.width * jsImage.height;
    r = new Float32Array(n);
    g = new Float32Array(n);
    b = new Float32Array(n);
    o = new Float32Array(4 * n);
    for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      r[i] = jsImage.data[4 * i + 0] / 255;
      g[i] = jsImage.data[4 * i + 1] / 255;
      b[i] = jsImage.data[4 * i + 2] / 255;
      o[4 * i + 0] = 255 * r_exp(r[i], g[i], b[i]);
      o[4 * i + 1] = 255 * g_exp(r[i], g[i], b[i]);
      o[4 * i + 2] = 255 * b_exp(r[i], g[i], b[i]);
      o[4 * i + 3] = 255;
    }
    return new JsImage(o, jsImage.width, jsImage.height, 4);
  }

  function infragrammar_mono(jsImage) {
    var b, g, i, l, n, o, r, ref;
    n = jsImage.width * jsImage.height;
    r = new Float32Array(n);
    g = new Float32Array(n);
    b = new Float32Array(n);
    o = new Float32Array(n);
    for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      r[i] = jsImage.data[4 * i + 0] / 255.0;
      g[i] = jsImage.data[4 * i + 1] / 255.0;
      b[i] = jsImage.data[4 * i + 2] / 255.0;
      o[i] = r_exp(r[i], g[i], b[i]);
    }
    return new JsImage(o, jsImage.width, jsImage.height, 1);
  }

  function render(jsImage) {
    var ctx, d, e;
    e = $("#image")[0];
    e.width = jsImage.width;
    e.height = jsImage.height;
    ctx = e.getContext("2d");
    d = ctx.getImageData(0, 0, jsImage.width, jsImage.height);
    jsImage.copyToImageData(d);
    return ctx.putImageData(d, 0, 0);
  }

  function colorize() {
    var imageData = getImageData();
    render(
      Colormaps.colorify(infragrammar_mono(imageData), function(x) {
        return colormap((x + 1) / 2);
      })
    );
    return true;
  }

  update_colorbar = (min, max) => {
    var b, ctx, d, e, g, i, j, k, l, m, r, ref, ref1;
    $('#colorbar-container')[0].style.display = 'inline-block';
    e = $('#colorbar')[0];
    ctx = e.getContext("2d");
    d = ctx.getImageData(0, 0, e.width, e.height);
    for (i = l = 0, ref = e.width; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      for (j = m = 0, ref1 = e.height; 0 <= ref1 ? m < ref1 : m > ref1; j = 0 <= ref1 ? ++m : --m) {
        [r, g, b] = colormap(i / e.width);
        k = 4 * (i + j * e.width);
        d.data[k + 0] = r;
        d.data[k + 1] = g;
        d.data[k + 2] = b;
        d.data[k + 3] = 255;
      }
    }
    ctx.putImageData(d, 0, 0);
    $("#colorbar-min")[0].textContent = min.toFixed(2);
    return $("#colorbar-max")[0].textContent = max.toFixed(2);
  }

  function update(image) {
    var b, g, max, min, ndvi_jsImg, normalize, r, resultJsImage;
    $('#colorbar-container')[0].style.display = 'none';
    if (mode === "ndvi") {
      [r, g, b] = get_channels(image);
      ndvi_jsImg = ndvi(r, b);
      // this isn't correct for NDVI; we want values from -1 to 1:
      // [[min],[max]] = ndvi_img.extrema()
      min = -1;
      max = 1;
      function normalize(x) {
        return (x - min) / (max - min);
      };
      resultJsImage = Colormaps.colorify(ndvi_jsImg, function(x) {
        return colormap(normalize(x));
      });
      update_colorbar(min, max);
    } else if (mode === "raw") {
      resultJsImage = new JsImage(image.data, image.width, image.height, 4);
    } else if (mode === "nir") {
      [r, g, b] = get_channels(image);
      resultJsImage = Colormaps.colorify(r, function(x) {
        return [x, x, x];
      });
    } else {
      resultJsImage = infragrammar(image);
    }
    return render(resultJsImage);
  }

  function save_expressions(r, g, b) {
    if (r === "") {
      r = "R";
    }
    if (g === "") {
      g = "G";
    }
    if (b === "") {
      b = "B";
    }
    eval("r_exp = function(R,G,B){var r=R,g=G,b=B;return " + r + ";}");
    eval("g_exp = function(R,G,B){var r=R,g=G,b=B;return " + g + ";}");
    return eval("b_exp = function(R,G,B){var r=R,g=G,b=B;return " + b + ";}");
  };

  function save_expressions_hsv(h, s, v) {
    if (h === "") {
      h = "H";
    }
    if (s === "") {
      s = "S";
    }
    if (v === "") {
      v = "V";
    }
    eval("r_exp = function(R,G,B){var h=H,s=S,v=V,hsv = converters.rgb2hsv(R, G, B), H = hsv[0], S = hsv[1], V = hsv[2]; return converters.hsv2rgb(" + h + "," + s + "," + v + ")[0];}");
    eval("g_exp = function(R,G,B){var h=H,s=S,v=V,hsv = converters.rgb2hsv(R, G, B), H = hsv[0], S = hsv[1], V = hsv[2]; return converters.hsv2rgb(" + h + "," + s + "," + v + ")[1];}");
    return eval("b_exp = function(R,G,B){var h=H,s=S,v=V,hsv = converters.rgb2hsv(R, G, B), H = hsv[0], S = hsv[1], V = hsv[2]; return converters.hsv2rgb(" + h + "," + s + "," + v + ")[2];}");
  }

  function getImageData() {
    var ctx = $('#image')[0].getContext("2d");
// risks being circular def of width/height
    var width = $('#image').width();
    var height = $('#image').height();
// this now just defaults to file-scoped 'image' which we want to avoid
    return image || ctx.getImageData(0, 0, width, height);
  }

  function getJsImage() {
    var imageData = getImageData();
    return new JsImage(imageData.data, imageData.width, imageData.height, 1);
  }

  function set_mode(new_mode) {
    mode = new_mode;
    update(getImageData());
    if (mode === "ndvi") {
      return $("#colormaps-group")[0].style.display = "inline-block";
    } else {
      if ($("#colormaps-group").length > 0) {
        return $("#colormaps-group")[0].style.display = "none";
      }
    }
  }

  // img should be a native JavaScript image obj
  function updateImage(img) {
    var ctx, height, imgCanvas, width;
    imgCanvas = document.getElementById("image");
    ctx = imgCanvas.getContext("2d");
    width = img.videoWidth || img.width;
    height = img.videoHeight || img.height;
    ctx.drawImage(img, 0, 0, width, height, 0, 0, imgCanvas.width, imgCanvas.height);
    image = ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height);
    return set_mode(mode);
  }

  function run(mode) {
    return set_mode(mode);
  }

  function getCurrentImage() {
    var ctx, e;
    e = $("#image")[0];
    ctx = e.getContext("2d");
    return ctx.canvas.toDataURL("image/jpeg");
  }

  jsHandleOnClickRaw = function() {
    return set_mode("raw");
  }

  jsHandleOnClickNdvi = function() {
    return set_mode("ndvi");
  }

  jsHandleOnSubmitInfraHsv = function() {
    save_expressions_hsv($('#h_exp').val(), $('#s_exp').val(), $('#v_exp').val());
    return set_mode("infragrammar_hsv");
  }

  jsHandleOnSubmitInfra = function() {
    save_expressions($('#r_exp').val(), $('#g_exp').val(), $('#b_exp').val());
    return set_mode("infragrammar");
  }

  jsHandleOnSubmitInfraMono = function() {
    save_expressions($('#m_exp').val(), $('#m_exp').val(), $('#m_exp').val());
    return set_mode("infragrammar_mono");
  }

  jsHandleOnClickGrey = function() {
    colormap = Colormaps.greyscale_colormap;
    return update(image);
  }

  return {
    type: 'javascript',
    colormap: colormap,
    getCurrentImage: getCurrentImage,
    getImageData: getImageData,
    getJsImage: getJsImage,
    infragrammar_mono: infragrammar_mono,
    infragrammar: infragrammar,
    render: render,
    run: run,
    save_expressions: save_expressions,
    save_expressions_hsv: save_expressions_hsv,
    update: update,
    updateImage: updateImage,
    colorize: colorize
  }

}

},{"../color/colormaps":3,"../color/converters":4,"../util/JsImage.js":11}],10:[function(require,module,exports){
// Generated by CoffeeScript 2.1.0
// This file was adapted from infragram-js:
// http://github.com/p-v-o-s/infragram-js.
module.exports = function webglProcessor() {

  var imgContext = null,
      mapContext = null,
      vertices = [-1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0],
      waitForShadersToLoad = 0,
      webglUtils = require('../util/webgl-utils')();

  vertices.itemSize = 2;

  function initialize() {
    imgContext = createContext("raw", 1, 0, 1.0, "image");
    mapContext = createContext("raw", 1, 1, 1.0, "colorbar");
    waitForShadersToLoad = 2;
    $("#shader-vs").load("dist/shader.vert", glShaderLoaded);
    $("#shader-fs-template").load("dist/shader.frag", glShaderLoaded);
    if (imgContext && mapContext) {
      return true;
    } else {
      return false;
    }
  };

  function createBuffer(ctx, data) {
    var buffer, gl;
    gl = ctx.gl;
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    buffer.itemSize = data.itemSize;
    return buffer;
  };

  function createTexture(ctx, textureUnit) {
    var gl, texture;
    gl = ctx.gl;
    texture = gl.createTexture();
    gl.activeTexture(textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ctx.canvas.width, ctx.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    return texture;
  };

  function createContext(mode, selColormap, colormap, slider, canvasName) {
    var ctx;
    ctx = new Object();
    ctx.mode = mode;
    ctx.expression = ["", "", ""];
    ctx.selColormap = selColormap;
    ctx.colormap = colormap;
    ctx.slider = slider;
    ctx.updateShader = true;
    ctx.canvas = document.getElementById(canvasName);
    ctx.canvas.addEventListener("webglcontextlost", (function(event) {
      return event.preventDefault();
    }), false);
    ctx.canvas.addEventListener("webglcontextrestored", glRestoreContext, false);
    ctx.gl = webglUtils.getWebGLContext(ctx.canvas);
    if (ctx.gl) {
      ctx.gl.getExtension("OES_texture_float");
      ctx.vertexBuffer = createBuffer(ctx, vertices);
      ctx.framebuffer = ctx.gl.createFramebuffer();
      ctx.imageTexture = createTexture(ctx, ctx.gl.TEXTURE0);
      return ctx;
    } else {
      return null;
    }
  };

  function drawScene(ctx, returnImage) {
    var gl, pColormap, pHsvUniform, pNdviUniform, pSampler, pSelColormapUniform, pSliderUniform, pVertexPosition;
    if (!returnImage) {
      window.requestAnimationFrame(function() {
 //     webglUtils.requestAnimFrame(function() {
        return drawScene(ctx, false);
      });
    }
    if (ctx.updateShader) {
      ctx.updateShader = false;
      generateShader(ctx);
    }
    gl = ctx.gl;
    gl.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
    gl.useProgram(ctx.shaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, ctx.vertexBuffer);
    pVertexPosition = gl.getAttribLocation(ctx.shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(pVertexPosition);
    gl.vertexAttribPointer(pVertexPosition, ctx.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    pSampler = gl.getUniformLocation(ctx.shaderProgram, "uSampler");
    gl.uniform1i(pSampler, 0);
    pSliderUniform = gl.getUniformLocation(ctx.shaderProgram, "uSlider");
    gl.uniform1f(pSliderUniform, ctx.slider);
    pNdviUniform = gl.getUniformLocation(ctx.shaderProgram, "uNdvi");
    gl.uniform1i(pNdviUniform, (ctx.mode === "ndvi" || ctx.colormap ? 1 : 0));
    pSelColormapUniform = gl.getUniformLocation(ctx.shaderProgram, "uSelectColormap");
    gl.uniform1i(pSelColormapUniform, ctx.selColormap);
    pHsvUniform = gl.getUniformLocation(ctx.shaderProgram, "uHsv");
    gl.uniform1i(pHsvUniform, (ctx.mode === "hsv" ? 1 : 0));
    pColormap = gl.getUniformLocation(ctx.shaderProgram, "uColormap");
    gl.uniform1i(pColormap, (ctx.colormap ? 1 : 0));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / vertices.itemSize);
    if (returnImage) {
      return ctx.canvas.toDataURL("image/jpeg");
    }
  };

  function generateShader(ctx) {
console.log('generateShader');
    var b, code, g, r;
    [r, g, b] = ctx.expression;
    // Map HSV to shader variable names
    r = r.toLowerCase().replace(/h/g, "r").replace(/s/g, "g").replace(/v/g, "b");
    g = g.toLowerCase().replace(/h/g, "r").replace(/s/g, "g").replace(/v/g, "b");
    b = b.toLowerCase().replace(/h/g, "r").replace(/s/g, "g").replace(/v/g, "b");
    // Sanitize strings
    r = r.replace(/[^xrgb\/\-\+\*\(\)\.0-9]*/g, "");
    g = g.replace(/[^xrgb\/\-\+\*\(\)\.0-9]*/g, "");
    b = b.replace(/[^xrgb\/\-\+\*\(\)\.0-9]*/g, "");
    // Convert int to float
    r = r.replace(/([0-9])([^\.])?/g, "$1.0$2");
    g = g.replace(/([0-9])([^\.])?/g, "$1.0$2");
    b = b.replace(/([0-9])([^\.])?/g, "$1.0$2");
    // adjust NDVI range
    if (ctx.mode === "ndvi") {
      if (r !== "") {
        r = "((" + r + ") + 1.0) / 2.0";
      }
      if (g !== "") {
        g = "((" + g + ") + 1.0) / 2.0";
      }
      if (b !== "") {
        b = "((" + b + ") + 1.0) / 2.0";
      }
    }
    if (r === "") {
      r = "r";
    }
    if (g === "") {
      g = "g";
    }
    if (b === "") {
      b = "b";
    }
    code = $("#shader-fs-template").html();
    code = code.replace(/@1@/g, r);
    code = code.replace(/@2@/g, g);
    code = code.replace(/@3@/g, b);
    $("#shader-fs").html(code);
    return ctx.shaderProgram = webglUtils.createProgramFromScripts(ctx.gl, ["shader-vs", "shader-fs"]);
  };

  function setMode(ctx, newMode) {
console.log('setMode', newMode);
    if (ctx.mode != newMode) ctx.updateShader = true;
    ctx.mode = newMode;
    if (ctx.mode === "ndvi") {
      $("#colorbar-container")[0].style.display = "inline-block";
      return $("#colormaps-group")[0].style.display = "inline-block";
    } else {
      $("#colorbar-container")[0].style.display = "none";
      return $("#colormaps-group")[0].style.display = "none";
    }
  };

  function glShaderLoaded() {
    waitForShadersToLoad -= 1;
    if (!waitForShadersToLoad) {
      drawScene(imgContext);
      return drawScene(mapContext);
    }
  };

  function glRestoreContext() {
    var imageData;
    imageData = imgContext.imageData;
    imgContext = createContext(imgContext.mode, imgContext.selColormap, imgContext.colormap, imgContext.slider, "image");
    mapContext = createContext(mapContext.mode, mapContext.selColormap, mapContext.colormap, mapContext.slider, "colorbar");
    if (imgContext && mapContext) {
      return updateImage(imageData);
    }
  };

  function updateImage(img) {
    var gl;
    gl = imgContext.gl;
    imgContext.imageData = img;
    gl.activeTexture(gl.TEXTURE0);
    return gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  };

  function getCurrentImage() {
    return drawScene(imgContext, true);
  };

  function getImageData() {
    return imgContext.imageData;
  };

  function glHandleDefaultColormap() {
    return imgContext.selColormap = mapContext.selColormap = 0;
  };

  function glHandleStretchedColormap() {
    return imgContext.selColormap = mapContext.selColormap = 2;
  };

  function saveExpression(a, b, c) {
    return imgContext.expression = [a, b, c];
  };

  function run(mode) {
    return setMode(imgContext, mode);
  };

  function glHandleOnClickGrey() {
    return imgContext.selColormap = mapContext.selColormap = 1;
  };

  function colorize(val) {
    if (val === "hsv") run('hsv');
    else {
      imgContext.selColormap = mapContext.selColormap = val;
      run('ndvi');
    }
  }

  initialize();

  return {
    type: 'webgl',
    initialize: initialize,
    getCurrentImage: getCurrentImage,
    getImageData: getImageData,
    run: run,
    save_expressions: saveExpression,
    setMode: setMode,
    updateImage: updateImage,
    colorize: colorize
  }

}

},{"../util/webgl-utils":12}],11:[function(require,module,exports){
module.exports = class JsImage {
  constructor(data1, width1, height1, channels) {
    this.data = data1;
    this.width = width1;
    this.height = height1;
    this.channels = channels;
  }

  copyToImageData(imgData) {
    return imgData.data.set(this.data);
  }

  extrema() {
    var c, i, j, l, m, maxs, mins, n, ref, ref1;
    n = this.width * this.height;
    mins = (function() {
      var l, ref, results;
      results = [];
      for (i = l = 0, ref = this.channels; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        results.push(this.data[i]);
      }
      return results;
    }).call(this);
    maxs = (function() {
      var l, ref, results;
      results = [];
      for (i = l = 0, ref = this.channels; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        results.push(this.data[i]);
      }
      return results;
    }).call(this);
    j = 0;
    for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      for (c = m = 0, ref1 = this.channels; 0 <= ref1 ? m < ref1 : m > ref1; c = 0 <= ref1 ? ++m : --m) {
        if (this.data[j] > maxs[c]) {
          maxs[c] = this.data[j];
        }
        if (this.data[j] < mins[c]) {
          mins[c] = this.data[j];
        }
        j++;
      }
    }
    return [mins, maxs];
  }

}

},{}],12:[function(require,module,exports){
/*
 * Copyright 2012, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// These funcitions are meant solely to help unclutter the tutorials.
// They are not meant as production type functions.

// This file was adapted from the above author for Node.js use.

module.exports = function webglUtils() {

var lastError;

/**
 * Wrapped logging function.
 * @param {string} msg The message to log.
 */
var log = function(msg) {
  if (window.console && window.console.log) {
    window.console.log(msg);
  }
};

/**
 * Wrapped logging function.
 * @param {string} msg The message to log.
 */
var error = function(msg) {
  if (window.console) {
    if (window.console.error) {
      window.console.error(msg);
    }
    else if (window.console.log) {
      window.console.log(msg);
    }
  }
};

/**
 * Turn off all logging.
 */
var loggingOff = function() {
  log = function() {};
  error = function() {};
};

/**
 * Check if the page is embedded.
 * @return {boolean} True of we are in an iframe
 */
var isInIFrame = function() {
  return window != window.top;
};

/**
 * Converts a WebGL enum to a string
 * @param {!WebGLContext} gl The WebGLContext to use.
 * @param {number} value The enum value.
 * @return {string} The enum as a string.
 */
var glEnumToString = function(gl, value) {
  for (var p in gl) {
    if (gl[p] == value) {
      return p;
    }
  }
  return "0x" + value.toString(16);
};

/**
 * Creates the HTLM for a failure message
 * @param {string} canvasContainerId id of container of th
 *        canvas.
 * @return {string} The html.
 */
var makeFailHTML = function(msg) {
  return '' +
    '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
    '<td align="center">' +
    '<div style="display: table-cell; vertical-align: middle;">' +
    '<div style="">' + msg + '</div>' +
    '</div>' +
    '</td></tr></table>';
};

/**
 * Mesasge for getting a webgl browser
 * @type {string}
 */
var GET_A_WEBGL_BROWSER = '' +
  'This page requires a browser that supports WebGL.<br/>' +
  '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

/**
 * Mesasge for need better hardware
 * @type {string}
 */
var OTHER_PROBLEM = '' +
  "It doesn't appear your computer can support WebGL.<br/>" +
  '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';

/**
 * Creates a webgl context. If creation fails it will
 * change the contents of the container of the <canvas>
 * tag to an error message with the correct links for WebGL.
 * @param {Element} canvas. The canvas element to create a
 *     context from.
 * @param {WebGLContextCreationAttirbutes} opt_attribs Any
 *     creation attributes you want to pass in.
 * @return {WebGLRenderingContext} The created context.
 */
var setupWebGL = function(canvas, opt_attribs) {
  function showLink(str) {
    var container = canvas.parentNode;
    if (container) {
      container.innerHTML = makeFailHTML(str);
    }
  };

  if (!window.WebGLRenderingContext) {
    //showLink(GET_A_WEBGL_BROWSER);
    return null;
  }

  var context = create3DContext(canvas, opt_attribs);
  if (!context) {
    //showLink(OTHER_PROBLEM);
  }
  return context;
};

/**
 * Creates a webgl context.
 * @param {!Canvas} canvas The canvas tag to get context
 *     from. If one is not passed in one will be created.
 * @return {!WebGLContext} The created context.
 */
var create3DContext = function(canvas, opt_attribs) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var ii = 0; ii < names.length; ++ii) {
    try {
      context = canvas.getContext(names[ii], opt_attribs);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  return context;
}

var updateCSSIfInIFrame = function() {
  if (isInIFrame()) {
    document.body.className = "iframe";
  }
};

/**
 * Gets a WebGL context.
 * makes its backing store the size it is displayed.
 */
var getWebGLContext = function(canvas, opt_attribs) {
  if (isInIFrame()) {
    updateCSSIfInIFrame();

    // make the canvas backing store the size it's displayed.
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  var gl = setupWebGL(canvas, opt_attribs);
  return gl;
};

/**
 * Loads a shader.
 * @param {!WebGLContext} gl The WebGLContext to use.
 * @param {string} shaderSource The shader source.
 * @param {number} shaderType The type of shader.
 * @param {function(string): void) opt_errorCallback callback for errors.
 * @return {!WebGLShader} The created shader.
 */
var loadShader = function(gl, shaderSource, shaderType, opt_errorCallback) {
  var errFn = opt_errorCallback || error;
  // Create the shader object
  var shader = gl.createShader(shaderType);

  // Load the shader source
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  // Check the compile status
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    // Something went wrong during compilation; get the error
    lastError = gl.getShaderInfoLog(shader);
    errFn("*** Error compiling shader '" + shader + "':" + lastError);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 * Creates a program, attaches shaders, binds attrib locations, links the
 * program and calls useProgram.
 * @param {!Array.<!WebGLShader>} shaders The shaders to attach
 * @param {!Array.<string>} opt_attribs The attribs names.
 * @param {!Array.<number>} opt_locations The locations for the attribs.
 * @param {function(string): void) opt_errorCallback callback for errors.
 */
var loadProgram = function(
    gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
  var errFn = opt_errorCallback || error;
  var program = gl.createProgram();
  for (var ii = 0; ii < shaders.length; ++ii) {
    gl.attachShader(program, shaders[ii]);
  }
  if (opt_attribs) {
    for (var ii = 0; ii < opt_attribs.length; ++ii) {
      gl.bindAttribLocation(
          program,
          opt_locations ? opt_locations[ii] : ii,
          opt_attribs[ii]);
    }
  }
  gl.linkProgram(program);

  // Check the link status
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
      // something went wrong with the link
      lastError = gl.getProgramInfoLog (program);
      errFn("Error in program linking:" + lastError);

      gl.deleteProgram(program);
      return null;
  }
  return program;
};

/**
 * Loads a shader from a script tag.
 * @param {!WebGLContext} gl The WebGLContext to use.
 * @param {string} scriptId The id of the script tag.
 * @param {number} opt_shaderType The type of shader. If not passed in it will
 *     be derived from the type of the script tag.
 * @param {function(string): void) opt_errorCallback callback for errors.
 * @return {!WebGLShader} The created shader.
 */
var createShaderFromScript = function(
    gl, scriptId, opt_shaderType, opt_errorCallback) {
  var shaderSource = "";
  var shaderType;
  var shaderScript = document.getElementById(scriptId);
  if (!shaderScript) {
    throw("*** Error: unknown script element" + scriptId);
  }
  shaderSource = shaderScript.text;

  if (!opt_shaderType) {
    if (shaderScript.type == "x-shader/x-vertex") {
      shaderType = gl.VERTEX_SHADER;
    } else if (shaderScript.type == "x-shader/x-fragment") {
      shaderType = gl.FRAGMENT_SHADER;
    } else if (shaderType != gl.VERTEX_SHADER && shaderType != gl.FRAGMENT_SHADER) {
      throw("*** Error: unknown shader type");
      return null;
    }
  }

  return loadShader(
      gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType,
      opt_errorCallback);
};

var defaultShaderType = [
  "VERTEX_SHADER",
  "FRAGMENT_SHADER"
];

/**
 * Creates a program from 2 script tags.
 *
 * @param {!WebGLContext} gl The WebGLContext to use.
 * @param {!Array.<string>} shaderScriptIds Array of ids of the
 *        script tags for the shaders. The first is assumed to
 *        be the vertex shader, the second the fragment shader.
 * @param {!Array.<string>} opt_attribs The attribs names.
 * @param {!Array.<number>} opt_locations The locations for the attribs.
 * @param {function(string): void) opt_errorCallback callback for errors.
 * @return {!WebGLProgram} The created program.
 */
var createProgramFromScripts = function(
    gl, shaderScriptIds, opt_attribs, opt_locations, opt_errorCallback) {
  var shaders = [];
  for (var ii = 0; ii < shaderScriptIds.length; ++ii) {
    shaders.push(createShaderFromScript(
        gl, shaderScriptIds[ii], gl[defaultShaderType[ii]], opt_errorCallback));
  }
  return loadProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
};


// Add your prefix here.
var browserPrefixes = [
  "",
  "MOZ_",
  "OP_",
  "WEBKIT_"
];

/**
 * Given an extension name like WEBGL_compressed_texture_s3tc
 * returns the supported version extension, like
 * WEBKIT_WEBGL_compressed_teture_s3tc
 * @param {string} name Name of extension to look for
 * @return {WebGLExtension} The extension or undefined if not
 *     found.
 */
var getExtensionWithKnownPrefixes = function(gl, name) {
  for (var ii = 0; ii < browserPrefixes.length; ++ii) {
    var prefixedName = browserPrefixes[ii] + name;
    var ext = gl.getExtension(prefixedName);
    if (ext) {
      return ext;
    }
  }
};


/**
 * Resize a canvas to match the size it's displayed.
 * @param {!Canvas} canvas The canvas to resize.
 */
var resizeCanvasToDisplaySize = function(canvas) {
  if (canvas.width != canvas.clientWidth ||
      canvas.height != canvas.clientHeight) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
}

/**
 * Provides requestAnimationFrame in a cross browser way.
 */
var requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           return window.setTimeout(callback, 1000/60);
         };
})();

/**
 * Provides cancelRequestAnimationFrame in a cross browser way.
 */
var cancelRequestAnimFrame = (function() {
  return window.cancelCancelRequestAnimationFrame ||
         window.webkitCancelRequestAnimationFrame ||
         window.mozCancelRequestAnimationFrame ||
         window.oCancelRequestAnimationFrame ||
         window.msCancelRequestAnimationFrame ||
         window.clearTimeout;
})();

return {
  createProgram: loadProgram,
  createProgramFromScripts: createProgramFromScripts,
  createShaderFromScriptElement: createShaderFromScript,
  getWebGLContext: getWebGLContext,
  updateCSSIfInIFrame: updateCSSIfInIFrame,
  getExtensionWithKnownPrefixes: getExtensionWithKnownPrefixes,
  resizeCanvasToDisplaySize: resizeCanvasToDisplaySize,
  requestAnimFrame: requestAnimFrame,
  cancelRequestAnimFrame: cancelRequestAnimFrame
};

};

},{}]},{},[2]);
