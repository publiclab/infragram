module.exports = function Interface(options) {  

  var isVideo = false, isCamera=false; var isOnCam;

  options.imageSelector = options.imageSelector || "#image-container";
  options.fileSelector = options.fileSelector || "#file-sel";

  var urlHash = require('urlhash')();
  var logger = options.logger;
  var Colormaps = require('../color/colormaps');
  var Fullscreen, Presets, Analysis, Colorize, Saving;

  // saving inputs/expressions:

  function save_infragrammar_inputs() {
    options.mode = $('#modeSwitcher').val();
    return save_infragrammar_expressions({
      'r': $('#r_exp').val(),
      'g': $('#g_exp').val(),
      'b': $('#b_exp').val(),
      'm': $('#m_exp').val(),
      'h': $('#h_exp').val(),
      's': $('#s_exp').val(),
      'v': $('#v_exp').val()
    });
  }

  function save_infragrammar_expressions(args) {
    console.log(args);
    if (options.mode === "infragrammar") {
      options.processor.save_expressions(args['r'], args['g'], args['b']);
    } else if (options.mode === "infragrammar_mono") {
      options.processor.save_expressions(args['m'], args['m'], args['m']);
    } else if (options.mode === "infragrammar_hsv") {
      return options.processor.save_expressions_hsv(args['h'], args['s'], args['v']);
    }
  }

  $(document).ready(function() {

    Fullscreen = require('./fullscreen')(options);
    Presets = require('../ui/presets')(options, save_infragrammar_inputs);
    Analysis = require('../ui/analysis')(options, save_infragrammar_inputs);
    Colorize = require('../ui/colorize')(options);

    $(options.imageSelector).ready(function() {

      var src, idNameMap = {
        "#m_exp": "m",
        "#r_exp": "r",
        "#g_exp": "g",
        "#b_exp": "b",
        "#h_exp": "h",
        "#s_exp": "s",
        "#v_exp": "v"
      };

      $("#overlay-slider").val(localStorage.getItem("overlaySize"));
      console.log('grid ' + localStorage.getItem("overlaySize"));
      setGrid($("#overlay-slider").val());

      // TODO: broken:  
      //urlHash.setUrlHashParameter(JSON.stringify(idNameMap));
      src = urlHash.getUrlHashParameter('src');
      if (src) {
        params = parametersObject(location.search.split('?')[1]);
        options.mode = params['mode'];
        fetch_image(src);
      }
      return true;
    });

    $(options.fileSelector).change(function() {
      $('.choose-prompt').hide();
      $("#save-modal-btn").show();
      $("#save-zone").show();
      if ((this.files[0].type == 'image/jpeg')||(this.files[0].type == 'image/png')) {
        let reader = new FileReader();
        reader.onload = function onReaderLoad(event) {
          var img;
          img = new Image();
          img.onload = function onImageLoad() {
            options.processor.updateImage(this);
          };
          return img.src = event.target.result;
        };
        reader.readAsDataURL(this.files[0]);        
      }else{
        videoURL = URL.createObjectURL(this.files[0]);
        activateVideo(videoURL);


      }
      $('#preset-modal').offcanvas('show');
      $('#preset-modalMobile').offcanvas('show');
      return true;
    });
    $("#webcam-activate").click(function () {
      if(isVideo){
        $("video").remove();
        //$("#localVideo").remove();      
      }
      isVideo  = false;
      isCamera = true;
      $('.choose-prompt').hide();
      $("#save-modal-btn").show();
      $("#save-zone").show();
      save_infragrammar_inputs();
      options.video();
      $('#preset-modal').offcanvas('show');
      $('#preset-modalMobile').offcanvas('show');
      return true;
    });

    function activateVideo(videoURL) { 
     options.processLocalVideo();   
     if(isCamera){ 
      localStream.getVideoTracks()[0].stop();  
       }
      isCamera = false;
      $("#localVideo").remove();      
      localVideo = document.createElement('video');
      localVideo.setAttribute("id", "localVideo");
      localVideo.setAttribute("src", videoURL);        
      localVideo.load();
      localVideo.style.display = "none"               
      localVideo.style.width = "50px";   
      localVideo.style.height = "50px";    
      document.getElementById("video-container").appendChild(localVideo);
      localVideo.play();
      localVideo.muted = true;
      localVideo.loop = true;
      document.getElementById("localVideoControls").style.display="block";
      //Attach video Element tocustom Sleek Bar
      localVideo.ontimeupdate = function(){
        var percentage = ( localVideo.currentTime / localVideo.duration ) * 100;
        $("#custom-seekbar span").css("width", percentage+"%");
      };
      isVideo  = true;
      $('.choose-prompt').hide();
      $("#save-modal-btn").show();
      $("#save-zone").show();
      save_infragrammar_inputs();
      $('#preset-modal').offcanvas('show');
      $('#preset-modalMobile').offcanvas('show');
      return true;
    }

    //Start video controls
    $("#custom-seekbar").on("click", function(e){
      localVideo = document.getElementById('localVideo');
      var offset = $(this).offset();
      var left = (e.pageX - offset.left);
      var totalWidth = $("#custom-seekbar").width();
      var percentage = ( left / totalWidth );
      var vidTime = localVideo.duration * percentage;
      localVideo.currentTime = vidTime;
    }); 

    $("#localVideoPlayPause").on("click", function(e){
      localVideo = document.getElementById('localVideo');
      if (localVideo.paused){
       localVideo.play();
       document.getElementById("localVideoPlayPause").innerHTML = '<i class="fa fa-pause"></i>';             
     }else {
       localVideo.pause();
       document.getElementById("localVideoPlayPause").innerHTML = '<i class="fa fa-play"></i>'; 
     }
   }); 
    //End video controls

    $("#snapshot").click(function() {
      options.camera.getSnapshot();
      return true;
    });

    $("#modeSwitcher").change(function() {
      $("#infragrammar, #infragrammar_mono, #infragrammar_hsv").hide();
      $("#" + $("#modeSwitcher").val()).css("display", "inline");
      return true;
    });

    $("#overlay-btn").click(function() {
      $("#overlay-container").toggle();
      $("#overlay-controls-container").toggle();
      $("#overlay-btn").toggleClass("btn-success");
    });

    $("#overlay-slider").on("input", function() {
      setGrid($("#overlay-slider").val());
    });

    function setGrid(size) {
      var scale = 80, // roughly, not smaller than the viewport
          ratio = 1250/2000; // size of svg
          $("#overlay-img").width(size * scale);
          $("#overlay-img").height(size * scale * ratio);
          $("#overlay-size").html(size);
          console.log('saved grid ' + size);
        }

        $("#overlay-save-btn").click(function() {
          localStorage.setItem("overlaySize", $("#overlay-slider").val());
          $("#overlay-save-info").show().delay(2000).fadeOut();
        });

        $("[rel=tooltip]").tooltip()
        $("[rel=popover]").popover()
        return true;
      });

//Start Handle multiple webcam resolutions
function changeResolution(w, h){
  document.getElementById('image').setAttribute("width",w);
  document.getElementById('image').setAttribute("height",h);
}
$('#qvga').click(function(e){
  changeResolution('100px','100px')
});
$('#vga').click(function(e){
  changeResolution('800px','600px')
});
$('#hd').click(function(e){
  changeResolution('2400px','1800px')
})
$('#full-hd').click(function(e){
  changeResolution('6000px','4000px')
});
//End Handling of Multiple webcam resolutions

//Start Canvas Recording and Download

const canvas = document.getElementById('image');
const ctx = canvas.getContext('2d');
var x = 0;
const stream = canvas.captureStream(); // grab our canvas MediaStream
const rec = new MediaRecorder(stream); 

function exportVid(blob) {
  const vid = document.createElement('video');
  vid.src = URL.createObjectURL(blob);
  vid.controls = true;
  vid.style.display='none';
  document.body.appendChild(vid);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = vid.src;
  a.download = 'infragramVideo.mp4';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(vid.src);
  }, 100);
}
$('#startRecord').click(function(e){
  const chunks = [];

  rec.ondataavailable = e => chunks.push(e.data);
  rec.onstop = e => exportVid(new Blob(chunks, {type: 'video/h264'}));
  rec.start();
  document.getElementById('startRecord').style.display='none';
  document.getElementById('stopRecord').style.display='block';
})
$('#stopRecord').click(function(e){
  rec.stop();
  document.getElementById('stopRecord').style.display='none';
  document.getElementById('startRecord').style.display='block'; 
  document.getElementById('downloadButton').style.display='block'; 
})

//End Canvas Recording and Download

}
