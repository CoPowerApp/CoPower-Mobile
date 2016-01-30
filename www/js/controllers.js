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
  vm.state = $state;
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
      user.set("username", $scope.newUserData.username);
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
