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
    //options.colorized = false;
    return processor.runInfragrammar(mode);
  }

  // this maps -1-1 to 0-1, i guess
  options.run_colorize = function run_colorize() {
    // not needed for webgl -- but then we should refactor this 
    // to be within the JS processor if it's not universally 
    // part of the processor API
    if (processor.type !== 'webgl') {
      var imageData = processor.getImageData();
      processor.render(Colormaps.colorify(processor.infragrammar_mono(imageData), function(x) {
        return processor.colormap((x + 1) / 2);
      }));
      return true;
    } else {
      processor.glHandleOnClickColor();
    }
  }

  return {
    options: options,
    run_colorize: options.run_colorize,
    run_infragrammar: options.run_infragrammar
  }

}
