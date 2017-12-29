// This file was adapted from infragram-js:
// http://github.com/p-v-o-s/infragram-js.

module.exports = function File(options, processor) {

  function downloadImage() {
    var event, format, lnk;
    // create an "off-screen" anchor tag
    lnk = document.createElement("a");
    // the key here is to set the download attribute of the a tag
    lnk.href = processor.getCurrentImage();
    if (lnk.href.match('image/jpeg')) {
      format = "jpg";
    } else {
      format = "png";
    }
    lnk.download = (new Date()).toISOString().replace(/:/g, "_") + "." + format;
    // create a "fake" click-event to trigger the download
    if (document.createEvent) {
      event = document.createEvent("MouseEvents");
      event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      lnk.dispatchEvent(event);
    } else if (lnk.fireEvent) {
      lnk.fireEvent("onclick");
    }
    return true;
  }

  // from a local URL (remote may be against js security rules)
  function fetchImage(src, mode) {
    var img;
    $("#save-modal-btn").show();
    $("#save-zone").show();
    img = new Image();
    if (options.uploader) {
      img.onload = function() {
        var filename;
        filename = src.split('/');
        filename = filename[filename.length - 1];
        FileUpload.setFilename(filename);
        if (mode) {
          if (mode.substring(0, 5) === "infra") {
            $("#modeSwitcher").val(mode).change();
          } else {
            $("button#" + mode).button("toggle");
            $("button#" + mode).click(); // this should be via a direct call, not a click; the show.jade page should not require buttons!
          }
        }
        options.save_infragrammar_expressions(params);
        if (mode === "ndvi") {
          options.save_infragrammar_expressions({
            'm': '(R-B)/(R+B)'
          });
          mode = "infragrammar_mono";
        } else if (mode === "nir") {
          options.save_infragrammar_expressions({
            'm': 'R'
          });
          mode = "infragrammar_mono";
        } else if (mode === "raw") {
          options.save_infragrammar_expressions({
            'r': 'R',
            'g': 'G',
            'b': 'B'
          });
          mode = "infragrammar";
        }
	processor.updateImage(this);
        if (params['color'] === "true" || params['c'] === "true") {
          options.colorized = true; // before run_infrag, so it gets logged
        }
        run_infragrammar(mode); // this sets colorized to false!
        if (params['color'] === "true" || params['c'] === "true") {
          options.colorized = true; // again, so it gets run 
        }
        if (options.colorized) {
          $("button#color").button("toggle");
          return run_colorize();
        }
      }
    }
    return img.src = src;
  }

  return {
    fetchImage: fetchImage,
    downloadImage: downloadImage
  }

}
