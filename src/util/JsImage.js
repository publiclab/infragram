module.exports = class JsImage {
  constructor(data1, width1, height1, channels) {
    this.data = data1;
    this.width = width1;
    this.height = height1;
    this.channels = channels;
  }

  copyToImageData(imgData) {
    return imgData.data.set(this.data);
  }

  extrema() {
    var c, i, j, l, m, maxs, mins, n, ref, ref1;
    n = this.width * this.height;
    mins = (function() {
      var l, ref, results;
      results = [];
      for (i = l = 0, ref = this.channels; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        results.push(this.data[i]);
      }
      return results;
    }).call(this);
    maxs = (function() {
      var l, ref, results;
      results = [];
      for (i = l = 0, ref = this.channels; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        results.push(this.data[i]);
      }
      return results;
    }).call(this);
    j = 0;
    for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      for (c = m = 0, ref1 = this.channels; 0 <= ref1 ? m < ref1 : m > ref1; c = 0 <= ref1 ? ++m : --m) {
        if (this.data[j] > maxs[c]) {
          maxs[c] = this.data[j];
        }
        if (this.data[j] < mins[c]) {
          mins[c] = this.data[j];
        }
        j++;
      }
    }
    return [mins, maxs];
  }

}
