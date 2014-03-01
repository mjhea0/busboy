/**
Functions
**/
$(function() {

//setup for handlebars
var source   = $("#entry-template").html();
var template = Handlebars.compile(source);

//socket startup
// var socket = io.connect();
// socket.on('connect', function(){
//     console.log('Hello the client is connected');
// });

//variables
var geoObj ={};
var busData = [];

// Sets distance from on the geoObj
geoObj.distanceFrom = 0.5; //$().val();

    // Finds current location
    // API works with browsers and Phonegap
    var geolocate = function () {
        if ( !navigator.geolocation ){
            console.log("Geolocation is not supported by your browser");
        }
        function success(position) {
            geoObj.latitude  = position.coords.latitude;
            geoObj.longitude = position.coords.longitude;

            $.post('currentLoc', geoObj);
            
            }

        function error() {
            console.error("Unable to retrieve your location");
        }

        navigator.geolocation.getCurrentPosition(success, error);
    };

    //socket event that receives data from server
    $('#refresh-button').on('click', function(){
        // Sets current time onto the geolocate object
        geoObj.time = moment().format('HH:mm:ss');
        
        geolocate();

        var busDataGet = $.get('/currentLoc', function(data){
                $('#body').empty();
                });

            $.when(busDataGet).then(
                _.sortBy(data, function(arr) {
                    return arr['distance'];
                })).done(
                    function() {
                        console.log(data);

                        if(data.length > 0){
                            var context = {bus : data};
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
        });

    // Sets the accordion ui from jQueryUI
    $("#accordion").accordion({
      collapsible: true
    });

    // Click event that enables the animated wobble on the bus
    $('#refresh-button').on('click', function(){
        $('#busimg').addClass('animated wobble');
    });

    // Listens for the accordion to be added then stops the bus
    // TODO: See if this can be changed if someone wants to reset
    $(document).on('DOMNodeInserted', function(e){
        if (e.target.className == 'entry'){
            console.log('it appears');
            $('#refresh-button').text('refresh nearby bus search');
            $('#refresh-button').removeClass('btn-info').addClass('btn-success');
            $('#busimg').removeClass('animated wobble');
        }
    });

});