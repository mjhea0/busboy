var request = require('request');
var Q = require('q');

// Requests stops from the API
exports.getStops = function() {
    var deferred = Q.defer();
    var options = {
        url: 'http://busboy-api.herokuapp.com/api/stops',
        json: true
    };
    request(options,
        function(error, response, body) {
            if( error ) {
                deferred.reject(new Error(error));
            } else if( response.statusCode === 200 ) {
                deferred.resolve(body);
            }
        });
    return deferred.promise;
};

// Requests stop times from the API
exports.getStopTimes = function() {
    var deferred = Q.defer();
    var options = {
        url: 'http://busboy-api.herokuapp.com/api/stop_times',
        json: true
    };
    request(options,
        function(error, response, body) {
            if( error ) {
                deferred.reject(new Error(error));
            } else if( response.statusCode === 200 ) {
                deferred.resolve(body);
            }
        });
    return deferred.promise;
};