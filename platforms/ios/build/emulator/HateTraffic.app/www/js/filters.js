var filters = angular.module('heat.filters', []);

filters.filter("parking", function (Level, _, Geolocation) {

    return function (input) {

        var parking = '';

        if (typeof input !== 'undefined') {

            var p = _parking_free(input);

            if (!_parking(input)) {
                parking = '<em>Posti liberi esauriti<em>';   
            } else {
                parking = 'Ci sono ' + input.free + ' posti liberi';  
            };
            
        };

        return parking;
    };

});

filters.filter("parking_img", function (Level, _) {

    return function (input) {

        var parking = '';

        if (typeof input !== 'undefined') {

            if (!_parking(input)) {
                parking = 'img/parking/out.jpg';   
            } else {
                parking = 'img/parking/free.jpg';  
            };
            
        };

        return parking;
    };

});

function _parking(input) {

    var free = input.free;
    var out = input.out;
    var p = out - free;
    var isPark = false;

    if (p == 0) {
       isPark = false;  
    } else {
       isPark = true;  
    };

    return isPark;

};

function _parking_free(input) {

    var free = (input.free);
    var out = (input.total);
    var p = out - free;

    return p;

}

filters.filter("distance", function (Level, _, Geolocation) {

    return function (input) {

        var distance = '';

        // console.log('Location Filter: ' + JSON.stringify(input));

        if (typeof input !== 'undefined') {
            distance = Geolocation.distance(input.lat, input.lng) + ' km';
        };

        return distance;
    };

});

filters.filter("level_descr", function (Level, _) {

    return function (input) {

    	var descr = '';

        // console.log('input descr: ' + input)

    	if (typeof input !== 'undefined') {

            var l = _.find(Level.items, function (item) {
                return item.level == input;
            });

            if (typeof l !== 'undefined') {
                descr = l.name;
            };
    	};

    	return descr;
    };

});

filters.filter("level_image", function (Level, _) {
  
  return function (input) {

    // console.log('level color: ' + input);
    var image = '';

    if (typeof input !== 'undefined') {
      
    	var l = _.find(Level.items, function (item) {
            return item.level === input;
        });

        if (typeof l !== 'undefined') {
            image = l.image;
        };
    };

    return image;

  }

});