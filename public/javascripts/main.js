/**
Functions
**/
$(function() {

//setup for handlebars
var source   = $("#entry-template").html();
var template = Handlebars.compile(source);

//socket startup
var socket = io.connect();
socket.on('connect', function(){
    console.log('Hello the client is connected');
});

//variables
var geoObj ={};
var distanceFrom = 0.5;  //will be set by the client
var busData = [];

//finds current location
    var geoFindMe = function (distanceFrom, now) {
        if (!navigator.geolocation){
            console.log("Geolocation is not supported by your browser");
        }
        function success(position) {
            var latitude  = position.coords.latitude;
            var longitude = position.coords.longitude;
            geoObj = {
                lat : latitude,
                lon : longitude,
                distanceFrom : distanceFrom,
                time: now
            };
            socket.emit('currentLoc', geoObj);
            }
        function error() {
            console.error("Unable to retrieve your location");
        }
        navigator.geolocation.getCurrentPosition(success, error);
    };

    //socket event that receives data from server
    $('#refresh-button').on('click', function(){
        var tt = moment().format('HH:mm:ss');
        console.log(tt);
        geoFindMe(distanceFrom, moment().format('HH:mm:ss'));
        // TODO: change from setTimeout to promise/deferred
        setTimeout(function(){
            socket.on('stops', function(data){
                $('#body').empty();
                busData = _.sortBy(data, function(arr){
                    return arr['distance'];
                });
                if(busData.length > 0){
                    var context = {bus : busData};
                    var html = template(context);
                    $('#body').html(html);
                    $("#accordion").accordion({
                        collapsible: true
                    });
                }
                else{
                    $('#body').html('<h2>No buses nearby</h2>');
                }
            });
        }, 2000);
    });

    $("#accordion").accordion({
      collapsible: true
    });

    $('#refresh-button').on('click', function(){
        $('#busimg').addClass('animated wobble');
    });

    $(document).on('DOMNodeInserted', function(e){
        if (e.target.className == 'entry'){
            console.log('it appears');
            $('#refresh-button').text('refresh nearby bus search');
            $('#refresh-button').removeClass('btn-info').addClass('btn-success');
            $('#busimg').removeClass('animated wobble');
        }
    });
    

    // //progressbar timer
    // $('#refresh-button').on('click', function(){
    //     $('#progressbar').removeClass('hidden');
    //     var progressbar = $( "#progressbar" ),
    //       progressLabel = $( ".progress-label" );
     
    //     progressbar.progressbar({
    //       value: false,
    //       change: function() {
    //         progressLabel.text( progressbar.progressbar( "value" ) + "%" );
    //       },
    //       complete: function() {
    //         progressLabel.text( "Complete!" );
    //       }
    //     });
     
    //     function progress() {
    //       var val = progressbar.progressbar( "value" ) || 0;
     
    //       progressbar.progressbar( "value", val + 1 );
     
    //       if ( val < 99 ) {
    //         setTimeout( progress, 100 );
    //       }
    //     }
    //     setTimeout( progress, 3000 );
    // });
});