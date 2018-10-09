module.exports = function Colorize(options) {

  $("#btn-colorize").click(function() {
    options.colorized = true;
    options.run(options.mode);
    return options.colorize();
  });

  $("#default_colormap").click(function() {
    options.colorized = true;
    options.colorize('default');
    options.run(options.mode);
    return $("#btn-colorize").addClass("active");
  });

  $("#stretched_colormap").click(function() {
    options.colorized = true;
    options.colorize('stretched');
    options.run(options.mode);
    return $("#btn-colorize").addClass("active");
  });

}
