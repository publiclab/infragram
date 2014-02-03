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

require('./db');

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');

var http = require('http');
var path = require('path');
var fs = require('fs');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// all environments
app.set('port', process.env.PORT || 8001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/i/:id', routes.show);
app.get('/raw/:id', routes.raw);
app.post('/create', routes.create);
app.get('/delete/:id', routes.delete);
app.get('/static/sandbox/', function (req, res) { res.redirect('/sandbox/'); });

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

getFilename = function (data, noDate) {
    var date = Date.now()
    var name = (noDate) ? '' : date + '_';
    if ('name' in data) {
        name += String(data['name']).substring(0, 128).toLowerCase();
        name = name.replace(/[^a-z0-9]/g, '_');
        name = name.replace(/(?:[0-9]+_){2}/g, date + '_');
        n = name.lastIndexOf('_');
        if (n > -1) {
            name = name.substring(0, n) + '.' + name.substring(n + 1);
        }
    }
    return name;
}

io.sockets.on('connection', function (socket) {
	socket.on('image', function (data) {
        var name = getFilename(data);
        if ('data' in data) {
            var buffer = String(data['data']);
            fs.writeFile('./public/upload/' + name, buffer, 'binary',  function () {
                socket.emit('done', {'name': name});
            });
        }
    });

    socket.on('thumbnail', function (data) {
        var name = getFilename(data, 'no_date') + '_thumb.jpg';
        if ('data' in data) {
            var buffer = String(data['data']).split(',');
            buffer = buffer[buffer.length - 1];
            fs.writeFile('./public/upload/' + name, buffer, 'base64',  function () {});
        }
    });

	socket.on('url', function (data) {
        var name = getFilename(data, 'no_date');
        if (('data' in data) && ('on_load' in data)) {
            var buffer = String(data['data']).substring(0, 256).split(':');
            if (buffer[0] == 'http' || buffer[0] == 'https') {
                buffer = 'http:' + buffer[buffer.length - 1];
                var file = fs.createWriteStream('./public/upload/' + name);
                file.on('finish', function () {
                    socket.emit('done_url', {'name': name, 'on_load': data['on_load']});
                });
                http.get(buffer, function (response) {
                    response.pipe(file);
                }).on('error', function () {}).end();
            }
            else {
                socket.emit('done_url', {'name': name, 'on_load': data['on_load']});
            }
        }
    });
});
