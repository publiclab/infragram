module.exports = function Colorize(options) {

  $("#download").click(function() {
    downloadImage();
    return true;
  });

  // refactor this, it's a mess:
  $("#save").click(function() {
    var img;
    function sendThumbnail() {
      img = options.processor.getCurrentImage();
      return FileUpload.uploadThumbnail(img, function() {
        $("#form-filename").val(FileUpload.getFilename());
        $("#form-log").val(JSON.stringify(logger.log));
        return $("#save-form").submit();
      });
    };
    $("#save").prop("disabled", true);
    $("#save").html("Saving...");
    if (FileUpload.getFilename() === "") {
      img = options.processor.getCurrentImage();
      FileUpload.fromBase64("camera", img, sendThumbnail);
    } else if (FileUpload.isLoadedFromFile() === false) {
      FileUpload.duplicate(sendThumbnail);
    } else {
      sendThumbnail();
    }
    return true;
  });

}
