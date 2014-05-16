
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var app = express();

var server = http.Server(app);
var io = require('socket.io').listen(server, { log: false }); // socket.io 0.9.x

//because I changed this to use a method in order to pass the variable io
var routes = require('./routes')(io);
var user = require('./routes/user');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/gettwets', routes.getTwets);
app.get('/stoptwets', routes.stopTwets);

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
