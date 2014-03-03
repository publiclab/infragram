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
var upload = require('./upload');
var fs = require('fs');
var async = require('async');

var CLEANUP_INTERVAL = 300000; // 5 minutes in ms
var CLEANUP_TIME_THRESHOLD = 60000; //1 minute in ms
var CLEANUP_SIZE_THRESHOLD = 1024; // 1kB

// Clean up damaged files.
setInterval(function () {
        var time = Date.now();
        fs.readdir(upload.UPLOAD_PREFIX, function (err, list) {
            if (err) return console.log(err);
            async.forEach(list, function (diritem, cb) {
                fs.lstat(upload.UPLOAD_PREFIX + diritem, function (err, stats) {
                    if (err) return console.log(err);
                    var timeDiff = time - stats.ctime.getTime();
                    if ((stats.size < CLEANUP_SIZE_THRESHOLD) && (timeDiff > CLEANUP_TIME_THRESHOLD)) {
                        fs.unlink(upload.UPLOAD_PREFIX + diritem, function () {});
                    }
                });
            });
        });
    },
    CLEANUP_INTERVAL
);

// Clean up damaged db records.
setInterval(function () {
        Image
            .find()
            .where('filename').equals('')
            .select('_id')
            .exec(function (err, images) {
                async.forEach(images, function (image, cb) {
                    Image.remove({ _id: image._id }, function (err, image) {});
                });
            });
    },
    CLEANUP_INTERVAL
);
