module.exports = function Fullscreen(options) {
    var fullscreen = false;

    $(".fullscreen").click(function() {
      if (fullscreen) {
        $("#image").css("display", "inline");
        $("#image").css("position", "relative");
        $("#image").css("height", "auto");
        $("#image").css("left", 0);
        $("#backdrop").hide();
        $(".btn.fullscreen").show();
        fullscreen = false;
      } else {
        $("#image").css("display", "block");
        $("#image").css("height", "100%");
        $("#image").css("width", "auto");
        $("#image").css("position", "absolute");
        $("#image").css("top", "0px");
        $("#image").css("left", parseInt((window.innerWidth - $("#image").width()) / 2) + "px");
        $("#image").css("z-index", "2");
        $("#backdrop").show();
        $(".btn.fullscreen").hide();
        fullscreen = true;
      }
      return fullscreen;
    });

}
