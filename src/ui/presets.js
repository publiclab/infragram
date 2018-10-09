module.exports = function Presets(options, save_infragrammar_inputs) {

  // preset button
  $("#preset_raw").click(function() {
    $('#modeSwitcher').val("infragrammar").change();
    $('#r_exp').val("R");
    $('#g_exp').val("G");
    $('#b_exp').val("B");
    $('#preset-modal').modal('hide');
    options.colorized = false;
    save_infragrammar_inputs();
    return options.run(options.mode);
  });

  // preset button
  $("#preset_ndvi_blue").click(function() {
    $('#modeSwitcher').val("infragrammar_mono").change();
    $('#m_exp').val("(R-B)/(R+B)");
    $('#preset-modal').modal('hide');
    options.colorized = false;
    options.processor.decolorize();
    save_infragrammar_inputs();
    return options.run(options.mode);
  });

  // preset button
  $("#preset_ndvi_blue_color").click(function() {
    $('#modeSwitcher').val("infragrammar_mono").change();
    $('#m_exp').val("(R-B)/(R+B)");
    $('#preset-modal').modal('hide');
    save_infragrammar_inputs();
    options.colorized = true;
    options.run(options.mode);
    options.colorize();
    return options.run();
  });

  // preset button
  $("#preset_ndvi_red").click(function() {
    $('#modeSwitcher').val("infragrammar_mono").change();
    $('#m_exp').val("(B-R)/(B+R)");
    $('#preset-modal').modal('hide');
    options.colorized = false;
    options.processor.decolorize();
    save_infragrammar_inputs();
    return options.run(options.mode);
  });

  // preset button
  $("#preset_ndvi_red_color").click(function() {
    $('#modeSwitcher').val("infragrammar_mono").change();
    $('#m_exp').val("(B-R)/(B+R)");
    $('#preset-modal').modal('hide');
    save_infragrammar_inputs();
    options.colorized = true;
    options.run(options.mode);
    options.colorize();
    return options.run();
  });

}
