// refactor to access state, not dom
module.exports = function Logger(options) {

  var log = []; // a record of previous commands run

  function log_mono() {
    var logEntry;
    logEntry = "mode=infragrammar_mono";
    logEntry += $("#m_exp").val() ? "&m=" + $("#m_exp").val() : "";
    logEntry += options.colorized ? "&c=true" : ""; // no way to succinctly store the colormap... just offer range of colorizations at view-time?
    return log.push(logEntry);
  }

  function log_hsv() {
    var logEntry;
    logEntry = "mode=infragrammar_hsv";
    logEntry += $("#h_exp").val() ? "&h=" + $("#h_exp").val() : "";
    logEntry += $("#s_exp").val() ? "&s=" + $("#s_exp").val() : "";
    logEntry += $("#v_exp").val() ? "&v=" + $("#v_exp").val() : "";
    return log.push(logEntry);
  }

  function log_rgb() {
    var logEntry;
    logEntry = "mode=infragrammar";
    logEntry += $("#r_exp").val() ? "&r=" + $("#r_exp").val() : "";
    logEntry += $("#g_exp").val() ? "&g=" + $("#g_exp").val() : "";
    logEntry += $("#b_exp").val() ? "&b=" + $("#b_exp").val() : "";
    return log.push(logEntry);
  }

  function save_log() {
    if (options.mode === "infragrammar_mono") {
      return log_mono();
    } else if (options.mode === "infragrammar_hsv") {
      return log_hsv();
    } else if (options.mode === "infragrammar") {
      return log_rgb();
    }
  }

  return {
    log: log,
    log_hsv: log_hsv,
    log_mono: log_mono,
    log_rgb: log_rgb,
    save_log: save_log
  }

}
