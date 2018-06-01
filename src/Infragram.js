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

  var Interface = require('./ui/interface')(options); // this can change processor based on URL hash
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
