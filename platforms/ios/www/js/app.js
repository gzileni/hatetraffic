// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('heat', ['ionic', 'ionic.service.core', 'ionic.service.push', 'ionic.service.analytics', 'heat.controllers', 'heat.services', 'heat.geolocation', 'heat.mapcontrollers', 'heat.filters', 'hate.db', 'ngCordova', 'underscore', 'turf', 'angular-momentjs', 'leaflet-directive', 'async', 'S', 'pouchdb'])

.run(function($ionicPlatform, Geolocation, $ionicAnalytics) {

  $ionicPlatform.ready(function() {

    $ionicAnalytics.register();

    Geolocation.watch();
    
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.constant('GEO', {
  timeout: 30000,
  zoom: 13
})

.constant('DB', {
  name: 'hate',
  parking: 'parking'
})

.constant('SHARE', {
  github: 'https://github.com/opendatabari/HateTraffic/raw/master/resources/splash.png',
  www: 'http://opendatabari.github.io/HateTraffic'
})

.constant('SEMINA', {
  url: 'http://bari.opendata.planetek.it/traffico/v1.0/TrafficService.svc/REST/statoPoi/?ascDesc=ASC&orderBy=STATOTRAFFICO&timeZone=UTC',
  _id: 'http://bari.opendata.planetek.it/traffico/v1.0/TrafficService.svc/REST/dataUltimoAggiornamento/?timeZone=IT',
  parking: 'http://bari.opendata.planetek.it/parcheggi/1.0/Parcheggi.svc/REST/parcheggi'
})

.config(function($momentProvider){
  $momentProvider
    .asyncLoading(false)
    .scriptUrl('lib/moment/moment.js');
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $ionicAppProvider) {

  $ionicConfigProvider.tabs.position('bottom');

  $ionicAppProvider.identify({
    // The App ID (from apps.ionic.io) for the server
    app_id: '276f388b',
    // The public API key all services will use for this app
    api_key: '384fae4a7346872c2c70b116789fcf2505949529c81a0208',
    // The GCM project ID (project number) from your Google Developer Console (un-comment if used)
    gcm_id: '109085790401'
  });

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.heatmap', {
    url: '/heatmap',
    views: {
      'tab-heatmap': {
        templateUrl: 'templates/tab-heatmap.html',
        controller: 'HeatMapCtrl'
      }
    }
  })

  .state('tab.list', {
    url: '/list',
    views: {
      'tab-list': {
        templateUrl: 'templates/tab-list.html',
        controller: 'HeatMapListCtrl'
      }
    }
  })

  .state('tab.login', {
    url: '/login',
    views: {
      'tab-airq': {
        templateUrl: 'templates/tab-login.html',
        controller: 'LogInCtrl'
      }
    }
  })

  .state('tab.info', {
    url: '/info',
    views: {
      'tab-info': {
        templateUrl: 'templates/tab-info.html',
        controller: 'InfoCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/login');

});
