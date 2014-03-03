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
var Q = require("q");
var request = Q.denodeify(require('request'));
var util = require('util');

// Create server
var server = http.createServer(app);

// Start the web socket server
// var io = socketio.listen(server);

// Sets the port
var port = process.env.PORT || 3001;

// all environments
app.use(require('prerender-node'));
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

//routes
app.get('/', function (req, res){
	res.render('index');
});

// //socket events
// io.sockets.on('connection', function(socket){
//     console.log('sockets connected');

//     //takes current location from client and runs
//     //it against stops and send back nearby stops
//     socket.on('currentLoc', function(data){
//         var closestStops = [],
//             selectedStops = [],
//             response = [];
//         console.log('cs', calculate.stops);
//         closestStops = calculate.calculateDistance(data, calculate.stops);
//         selectedStops = calculate.selectedStopTimes(closestStops, calculate.stop_times);
//         response = calculate.closestTimes(data, selectedStops);
//         io.sockets.emit('stops', response);
//     });
// });

// Requests stop times from the API
var stop_times = request('http://busboy-api.herokuapp.com/api/stop_times', function(error, response, body) {
    if( error ) { console.error('ERROR in stop_times request'); }
    else if( response.statusCode === 200 ) {
        console.log('bs', body[1]);
        return body;
    }
});

// // Requests stops from the API
// var stops = []
// request('http://busboy-api.herokuapp.com/api/stops', function(error, response, body) {
//     if( error ) { console.error('ERROR in stop_times request'); }
//     else if( response.statusCode === 200 ) {
//         //console.log('bs1', body);
//         // console.log(body)
//         var test = body;
//     }
//     return(stops.push(test));
// });

// console.log(stops)



function getStops() {
  var response = request({
    uri: "http://busboy-api.herokuapp.com/api/stops",
    method: 'GET'
  })
  response.then(function (res) {
    if (res.statusCode >= 300) {
      throw new Error('Server responded with status code ' + res.statusCode)
    } else {
      // return res.body.toString()
      res[0].body.toString()
    }
  })
}


var test = getStops()

console.log(util.inspect(test))

app.post('/currentLoc', function(req, res) {
    var data = req.body,
        closestStops = [],
        selectedStops = [],
        response = [];
    closestStops = calculate.calculateDistance(data, getStops());
    selectedStops = calculate.selectedStopTimes(closestStops, calculate.stop_times);
    response = calculate.closestTimes(data, selectedStops);
    res.send(response);
});


//server listen
server.listen(port, function() {
  console.log('Express server listening on port ' + port);
});
