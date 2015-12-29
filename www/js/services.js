var app_services = angular.module('heat.services', [])

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

app_services.factory('Level', function () {

  var level_json = {
    items: [
      {
        level: 0,
        image: 'img/level/level-0.jpg',
        name: 'assenza di dati'
      },
      {
        level: 1,
        image: 'img/level/level-1.jpg',
        name: 'traffico veloce'
      },
      {
        level: 2,
        image: 'img/level/level-2.jpg',
        name: 'traffico scorrevole'
      },
      {
        level: 3,
        image: 'img/level/level-3.jpg',
        name: 'traffico intenso'
      },
      {
        level: 4,
        image: 'img/level/level-4.jpg',
        name: 'traffico molto intenso'
      }
    ]
  };

  return level_json;

});

app_services.factory('Traffic', function ($localstorage, $http, turf, _, SEMINA, DB, pdb) {

  var db;
  var isDb = false;
  var _id;

  var data_db = {
      _id: '',
      _rev: '',
      traffic: {},
      parking: {}
  };

  var traffic_json = {

    get: function (force, callback_service) {

      async.series([

        // get id
        function (callback) {

          console.log('getting _id ...');

          var url = SEMINA._id;

          $http.get(url)
            .success(function (data, status, headers, config) {
              //handle success
              console.log('Success get _id: ' + JSON.stringify(data));
              data_db._id = data.TimestampAggiornamentoTraffico;
              console.log('_id:' + _id);
              callback(false, 'next');
            }).error(function (data, status, headers, config) {
              console.log('error to get id...');
              callback(true, 'next');
            });  
        },

        // open db
        function (callback) {

          console.log('open db ...');

          pdb.open(DB.name, function (db_istance) {
              db = db_istance;
              callback(false, 'next');
          });

        },

        // leggo il documento dal db
        function (callback) {

          console.log('getting document ...');

          if (!force) {
            _getdoc(pdb, db, data_db._id, function (isdbexist, data) {
              isDb = isdbexist;
              if (!isdbexist) {
                pdb.close(DB.name, function (err) {
                  if (!err) {
                      console.log('cancello il db...');
                      pdb.open(DB.name, function (db_istance) {
                        db = db_istance;
                        callback(false, 'next');
                      });    
                  } else {
                    callback(false, 'next');  
                  }
                });
              } else {
                traffic_json.data_db = data;
                callback(false, 'next');  
              }
              
            });

          } else {
            isDb = false;
            // azzero il database
            callback(false, 'next');
          };

        },

        // leggo i dai dal server SEMINA
        function (callback) {

          if (!isDb) {

            console.log('getting data from semina ...');

            var url = SEMINA.url;

            $http.get(url)
              .success(function (data, status, headers, config) {
                  //handle success
                  data_db.traffic = data;
                  console.log('Success.');
                  if (typeof callback === 'function') {
                    callback(false, 'next');
                  };
                }).error(function (data, status, headers, config) {
                  console.log('error ...');
                  if (typeof callback === 'function') {
                    callback(true, 'next');
                  }
                });
          } else {
            callback(false, 'next');
          } 
        },

        function (callback) {
          
          if (!isDb) {

              var url = SEMINA.parking;

              console.log('getting data for parking ...');

              $http.get(url)
                  .success(function (data, status, headers, config) {
                  //handle success
                  console.log('Success get parking ...');
                  data_db.parking = data;
                  callback(false, 'next');
                }).error(function (data, status, headers, config) {
                  console.log('error to get parking...');
                  callback(true, 'next');
                });
            } else {
              callback(false, 'next'); 
            }
        },

        // save data
        function (callback) {

          if (!isDb) {
            _save(pdb, db, data_db, callback)
          } else {
            callback(false, 'done');
          };

        }], function (err, results) {
          callback_service(err, data_db);
        });
    }
  };

  return traffic_json;

});

app_services.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}]);

function _getdoc(pdb, db, _id, callback) {
  
  pdb.get(db, _id, function(err, data) {
    if (!err) {
      console.log('documento trovato.');
      callback(true, data.data);
    } else {
      isDb = false;
      console.log('non ho trovato il documento.');
      callback(false, null);
    };
  });

};

function _save(pdb, db, data_db, callback) {
  
  console.log('saving data...');

  pdb.put(db, data_db, function (err, response) {
    //console.log('Response: ' + JSON.stringify(response));
    console.log('saved to db -> Err: ' + err + ' Response:' + JSON.stringify(response));
    callback(err, 'done');
  });

}


