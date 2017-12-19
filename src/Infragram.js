Infragram = function Infragram(options) {
  options = options || {};
  options.uploader = options.uploader || false;
  options.processor = options.processor || 'javascript';
  options.camera = require('./camera')(options);

  JsImage = require('./util/JsImage.js'),

  options.processors = {
    'webgl':           require('./processors/webgl'),
    'javascript':      require('./processors/javascript'),
    //'image-sequencer': require('./processors/image-sequencer')
  }

  options.processor = options.processors[options.processor]();
  options.logger = require('./logger')(options);

  return {
    Camera: options.camera,
    Dispatch: require('./dispatch')(options, options.processor),
    Interface: require('./interface')(options),
    logger: options.logger,
    processors: options.processors
  }
}
module.exports = Infragram;
