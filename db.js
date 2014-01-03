var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
 
var Image = new Schema({
    filename    : String,
    author      : String,
    desc        : String,
    src         : String,
    log         : [String],
    updated_at  : Date
});
 
mongoose.model( 'Image', Image );
mongoose.connect( 'mongodb://localhost/infragram' );
