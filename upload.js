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

var FILE_NAME_LIMIT = 128;
var ID_LENGTH_LIMIT = 64;
var SIZE_LENGTH_LIMIT = 8;
var URL_LENGTH_LIMIT = 256;
var UPLOAD_PREFIX = './public/upload/';
var THUMBNAIL_SUFIX = '_thumb.jpg';

var FILE_SIZE_LIMIT = 5242880; // 5MB
var FILE_CHUNK_SIZE = 131072; // 128kB

var activeFiles = {};

getValue = function (data, key, maxLen) {
    var value = '';
    if (key in data) {
        value = String(data[key])
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
    name = name.replace(/(?:[0-9]+_){2}/g, date + '_');
    var n = name.lastIndexOf('_');
    if (n > -1) {
        name = name.substring(0, n) + '.' + name.substring(n + 1);
    }
    return name;
};

exports.onConnection = function (socket) {
    socket.on('image_start', function (data) {
        var id = getValue(data, 'id', ID_LENGTH_LIMIT);
        var name = getFilename(data);
        var size = parseInt(getValue(data, 'size', SIZE_LENGTH_LIMIT));
        if (size < FILE_SIZE_LIMIT) {
            activeFiles[id] = {'name': name, 'size': size, 'uploaded': 0};
            socket.emit('image_request', {'uploaded': 0, 'chunk': FILE_CHUNK_SIZE, 'percent': 0});
        }
        else {
            socket.emit('image_done', {'error': 'File is too big. Size limit is 5MB.'});
        }
    });

    socket.on('image_send', function (data) {
        var id = getValue(data, 'id', ID_LENGTH_LIMIT);
        if (id in activeFiles) {
            var file = activeFiles[id];
            var buffer = getValue(data, 'data', FILE_CHUNK_SIZE);
            var options = {encoding: 'binary', mode: 438, flag: 'a'};
            fs.appendFile(UPLOAD_PREFIX + file['name'], buffer, options, function () {
                file['uploaded'] += buffer.length;
                var percent = Math.round((file['uploaded'] / activeFiles[id]['size']) * 100);
                socket.emit(
                    (file['uploaded'] < file['size']) ? 'image_request' : 'image_done',
                    {'name': file['name'], 'uploaded': file['uploaded'], 'chunk': FILE_CHUNK_SIZE, 'percent': percent}
                );
            });
        }
        else {
            socket.emit('image_done', {'error': 'Unknown session id.'});
        }
    });

    socket.on('thumbnail', function (data) {
        var name = getFilename(data, 'no_date') + THUMBNAIL_SUFIX;
        var buffer = getValue(data, 'data', FILE_SIZE_LIMIT).split(',');
        fs.writeFile(UPLOAD_PREFIX + name, buffer[buffer.length - 1], 'base64', function () {});
    });

    socket.on('base64_start', function (data) {
        var name = getFilename(data);
        var on_load = getValue(data, 'on_load', 0);
        var buffer = getValue(data, 'data', FILE_SIZE_LIMIT).split(',');
        fs.writeFile(UPLOAD_PREFIX + name, buffer[buffer.length - 1], 'base64', function () {
            socket.emit('base64_done', {'name': name, 'on_load': on_load});
        });
    });

    socket.on('url_start', function (data) {
        var url = getValue(data, 'url', URL_LENGTH_LIMIT);
        var protocol = url.split(':')[0]
        var on_load = getValue(data, 'on_load', 0);
        if (protocol == 'http' || protocol == 'https') {
            var name = getFilename(data);
            var file = fs.createWriteStream(UPLOAD_PREFIX + name);
            file.on('finish', function () {
                socket.emit('url_done', {'name': name, 'on_load': on_load});
            });
            url = url.replace(/https:\/\//g, 'http://');
            http.get(url, function (response) {
                response.pipe(file);
            }).on('error', function () {}).end();
        }
        else {
            var name = getFilename(data, 'no_date');
            socket.emit('url_done', {'name': name, 'on_load': on_load});
        }
    });
};

exports.UPLOAD_PREFIX = UPLOAD_PREFIX;

exports.THUMBNAIL_SUFIX = THUMBNAIL_SUFIX;
