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
var upload = require('./upload');
var maintenance = require('./maintenance');

var http = require('http');
var path = require('path');

var app = express();
var server = http.createServer(app);

var ioOptions = {
    rememberTransport: false,
    transports: ['WebSocket', 'AJAX long-polling']
};
var io = require('socket.io', ioOptions).listen(server, {log: false});

// all environments
app.set('port', process.env.PORT || 80);
//app.set('port', process.env.PORT || 8001);
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
app.get('/p/:page', routes.index);
app.get('/i/:id', routes.show);
app.get('/raw/:id', routes.raw);
app.post('/create', routes.create);
app.get('/delete/:id', routes.delete);
app.get('/static/sandbox/', function (req, res) { res.redirect('/sandbox/'); });
app.get('/sandbox/index-beta.html', function (req, res) { res.redirect('/sandbox/'); });
app.get('/sandbox/beta/', function (req, res) { res.redirect('/sandbox/'); });

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', upload.onConnection);
