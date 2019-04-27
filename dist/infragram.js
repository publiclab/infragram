"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f;
        }

        var l = n[o] = {
          exports: {}
        };
        t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];
          return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }

      return n[o].exports;
    }

    var i = typeof require == "function" && require;

    for (var o = 0; o < r.length; o++) {
      s(r[o]);
    }

    return s;
  }

  return e;
})()({
  1: [function (require, module, exports) {
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
        pairs.forEach(function (pair, i) {
          pair = pair.split('=');
          if (pair[0] != '') object[pair[0]] = pair[1];
        });
        return object;
      } // accepts an object like { paramName: value, paramName1: value }
      // and transforms to: url.com#paramName=value&paramName1=value


      function setUrlHashParameters(params) {
        var keys = Object.keys(params);
        var values = Object.values(params);
        var pairs = [];
        keys.forEach(function (key, i) {
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
        getUrlHashParameter: getUrlHashParameter,
        getUrlHashParameters: getUrlHashParameters,
        setUrlHashParameter: setUrlHashParameter,
        setUrlHashParameters: setUrlHashParameters
      };
    }

    module.exports = urlHash;
  }, {}],
  2: [function (require, module, exports) {
    window.Infragram = function Infragram(options) {
      options = options || {};
      options.uploader = options.uploader || false;
      options.processor = options.processor || 'javascript';
      options.camera = require('./io/camera')(options);
      options.colorized = options.colorized || false;
      options.mode = options.mode || "raw", options.video_live = options.video_live || false, options.webGlSupported = options.webGlSupported || false; // move into processor

      options.processors = {
        'webgl': require('./processors/webgl'),
        'javascript': require('./processors/javascript')
      };
      options.processor = options.processors[options.processor](options);
      options.file = require('./io/file')(options, options.processor);
      options.logger = require('./logger')(options);

      var Interface = require('./ui/interface')(options); // this can change processor based on URL hash
      //options.processor.initialize(options); // double initialize after end of processor code?


      console.log('processor:', options.processor.type);

      options.colorize = function colorize(map) {
        options.processor.colorize(map);
      }; // this should accept an object with parameters r,g,b,h,s,v,m and mode


      options.run = function run(mode) {
        options.logger.save_log();
        return options.processor.run(mode);
      }; // split into processor.video() methods


      options.video = function video() {
        options.camera.initialize();
        var interval;
        if (options.processor.type == "webgl") interval = 15;else interval = 150;
        setInterval(function () {
          if (image) options.run(options.mode);
          options.camera.getSnapshot(); //if (options.colorized) return options.colorize();
        }, interval);
      }; // TODO: this doesn't work; it just downloads the unmodified image. 
      // probably a timing issue?


      function download() {
        //options.run(options.mode);
        //if (options.colorized) return options.colorize();
        options.file.downloadImage();
      }

      return {
        Camera: options.camera,
        Interface: Interface,
        logger: options.logger,
        run: options.run,
        colorize: options.colorize,
        processors: options.processors,
        download: download,
        options: options
      };
    };

    module.exports = Infragram;
  }, {
    "./io/camera": 8,
    "./io/file": 9,
    "./logger": 10,
    "./processors/javascript": 11,
    "./processors/webgl": 12,
    "./ui/interface": 16
  }],
  3: [function (require, module, exports) {
    module.exports = function segmented_colormap(segments) {
      return function (x) {
        var i, l, len, m, ref, result, x0, x1, xstart, y0, y1;
        y0 = 0;
        y1 = 0;
        var _ref = [segments[0][0], 1];
        x0 = _ref[0];
        x1 = _ref[1];

        if (x < x0) {
          return y0;
        }

        for (i = l = 0, len = segments.length; l < len; i = ++l) {
          var _segments$i = _slicedToArray(segments[i], 3);

          xstart = _segments$i[0];
          y0 = _segments$i[1];
          y1 = _segments$i[2];
          x0 = xstart;

          if (i === segments.length - 1) {
            x1 = 1;
            break;
          }

          x1 = segments[i + 1][0];

          if (xstart <= x && x < x1) {
            break;
          }
        }

        result = [];

        for (i = m = 0, ref = y0.length; 0 <= ref ? m < ref : m > ref; i = 0 <= ref ? ++m : --m) {
          result[i] = (x - x0) / (x1 - x0) * (y1[i] - y0[i]) + y0[i];
        }

        return result;
      };
    };
  }, {}],
  4: [function (require, module, exports) {
    module.exports = {
      "greyscale": {
        "author": "publiclab",
        "description": "A simple linear greyscale colormap, black to white.",
        "url": "https://publiclab.org/colormaps#greyscale",
        "colormapRanges": [[0, [0, 0, 0], [255, 255, 255]], [1, [255, 255, 255], [255, 255, 255]]]
      },
      "default": {
        "author": "publiclab",
        "description": "A full-colorwheel colormap, covering the colors in the spectrum.",
        "url": "https://publiclab.org/colormaps#default",
        "colormapRanges": [[0, [45, 1, 121], [25, 1, 137]], [0.125, [25, 1, 137], [0, 6, 156]], [0.1875, [0, 6, 156], [7, 41, 172]], [0.25, [7, 41, 172], [22, 84, 187]], [0.3125, [22, 84, 187], [25, 125, 194]], [0.375, [25, 125, 194], [26, 177, 197]], [0.4375, [26, 177, 197], [23, 199, 193]], [0.47, [23, 199, 193], [25, 200, 170]], [0.50, [25, 200, 170], [21, 209, 27]], [0.5625, [21, 209, 27], [108, 215, 18]], [0.625, [108, 215, 18], [166, 218, 19]], [0.6875, [166, 218, 19], [206, 221, 20]], [0.75, [206, 221, 20], [222, 213, 19]], [0.7813, [222, 213, 19], [222, 191, 19]], [0.8125, [222, 191, 19], [227, 133, 17]], [0.875, [227, 133, 17], [231, 83, 16]], [0.9375, [231, 83, 16], [220, 61, 48]]]
      },
      "stretched": {
        "author": "publiclab",
        "description": "A simple colormap from blue to red, with no purple overlap.",
        "url": "https://publiclab.org/colormaps#stretched",
        "colormapRanges": [[0, [0, 0, 255], [0, 0, 255]], [0.1, [0, 0, 255], [38, 195, 195]], [0.5, [0, 150, 0], [255, 255, 0]], [0.7, [255, 255, 0], [255, 50, 50]], [0.9, [255, 50, 50], [255, 50, 50]]]
      },
      "bluwhtgrngis": {
        "author": "MaggPi",
        "description": "A colormap from blue to white to green to....",
        "url": "https://publiclab.org/colormaps#bluwhtgrngis",
        "colormapRanges": [[0, [6, 23, 86], [6, 25, 84]], [0.0625, [6, 25, 84], [6, 25, 84]], [0.125, [6, 25, 84], [6, 25, 84]], [0.1875, [6, 25, 84], [6, 25, 84]], [0.25, [6, 25, 84], [6, 25, 84]], [0.3125, [6, 25, 84], [9, 24, 84]], [0.3438, [9, 24, 84], [119, 120, 162]], [0.375, [119, 129, 162], [249, 250, 251]], [0.406, [249, 250, 251], [255, 255, 255]], [0.4375, [255, 255, 255], [255, 255, 255]], [0.50, [255, 255, 255], [214, 205, 191]], [0.52, [214, 205, 191], [178, 175, 96]], [0.5625, [178, 175, 96], [151, 176, 53]], [0.593, [151, 176, 53], [146, 188, 12]], [0.625, [146, 188, 12], [96, 161, 1]], [0.6875, [96, 161, 1], [30, 127, 3]], [0.75, [30, 127, 3], [0, 99, 1]], [0.8125, [0, 99, 1], [0, 74, 1]], [0.875, [0, 74, 1], [0, 52, 0]], [0.9375, [0, 52, 0], [0, 34, 0]], [0.968, [0, 34, 0], [68, 70, 67]]]
      },
      "brntogrn": {
        "author": "MaggPi",
        "description": "A colormap from brown to green.",
        "url": "https://publiclab.org/colormaps#brntogrn",
        "colormapRanges": [[0, [110, 12, 3], [118, 6, 1]], [0.0625, [118, 6, 1], [141, 19, 6]], [0.125, [141, 19, 6], [165, 35, 13]], [0.1875, [165, 35, 13], [177, 59, 25]], [0.2188, [177, 59, 25], [192, 91, 36]], [0.25, [192, 91, 36], [214, 145, 76]], [0.3125, [214, 145, 76], [230, 183, 134]], [0.375, [230, 183, 134], [243, 224, 194]], [0.4375, [243, 224, 194], [250, 252, 229]], [0.50, [250, 252, 229], [217, 235, 185]], [0.5625, [217, 235, 185], [184, 218, 143]], [0.625, [184, 218, 143], [141, 202, 89]], [0.6875, [141, 202, 89], [80, 176, 61]], [0.75, [80, 176, 61], [0, 147, 32]], [0.8125, [0, 147, 32], [1, 122, 22]], [0.875, [1, 122, 22], [0, 114, 19]], [0.90, [0, 114, 19], [0, 105, 18]], [0.9375, [0, 105, 18], [7, 70, 14]]]
      },
      "blutoredjet": {
        "author": "MaggPi",
        "description": "A colormap from blue to red.",
        "url": "https://publiclab.org/colormaps#blutoredjet",
        "colormapRanges": [[0, [0, 0, 140], [1, 1, 186]], [0.0625, [1, 1, 186], [0, 1, 248]], [0.125, [0, 1, 248], [0, 70, 254]], [0.1875, [0, 70, 254], [0, 130, 255]], [0.25, [0, 130, 255], [2, 160, 255]], [0.2813, [2, 160, 255], [0, 187, 255]], [0.3125, [0, 187, 255], [6, 250, 255]], [0.348, [0, 218, 255], [8, 252, 251]], [0.375, [8, 252, 251], [27, 254, 228]], [0.406, [27, 254, 228], [70, 255, 187]], [0.4375, [70, 255, 187], [104, 254, 151]], [0.47, [104, 254, 151], [132, 255, 19]], [0.50, [132, 255, 19], [195, 255, 60]], [0.5625, [195, 255, 60], [231, 254, 25]], [0.5976, [231, 254, 25], [253, 246, 1]], [0.625, [253, 246, 1], [252, 210, 1]], [0.657, [252, 210, 1], [255, 183, 0]], [0.6875, [255, 183, 0], [255, 125, 2]], [0.75, [255, 125, 2], [255, 65, 1]], [0.8125, [255, 65, 1], [247, 1, 1]], [0.875, [247, 1, 1], [200, 1, 3]], [0.9375, [200, 1, 3], [122, 3, 2]]]
      },
      "colors16": {
        "author": "publiclab",
        "description": "A segmented colormap of the full color spectrum, divided into 16 colors.",
        "url": "https://publiclab.org/colormaps#colors16",
        "colormapRanges": [[0, [0, 0, 0], [0, 0, 0]], [0.0625, [3, 1, 172], [3, 1, 172]], [0.125, [3, 1, 222], [3, 1, 222]], [0.1875, [0, 111, 255], [0, 111, 255]], [0.25, [3, 172, 255], [3, 172, 255]], [0.3125, [1, 226, 255], [1, 226, 255]], [0.375, [2, 255, 0], [2, 255, 0]], [0.4375, [198, 254, 0], [190, 254, 0]], [0.50, [252, 255, 0], [252, 255, 0]], [0.5625, [255, 223, 3], [255, 223, 3]], [0.625, [255, 143, 3], [255, 143, 3]], [0.6875, [255, 95, 3], [255, 95, 3]], [0.75, [242, 0, 1], [242, 0, 1]], [0.8125, [245, 0, 170], [245, 0, 170]], [0.875, [223, 180, 225], [223, 180, 225]], [0.9375, [255, 255, 255], [255, 255, 255]]]
      },
      "fastie": {
        "author": "cfastie",
        "description": "A colormap for highlighting NDVI values over 0 on a scale from -1 to 1; in this scale, values from 0-0.5 are greyscale, while those over 0.5 are color.",
        "url": "https://publiclab.org/colormaps#fastie",
        "colormapRanges": [[0, [255, 255, 255], [0, 0, 0]], [0.167, [0, 0, 0], [255, 255, 255]], [0.33, [255, 255, 255], [0, 0, 0]], [0.5, [0, 0, 0], [140, 140, 255]], [0.55, [140, 140, 255], [0, 255, 0]], [0.63, [0, 255, 0], [255, 255, 0]], [0.75, [255, 255, 0], [255, 0, 0]], [0.95, [255, 0, 0], [255, 0, 255]]]
      }
    };
  }, {}],
  5: [function (require, module, exports) {
    // This file was adapted from infragram-js:
    // http://github.com/p-v-o-s/infragram-js.
    module.exports = function Colormaps(options) {
      // see https://github.com/publiclab/image-sequencer/tree/main/src/modules/Colormap/
      var colormapFunctionGenerator = require('./colormapFunctionGenerator.js');

      var colormaps = require('./colormaps.json');

      Object.keys(colormaps).forEach(function (key) {
        // make a function from the colormap, which we can't easily do in JSON
        colormaps[key].fn = colormapFunctionGenerator(colormaps[key].colormapRanges);
      });

      var JsImage = require('../util/JsImage.js');

      function colorify(jsImage, colormap) {
        var b, data, g, i, j, l, n, r, ref;
        $('#btn-colorize').addClass('active');
        n = jsImage.width * jsImage.height;
        data = new Uint8ClampedArray(4 * n);
        j = 0;

        for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
          var _colormap = colormap(jsImage.data[i]);

          var _colormap2 = _slicedToArray(_colormap, 3);

          r = _colormap2[0];
          g = _colormap2[1];
          b = _colormap2[2];
          data[j++] = r;
          data[j++] = g;
          data[j++] = b;
          data[j++] = 255;
        }

        return new JsImage(data, jsImage.width, jsImage.height, 4);
      }

      return {
        colorify: colorify,
        colormap1: colormaps['default'].fn,
        colormap2: colormaps['stretched'].fn,
        greyscale_colormap: colormaps['greyscale'].fn,
        segmented_colormap: colormapFunctionGenerator
      };
    };
  }, {
    "../util/JsImage.js": 19,
    "./colormapFunctionGenerator.js": 3,
    "./colormaps.json": 4
  }],
  6: [function (require, module, exports) {
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
    };
  }, {}],
  7: [function (require, module, exports) {
    // Generated by CoffeeScript 2.1.0
    // This file was adapted from infragram-js:
    // http://github.com/p-v-o-s/infragram-js.
    module.exports = window.FileUpload = {
      socket: null,
      file: null,
      serverFilename: "",
      isLoadedFromFile: function isLoadedFromFile() {
        if (FileUpload.file) {
          return true;
        } else {
          return false;
        }
      },
      getFilename: function getFilename() {
        return FileUpload.serverFilename;
      },
      setFilename: function setFilename(name) {
        return FileUpload.serverFilename = name;
      },
      uploadThumbnail: function uploadThumbnail(src, callback) {
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
      fromFile: function fromFile(files, callback, upload) {
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
      duplicate: function duplicate(callback) {
        callback = callback.toString();
        return FileUpload.socket.emit("duplicate_start", {
          "name": FileUpload.serverFilename,
          "callback": callback
        });
      },
      fromBase64: function fromBase64(name, data, callback) {
        callback = callback.toString();
        return FileUpload.socket.emit("base64_start", {
          "name": name,
          "data": data,
          "callback": callback
        });
      },
      initialize: function initialize(options) {
        options = options || {};
        options.rememberTransport = options.rememberTransport || false;
        options.transports = options.transports || ['websocket', 'AJAX long-polling'];

        if (options.socket) {
          FileUpload.socket = io.connect(window.location.protocol + "//" + window.location.host, options);
          FileUpload.socket.on("image_request", function (data) {
            var file, newFile, txt;
            file = FileUpload.file;
            txt = $("#save-modal-btn").html().split(/\s-\s/g)[0];
            txt += " - " + Math.round(file.uploaded / file.size * 100) + "%";
            $("#save-modal-btn").html(txt);
            newFile = file.slice(file.uploaded, file.uploaded + Math.min(data["chunk"], file.size - file.uploaded));
            FileUpload.file.uploaded += data["chunk"];
            FileUpload.serverFilename = data["name"];
            return file.reader.readAsDataURL(newFile);
          });
          FileUpload.socket.on("image_done", function (data) {
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
          FileUpload.socket.on("base64_done", function (data) {
            FileUpload.serverFilename = data["name"];
            eval("var callback=" + data["callback"]);
            return callback();
          });
          FileUpload.socket.on("duplicate_done", function (data) {
            if (data["error"]) {
              return alert(data["error"]);
            } else {
              FileUpload.serverFilename = data["name"];
              eval("var callback=" + data["callback"]);
              return callback();
            }
          });
          FileUpload.socket.on("thumbnail_done", function (data) {
            eval("var callback=" + data["callback"]);
            return callback();
          });
        }
      }
    };
  }, {}],
  8: [function (require, module, exports) {
    // This file was adapted from infragram-js:
    // http://github.com/p-v-o-s/infragram-js.
    module.exports = function Camera(options) {
      var canvas, ctx; // Initialize getUserMedia with options

      function initialize() {
        getUserMedia(webRtcOptions, success, deviceError); // iOS Safari 11 compatibility: https://github.com/webrtc/adapter/issues/685

        webRtcOptions.videoEl.setAttribute('autoplay', 'autoplay');
        webRtcOptions.videoEl.setAttribute('playsinline', 'playsinline');
        window.webcam = webRtcOptions; // this is weird but maybe used for flash fallback?

        canvas = options.canvas || document.getElementById("image");
        ctx = canvas.getContext("2d"); // Trigger a snapshot w/ button
        // -- move this to interface.js?

        $("#snapshot").show();
        $("#live-video").show();
        $("#webcam").show();
      } // webRtcOptions contains the configuration information for the shim
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
        debug: function debug() {},
        // callback for capturing the fallback stream
        onCapture: function onWebRtcCapture() {
          return window.webcam.save();
        },
        // callback for saving the stream, useful for
        // relaying data further.
        onSave: onSaveGetUserMedia,
        onLoad: function onLoadGetUserMedia() {}
      };

      function onSaveGetUserMedia(data) {
        var col,
            h,
            i,
            img,
            j,
            ref,
            tmp,
            w,
            pos = 0;
        col = data.split("");
        img = camera.image;
        tmp = null;
        w = webRtcOptions.width;
        h = webRtcOptions.height;

        for (i = j = 0, ref = w - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
          tmp = parseInt(col[i], 10);
          img.data[pos + 0] = tmp >> 16 & 0xff;
          img.data[pos + 1] = tmp >> 8 & 0xff;
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
        var video;

        if (webRtcOptions.context === "webrtc") {
          video = webRtcOptions.videoEl;

          if (navigator.mozGetUserMedia) {
            video.mozSrcObject = stream;
            console.log("mozilla???");
          } else {
            video.srcObject = stream;
          }

          return video.onerror = function (e) {
            return stream.stop();
          };
        } else {}
      }

      function deviceError(error) {
        alert("No camera available.");
        console.log(error);
        return console.error("An error occurred: [CODE " + error.code + "]");
      } // not doing anything now... for copying to a 2nd canvas


      function getSnapshot() {
        var video; // If the current context is WebRTC/getUserMedia (something
        // passed back from the shim to avoid doing further feature
        // detection), we handle getting video/images for our canvas 
        // from our HTML5 <video> element.

        if (webRtcOptions.context === "webrtc") {
          video = document.getElementsByTagName("video")[0];
          options.processor.updateImage(video);
          return $("#webcam").hide(); // Otherwise, if the context is Flash, we ask the shim to
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
      };
    };
  }, {}],
  9: [function (require, module, exports) {
    // This file was adapted from infragram-js:
    // http://github.com/p-v-o-s/infragram-js.
    module.exports = function File(options, processor) {
      function downloadImage() {
        var event, format, lnk; // create an "off-screen" anchor tag

        lnk = document.createElement("a"); // the key here is to set the download attribute of the a tag

        lnk.href = processor.getCurrentImage();

        if (lnk.href.match('image/jpeg')) {
          format = "jpg";
        } else {
          format = "png";
        }

        lnk.download = new Date().toISOString().replace(/:/g, "_") + "." + format; // create a "fake" click-event to trigger the download

        if (document.createEvent) {
          event = document.createEvent("MouseEvents");
          event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          lnk.dispatchEvent(event);
        } else if (lnk.fireEvent) {
          lnk.fireEvent("onclick");
        }

        return true;
      } // from a local URL (remote may be against js security rules)


      function fetchImage(src, mode) {
        var img;
        $("#save-modal-btn").show();
        $("#save-zone").show();
        img = new Image();

        if (options.uploader) {
          img.onload = function () {
            var filename;
            filename = src.split('/');
            filename = filename[filename.length - 1];
            FileUpload.setFilename(filename);

            if (mode) {
              if (mode.substring(0, 5) === "infra") {
                $("#modeSwitcher").val(mode).change();
              } else {
                $("button#" + mode).button("toggle");
                $("button#" + mode).click(); // this should be via a direct call, not a click; the show.jade page should not require buttons!
              }
            }

            options.save_infragrammar_expressions(params);

            if (mode === "ndvi") {
              options.save_infragrammar_expressions({
                'm': '(R-B)/(R+B)'
              });
              mode = "infragrammar_mono";
            } else if (mode === "nir") {
              options.save_infragrammar_expressions({
                'm': 'R'
              });
              mode = "infragrammar_mono";
            } else if (mode === "raw") {
              options.save_infragrammar_expressions({
                'r': 'R',
                'g': 'G',
                'b': 'B'
              });
              mode = "infragrammar";
            }

            processor.updateImage(this);

            if (params['color'] === "true" || params['c'] === "true") {
              options.colorized = true; // before run_infrag, so it gets logged
            }

            run_infragrammar(mode); // this sets colorized to false!

            if (params['color'] === "true" || params['c'] === "true") {
              options.colorized = true; // again, so it gets run 
            }

            if (options.colorized) {
              $("button#color").button("toggle");
              return run_colorize();
            }
          };
        }

        return img.src = src;
      }

      return {
        fetchImage: fetchImage,
        downloadImage: downloadImage
      };
    };
  }, {}],
  10: [function (require, module, exports) {
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
      };
    };
  }, {}],
  11: [function (require, module, exports) {
    // This file was adapted from infragram-js:
    // http://github.com/p-v-o-s/infragram-js.
    // not currently being used -- will replace with Image Sequencer perhaps?
    // https://github.com/publiclab/image-sequencer
    module.exports = function javascriptProcessor() {
      var b_exp = "",
          g_exp = "",
          get_channels,
          Colormaps = require('../color/colormaps')(JsImage),
          colormap = Colormaps.colormap1,
          converters = require('../color/converters'),
          image = null,
          mode = "raw",
          ndvi,
          r_exp = "",
          set_mode,
          update_colorbar;

      var JsImage = require('../util/JsImage.js');

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
      } // replace with infragrammar expression


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
        render(Colormaps.colorify(infragrammar_mono(imageData), function (x) {
          return colormap((x + 1) / 2);
        }));
        return true;
      }

      update_colorbar = function update_colorbar(min, max) {
        var b, ctx, d, e, g, i, j, k, l, m, r, ref, ref1;
        $('#colorbar-container')[0].style.display = 'inline-block';
        e = $('#colorbar')[0];
        ctx = e.getContext("2d");
        d = ctx.getImageData(0, 0, e.width, e.height);

        for (i = l = 0, ref = e.width; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
          for (j = m = 0, ref1 = e.height; 0 <= ref1 ? m < ref1 : m > ref1; j = 0 <= ref1 ? ++m : --m) {
            var _colormap3 = colormap(i / e.width);

            var _colormap4 = _slicedToArray(_colormap3, 3);

            r = _colormap4[0];
            g = _colormap4[1];
            b = _colormap4[2];
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
      };

      function update(image) {
        var b, g, max, min, ndvi_jsImg, normalize, r, resultJsImage;
        $('#colorbar-container')[0].style.display = 'none';

        if (mode === "ndvi") {
          var _normalize = function _normalize(x) {
            return (x - min) / (max - min);
          };

          var _get_channels = get_channels(image);

          var _get_channels2 = _slicedToArray(_get_channels, 3);

          r = _get_channels2[0];
          g = _get_channels2[1];
          b = _get_channels2[2];
          ndvi_jsImg = ndvi(r, b); // this isn't correct for NDVI; we want values from -1 to 1:
          // [[min],[max]] = ndvi_img.extrema()

          min = -1;
          max = 1;
          ;
          resultJsImage = Colormaps.colorify(ndvi_jsImg, function (x) {
            return colormap(_normalize(x));
          });
          update_colorbar(min, max);
        } else if (mode === "raw") {
          resultJsImage = new JsImage(image.data, image.width, image.height, 4);
        } else if (mode === "nir") {
          var _get_channels3 = get_channels(image);

          var _get_channels4 = _slicedToArray(_get_channels3, 3);

          r = _get_channels4[0];
          g = _get_channels4[1];
          b = _get_channels4[2];
          resultJsImage = Colormaps.colorify(r, function (x) {
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
      }

      ;

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
        var ctx = $('#image')[0].getContext("2d"); // risks being circular def of width/height

        var width = $('#image').width();
        var height = $('#image').height(); // this now just defaults to file-scoped 'image' which we want to avoid

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
          // TODO: move this into interface code:
          return $("#colormaps-group")[0].style.display = "inline-block";
        } else {
          if ($("#colormaps-group").length > 0) {
            return $("#colormaps-group")[0].style.display = "none";
          }
        }
      } // img should be a native JavaScript image obj


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
        colorize: colorize,
        initialize: function initialize() {}
      };
    };
  }, {
    "../color/colormaps": 5,
    "../color/converters": 6,
    "../util/JsImage.js": 19
  }],
  12: [function (require, module, exports) {
    // Generated by CoffeeScript 2.1.0
    // This file was adapted from infragram-js:
    // http://github.com/p-v-o-s/infragram-js.
    module.exports = function webglProcessor(options) {
      var imgContext = null,
          mapContext = null,
          inputImage,
          // the pre-processed image
      vertices = [-1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0],
          waitForShadersToLoad = 0,
          webglUtils = require('../util/webgl-utils')(),
          colorized = false,
          // TODO: we should refactor this to use colormaps in /src/color/;
      // we could build the dist/shader.frag file automatically around these
      // using the function now at /src/color/colormapFunctionGenerator.js
      // ... we need to either use integer indices for colormap, 
      // OR switch the system to strings and use the colormap names
      colormaps = {
        default: 0,
        stretched: 2,
        grey: 1
      },
          colormap = colormaps.default;

      vertices.itemSize = 2;

      function initialize(options) {
        console.log(options, 'webgl');
        options = options || {};
        options.shaderVertPath = options.shaderVertPath || "dist/shader.vert";
        options.shaderFragPath = options.shaderFragPath || "dist/shader.frag";
        imgContext = createContext("raw", 1, 0, 1.0, "image");
        mapContext = createContext("raw", 1, 1, 1.0, "colorbar");
        decolorize();
        waitForShadersToLoad = 2;
        $("#shader-vs").load(options.shaderVertPath, glShaderLoaded);
        $("#shader-fs-template").load(options.shaderFragPath, glShaderLoaded);

        if (imgContext && mapContext) {
          return true;
        } else {
          return false;
        }
      }

      ;

      function colorize(val) {
        if (val === "hsv") run('hsv');else {
          val = val || colormap;
          colormap = val;
          console.log('colorize:' + val);
          if (typeof val === 'string') val = colormaps[val];
          imgContext.selColormap = mapContext.selColormap = val;
          colorized = true;
        }
      }

      function decolorize() {
        colorized = false;
      }

      function createBuffer(ctx, data) {
        var buffer, gl;
        gl = ctx.gl;
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        buffer.itemSize = data.itemSize;
        return buffer;
      }

      ;

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
      }

      ;

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
        ctx.canvas.addEventListener("webglcontextlost", function (event) {
          return event.preventDefault();
        }, false);
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
      }

      ;

      function drawScene(ctx, returnImage) {
        var gl, pColormap, pHsvUniform, pColorizedUniform, pSampler, pSelColormapUniform, pSliderUniform, pVertexPosition;

        if (!returnImage) {
          window.requestAnimationFrame(function () {
            return drawScene(ctx, false);
          });
        }

        if (ctx.updateShader) {
          ctx.updateShader = false;
          ctx.shaderProgram = generateShader(ctx);
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
        pColorizedUniform = gl.getUniformLocation(ctx.shaderProgram, "uColorized");
        gl.uniform1i(pColorizedUniform, colorized || ctx.colormap ? 1 : 0);
        pSelColormapUniform = gl.getUniformLocation(ctx.shaderProgram, "uSelectColormap");
        gl.uniform1i(pSelColormapUniform, ctx.selColormap);
        pHsvUniform = gl.getUniformLocation(ctx.shaderProgram, "uHsv");
        gl.uniform1i(pHsvUniform, ctx.mode === "hsv" ? 1 : 0);
        pColormap = gl.getUniformLocation(ctx.shaderProgram, "uColormap");
        gl.uniform1i(pColormap, ctx.colormap ? 1 : 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / vertices.itemSize);
        if (returnImage) return ctx.canvas.toDataURL("image/jpeg");
      }

      ;

      function generateShader(ctx) {
        var b, code, g, r;

        var _ctx$expression = _slicedToArray(ctx.expression, 3);

        r = _ctx$expression[0];
        g = _ctx$expression[1];
        b = _ctx$expression[2];
        // Map HSV to shader variable names
        r = r.toLowerCase().replace(/h/g, "r").replace(/s/g, "g").replace(/v/g, "b");
        g = g.toLowerCase().replace(/h/g, "r").replace(/s/g, "g").replace(/v/g, "b");
        b = b.toLowerCase().replace(/h/g, "r").replace(/s/g, "g").replace(/v/g, "b"); // Sanitize strings

        r = r.replace(/[^xrgb\/\-\+\*\(\)\.0-9]*/g, "");
        g = g.replace(/[^xrgb\/\-\+\*\(\)\.0-9]*/g, "");
        b = b.replace(/[^xrgb\/\-\+\*\(\)\.0-9]*/g, ""); // Convert int to float if no decimals are present

        if (!r.includes('.')) r = r.replace(/([0-9])([^\.])?/g, "$1.0$2");
        if (!g.includes('.')) g = g.replace(/([0-9])([^\.])?/g, "$1.0$2");
        if (!b.includes('.')) b = b.replace(/([0-9])([^\.])?/g, "$1.0$2"); // adjust NDVI range

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
        return webglUtils.createProgramFromScripts(ctx.gl, ["shader-vs", "shader-fs"]);
      }

      ;

      function setMode(ctx, newMode) {
        if (ctx.mode != newMode) ctx.updateShader = true;
        ctx.mode = newMode;
      }

      ;

      function glShaderLoaded() {
        waitForShadersToLoad -= 1;

        if (!waitForShadersToLoad) {
          drawScene(imgContext);
          return drawScene(mapContext);
        }
      }

      ;

      function glRestoreContext() {
        var imageData;
        imageData = imgContext.imageData;
        imgContext = createContext(imgContext.mode, imgContext.selColormap, imgContext.colormap, imgContext.slider, "image");
        mapContext = createContext(mapContext.mode, mapContext.selColormap, mapContext.colormap, mapContext.slider, "colorbar");

        if (imgContext && mapContext) {
          return updateImage(imageData);
        }
      }

      ;

      function updateImage(img) {
        var gl;
        gl = imgContext.gl;
        inputImage = img;
        imgContext.imageData = img;
        gl.activeTexture(gl.TEXTURE0);
        return gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      }

      ;

      function getInputImage() {
        function imageToBase64(img) {
          var canvas = document.createElement('CANVAS');
          var ctx = canvas.getContext('2d');
          canvas.height = img.height;
          canvas.width = img.width;
          ctx.drawImage(img, 0, 0);
          var dataURL = canvas.toDataURL('image/png|gif|jpg');
          canvas = null;
          return dataURL;
        }

        return imageToBase64(inputImage);
      }

      ;

      function getCurrentImage() {
        return drawScene(imgContext, true);
      }

      ;

      function getImageData() {
        return imgContext.imageData;
      }

      ;

      function saveExpression(a, b, c) {
        return imgContext.expression = [a, b, c];
      }

      ;

      function run(mode) {
        return setMode(imgContext, mode);
      }

      ;
      initialize(options);
      return {
        type: 'webgl',
        initialize: initialize,
        getInputImage: getInputImage,
        getCurrentImage: getCurrentImage,
        getImageData: getImageData,
        run: run,
        save_expressions: saveExpression,
        setMode: setMode,
        updateImage: updateImage,
        decolorize: decolorize,
        colorize: colorize,
        context: imgContext
      };
    };
  }, {
    "../util/webgl-utils": 20
  }],
  13: [function (require, module, exports) {
    module.exports = function Analysis(options, save_infragrammar_inputs) {
      // buttons to run Analysis steps
      $("#infragrammar_hsv").submit(function () {
        console.log('hsv mode');
        options.mode = "infragrammar_hsv";
        options.logger.log_hsv();
        save_infragrammar_inputs();
        options.run(options.mode);
        options.run();
        return true;
      });
      $("#infragrammar").submit(function () {
        console.log('infragrammar mode');
        options.mode = "infragrammar";
        options.logger.log_rgb();
        save_infragrammar_inputs();
        options.run(options.mode);
        options.run();
        return true;
      });
      $("#infragrammar_mono").submit(function () {
        console.log('infragrammar mono mode');
        options.mode = "infragrammar_mono";
        options.logger.log_mono();
        save_infragrammar_inputs();
        options.run(options.mode);
        options.run();
        return true;
      });
    };
  }, {}],
  14: [function (require, module, exports) {
    module.exports = function Colorize(options) {
      $(".btn-colorize").click(function () {
        if (options.colorized) {
          decolorize();
          options.run(options.mode);
          return options.processor.decolorize();
        } else {
          colorize();
          options.run(options.mode);
          return options.colorize();
        }
      });
      $("#default_colormap").click(function () {
        console.log('default colormap');
        colorize();
        options.colorize('default');
        options.run(options.mode);
        return $("#btn-colorize").addClass("active");
      });
      $("#stretched_colormap").click(function () {
        console.log('stretched colormap');
        colorize();
        options.colorize('stretched');
        options.run(options.mode);
        return $("#btn-colorize").addClass("active");
      }); // duplicated in presets.js

      function colorize() {
        console.log('colorized on');
        options.colorized = true;
        $("#btn-colorize").addClass("active");
        $("#colorbar-container").css('display', 'inline-block');
        $("#colormaps-group").css('display', 'inline-block');
      }

      function decolorize() {
        console.log('colorized off');
        options.colorized = false;
        $("#btn-colorize").removeClass("active");
        $("#colorbar-container").css('display', 'none');
        $("#colormaps-group").css('display', 'none');
      }
    };
  }, {}],
  15: [function (require, module, exports) {
    module.exports = function Fullscreen(options) {
      var fullscreen = false;
      $(".fullscreen").click(function () {
        if (fullscreen) {
          $("#image").css("display", "inline");
          $("#image").css("position", "relative");
          $("#image").css("height", "auto");
          $("#image").css("left", 0);
          $("#backdrop").hide();
          $(".btn.fullscreen").show();
          fullscreen = false;
        } else {
          $("#image").css("display", "block");
          $("#image").css("height", "100%");
          $("#image").css("width", "auto");
          $("#image").css("position", "absolute");
          $("#image").css("top", "0px");
          $("#image").css("left", parseInt((window.innerWidth - $("#image").width()) / 2) + "px");
          $("#image").css("z-index", "2");
          $("#backdrop").show();
          $(".btn.fullscreen").hide();
          fullscreen = true;
        }

        return fullscreen;
      });
    };
  }, {}],
  16: [function (require, module, exports) {
    module.exports = function Interface(options) {
      options.imageSelector = options.imageSelector || "#image-container";
      options.fileSelector = options.fileSelector || "#file-sel";

      var urlHash = require('urlhash')();

      var FileUpload = require('../file-upload');

      var logger = options.logger;

      var Colormaps = require('../color/colormaps');

      var Fullscreen, Presets, Analysis, Colorize, Saving; // saving inputs/expressions:

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
        console.log(args);

        if (options.mode === "infragrammar") {
          options.processor.save_expressions(args['r'], args['g'], args['b']);
        } else if (options.mode === "infragrammar_mono") {
          options.processor.save_expressions(args['m'], args['m'], args['m']);
        } else if (options.mode === "infragrammar_hsv") {
          return options.processor.save_expressions_hsv(args['h'], args['s'], args['v']);
        }
      }

      $(document).ready(function () {
        Fullscreen = require('./fullscreen')(options);
        Presets = require('../ui/presets')(options, save_infragrammar_inputs);
        Analysis = require('../ui/analysis')(options, save_infragrammar_inputs);
        Colorize = require('../ui/colorize')(options);
        Saving = require('../ui/saving')(options);
        if (options.uploadable) FileUpload.initialize({
          socket: options.uploadable
        });
        $(options.imageSelector).ready(function () {
          var src,
              idNameMap = {
            "#m_exp": "m",
            "#r_exp": "r",
            "#g_exp": "g",
            "#b_exp": "b",
            "#h_exp": "h",
            "#s_exp": "s",
            "#v_exp": "v"
          };
          $("#overlay-slider").val(localStorage.getItem("overlaySize")); // TODO: broken:  
          //urlHash.setUrlHashParameter(JSON.stringify(idNameMap));

          src = urlHash.getUrlHashParameter('src');

          if (src) {
            params = parametersObject(location.search.split('?')[1]);
            options.mode = params['mode'];
            fetch_image(src);
          }

          return true;
        });
        $(options.fileSelector).change(function () {
          $('.choose-prompt').hide();
          $("#save-modal-btn").show();
          $("#save-zone").show();
          FileUpload.fromFile(this.files, options.processor.updateImage, options.uploadable);
          $('#preset-modal').modal('show');
          return true;
        });
        $("#webcam-activate").click(function () {
          $('.choose-prompt').hide();
          $("#save-modal-btn").show();
          $("#save-zone").show();
          save_infragrammar_inputs();
          options.video();
          $('#preset-modal').modal('show');
          return true;
        });
        $("#snapshot").click(function () {
          options.camera.getSnapshot();
          return true;
        });
        $("#modeSwitcher").change(function () {
          $("#infragrammar, #infragrammar_mono, #infragrammar_hsv").hide();
          $("#" + $("#modeSwitcher").val()).css("display", "inline");
          return true;
        });
        $("#overlay-btn").click(function () {
          $("#overlay-container").toggle();
          $("#overlay-btn").toggleClass("btn-success");
        });
        $("#overlay-slider").on("input", function () {
          $("#overlay-img").width($("#overlay-slider").val() * 8);
        });
        $("#overlay-save-btn").click(function () {
          localStorage.setItem("overlaySize", $("#overlay-slider").val());
          $("#overlay-save-info").show().delay(2000).fadeOut();
        });
        $("[rel=tooltip]").tooltip();
        $("[rel=popover]").popover();
        return true;
      });
    };
  }, {
    "../color/colormaps": 5,
    "../file-upload": 7,
    "../ui/analysis": 13,
    "../ui/colorize": 14,
    "../ui/presets": 17,
    "../ui/saving": 18,
    "./fullscreen": 15,
    "urlhash": 1
  }],
  17: [function (require, module, exports) {
    module.exports = function Presets(options, save_infragrammar_inputs) {
      // preset button
      $("#preset_raw").click(function () {
        $('#modeSwitcher').val("infragrammar").change();
        $('#r_exp').val("R");
        $('#g_exp').val("G");
        $('#b_exp').val("B");
        $('#preset-modal').modal('hide');
        options.colorized = false;
        options.processor.decolorize();
        save_infragrammar_inputs();
        decolorize();
        return options.run(options.mode);
      }); // preset button

      $("#preset_ndvi_blue").click(function () {
        $('#modeSwitcher').val("infragrammar_mono").change();
        $('#m_exp').val("(R-B)/(R+B)");
        $('#preset-modal').modal('hide');
        options.colorized = false;
        options.processor.decolorize();
        save_infragrammar_inputs();
        decolorize();
        return options.run(options.mode);
      }); // preset button

      $("#preset_ndvi_blue_color").click(function () {
        $('#modeSwitcher').val("infragrammar_mono").change();
        $('#m_exp').val("(R-B)/(R+B)");
        $('#preset-modal').modal('hide');
        save_infragrammar_inputs();
        options.colorized = true;
        options.run(options.mode);
        options.colorize();
        colorize();
        return options.run();
      }); // preset button

      $("#preset_ndvi_red").click(function () {
        $('#modeSwitcher').val("infragrammar_mono").change();
        $('#m_exp').val("(B-R)/(B+R)");
        $('#preset-modal').modal('hide');
        options.colorized = false;
        options.processor.decolorize();
        save_infragrammar_inputs();
        decolorize();
        return options.run(options.mode);
      }); // preset button

      $("#preset_ndvi_red_color").click(function () {
        $('#modeSwitcher').val("infragrammar_mono").change();
        $('#m_exp').val("(B-R)/(B+R)");
        $('#preset-modal').modal('hide');
        save_infragrammar_inputs();
        colorize();
        options.run(options.mode);
        options.colorize();
        return options.run();
      });

      function colorize() {
        console.log('colorized on');
        options.colorized = true;
        $("#btn-colorize").addClass("active");
        $("#colorbar-container").css('display', 'inline-block');
        $("#colormaps-group").css('display', 'inline-block');
      }

      function decolorize() {
        console.log('colorized off');
        options.colorized = false;
        $("#btn-colorize").removeClass("active");
        $("#colorbar-container").css('display', 'none');
        $("#colormaps-group").css('display', 'none');
      }
    };
  }, {}],
  18: [function (require, module, exports) {
    module.exports = function Saving(options) {
      // This is all unused...
      $("#download").click(function () {
        downloadImage();
        return true;
      }); // refactor this, it's a mess:

      $("#save").click(saveImage);

      function saveImage() {
        var img;

        function sendThumbnail() {
          img = options.processor.getCurrentImage();
          return FileUpload.uploadThumbnail(img, function () {
            $("#form-filename").val(FileUpload.getFilename());
            $("#form-log").val(JSON.stringify(logger.log));
            return $("#save-form").submit();
          });
        }

        ;
        $("#save").prop("disabled", true);
        $("#save").html("Saving...");

        if (FileUpload.getFilename() === "") {
          img = options.processor.getCurrentImage();
          FileUpload.fromBase64("camera", img, sendThumbnail);
        } else if (FileUpload.isLoadedFromFile() === false) {
          FileUpload.duplicate(sendThumbnail);
        } else {
          sendThumbnail();
        }

        return img;
      }

      return {
        saveImage: saveImage
      };
    };
  }, {}],
  19: [function (require, module, exports) {
    module.exports = function () {
      function JsImage(data1, width1, height1, channels) {
        _classCallCheck(this, JsImage);

        this.data = data1;
        this.width = width1;
        this.height = height1;
        this.channels = channels;
      }

      _createClass(JsImage, [{
        key: "copyToImageData",
        value: function copyToImageData(imgData) {
          return imgData.data.set(this.data);
        }
      }, {
        key: "extrema",
        value: function extrema() {
          var c, i, j, l, m, maxs, mins, n, ref, ref1;
          n = this.width * this.height;

          mins = function () {
            var l, ref, results;
            results = [];

            for (i = l = 0, ref = this.channels; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
              results.push(this.data[i]);
            }

            return results;
          }.call(this);

          maxs = function () {
            var l, ref, results;
            results = [];

            for (i = l = 0, ref = this.channels; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
              results.push(this.data[i]);
            }

            return results;
          }.call(this);

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
      }]);

      return JsImage;
    }();
  }, {}],
  20: [function (require, module, exports) {
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

      var log = function log(msg) {
        if (window.console && window.console.log) {
          window.console.log(msg);
        }
      };
      /**
       * Wrapped logging function.
       * @param {string} msg The message to log.
       */


      var error = function error(msg) {
        if (window.console) {
          if (window.console.error) {
            window.console.error(msg);
          } else if (window.console.log) {
            window.console.log(msg);
          }
        }
      };
      /**
       * Turn off all logging.
       */


      var loggingOff = function loggingOff() {
        log = function log() {};

        error = function error() {};
      };
      /**
       * Check if the page is embedded.
       * @return {boolean} True of we are in an iframe
       */


      var isInIFrame = function isInIFrame() {
        return window != window.top;
      };
      /**
       * Converts a WebGL enum to a string
       * @param {!WebGLContext} gl The WebGLContext to use.
       * @param {number} value The enum value.
       * @return {string} The enum as a string.
       */


      var glEnumToString = function glEnumToString(gl, value) {
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


      var makeFailHTML = function makeFailHTML(msg) {
        return '' + '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' + '<td align="center">' + '<div style="display: table-cell; vertical-align: middle;">' + '<div style="">' + msg + '</div>' + '</div>' + '</td></tr></table>';
      };
      /**
       * Mesasge for getting a webgl browser
       * @type {string}
       */


      var GET_A_WEBGL_BROWSER = '' + 'This page requires a browser that supports WebGL.<br/>' + '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';
      /**
       * Mesasge for need better hardware
       * @type {string}
       */

      var OTHER_PROBLEM = '' + "It doesn't appear your computer can support WebGL.<br/>" + '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';
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

      var setupWebGL = function setupWebGL(canvas, opt_attribs) {
        function showLink(str) {
          var container = canvas.parentNode;

          if (container) {
            container.innerHTML = makeFailHTML(str);
          }
        }

        ;

        if (!window.WebGLRenderingContext) {
          //showLink(GET_A_WEBGL_BROWSER);
          return null;
        }

        var context = create3DContext(canvas, opt_attribs);

        if (!context) {//showLink(OTHER_PROBLEM);
        }

        return context;
      };
      /**
       * Creates a webgl context.
       * @param {!Canvas} canvas The canvas tag to get context
       *     from. If one is not passed in one will be created.
       * @return {!WebGLContext} The created context.
       */


      var create3DContext = function create3DContext(canvas, opt_attribs) {
        var names = ["webgl", "experimental-webgl"];
        var context = null;

        for (var ii = 0; ii < names.length; ++ii) {
          try {
            context = canvas.getContext(names[ii], opt_attribs);
          } catch (e) {}

          if (context) {
            break;
          }
        }

        return context;
      };

      var updateCSSIfInIFrame = function updateCSSIfInIFrame() {
        if (isInIFrame()) {
          document.body.className = "iframe";
        }
      };
      /**
       * Gets a WebGL context.
       * makes its backing store the size it is displayed.
       */


      var getWebGLContext = function getWebGLContext(canvas, opt_attribs) {
        if (isInIFrame()) {
          updateCSSIfInIFrame(); // make the canvas backing store the size it's displayed.

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


      var loadShader = function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
        var errFn = opt_errorCallback || error; // Create the shader object

        var shader = gl.createShader(shaderType); // Load the shader source

        gl.shaderSource(shader, shaderSource); // Compile the shader

        gl.compileShader(shader); // Check the compile status

        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

        if (!compiled) {
          // Something went wrong during compilation; get the error
          lastError = gl.getShaderInfoLog(shader);
          errFn("*** Error compiling shader '" + shader + "':" + lastError);
          gl.deleteShader(shader);
          return null;
        }

        return shader;
      };
      /**
       * Creates a program, attaches shaders, binds attrib locations, links the
       * program and calls useProgram.
       * @param {!Array.<!WebGLShader>} shaders The shaders to attach
       * @param {!Array.<string>} opt_attribs The attribs names.
       * @param {!Array.<number>} opt_locations The locations for the attribs.
       * @param {function(string): void) opt_errorCallback callback for errors.
       */


      var loadProgram = function loadProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
        var errFn = opt_errorCallback || error;
        var program = gl.createProgram();

        for (var ii = 0; ii < shaders.length; ++ii) {
          gl.attachShader(program, shaders[ii]);
        }

        if (opt_attribs) {
          for (var ii = 0; ii < opt_attribs.length; ++ii) {
            gl.bindAttribLocation(program, opt_locations ? opt_locations[ii] : ii, opt_attribs[ii]);
          }
        }

        gl.linkProgram(program); // Check the link status

        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);

        if (!linked) {
          // something went wrong with the link
          lastError = gl.getProgramInfoLog(program);
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


      var createShaderFromScript = function createShaderFromScript(gl, scriptId, opt_shaderType, opt_errorCallback) {
        var shaderSource = "";
        var shaderType;
        var shaderScript = document.getElementById(scriptId);

        if (!shaderScript) {
          throw "*** Error: unknown script element" + scriptId;
        }

        shaderSource = shaderScript.text;

        if (!opt_shaderType) {
          if (shaderScript.type == "x-shader/x-vertex") {
            shaderType = gl.VERTEX_SHADER;
          } else if (shaderScript.type == "x-shader/x-fragment") {
            shaderType = gl.FRAGMENT_SHADER;
          } else if (shaderType != gl.VERTEX_SHADER && shaderType != gl.FRAGMENT_SHADER) {
            throw "*** Error: unknown shader type";
            return null;
          }
        }

        return loadShader(gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType, opt_errorCallback);
      };

      var defaultShaderType = ["VERTEX_SHADER", "FRAGMENT_SHADER"];
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

      var createProgramFromScripts = function createProgramFromScripts(gl, shaderScriptIds, opt_attribs, opt_locations, opt_errorCallback) {
        var shaders = [];

        for (var ii = 0; ii < shaderScriptIds.length; ++ii) {
          shaders.push(createShaderFromScript(gl, shaderScriptIds[ii], gl[defaultShaderType[ii]], opt_errorCallback));
        }

        return loadProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
      }; // Add your prefix here.


      var browserPrefixes = ["", "MOZ_", "OP_", "WEBKIT_"];
      /**
       * Given an extension name like WEBGL_compressed_texture_s3tc
       * returns the supported version extension, like
       * WEBKIT_WEBGL_compressed_teture_s3tc
       * @param {string} name Name of extension to look for
       * @return {WebGLExtension} The extension or undefined if not
       *     found.
       */

      var getExtensionWithKnownPrefixes = function getExtensionWithKnownPrefixes(gl, name) {
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


      var resizeCanvasToDisplaySize = function resizeCanvasToDisplaySize(canvas) {
        if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight) {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        }
      };
      /**
       * Provides requestAnimationFrame in a cross browser way.
       */


      var requestAnimFrame = function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (
        /* function FrameRequestCallback */
        callback,
        /* DOMElement Element */
        element) {
          return window.setTimeout(callback, 1000 / 60);
        };
      }();
      /**
       * Provides cancelRequestAnimationFrame in a cross browser way.
       */


      var cancelRequestAnimFrame = function () {
        return window.cancelCancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || window.clearTimeout;
      }();

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
  }, {}]
}, {}, [2]);
//# sourceMappingURL=infragram.js.map
