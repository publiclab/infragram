var mongoose = require( 'mongoose' );
var Image     = mongoose.model( 'Image' );

/*
 * GET home page.
 */

exports.index = function(req, res){
  Image.find( function ( err, images, count ){
    res.render( 'index', {
      title : 'Infragram: online infrared image analysis',
      images : images
    });
  });
};

exports.show = function(req, res){
  Image.findOne({ _id: req.params.id }, 'src desc author orig_src created_at log', function (err, image) {
    if (err) return handleError(err);
    res.render( 'show', {
      image : image
    });
  })
};

exports.delete = function(req, res){
  Image.remove({ _id: req.params.id }, function (err, image) {
    if (err) return handleError(err);
    res.redirect('/');
  })
};

exports.create = function ( req, res ){
  new Image({
    title: req.body.title,
    author: req.body.author,
    desc: req.body.desc,
    log: req.body.log,
    orig_src: req.body.orig_src,
    src: req.body.src,
    updated_at : Date.now(),
  }).save( function( err, todo, count ){
    res.redirect( '/' );
  });
};
