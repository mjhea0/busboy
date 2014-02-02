var request = require('request');
var moment = require('moment');
var range = require('moment-range');
var _ = require('underscore');

// Requests stop times from the API
exports.stop_times = request('http://busboy-api.herokuapp.com/api/stop_times', function(error, response, body) {
    if( error ) { console.error('ERROR in stop_times request'); }
    else if( response.statusCode === 200 ) {
        console.log(body);
        return body;
    }
});

// Requests stops from the API
exports.stops = request('http://busboy-api.herokuapp.com/api/stop_times', function(error, response, body) {
    if( error ) { console.error('ERROR in stop_times request'); }
    else if( response.statusCode === 200 ) {
        return body;
    }
});

//creates prototype to convert radii to distance
Number.prototype.toRad = function() {
  return this * Math.PI / 180;
};

//function for calculating distance
exports.calculateDistance = function (currentPlaceObj, stops) {
    var distanceFrom = Number;
    var R = 3959; // m
    var latitude = currentPlaceObj.lat;
    var longitude = currentPlaceObj.lon;
    var output = [];

    _.each(stops, function(stop) {
        var dLat = (stop['stop_lat'] - latitude).toRad();
        var dLon = (stop['stop_lon'] - longitude).toRad();
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(latitude.toRad()) * Math.cos(stop['stop_lat'].toRad()) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        stop['distance'] = Math.round(d*100)/100;
        if( stop['distance'] <= currentPlaceObj['distanceFrom'] ) {
            output.push(stop);
        }
    });
    console.log('stops', output);
    return output;
};

// TODO: need function to match output of calculate distance to actual stop times
exports.selectedStopTimes = function(selected_stops, stop_times) {
    var i = 0,
        stopIds = [],
        output = [];
    stopIds = _.pluck(selected_stops, 'stop_id');
    var lenStopId = stopIds.length;

    for( i; i < lenStopId; i+=1 ) {
        var id = stopIds[i];
        if(selected_stops[id]) {
            output.push(selected_stops[id]);
        }
    }
    console.log('seleS', output);
    return output;
};


exports.closestTimes = function(currentPlaceObj, selectedStops) {
    var output = [];
    var time = currentPlaceObj.time;
    var gTime = moment().zone(420).format('HH:mm:ss');
    console.log('gTime', gTime);
    //adjusted for GMT to MST
    var tenTime = moment().zone(420).add('m', 10).format('HH:mm:ss');
    var timeRange = moment().range(time, tenTime);

    _.each(selectedStops, function(selectedStop) {
        if(( selectedStop['arrival_time'] > gTime )  && ( selectedStop['arrival_time'] < tenTime )) {
            output.push(selectedStop);
        }
    });
    console.log('close', output);
    return output;
};


// fs.readFile(__dirname + '/public/javascripts/mr_data.js',
//     function (err, data){
//         if(err){
//             console.log(err);
//         }
//         var d = JSON.parse(data);
//         mrdata = d;
//     });



