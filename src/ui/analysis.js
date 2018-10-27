module.exports = function Analysis(options, save_infragrammar_inputs) {

  // buttons to run Analysis steps
  $("#infragrammar_hsv").submit(function() {
    console.log('hsv mode');
    options.mode = "infragrammar_hsv";
    options.logger.log_hsv();
    save_infragrammar_inputs();
    options.run(options.mode);
    options.run();
    return true;
  });

  $("#infragrammar").submit(function() {
    console.log('infragrammar mode');
    options.mode = "infragrammar";
    options.logger.log_rgb();
    save_infragrammar_inputs();
    options.run(options.mode);
    options.run();
    return true;
  });

  $("#infragrammar_mono").submit(function() {
    console.log('infragrammar mono mode');
    options.mode = "infragrammar_mono";
    options.logger.log_mono();
    save_infragrammar_inputs();
    options.run(options.mode);
    options.run();
    return true;
  });

}
