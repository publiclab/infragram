module.exports = function segmented_colormap(segments) {
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
