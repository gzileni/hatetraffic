/*!
 * Copyright 2014 Giuseppe Zileni
 * http://giuseppezileni.github.io
 *
 * Ionic, v1.0.0
 * http://ionicframework.com/
 *
 * By @gzileni
 *
 * Licensed under the MIT license. Please see LICENSE for more information.
 *
 */

var mapctrl = angular.module('heat.mapcontrollers', ['leaflet-directive']);

mapctrl.controller('HeatMapCtrl', function ($scope, $stateParams, Geolocation, leafletData, S, $ionicLoading, Traffic, async, GEO) {
  	
  	var location;
  	var marker; 
	var layer;
	var map;
	var markers = [];
	
	showSpinner(true, 'refresh data ...');

    angular.extend($scope, {
		defaults: {
	        scrollWheelZoom: false
	    }
	});

    _init_map();
		
	_refresh_position();

	function _load() {

		console.log('loading data ...');
		Traffic.get(false, function (err, data) {
			// console.log('Data: ' + JSON.stringify(data.data));
			// data_heatmap = data.traffic;
			_heatmap(data.traffic);
			_add_parking(data.parking);
		});
	};

	function _add_parking(data) {

		markers = [];

		async.each(data, function(item, callback) {

			leafletData.getMap('map').then(function(map) {

				var parkIcon = L.icon({
				    iconUrl: 'img/parking/parking_icon.png',
				    iconSize: [24, 24],
				    shadowSize:   [24, 24], // size of the shadow
    				iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    				shadowAnchor: [4, 62],  // the same for the shadow
    				popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
				});

				var lat = parseFloat(S(item.PosizioneGeografica.Latitudine).replaceAll(',', '.').s);
				var lng = parseFloat(S(item.PosizioneGeografica.Longitudine).replaceAll(',', '.').s);

				var ll = L.latLng(lat, lng);

				console.log('coordinate parking: ' + item.PosizioneGeografica.Latitudine + ',' + item.PosizioneGeografica.Longitudine);

				var b = '<h2>' + item.NomeParcheggio + '</h2><br />' +
					    '<p> Numero Posti Liberi: ' + Number(item.DatiVariabili.NumPostiLiberi) + '<br />' +
					    'Distanza: ' + Geolocation.distance(Number(item.PosizioneGeografica.Latitudine), Number(item.PosizioneGeografica.Longitudine)) + 'km </p>';

				var marker = L.marker(ll, {
					icon: parkIcon
				});

				marker.addTo(map).bindPopup(b);

				markers.push(marker);

				
			});

		}, function (err) {

		});

	};

    function showSpinner (view, message) {

	    var msg = '<ion-spinner icon="lines"></ion-spinner>';

	    if (typeof message !== 'undefined') {
	      msg = message;
	    };

	    if (view) {  
	      $ionicLoading.show({
	          template: msg
	      });
	    } else {
	      $ionicLoading.hide();
	    }
  	};

  	var _callback_geolocation_success = function (position) {
	    console.log('getting position: ' +  JSON.stringify(position));
	    Geolocation.save(position);
	    _refresh_position();
	};

	var _callback_geolocation_error = function (error) {
	    console.error('code: '    + error.code    + '\n' +
	                  'message: ' + error.message + '\n');

	};

  	Geolocation.watch(_callback_geolocation_success, _callback_geolocation_error);

	function _refresh_position () {

		_load();

		location = Geolocation.location();

		if (location.latitude != 0 && location.longitude != 0) {
			console.log('**** Center ' + location.latitude + ',' + location.longitude);
		};

		leafletData.getMap('map').then(function(map) {

			if (marker) {
				map.removeLayer(marker);
			};

			var ll = L.latLng(location.latitude, location.longitude);

			marker = L.userMarker(ll, {
				pulsing: true, 
				accuracy: 100, 
				smallIcon: true,
				opacity: 0.2
			});
			marker.addTo(map);

			map.setView([location.latitude, location.longitude], GEO.zoom);
				
			map.invalidateSize();
			
			
		});

	}

    // Initialize Map
	function _init_map () {

		showSpinner(true, 'initializing map ...');

		leafletData.getMap('map').then(function(map) {

			console.log('init map ...');

			var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
			var osmAttribution = 'Map data © OpenStreetMap contributors, CC-BY-SA';
			var osm = new L.TileLayer(osmUrl, {
				maxZoom: 18, 
				attribution: osmAttribution
			}).addTo(map);

			showSpinner(false);

		});

	};

	function _heatmap (data) {

		showSpinner(true, 'I Hate Traffic ...');

		var addressPoints = [];

		var config = {
			minOpacity: 0.4,
			maxZoom: 18,
			max: 4,
			radius: 64,
			blur: 20,
			gradient: {
				0.4: 'green', 
				0.6: 'yellow', 
				0.85: 'lime', 
				1: 'red'
			} 
		}

		async.each(data, function (item, callback) {

			var address = [Number(item.Poi.Latitudine), Number(item.Poi.Longitudine), Number(item.ValoreIndiceTempoPercorrenza)];
		  	addressPoints.push(address);

			callback();

		}, function (err) {

			if (!err) {

				// console.log('address point: ' + JSON.stringify(addressPoints));

				leafletData.getMap('map').then(function(map) {
					
					if (layer) {
						map.removeLayer(layer);
					};

					layer = L.heatLayer(addressPoints, config).addTo(map);
					showSpinner(false);
				});
				
			};

		});

		showSpinner(false);
	};
});

mapctrl.controller('HeatMapListCtrl', function ($scope, $stateParams, Geolocation, leafletData, S, $ionicLoading, Traffic, async, GEO, _, $cordovaSocialSharing, Level, SHARE) {

	var location;
	var parking = {
		name: '',
		park: {
			free: 0,
			out: 0
		},
		time: '',
		location: {
			latitude: 0,
			longitude: 0
		}
	};

	showSpinner(true);
	
	$scope.$on('$ionicView.beforeEnter', function() {
    	$scope.refresh(false);
    });

    $scope.share = function (type, item) {

	    var message = '';
	    var image = '';
	    var link = '';
	    var descr = '';

	    var l = _.find(Level.items, function (item_data) {
            return item_data.level === item.ValoreIndiceTempoPercorrenza;
        });

        if (typeof l !== 'undefined') {
            descr = l.name;
        };
	    
	    // {"NumTransiti":1,"Poi":{"Codice":"VIALE_EUROPA_001","Descrizione":"Viale Europa, Canalone verso San Paolo","Latitudine":41.1239585876465,"Longitudine":16.8316326141357},"Timestamp":{"TimestampAggiornamentoTraffico":"2015-06-26T21:20:39Z","TimestampRichiesta":"2015-06-26T21:20:57Z"},"ValoreIndiceTempoPercorrenza":2}

	    message = item.Poi.Descrizione + '\n' + descr;

		image = SHARE.github;
		link = SHARE.www;
	    
	    console.log(message + '\n' + image + '\n' + link);

	    if (type === 'facebook') {
	      $cordovaSocialSharing
	        .shareViaFacebook(message, image, link)
	        .then(_success_share, _error_share);
	    } else if (type === 'twitter') {
	      $cordovaSocialSharing
	        .shareViaTwitter(message, image, link)
	        .then(_success_share, _error_share);
	    } else if (type === 'whatsapp') {
	      $cordovaSocialSharing
	      .shareViaWhatsApp(message, image, link)
	      .then(_success_share, _error_share);
	    }
  	};

    function showSpinner (view, message) {

	    var msg = '<ion-spinner icon="lines"></ion-spinner>';

	    if (typeof message !== 'undefined') {
	      msg = message;
	    };

	    if (view) {  
	      $ionicLoading.show({
	          template: msg
	      });
	    } else {
	      $ionicLoading.hide();
	    }
  	};

  	$scope.refresh = function (force) {

  		$scope.view_error = false;
		showSpinner(true, 'refresh data ...');
		location = Geolocation.location();

        Traffic.get(force, function (err, data) {
        	
        	if (!err) {
        		// console.log('Data: ' + JSON.stringify(data));

				var d_sorted = _.sortBy(data.traffic, function (item) {
					return Geolocation.distance(Number(item.Poi.Latitudine), Number(item.Poi.Longitudine));
				});

				// console.log('data sorted n.' + _.size(d_sorted));

				var d_filtered = _.filter(d_sorted, function (item) {
					return Number(item.ValoreIndiceTempoPercorrenza) > 0;
				});

				// console.log('data filtered n.' + _.size(d_filtered));

				$scope.trafficlist = d_filtered;

				// -------------------
				// Parcheggi

				var d_sorted = _.sortBy(data.parking, function (item) {
					return Geolocation.distance(item.PosizioneGeografica.Latitudine, item.PosizioneGeografica.Longitudine);
				});

				console.log('Parking: ' + JSON.stringify(d_sorted[0]));
        		
				parking = {
					name: d_sorted[0].NomeParcheggio,
					park: {
						free: Number(d_sorted[0].DatiVariabili.NumPostiLiberi),
						out: Number(d_sorted[0].DatiVariabili.NumPostiOccupati),
						total: Number(d_sorted[0].NumeroPosti)
					},
					time: d_sorted[0].OraAggiornamento,
					location: {
						lat: parseFloat(S(d_sorted[0].PosizioneGeografica.Latitudine).replaceAll(',', '.').s),
						lng: parseFloat(S(d_sorted[0].PosizioneGeografica.Longitudine).replaceAll(',', '.').s)
					}
				};

				$scope.parking = parking;

			} else {
				$scope.view_error = true;
				$scope.error = 'Non riesco a leggere i dati dei sensori.<br />';
			};

			showSpinner(false);
		});

	};

});

