/*
 This file is part of infragram-js.

 infragram-js is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 2 of the License, or
 (at your option) any later version.

 infragram-js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with infragram-js.  If not, see <http://www.gnu.org/licenses/>.
*/

var mongoose = require('mongoose');
var Image = mongoose.model('Image');

exports.index = function (req, res) {
  Image.find('title author created_at filename', function (err, images, count) {
    res.render('index', {
      title: 'Infragram: online infrared image analysis',
      images: images
    });
  });
};

exports.show = function(req, res){
  Image.findOne({ _id: req.params.id }, 'filename title desc author updated_at log', function (err, image) {
    if (err) return handleError(err);
    res.render('show', {
      image: image
    });
  })
};

exports.delete = function (req, res) {
  if (req.query.pwd == "easytohack") { // very temporary solution
    Image.findOne({_id: req.params.id}, 'filename', function (err, image) {
      if (err) return handleError(err);
      var upload = require('../upload');
      var fs = require('fs');
      var obj = image.toObject();
      fs.unlink(upload.UPLOAD_PREFIX + obj.filename, function () {});
      fs.unlink(upload.UPLOAD_PREFIX + obj.filename + upload.THUMBNAIL_SUFIX, function () {});

      Image.remove({ _id: req.params.id }, function (err, image) {
        if (err) return handleError(err);
        res.redirect('/');
      });
    });
  }
  else {
    res.redirect('/');
  }
};

exports.create = function (req, res) {
  new Image({
    filename: req.body.filename,
    title: req.body.title,
    author: req.body.author,
    desc: req.body.desc,
    log: req.body.log,
    updated_at: Date.now(),
  }).save(function (err, todo, count) {
    res.redirect('/');
  });
};
