angular.module('coPower.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $cordovaGeolocation, $state, $ionicHistory) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  var vm = $scope;
  vm.store = "Walmart";
  vm.loginData = {};
  vm.user = null;
  vm.history = $ionicHistory;
  // Create the login modal that we will use later
  vm.getLocationData = function(success,error){
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
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
      return null;
    });
  };

  vm.login = function(){
    console.log(vm.loginData.username,vm.loginData.password);
    Parse.User.logIn(vm.loginData.username, vm.loginData.password, {
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
  vm.globalFy("scope",vm);

  // Perform the login action when the user submits the login form
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae',   id: 1   },
    { title: 'Chill',    id: 2   },
    { title: 'Dubstep',  id: 3   },
    { title: 'Indie',    id: 4   },
    { title: 'Rap',      id: 5   },
    { title: 'Cowbell',  id: 6   }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
  console.log($stateParams);
})

.controller('chats', function($scope, $stateParams) {
  console.log($stateParams);
  $scope.title = "Hello!";
  $scope.getLocationData(function(stuff){
    console.log("=============");
    console.log(stuff);
  });
})
.controller('home', function($scope, $stateParams) {
  $scope.title = "Walmart!";
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
