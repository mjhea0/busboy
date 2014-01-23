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