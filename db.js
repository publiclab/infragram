var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
 
var Image = new Schema({
    filename    : String,
    author      : String,
    title       : String,
    desc        : String,
    src         : String,
    thumb_src   : String, // thumbnail image
    orig_src    : String, // original image
    parent_id   : String, // this image based on the parent_id; default null?
    log         : String,
    updated_at  : Date
});
 
mongoose.model( 'Image', Image );

//Image.schema.path('desc').validate(function (value) {
  // example: //return /blue|green|white|red|orange|periwinkle/i.test(value);
  //return (value.split(' ').length > 1000);
//}, 'Description must be less than 1000 words');

mongoose.connect( 'mongodb://localhost/infragram' );
