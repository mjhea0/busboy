var request = require('request'),
    moment = require('moment'),
    range = require('moment-range'),
    _ = require('underscore'),
    util = require('util');

//creates prototype to convert radii to distance
Number.prototype.toRad = function() {
  return this * Math.PI / 180;
};

//function for calculating distance
exports.calculateDistance = function (currentPlaceObj, stops) {
    var distanceFrom = Number,
        R = 3959, // m
        latitude = parseInt(currentPlaceObj.latitude, 10),
        longitude = parseInt(currentPlaceObj.longitude, 10),
        output = [];
    console.log('len: ', stops.length);
    _.each(stops, function(stop) {
        var stopLat = parseInt(stop['stop_lat'], 10),
            stopLon = parseInt(stop['stop_lon'], 10),
            dLat = (stopLat - latitude).toRad(),
            dLon = (stopLon - longitude).toRad();
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(latitude.toRad()) *
            Math.cos(stopLat.toRad()) *
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



