var uploadable = false; // add to constructor params
$(document).ready(function() {
  FileUpload.initialize({ socket: uploadable });
  $("#image-container").ready(function() {
    var enablewebgl, idNameMap, src;
    enablewebgl = (getURLParameter("webgl") === "true") ? true : false;
    webGlSupported = enablewebgl && glInitInfragram();
    if (webGlSupported) {
      $("#webgl-activate").html("&laquo; Go back to JS version");
    }
    idNameMap = {
      "#m_exp": "m",
      "#r_exp": "r",
      "#g_exp": "g",
      "#b_exp": "b",
      "#h_exp": "h",
      "#s_exp": "s",
      "#v_exp": "v"
    };
    setParametersFromURL(idNameMap);
    src = getURLParameter('src');
    if (src) {
      params = parametersObject(location.search.split('?')[1]);
      mode = params['mode'];
      fetch_image(src);
    }
    return true;
  });
  $("#file-sel").change(function() {
    $("#save-modal-btn").show();
    $("#save-zone").show();
    FileUpload.fromFile(this.files, updateImage, uploadable);
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
    if (webGlSupported) {
      return glHandleOnClickRaw();
    } else {
      return run_infragrammar(mode);
    }
  });
  $("#preset_ndvi_blue").click(function() {
    $('#modeSwitcher').val("infragrammar_mono").change();
    $('#m_exp').val("(R-B)/(R+B)");
    $('#preset-modal').modal('hide');
    save_infragrammar_inputs();
    if (webGlSupported) {
      return glHandleOnSubmitInfraMono();
    } else {
      return run_infragrammar(mode);
    }
  });
  $("#preset_ndvi_blue_color").click(function() {
    $('#modeSwitcher').val("infragrammar_mono").change();
    $('#m_exp').val("(R-B)/(R+B)");
    $('#preset-modal').modal('hide');
    save_infragrammar_inputs();
    if (webGlSupported) {
      glHandleOnClickColor();
      return glHandleOnClickNdvi();
    } else {
      colorized = true;
      run_infragrammar(mode);
      return run_colorize();
    }
  });
  $("#preset_ndvi_red").click(function() {
    $('#modeSwitcher').val("infragrammar_mono").change();
    $('#m_exp').val("(B-R)/(B+R)");
    $('#preset-modal').modal('hide');
    save_infragrammar_inputs();
    if (webGlSupported) {
      return glHandleOnSubmitInfraMono();
    } else {
      return run_infragrammar(mode);
    }
  });
  $("#preset_ndvi_red_color").click(function() {
    $('#modeSwitcher').val("infragrammar_mono").change();
    $('#m_exp').val("(B-R)/(B+R)");
    $('#preset-modal').modal('hide');
    save_infragrammar_inputs();
    if (webGlSupported) {
      glHandleOnClickColor();
      return glHandleOnClickNdvi();
    } else {
      colorized = true;
      run_infragrammar(mode);
      return run_colorize();
    }
  });
  $("#btn-colorize").click(function() {
    if (webGlSupported) {
      glHandleOnClickColor();
      return glHandleOnClickNdvi();
    } else {
      colorized = true;
      run_infragrammar(mode);
      return run_colorize();
    }
  });
  $("#default_colormap").click(function() {
    var colormap;
    if (webGlSupported) {
      glHandleDefaultColormap();
      glHandleOnClickNdvi();
    } else {
      colorized = true;
      colormap = colormap1;
      run_colorize();
    }
    return $("#btn-colorize").addClass("active");
  });
  $("#stretched_colormap").click(function() {
    var colormap;
    if (webGlSupported) {
      glHandleStretchedColormap();
      glHandleOnClickNdvi();
    } else {
      colorized = true;
      colormap = colormap2;
      run_colorize();
    }
    return $("#btn-colorize").addClass("active");
  });
  $("button#raw").click(function() {
    log.push("mode=raw");
    if (webGlSupported) {
      glHandleOnClickRaw();
    } else {
      jsHandleOnClickRaw();
    }
    return true;
  });
  $("button#ndvi").click(function() {
    log.push("mode=ndvi");
    if (webGlSupported) {
      glHandleOnClickNdvi();
    } else {
      jsHandleOnClickNdvi();
    }
    return true;
  });
  $("button#nir").click(function() {
    log.push("mode=nir");
    $("#m_exp").val("R");
    $("#modeSwitcher").val("infragrammar_mono").change();
    if (webGlSupported) {
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
        $("#form-log").val(JSON.stringify(log));
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
    mode = "infragrammar_hsv";
    log_hsv();
    save_infragrammar_inputs();
    if (webGlSupported) {
      glHandleOnSubmitInfraHsv();
    } else {
      run_infragrammar(mode);
    }
    return true;
  });
  $("#infragrammar").submit(function() {
    mode = "infragrammar";
    log_rgb();
    save_infragrammar_inputs();
    if (webGlSupported) {
      glHandleOnSubmitInfra();
    } else {
      run_infragrammar(mode);
    }
    return true;
  });
  $("#infragrammar_mono").submit(function() {
    mode = "infragrammar_mono";
    log_mono();
    save_infragrammar_inputs();
    if (webGlSupported) {
      glHandleOnSubmitInfraMono();
    } else {
      run_infragrammar(mode);
    }
    return true;
  });
  $("button#grey").click(function() {
    log.push("mode=ndvi");
    if (webGlSupported) {
      glHandleOnClickGrey();
    } else {
      jsHandleOnClickGrey();
    }
    return true;
  });
  $("button#colorify").click(function() {
    if (webGlSupported) {
      glHandleOnClickColorify();
    } else {
      jsHandleOnClickColorify();
    }
    return true;
  });
  $("button#color").click(function() {
    log.push("mode=ndvi&color=true");
    if (webGlSupported) {
      glHandleOnClickColor();
    } else {
      jsHandleOnClickColor();
    }
    return true;
  });
  $("#slider").slider().on("slide", function(event) {
    if (webGlSupported) {
      glHandleOnSlide(event);
    } else {
      jsHandleOnSlide(event);
    }
    return true;
  });
  $("#webgl-activate").click(function() {
    var href;
    href = window.location.href;
    if (webGlSupported) {
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
    camera.initialize();
    save_infragrammar_inputs();
    if (webGlSupported) {
      setInterval(function() {
        if (image && video_live) {
          run_infragrammar(mode);
          video_live = true;
        }
        camera.getSnapshot();
        if (colorized) {
          return run_colorize();
        }
      }, 33);
    } else {
      setInterval(function() {
        if (image && video_live) {
          run_infragrammar(mode);
          video_live = true;
        }
        camera.getSnapshot();
        if (colorized) {
          return run_colorize();
        }
      }, 250);
    }
    $('#preset-modal').modal('show');
    return true;
  });
  $("#snapshot").click(function() {
    camera.getSnapshot();
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
  return true;
});
