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

//creates prototype to convert radii to distance
Number.prototype.toRad = function() {
  return this * Math.PI / 180;
};

//function for calculating distance
function calculateDistance(obj, arr) {
    var R = 3959; // m
    var latitude = obj.lat;
    var longitude = obj.lon;
    var time = obj.time;
    var gTime = moment().zone(420).format('HH:mm:ss');
    console.log('gTime', gTime);
    //adjusted for GMT to MST
    var tenTime = moment().zone(420).add('m', 10).format('HH:mm:ss');
    var timeRange = moment().range(time, tenTime);
    var output = [];
    _.each(arr, function(arrObj){
        var dLat = (arrObj['stop_lat'] - latitude).toRad();
        var dLon = (arrObj['stop_lon'] - longitude).toRad();
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(latitude.toRad()) * Math.cos(arrObj['stop_lat'].toRad()) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        arrObj['distance'] = Math.round(d*100)/100;
        if((arrObj['distance'] <= obj['distanceFrom']) && (arrObj['arrival_time'] > gTime)  && (arrObj['arrival_time'] < tenTime)){
            output.push(arrObj);
        }
    });
    return output;
}

fs.readFile(__dirname + '/public/javascripts/mr_data.js',
    function (err, data){
        if(err){
            console.log(err);
        }
        var d = JSON.parse(data);
        mrdata = d;
    });

//socket events
io.sockets.on('connection', function(socket){
	console.log('sockets connected');

	//takes current location from client and runs
	//it against stops and send back nearby stops
	socket.on('currentLoc', function(data){
		stops = calculateDistance(data, mrdata);
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
