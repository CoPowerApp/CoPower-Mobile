/**
 * Todo:
 * Build select store page

var Store = new Parse.Object.extend("Store");
var query = new Parse.Query(Store);
query.find().then(function(store){
  console.log(store);
  scope.user.set("store",store);
  scope.user.save().then(function(success){
console.log(success);
},function(err){
console.log(err);
});
})

 */



angular.module('coPower.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $cordovaGeolocation, $state, $ionicHistory) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  var vm = $scope;
  vm.store = "CoPower";
  vm.loginData = {};
  vm.user = null;
  vm.history = $ionicHistory;
  vm.state = $state;
  vm.timeout = $timeout;
  vm.conflict = null;
  // Create the login modal that we will use later
  vm.getLocationData = function(success,error){
    var posOptions = {timeout: 20000, enableHighAccuracy: false};
    $cordovaGeolocation
    .getCurrentPosition(posOptions)
    .then(function (position) {
      var lat  = position.coords.latitude;
      var long = position.coords.longitude;
      console.log("Got location data");
      if(typeof success == "function")
        success([lat,long]);
    }, function(err) {
      // error
      console.error("Error getting location data!");
      if(typeof error == "function")
        error(err);
      return null;
    });
  };

  vm.login = function(){
    console.log(vm.loginData.username,vm.loginData.password);
    Parse.User.logIn(vm.loginData.username.toLowerCase(), vm.loginData.password, {
      success: function(user) {
        // Do stuff after successful login.
        console.log("User",user);
        vm.user = user;
        vm.globalFy("user",user);
        $state.go("app.home");
      },
      error: function(user, error) {
        // The login failed. Check error to see why.
        console.log("error",error);
      }
    });
  };

  vm.globalFy = function(name,value){
    window[name] = value;
  };
  vm.fixHistory = function(){
    $ionicHistory.nextViewOptions({
        historyRoot: true,
        disableBack: true
    });
  };

  $scope.setConflict = function(conflict){
    $scope.conflict = conflict;
    console.log("==================");
    $scope.state.go("app.conflictsNew");
  };
  vm.globalFy("scope",vm);
})

.controller('chats', function($scope, $stateParams) {
  $scope.getLocationData(function(stuff){
    console.log("=============");
    console.log(stuff);
  });
})
.controller('home', function($scope, $stateParams) {
  // $scope.$on('$ionicView.enter', function(e) {
  //   console.log("Setting history");
  //   $scope.fixHistory();
  // });
})
.controller('', function($scope, $stateParams) {
  // $scope.$on('$ionicView.enter', function(e) {
  //   console.log("Setting history");
  //   $scope.fixHistory();
  // });
})
.controller('conflicts', function($scope, $stateParams) {
  $scope.conflicts = [];
  console.log("Setting conflict");
  $scope.$on('$ionicView.enter', function(e) {
    $scope.init();
    console.log($scope.conflicts);
  });
  $scope.init = function(){
    var Conflict = Parse.Object.extend("conflict");
    var query = new Parse.Query("Conflict");
    query.equalTo("user", $scope.user);
    query.find().then(function(result){
      console.log(result);
      $scope.conflicts = result;
    },function(err){
      console.log(err);
    });
  };
  $scope.logConflict = function(){
    console.log($scope.conflict,$scope.conflicts,$scope.selectedConflict,$scope.indexOfConflict);
  };
  console.log("Conflicting info");
})
.directive('clickForOptions', ['$ionicGesture', function($ionicGesture) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $ionicGesture.on('tap', function(e){

                // Grab the content
                var content = element[0].querySelector('.item-content');

                // Grab the buttons and their width
                var buttons = element[0].querySelector('.item-options');

                if (!buttons) {
                    console.log('There are no option buttons');
                    return;
                }
                var buttonsWidth = buttons.offsetWidth;

                ionic.requestAnimationFrame(function() {
                    content.style[ionic.CSS.TRANSITION] = 'all ease-out .25s';

                    if (!buttons.classList.contains('invisible')) {
                        console.log('close');
                        content.style[ionic.CSS.TRANSFORM] = '';
                        setTimeout(function() {
                            buttons.classList.add('invisible');
                        }, 250);                
                    } else {
                        buttons.classList.remove('invisible');
                        content.style[ionic.CSS.TRANSFORM] = 'translate3d(-' + buttonsWidth + 'px, 0, 0)';
                    }
                });     

            }, element);
        }
    };
}])
.controller('selectStore', function($scope, $stateParams) {
  console.log("Select Store");
  $scope.query = {};
  $scope.map = {};
  $scope.maxOptions = ["5 Mile", "10 Mile", "25 Mile", "50 Mile"];
  $scope.stores=[];
  $scope.addStoreToUser = function(store){
    console.log(store);
    if($scope.map[store.state][store.city][store.address]){
      $scope.user.set("store",$scope.map[store.state][store.city][store.address]);
      $scope.user.save({success:function(user){
        alert("Store set!");
        console.log(user);
      },error:function(err){
        console.error(err);
        alert("Could not set store");
      }});
    } else {
      alert("Couldn't find store");
    }
  };
  $scope.getStoresByQuery = function(){
    var cityStuff = [];
    if($scope.query.city){
      var hi = $scope.query.city;
      console.log(hi);
      for(var i in hi){
        if(hi[i].toJSON)
          cityStuff.push(hi[i].toJSON());
      }
      console.log(cityStuff);
      $scope.stores = cityStuff;
    }
  };
  $scope.getStoresNearMe = function(){
    var storesFound = [];
    var Store = new Parse.Object.extend("Store");
    var geoQuery = new Parse.Query(Store);
    if(!$scope.query.maxDistance){
      alert("Enter Max Distance");
      return false;
    }
    $scope.getLocationData(function(pos){
      geoQuery.withinMiles("location",  new Parse.GeoPoint({latitude:pos[0], longitude:pos[1]}),parseInt($scope.query.maxDistance,10));
      geoQuery.limit(20);
      geoQuery.find().then(function(stores){
        for(i=0; i<stores.length; i++) {
          var storeLocation = new Parse.GeoPoint();
          storeLocation = stores[i].get("location");
          var data = {
            lat: storeLocation.latitude,
            long: storeLocation.longitude,
            address: stores[i].get("address"),
            city: stores[i].get("city"),
            county: stores[i].get("county"),
            state: stores[i].get("state")
          };
          storesFound.push(data);
        }
        $scope.stores = storesFound;
        $scope.timeout(function(){
          $scope.$apply();
        },100);
        console.log($scope.stores);
      });
    }, function(err){
      console.error(err);
      alert("There was a problem getting your location!");
    });
  };
  $scope.populateMap = function(){
    var Store = new Parse.Object.extend("Store");
    var query = new Parse.Query(Store);
    var map = $scope.map;
    query.find().then(function(store){
      for (var i = 0; i < store.length; i++) {
        var st = store[i].toJSON();
        if(map[st.state]){
          if(map[st.state][st.city]){
            if(map[st.state][st.city][st.address]){
              //Already exists
            } else {
              map[st.state][st.city][st.address] = store[i];
            }
          } else {
            var obj = {};
            obj[st.address] = store[i];
            map[st.state][st.city] = obj;
          }
        } else {
          var obj = {};
          obj[st.address] = store[i];
          var obj2 = {};
          obj2[st.city] = obj;
          map[st.state] = obj2;
        }
      }
      var states = [];
      
      console.log(map,states);
    },function(err){
      console.log(err);
    });
  };

  $scope.logQuery = function(){
    console.log($scope.query);
  };
  $scope.$on('$ionicView.enter', function(e) {
    $scope.populateMap();
  });
})
.controller('search', function($scope, $stateParams) {
  $scope.createHeatmap = function(map,array){
        var gradient = [
         'rgba(50, 128, 255, 0)',
         'rgba(50, 128, 255, 0.5)',
          'rgba(50, 128, 255, 1)',
          'rgba(75, 128, 240, 1)',
          'rgba(100, 100, 200, 1)',
          'rgba(125, 75, 150, 1)',
          'rgba(150, 50, 100, 1)',
          'rgba(175, 50, 75, 1)',
          'rgba(175, 50, 75, 1)',
          'rgba(200, 50, 50, 1)',
          'rgba(200, 50, 50, 1)',
          'rgba(200, 50, 50, 1)',
          'rgba(200, 50, 28, 1)',
          'rgba(230, 50, 28, 1)',
          'rgba(230, 50, 28, 1)',
          'rgba(255, 28, 28, 1)',
          'rgba(255, 28, 28, 1)',
          'rgba(255, 28, 28, 1)'
        ];
        //#C42A2B
        
        var heatmap = new google.maps.visualization.HeatmapLayer({
          data: array,
          map: map
        });

        heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
        heatmap.set('radius', heatmap.get('radius') ? null : 25);
        heatmap.set('opacity', heatmap.get('opacity') ? null : 0.6);
  };
  $scope.initialize = function(){
    console.log("Google maps done loading");
    if($scope.user){
      console.log("Attempting to get location data");
      $scope.getLocationData(function(coords){
        console.log(coords);
        var latLng = new google.maps.LatLng(coords[0], coords[1]);
        //var array = [{location:latLng,weight:10},{location:new google.maps.LatLng(coords[0]-1, coords[1]-1),weight:1},{location:new google.maps.LatLng(coords[0]+1, coords[1]+1),weight:20}];
        var array = [];
        var Store = new Parse.Object.extend("Store");
        var query = new Parse.Query(Store);
        query.find().then(function(store){
          for (var i = 0; i < store.length; i++) {
            var st = store[i].toJSON();
            console.log(st);
            if(st.location){
              array.push({location:new google.maps.LatLng(st.location.latitude, st.location.longitude),weight:1});
            }
          }
          $scope.createHeatmap($scope.map,array);
        });
        
        console.log(array);
      }, function(err){
        alert("Could not get location data");
        console.error(err);
      });
    }
  };
  $scope.$on('$ionicView.enter', function(e) {
    console.log($scope.initialize);
    var mapOptions = {
        center: new google.maps.LatLng(37.0005932,-122.0577319),
        zoom: 15,
        streetViewControl: false,
        disableDefaultUI:false,
        mapTypeControl:false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
    console.log(document.getElementById("map"));
    document.getElementById("map").innerHTML = "";
    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    $scope.initialize();
  });
})
.controller('register', function($scope, $stateParams) {
  $scope.newUserData = {};
  $scope.registerUser = function(){
    console.log($scope.newUserData);
    if($scope.newUserData.password!=$scope.newUserData.passwordAgain){
      alert("Passwords are not the same");
      return false;
    } else {
      if(!$scope.newUserData.email){
        alert("invalid email");
        return false;
      }
      if(!$scope.newUserData.password){
        alert("Passwords must be at least 7 characters");
        return false;
      }
      if(!$scope.newUserData.username){
        alert("username must be at least 5 characters");
        return false;
      }
      var user = new Parse.User();
      user.set("username", $scope.newUserData.username.toLowerCase());
      user.set("password", $scope.newUserData.password);
      user.set("email", $scope.newUserData.email);
      user.signUp(null,{
        success:function(user){
          alert("Account created, going to login");
          $scope.state.go("app.login");
        },
        error:function(user,error){
          alert("Registation error: "+error.message);
        }
      });
    }
  };
  $scope.$on('$ionicView.enter', function(e) {
    console.log("Setting history");
    $scope.fixHistory();
  });
})
.controller('login', function($scope, $stateParams, $state) {
  var vm = $scope;
  $scope.$on('$ionicView.enter', function(e) {
    console.log(vm.history.viewHistory());
    console.log("Setting history");
    vm.fixHistory();
  });
});
