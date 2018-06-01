module.exports = function Interface(options) {

  options.imageSelector = options.imageSelector || "#image-container";
  options.fileSelector = options.fileSelector || "#file-sel";

  var urlHash = require('urlhash')();
  var FileUpload = require('../file-upload');
  var logger = options.logger;
  var Colormaps = require('../color/colormaps');
  var Fullscreen;

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

    Fullscreen = require('./fullscreen')(options);

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

    // preset button
    $("#preset_raw").click(function() {
      $('#modeSwitcher').val("infragrammar").change();
      $('#r_exp').val("R");
      $('#g_exp').val("G");
      $('#b_exp').val("B");
      $('#preset-modal').modal('hide');
      save_infragrammar_inputs();
      return options.run(options.mode);
    });

    // preset button
    $("#preset_ndvi_blue").click(function() {
      $('#modeSwitcher').val("infragrammar_mono").change();
      $('#m_exp').val("(R-B)/(R+B)");
      $('#preset-modal').modal('hide');
      save_infragrammar_inputs();
      return options.run(options.mode);
    });

    // preset button
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

    // preset button
    $("#preset_ndvi_red").click(function() {
      $('#modeSwitcher').val("infragrammar_mono").change();
      $('#m_exp').val("(B-R)/(B+R)");
      $('#preset-modal').modal('hide');
      save_infragrammar_inputs();
      return options.run(options.mode);
    });

    // preset button
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


    $("#default_colormap").click(function() {
      options.colorized = true;
      options.colorize('default');
      return $("#btn-colorize").addClass("active");
    });

    $("#stretched_colormap").click(function() {
      options.colorized = true;
      options.colorize('stretched');
      return $("#btn-colorize").addClass("active");
    });

    $("#download").click(function() {
      downloadImage();
      return true;
    });

    // refactor this, it's a mess:
    $("#save").click(function() {
      var img;
      function sendThumbnail() {
        img = options.processor.getCurrentImage();
        return FileUpload.uploadThumbnail(img, function() {
          $("#form-filename").val(FileUpload.getFilename());
          $("#form-log").val(JSON.stringify(logger.log));
          return $("#save-form").submit();
        });
      };
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
      return true;
    });

    // buttons to run Analysis steps
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
