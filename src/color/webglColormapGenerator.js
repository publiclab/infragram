// This is an attempt to generate Webgl shader.frag on the fly from a JSON file
// of colormaps from /src/color/colormaps.json

// from /dist/shader.frag, this is the function for creating a colormap:

/*
vec4 color_colormap(float n) {
  vec2 x = vec2(0.0, 0.5);                    // input value min and max for first pass
  vec3 y0 = vec3(0.0, 0.0, 255.0) / 255.0;    // min output val
  vec3 y1 = vec3(38.0, 195.0, 195.0) / 255.0; // max output val

  if ((n >= 0.5) && (n < 0.75)) {             // set range for second set of min/max inputs
    x = vec2(0.5, 0.75);                      // repeat input min/max
    y0 = vec3(0.0, 150.0, 0.0) / 255.0;       // min output val
    y1 = vec3(255.0, 255.0, 0.0) / 255.0;     // max output val
  } else if (n >= 0.75) {                     // set range for third set of min/max inputs
    x = vec2(0.75, 1.0);
    y0 = vec3(255.0, 255.0, 0.0) / 255.0;
    y1 = vec3(255.0, 50.0, 50.0) / 255.0;
  }

  // provide outputs; this is always the same for all colormaps
  return vec4(
      (n - x[0]) / (x[1] - x[0]) * (y1[0] - y0[0]) + y0[0],
      (n - x[0]) / (x[1] - x[0]) * (y1[1] - y0[1]) + y0[1],
      (n - x[0]) / (x[1] - x[0]) * (y1[2] - y0[2]) + y0[2],
      1.0);
}

// example colormap object:
  "greyscale": {
    "author": "publiclab",
    "description": "A simple linear greyscale colormap, black to white.",
    "url": "https://publiclab.org/colormaps#greyscale",
    "colormapRanges": [
      [0,     [0,   0,   0],   [255, 255, 255] ],
      [1,     [255, 255, 255], [255, 255, 255] ]
    ]
  }


*/

// start by returning this, but we can make another file to run this on 
// each colormaps.json entry and do something with the returned webgl syntax string
module.exports = function generateWebglColormapFunction(colormapName, colormapObject) {

  if (colormapObject.colormapRanges.length > 2) {
    colormapObject.colormapRanges.forEach(function(range, i) {
      var inMin = range[0],
          outMinR = range[1][0],
          outMinG = range[1][1],
          outMinB = range[1][2],
          outMaxR = range[2][0],
          outMaxG = range[2][1],
          outMaxB = range[2][2];
      if (i < colormapObject.colormapRanges.length - 1) inMax = colormapObject.colormapRanges[i + 1][0];
      else inMax = 1;

      if (i === 0) {

        // TODO: scale from 0-1 to 0-255 with 0.0 precision
        var fn = '\
vec4 ' + colormapName + '(float n) {\
  vec2 x = vec2('+inMin+', '+inMax+');                    // input value min and max\
  vec3 y0 = vec3('+outMinR+', '+outMinG+', '+outMinB+') / 255.0; // min output val\
  vec3 y1 = vec3('+outMaxR+', '+outMaxG+', '+outMaxB+') / 255.0; // max output val'

      } else {

        fn += '\
  if ((n >= ' + inMin + ') && (n < ' + inMax + ')) {             // input value min and max\
    x = vec2('+inMin+', '+inMax+');                    // input value min and max in vec2\
    y0 = vec3('+outMinR+', '+outMinG+', '+outMinB+') / 255.0; // min output val\
    y1 = vec3('+outMaxR+', '+outMaxG+', '+outMaxB+') / 255.0; // max output val'
  }';

      }
    });
  }

  // in the original, we used if/else so we do only one range comparison, 
  // but it's harder to concisely write, so here we're just doing a repeated if statement.

  // provide outputs; this is always the same for all colormaps\
  fn += 'vec4(\
      (n - x[0]) / (x[1] - x[0]) * (y1[0] - y0[0]) + y0[0],\
      (n - x[0]) / (x[1] - x[0]) * (y1[1] - y0[1]) + y0[1],\
      (n - x[0]) / (x[1] - x[0]) * (y1[2] - y0[2]) + y0[2],\
      1.0);\
}'

  return fn;
}
