// This file was adapted from infragram-js:
// http://github.com/p-v-o-s/infragram-js.

module.exports = window.Converters = {

  // modified from:
  // http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
  hsv2rgb: function hsv2rgb(h, s, v) {
    var data, f, i, p, q, rgb, t;
    data = [];
    if (s === 0) {
      rgb = [v, v, v];
    } else {
      i = Math.floor(h * 6);
      f = h * 6 - i;
      p = v * (1 - s);
      q = v * (1 - f * s);
      t = v * (1 - (1 - f) * s);
      data = [v * (1 - s), v * (1 - s * (h - i)), v * (1 - s * (1 - (h - i)))];
      switch (i) {
        case 0:
          rgb = [v, t, p];
          break;
        case 1:
          rgb = [q, v, p];
          break;
        case 2:
          rgb = [p, v, t];
          break;
        case 3:
          rgb = [p, q, v];
          break;
        case 4:
          rgb = [t, p, v];
          break;
        default:
          rgb = [v, p, q];
      }
    }
    return rgb;
  },

  rgb2hsv: function rgb2hsv(r, g, b) {
    var d, h, max, min, s, v;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    h = s = v = max;
    d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return [h, s, v];
  }

}
