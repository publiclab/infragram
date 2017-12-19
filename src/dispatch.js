// This file was adapted from infragram-js:
// http://github.com/p-v-o-s/infragram-js.

module.exports = function Dispatch(options, processor) {

  options.colorized      = options.colorized      || false;
  options.mode           = options.mode           || "raw",
  options.video_live     = options.video_live     || false,
  options.webGlSupported = options.webGlSupported || false; // move into processor

  var Colormaps = require('./color/colormaps')();

  var logger = options.logger;

  // this should accept an object with parameters r,g,b,h,s,v,m and mode
  options.run_infragrammar = function run_infragrammar(mode) {
    logger.save_log();
    options.colorized = false;
    return processor.runInfragrammar(mode);
  }

  // this maps -1-1 to 0-1, i guess
  options.run_colorize = function run_colorize() {
    var imageData = processor.getImageData();
    processor.render(Colormaps.colorify(processor.infragrammar_mono(imageData), function(x) {
      return processor.colormap((x + 1) / 2);
    }));
    return true;
  }

  // saving inputs/expressions:

  // can we move this into interface?
  options.save_infragrammar_inputs = function save_infragrammar_inputs() {
    mode = $('#modeSwitcher').val();
    return options.save_infragrammar_expressions({
      'r': $('#r_exp').val(),
      'g': $('#g_exp').val(),
      'b': $('#b_exp').val(),
      'm': $('#m_exp').val(),
      'h': $('#h_exp').val(),
      's': $('#s_exp').val(),
      'v': $('#v_exp').val()
    });
  }

  options.save_infragrammar_expressions = function save_infragrammar_expressions(args) {
    if (mode === "infragrammar") {
      processor.save_expressions(args['r'], args['g'], args['b']);
    } else if (mode === "infragrammar_mono") {
      processor.save_expressions(args['m'], args['m'], args['m']);
    } else if (mode === "infragrammar_hsv") {
      return processor.save_expressions_hsv(args['h'], args['s'], args['v']);
    }
  }

  return {
    run_colorize: options.run_colorize,
    run_infragrammar: options.run_infragrammar,
    save_infragrammar_expressions: options.save_infragrammar_expressions,
    save_infragrammar_inputs: options.save_infragrammar_inputs
  }

}
