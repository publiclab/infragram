// This file was adapted from infragram-js:
// http://github.com/p-v-o-s/infragram-js.

module.exports = function javascriptProcessor() {

  var b_exp = "",
      g_exp = "",
      get_channels,
      Colormaps = require('../color/colormaps')(),
      colormap = Colormaps.colormap1,
      converters = require('../color/converters'),
      image = null,
      jsHandleOnClickGrey,
      jsHandleOnClickNdvi,
      jsHandleOnClickRaw,
      jsHandleOnSlide,
      jsHandleOnSubmitInfra,
      jsHandleOnSubmitInfraHsv,
      jsHandleOnSubmitInfraMono,
      m_exp = "",
      mode = "raw",
      ndvi,
      r_exp = "",
      set_mode,
      update_colorbar;

  function histogram(array, [min, max], nbins) {
    var a, bins, d, i, l, len;
    bins = (function() {
      var l, ref, results;
      results = [];
      for (i = l = 0, ref = nbins; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        results.push(0);
      }
      return results;
    })();
    d = (max - min) / nbins;
    for (l = 0, len = array.length; l < len; l++) {
      a = array[l];
      i = Math.floor((a - min) / d);
      if ((0 <= i && i < nbins)) {
        bins[i]++;
      }
    }
    return bins;
  }

  function get_channels(jsImage) {
    var b, g, i, l, mkImage, n, r, ref;
    n = jsImage.width * jsImage.height;
    r = new Float32Array(n);
    g = new Float32Array(n);
    b = new Float32Array(n);
    for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      r[i] = jsImage.data[4 * i + 0];
      g[i] = jsImage.data[4 * i + 1];
      b[i] = jsImage.data[4 * i + 2];
    }
    function mkImage(d) {
      return new JsImage(d, jsImage.width, jsImage.height, 1);
    }
    return [mkImage(r), mkImage(g), mkImage(b)];
  }

  // replace with infragrammar expression
  function ndvi(nirJsImg, visJsImg) {
    var d, i, l, n, ref;
    n = nirJsImg.width * nirJsImg.height;
    d = new Float64Array(n);
    for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      d[i] = (nirJsImg.data[i] - visJsImg.data[i]) / (nirJsImg.data[i] + visJsImg.data[i]);
    }
    return new JsImage(d, nirJsImg.width, nirJsImg.height, 1);
  }

  function infragrammar(jsImage) {
    var b, g, i, l, n, o, r, ref;
    $('#btn-colorize').removeClass('active');
    n = jsImage.width * jsImage.height;
    r = new Float32Array(n);
    g = new Float32Array(n);
    b = new Float32Array(n);
    o = new Float32Array(4 * n);
    for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      r[i] = jsImage.data[4 * i + 0] / 255;
      g[i] = jsImage.data[4 * i + 1] / 255;
      b[i] = jsImage.data[4 * i + 2] / 255;
      o[4 * i + 0] = 255 * r_exp(r[i], g[i], b[i]);
      o[4 * i + 1] = 255 * g_exp(r[i], g[i], b[i]);
      o[4 * i + 2] = 255 * b_exp(r[i], g[i], b[i]);
      o[4 * i + 3] = 255;
    }
    return new JsImage(o, jsImage.width, jsImage.height, 4);
  }

  function infragrammar_mono(jsImage) {
    var b, g, i, l, n, o, r, ref;
    n = jsImage.width * jsImage.height;
    r = new Float32Array(n);
    g = new Float32Array(n);
    b = new Float32Array(n);
    o = new Float32Array(n);
    for (i = l = 0, ref = n; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      r[i] = jsImage.data[4 * i + 0] / 255.0;
      g[i] = jsImage.data[4 * i + 1] / 255.0;
      b[i] = jsImage.data[4 * i + 2] / 255.0;
      o[i] = r_exp(r[i], g[i], b[i]);
    }
    return new JsImage(o, jsImage.width, jsImage.height, 1);
  }

  function render(jsImage) {
    var ctx, d, e;
    e = $("#image")[0];
    e.width = jsImage.width;
    e.height = jsImage.height;
    ctx = e.getContext("2d");
    d = ctx.getImageData(0, 0, jsImage.width, jsImage.height);
    jsImage.copyToImageData(d);
    return ctx.putImageData(d, 0, 0);
  }

  update_colorbar = (min, max) => {
    var b, ctx, d, e, g, i, j, k, l, m, r, ref, ref1;
    $('#colorbar-container')[0].style.display = 'inline-block';
    e = $('#colorbar')[0];
    ctx = e.getContext("2d");
    d = ctx.getImageData(0, 0, e.width, e.height);
    for (i = l = 0, ref = e.width; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      for (j = m = 0, ref1 = e.height; 0 <= ref1 ? m < ref1 : m > ref1; j = 0 <= ref1 ? ++m : --m) {
        [r, g, b] = colormap(i / e.width);
        k = 4 * (i + j * e.width);
        d.data[k + 0] = r;
        d.data[k + 1] = g;
        d.data[k + 2] = b;
        d.data[k + 3] = 255;
      }
    }
    ctx.putImageData(d, 0, 0);
    $("#colorbar-min")[0].textContent = min.toFixed(2);
    return $("#colorbar-max")[0].textContent = max.toFixed(2);
  }

  function update(image) {
    var b, g, max, min, ndvi_jsImg, normalize, r, resultJsImage;
    $('#colorbar-container')[0].style.display = 'none';
    if (mode === "ndvi") {
      [r, g, b] = get_channels(image);
      ndvi_jsImg = ndvi(r, b);
      // this isn't correct for NDVI; we want values from -1 to 1:
      // [[min],[max]] = ndvi_img.extrema()
      min = -1;
      max = 1;
      function normalize(x) {
        return (x - min) / (max - min);
      };
      resultJsImage = Colormaps.colorify(ndvi_jsImg, function(x) {
        return colormap(normalize(x));
      });
      update_colorbar(min, max);
    } else if (mode === "raw") {
      resultJsImage = new JsImage(image.data, image.width, image.height, 4);
    } else if (mode === "nir") {
      [r, g, b] = get_channels(image);
      resultJsImage = Colormaps.colorify(r, function(x) {
        return [x, x, x];
      });
    } else {
      resultJsImage = infragrammar(image);
    }
    return render(resultJsImage);
  }

  function save_expressions(r, g, b) {
    if (r === "") {
      r = "R";
    }
    if (g === "") {
      g = "G";
    }
    if (b === "") {
      b = "B";
    }
    eval("r_exp = function(R,G,B){var r=R,g=G,b=B;return " + r + ";}");
    eval("g_exp = function(R,G,B){var r=R,g=G,b=B;return " + g + ";}");
    return eval("b_exp = function(R,G,B){var r=R,g=G,b=B;return " + b + ";}");
  };

  save_expressions_hsv = function(h, s, v) {
    if (h === "") {
      h = "H";
    }
    if (s === "") {
      s = "S";
    }
    if (v === "") {
      v = "V";
    }
    eval("r_exp = function(R,G,B){var h=H,s=S,v=V,hsv = converters.rgb2hsv(R, G, B), H = hsv[0], S = hsv[1], V = hsv[2]; return converters.hsv2rgb(" + h + "," + s + "," + v + ")[0];}");
    eval("g_exp = function(R,G,B){var h=H,s=S,v=V,hsv = converters.rgb2hsv(R, G, B), H = hsv[0], S = hsv[1], V = hsv[2]; return converters.hsv2rgb(" + h + "," + s + "," + v + ")[1];}");
    return eval("b_exp = function(R,G,B){var h=H,s=S,v=V,hsv = converters.rgb2hsv(R, G, B), H = hsv[0], S = hsv[1], V = hsv[2]; return converters.hsv2rgb(" + h + "," + s + "," + v + ")[2];}");
  }

  function getImageData() {
    var ctx = $('#image')[0].getContext("2d");
// risks being circular def of width/height
    var width = $('#image').width();
    var height = $('#image').height();
// this now just defaults to file-scoped 'image' which we want to avoid
    return image || ctx.getImageData(0, 0, width, height);
  }

  function getJsImage() {
    var imageData = getImageData();
    return new JsImage(imageData.data, imageData.width, imageData.height, 1);
  }

  function set_mode(new_mode) {
    mode = new_mode;
    update(getImageData());
    if (mode === "ndvi") {
      return $("#colormaps-group")[0].style.display = "inline-block";
    } else {
      if ($("#colormaps-group").size() > 0) {
        return $("#colormaps-group")[0].style.display = "none";
      }
    }
  }

  // img should be a native JavaScript image obj
  function updateImage(img) {
    var ctx, height, imgCanvas, width;
    imgCanvas = document.getElementById("image");
    ctx = imgCanvas.getContext("2d");
    width = img.videoWidth || img.width;
    height = img.videoHeight || img.height;
    ctx.drawImage(img, 0, 0, width, height, 0, 0, imgCanvas.width, imgCanvas.height);
    image = ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height);
    return set_mode(mode);
  }

  function runInfragrammar(mode) {
    return set_mode(mode);
  }

  function getCurrentImage() {
    var ctx, e;
    e = $("#image")[0];
    ctx = e.getContext("2d");
    return ctx.canvas.toDataURL("image/jpeg");
  }

  jsHandleOnClickRaw = function() {
    return set_mode("raw");
  }

  jsHandleOnClickNdvi = function() {
    return set_mode("ndvi");
  }

  jsHandleOnSubmitInfraHsv = function() {
    save_expressions_hsv($('#h_exp').val(), $('#s_exp').val(), $('#v_exp').val());
    return set_mode("infragrammar_hsv");
  }

  jsHandleOnSubmitInfra = function() {
    save_expressions($('#r_exp').val(), $('#g_exp').val(), $('#b_exp').val());
    return set_mode("infragrammar");
  }

  jsHandleOnSubmitInfraMono = function() {
    save_expressions($('#m_exp').val(), $('#m_exp').val(), $('#m_exp').val());
    return set_mode("infragrammar_mono");
  }

  jsHandleOnClickGrey = function() {
    colormap = Colormaps.greyscale_colormap;
    return update(image);
  }

  return {
    type: 'javascript',
    colormap: colormap,
    getCurrentImage: getCurrentImage,
    getImageData: getImageData,
    getJsImage: getJsImage,
    infragrammar_mono: infragrammar_mono,
    infragrammar: infragrammar,
    render: render,
    runInfragrammar: runInfragrammar,
    save_expressions: save_expressions,
    save_expressions_hsv: save_expressions_hsv,
    update: update,
    updateImage: updateImage
  }

}
