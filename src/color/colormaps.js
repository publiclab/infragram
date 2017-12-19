// This file was adapted from infragram-js:
// http://github.com/p-v-o-s/infragram-js.

module.exports = function Colormaps(options) {

  var greyscale_colormap = segmented_colormap([[0, [0,   0,   0  ], [255, 255, 255]], 
                                               [1, [255, 255, 255], [255, 255, 255]]]);

  var colormap1 = segmented_colormap([[0,    [0,   0,   255], [38,  195, 195]],
                                      [0.5,  [0,   150, 0  ], [255, 255, 0  ]],
                                      [0.75, [255, 255, 0  ], [255, 50,  50 ]]]);

  var colormap2 = segmented_colormap([[0,   [0,   0,   255], [0,   0,   255]], 
                                      [0.1, [0,   0,   255], [38,  195, 195]],
                                      [0.5, [0,   150, 0  ], [255, 255, 0  ]],
                                      [0.7, [255, 255, 0  ], [255, 50,  50 ]],
                                      [0.9, [255, 50,  50 ], [255, 50,  50 ]]]);

  function segmented_colormap(segments) {
    return function(x) {
      var i, l, len, m, ref, result, x0, x1, xstart, y0, y1;
      [y0, y1] = [0, 0];
      [x0, x1] = [segments[0][0], 1];
      if (x < x0) {
        return y0;
      }
      for (i = l = 0, len = segments.length; l < len; i = ++l) {
        [xstart, y0, y1] = segments[i];
        x0 = xstart;
        if (i === segments.length - 1) {
          x1 = 1;
          break;
        }
        x1 = segments[i + 1][0];
        if ((xstart <= x && x < x1)) {
          break;
        }
      }
      result = [];
      for (i = m = 0, ref = y0.length; 0 <= ref ? m < ref : m > ref; i = 0 <= ref ? ++m : --m) {
        result[i] = (x - x0) / (x1 - x0) * (y1[i] - y0[i]) + y0[i];
      }
      return result;
    }
  }

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
    colormap1: colormap1,
    colormap2: colormap2,
    greyscale_colormap: greyscale_colormap,
    segmented_colormap: segmented_colormap
  }

}
