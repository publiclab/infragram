module.exports = function Colorize(options) {

  $(".btn-colorize").click(function() {
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

  $("#default_colormap").click(function() {
    console.log('default colormap');
    colorize();
    options.colorize('default');
    options.run(options.mode);
    return $("#btn-colorize").addClass("active");
  });

  $("#stretched_colormap").click(function() {
    console.log('stretched colormap');
    colorize();
    options.colorize('stretched');
    options.run(options.mode);
    return $("#btn-colorize").addClass("active");
  });

  // duplicated in presets.js
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

}
