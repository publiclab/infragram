module.exports = function Interface(options) {

  options.imageSelector = options.imageSelector || "#image-container";
  options.fileSelector = options.fileSelector || "#file-sel";

  var urlHash = require('urlhash')();
  var FileUpload = require('./file-upload');
  var logger = options.logger;
  var Colormaps = require('./color/colormaps');

  $(document).ready(function() {

    if (options.uploadable) FileUpload.initialize({ socket: options.uploadable });

    $(options.imageSelector).ready(function() {
      var enablewebgl, idNameMap, src;
      enablewebgl = urlHash.getUrlHashParameter("webgl") === "true" ? true : false;
      var initialized = options.processor.initialize && options.processor.initialize();
      options.webGlSupported = enablewebgl && initialized;

      if (options.webGlSupported) {
        $("#webgl-activate").html("&laquo; Go back to JS version");
      }

      // broken:  
      idNameMap = {
        "#m_exp": "m",
        "#r_exp": "r",
        "#g_exp": "g",
        "#b_exp": "b",
        "#h_exp": "h",
        "#s_exp": "s",
        "#v_exp": "v"
      };

      urlHash.setUrlHashParameter(JSON.stringify(idNameMap));
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
      options.save_infragrammar_inputs();
      if (options.webGlSupported) {
        return glHandleOnClickRaw();
      } else {
        return options.run_infragrammar(options.mode);
      }
    });

    $("#preset_ndvi_blue").click(function() {
      $('#modeSwitcher').val("infragrammar_mono").change();
      $('#m_exp').val("(R-B)/(R+B)");
      $('#preset-modal').modal('hide');
      options.save_infragrammar_inputs();
      if (options.webGlSupported) {
        return glHandleOnSubmitInfraMono();
      } else {
        return options.run_infragrammar(options.mode);
      }
    });

    $("#preset_ndvi_blue_color").click(function() {
      $('#modeSwitcher').val("infragrammar_mono").change();
      $('#m_exp').val("(R-B)/(R+B)");
      $('#preset-modal').modal('hide');
      options.save_infragrammar_inputs();
      if (options.webGlSupported) {
        glHandleOnClickColor();
        return glHandleOnClickNdvi();
      } else {
        options.colorized = true;
        options.run_infragrammar(options.mode);
        return options.run_colorize();
      }
    });

    $("#preset_ndvi_red").click(function() {
      $('#modeSwitcher').val("infragrammar_mono").change();
      $('#m_exp').val("(B-R)/(B+R)");
      $('#preset-modal').modal('hide');
      options.save_infragrammar_inputs();
      if (options.webGlSupported) {
        return glHandleOnSubmitInfraMono();
      } else {
        return options.run_infragrammar(options.mode);
      }
    });

    $("#preset_ndvi_red_color").click(function() {
      $('#modeSwitcher').val("infragrammar_mono").change();
      $('#m_exp').val("(B-R)/(B+R)");
      $('#preset-modal').modal('hide');
      options.save_infragrammar_inputs();
      if (options.webGlSupported) {
        glHandleOnClickColor();
        return glHandleOnClickNdvi();
      } else {
        options.colorized = true;
        options.run_infragrammar(options.mode);
        return options.run_colorize();
      }
    });

    $("#btn-colorize").click(function() {
      if (options.webGlSupported) {
        glHandleOnClickColor();
        return glHandleOnClickNdvi();
      } else {
        options.colorized = true;
        options.run_infragrammar(options.mode);
        return options.run_colorize();
      }
    });

    $("#default_colormap").click(function() {
      var colormap;
      if (options.webGlSupported) {
        glhandledefaultcolormap();
        glhandleonclickndvi();
      } else {
        options.colorized = true;
        colormap = Colormaps.colormap1;
        options.run_colorize();
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
        options.run_colorize();
      }
      return $("#btn-colorize").addClass("active");
    });

    $("button#raw").click(function() {
      logger.log.push("mode=raw");
      if (options.webGlSupported) {
        glHandleOnClickRaw();
      } else {
        jsHandleOnClickRaw();
      }
      return true;
    });

    $("button#ndvi").click(function() {
      logger.log.push("mode=ndvi");
      if (options.webGlSupported) {
        glHandleOnClickNdvi();
      } else {
        jsHandleOnClickNdvi();
      }
      return true;
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
      options.save_infragrammar_inputs();
      if (options.webGlSupported) {
        glHandleOnSubmitInfraHsv();
      } else {
        options.run_infragrammar(options.mode);
      }
      return true;
    });

    $("#infragrammar").submit(function() {
      options.mode = "infragrammar";
      logger.log_rgb();
      options.save_infragrammar_inputs();
      if (options.webGlSupported) {
        glHandleOnSubmitInfra();
      } else {
        options.run_infragrammar(options.mode);
      }
      return true;
    });

    $("#infragrammar_mono").submit(function() {
      options.mode = "infragrammar_mono";
      logger.log_mono();
      options.save_infragrammar_inputs();
      if (options.webGlSupported) {
        glHandleOnSubmitInfraMono();
      } else {
        options.run_infragrammar(options.mode);
      }
      return true;
    });

    $("button#grey").click(function() {
      logger.log.push("mode=ndvi");
      if (options.webGlSupported) {
        glHandleOnClickGrey();
      } else {
        jsHandleOnClickGrey();
      }
      return true;
    });

    $("button#colorify").click(function() {
      if (options.webGlSupported) {
        glHandleOnClickColorify();
      } else {
        jsHandleOnClickColorify();
      }
      return true;
    });

    $("button#color").click(function() {
      logger.log.push("mode=ndvi&color=true");
      if (options.webGlSupported) {
        glHandleOnClickColor();
      } else {
        jsHandleOnClickColor();
      }
      return true;
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
      options.camera.initialize();
      options.save_infragrammar_inputs();
      if (options.webGlSupported) {
        setInterval(function() {
          if (image) {
            options.run_infragrammar(options.mode);
          }
          options.camera.getSnapshot();
          if (options.colorized) {
            return options.run_colorize();
          }
        }, 33);
      } else {
        setInterval(function() {
          if (image) {
            options.run_infragrammar(options.mode);
          }
          options.camera.getSnapshot();
          if (options.colorized) {
            return options.run_colorize();
          }
        }, 250);
      }
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
