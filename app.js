// Module dependencies
var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    static = require('node-static'),
    app = express(),
    calculate = require('./services/calculate'),
    api = require('./services/api'),
    Q = require('q');

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

app.post('/currentLoc', function(req, res) {
    var location = req.body;
    api.getStops().done(function(stopData) {
        var closestStops = calculate.calculateDistance(location, stopData);
        api.getStopTimes().done(function(stopTimeData) {
            var selectedStops = calculate.selectedStopTimes(closestStops, stopTimeData),
                response = calculate.closestTimes(location, selectedStops);
            res.send(response);
        });
    });
});

//server listen
server.listen(port, function() {
  console.log('Express server listening on port ' + port);
});
