var fs = require('fs');
var request = require('request');

//creates prototype to convert radii to distance
Number.prototype.toRad = function() {
  return this * Math.PI / 180;
};

//function for calculating distance
calculateDistance = function calculateDistance(currentPlaceObj, stops) {
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
    return output;
};

// TODO: need function to match output of calculate distance to actual stop times

var closestStops = calculateDistance(geolocation, stops); //geolocation comes from socket event

exports.closestTimes = function (currentPlaceObj, stop_times) {
    var output = [];
    var time = currentPlaceObj.time;
    var gTime = moment().zone(420).format('HH:mm:ss');
    console.log('gTime', gTime);
    //adjusted for GMT to MST
    var tenTime = moment().zone(420).add('m', 10).format('HH:mm:ss');
    var timeRange = moment().range(time, tenTime);

    _.each(stop_times, function(stop_time) {
        if(( stop_time['arrival_time'] > gTime )  && ( stop_time['arrival_time'] < tenTime )) {
            output.push(stop_time);
        }
    });
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

var stop_times = request('http://busboy-api.herokuapp.com/api/stop_times', function(error, response, body) {
    if( error ) { console.error('ERROR in stop_times request'); }
    else if( response.statusCode === 200 ) {
        return body;
    }
});

var stops = request('http://busboy-api.herokuapp.com/api/stop_times', function(error, response, body) {
    if( error ) { console.error('ERROR in stop_times request'); }
    else if( response.statusCode === 200 ) {
        return body;
    }
});