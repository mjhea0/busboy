// Module dependencies
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');
var static = require('node-static');
var app = express();
var socketio = require('socket.io');
var _ = require('underscore');
var moment = require('moment');
var range = require('moment-range');
var calculate = require('./services/calculate');

// Create server
var server = http.createServer(app);

// Start the web socket server
var io = socketio.listen(server);

// Sets the port
var port = process.env.PORT || 3001;

// all environments
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*
* TODO: move data manipulation to separate services js file
*
*/
var mrdata = [];
var distanceFrom = Number;
var stops = [];

//socket events
io.sockets.on('connection', function(socket){
	console.log('sockets connected');

	//takes current location from client and runs
	//it against stops and send back nearby stops
	socket.on('currentLoc', function(data){
		stops = calculate.calculateDistance(data, mrdata);
		io.sockets.emit('stops', stops);
	});

});

//routes
app.get('/', function (req, res){
	res.render('index');
});

//server listen
server.listen(port, function() {
  console.log('Express server listening on port ' + port);
});
