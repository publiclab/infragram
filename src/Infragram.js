Infragram = function Infragram(options) {
  options = options || {};
  options.uploader = options.uploader || false;

  options.processors = {
    'webgl':           require('./processors/webgl'),
    'javascript':      require('./processors/javascript'),
    //'image-sequencer': require('./processors/image-sequencer')
  }

  options.processor = options.processor || 'javascript';
  options.processor = options.processors[options.processor]();

  return {
    Dispatch: require('./dispatch')(options, options.processor),
    Interface: require('./interface')(options),
    processors: options.processors
  }
}
module.exports = Infragram;
