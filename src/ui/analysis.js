module.exports = function Analysis(options, save_infragrammar_inputs) {

  // buttons to run Analysis steps
  $("#infragrammar_hsv").submit(function() {
    options.mode = "infragrammar_hsv";
    options.logger.log_hsv();
    save_infragrammar_inputs();
    options.run(options.mode);
    return true;
  });

  $("#infragrammar").submit(function() {
    options.mode = "infragrammar";
    options.logger.log_rgb();
    save_infragrammar_inputs();
    options.run(options.mode);
    return true;
  });

  $("#infragrammar_mono").submit(function() {
    options.mode = "infragrammar_mono";
    options.logger.log_mono();
    save_infragrammar_inputs();
    options.run(options.mode);
    return true;
  });

}
