module.exports = function Interface(options) {

  options.imageSelector = options.imageSelector || "#image-container";
  options.fileSelector = options.fileSelector || "#file-sel";

  var urlHash = require('urlhash')();
  var FileUpload = require('../file-upload');
  var logger = options.logger;
  var Colormaps = require('../color/colormaps');
  var Fullscreen, Presets, Analysis, Colorize, Saving;

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
    console.log(args);
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
    Presets = require('../ui/presets')(options, save_infragrammar_inputs);
    Analysis = require('../ui/analysis')(options, save_infragrammar_inputs);
    Colorize = require('../ui/colorize')(options);
    Saving = require('../ui/saving')(options);

    if (options.uploadable) FileUpload.initialize({ socket: options.uploadable });

    $(options.imageSelector).ready(function() {

      var src, idNameMap = {
        "#m_exp": "m",
        "#r_exp": "r",
        "#g_exp": "g",
        "#b_exp": "b",
        "#h_exp": "h",
        "#s_exp": "s",
        "#v_exp": "v"
      };
 
      $("#overlay-slider").val(localStorage.getItem("overlaySize"));
      console.log('grid ' + localStorage.getItem("overlaySize"));
      setGrid($("#overlay-slider").val());

      // TODO: broken:  
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
      $('.choose-prompt').hide();
      $("#save-modal-btn").show();
      $("#save-zone").show();
      FileUpload.fromFile(this.files, options.processor.updateImage, options.uploadable);
      $('#preset-modal').modal('show');
      return true;
    });

    $("#webcam-activate").click(function() {
      $('.choose-prompt').hide();
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

    $("#overlay-btn").click(function() {
      $("#overlay-container").toggle();
      $("#overlay-controls-container").toggle();
      $("#overlay-btn").toggleClass("btn-success");
    });

    $("#overlay-slider").on("input", function() {
      setGrid($("#overlay-slider").val());
    });

    function setGrid(size) {
      var scale = 80, // roughly, not smaller than the viewport
          ratio = 1250/2000; // size of svg
      $("#overlay-img").width(size * scale);
      $("#overlay-img").height(size * scale * ratio);
      $("#overlay-size").html(size);
      console.log('saved grid ' + size);
    }

    $("#overlay-save-btn").click(function() {
      localStorage.setItem("overlaySize", $("#overlay-slider").val());
      $("#overlay-save-info").show().delay(2000).fadeOut();
    });
    
    $("[rel=tooltip]").tooltip()
    $("[rel=popover]").popover()
    return true;
  });
}
