// This file was adapted from infragram-js:
// http://github.com/p-v-o-s/infragram-js.

module.exports = function Colormaps(options) {

  // see https://github.com/publiclab/image-sequencer/tree/main/src/modules/Colormap/
  var colormapFunctionGenerator = require('./colormapFunctionGenerator.js');
  var colormaps = require('./colormaps.json');
  Object.keys(colormaps).forEach(function(key) {
    // make a function from the colormap, which we can't easily do in JSON
    colormaps[key].fn = colormapFunctionGenerator(colormaps[key].colormapRanges);
  });

  var JsImage = require('../util/JsImage.js');

  function colorify(jsImage, colormap) {
    var b, data, g, i, j, l, n, r, ref;
    $('#btn-colorize').addClass('active');
    n = jsImage.width * jsImage.height;
    data = new Uint8ClampedArray(4 * n);
    j = 0;
    for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      [r, g, b] = colormap(jsImage.data[i]);
      data[j++] = r;
      data[j++] = g;
      data[j++] = b;
      data[j++] = 255;
    }
    return new JsImage(data, jsImage.width, jsImage.height, 4);
  }

  return {
    colorify: colorify,
    colormap1: colormaps['default'].fn,
    colormap2: colormaps['stretched'].fn,
    greyscale_colormap: colormaps['greyscale'].fn,
    segmented_colormap: colormapFunctionGenerator
  }

}
