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

var fs = require('fs');
var http = require('http');
var async = require('async');

var FILE_NAME_LIMIT = 128;
var ID_LENGTH_LIMIT = 64;
var NUMBER_LENGTH_LIMIT = 8;
var UPLOAD_PREFIX = './public/upload/';
var THUMBNAIL_SUFIX = '_thumb.jpg';

//var FILE_SIZE_LIMIT = 5242880; // 5MB
var FILE_SIZE_LIMIT = 16777216; // ~16MB
var FILE_CHUNK_SIZE = 131072; // 128kB
var FILE_CHUNK_BASE64_SIZE = FILE_CHUNK_SIZE * 2;

getValue = function (data, key, maxLen) {
    var value = '';
    if (key in data) {
        value = String(data[key]);
        if (maxLen > 0) {
            value = value.substring(0, maxLen);
        }
    }
    return value;
};

getFilename = function (data, noDate) {
    var date = Date.now();
    var name = (noDate) ? '' : date + '_';
    name += getValue(data, 'name', FILE_NAME_LIMIT).toLowerCase();
    name = name.replace(/[^a-z0-9]/g, '_');
    var n = name.lastIndexOf('_');
    if (n > -1) {
        name = name.substring(0, n) + '.' + name.substring(n + 1);
    }
    return name;
};

exports.onConnection = function (socket) {

    socket.on('image_send', function (data) {
        var strSize = getValue(data, 'size', NUMBER_LENGTH_LIMIT);
        var size = parseInt(strSize);
        if ((strSize == '') || (size > FILE_SIZE_LIMIT)) {
            socket.emit('image_done', {'error': 'File is too big. Size limit is 5MB.'});
        }
        else {
            var strData = getValue(data, 'data', FILE_CHUNK_BASE64_SIZE).split(',');
            strData = strData[strData.length - 1];
            var name = getFilename(data, !(strData == ''));
            var options = {encoding: 'binary', mode: 438, flag: 'a+'};
            fs.stat(UPLOAD_PREFIX + name, function (err, stats) {
                if (err) {
                    fs.appendFile(UPLOAD_PREFIX + name, '', options, function () {
                        socket.emit('image_request', {'name': name, 'chunk': FILE_CHUNK_SIZE});
                    });
                }
                else if (stats.size < size) {
                    var buffer = new Buffer(strData, 'base64');
                    fs.appendFile(UPLOAD_PREFIX + name, buffer, options, function () {
                        if (stats.size + buffer.length >= size) {
                            socket.emit('image_done', {'name': name});
                        }
                        else {
                            socket.emit('image_request', {'name': name, 'chunk': FILE_CHUNK_SIZE});
                        }
                    });
                }
                else {
                    socket.emit('image_done', {'error': 'File size mismatch.'});
                }
            });
        }
    });

    socket.on('thumbnail_start', function (data) {
        var name = getFilename(data, 'no_date') + THUMBNAIL_SUFIX;
        var callback = getValue(data, 'callback', 0);
        var buffer = getValue(data, 'data', FILE_SIZE_LIMIT).split(',');
        fs.writeFile(UPLOAD_PREFIX + name, buffer[buffer.length - 1], 'base64', function () {
            socket.emit('thumbnail_done', {'callback': callback});
        });
    });

    socket.on('base64_start', function (data) {
        var name = getFilename(data);
        var callback = getValue(data, 'callback', 0);
        var buffer = getValue(data, 'data', FILE_SIZE_LIMIT).split(',');
        fs.writeFile(UPLOAD_PREFIX + name, buffer[buffer.length - 1], 'base64', function () {
            socket.emit('base64_done', {'name': name, 'callback': callback});
        });
    });

    socket.on('duplicate_start', function (data) {
        var callback = getValue(data, 'callback', 0);
        var newName = getFilename(data);
        var existingName = getFilename(data, 'no_date');
        fs.open(UPLOAD_PREFIX + existingName, 'r', function (err, fd) {
            if (err) {
                socket.emit('duplicate_done', {'error': 'File not found.'});
            }
            else {
                var file = fs.createWriteStream(UPLOAD_PREFIX + newName);
                file.on('finish', function () {
                    socket.emit('duplicate_done', {'name': newName, 'callback': callback});
                });
                fs.createReadStream(UPLOAD_PREFIX + existingName, {'fd': fd}).pipe(file);
            }
        });
    });
};

exports.UPLOAD_PREFIX = UPLOAD_PREFIX;

exports.THUMBNAIL_SUFIX = THUMBNAIL_SUFIX;

exports.getFilename = getFilename;
