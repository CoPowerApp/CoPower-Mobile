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
  vm.chats = [];
  vm.chat = null;
  vm.getChats = null;
  vm.conflictTypes =
  ["Wage Negotiation",
  "Sexual Harassment",
  "General Harassment",
  "Scheduling Problems",
  "Discrimination",
  "Work Safety"];
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
        localStorage.user = user.toJSON();
        vm.globalFy("user",user);
        if(vm.user.get("store")){
          $state.go("app.home");
        } else{
          alert("No store found, please select which store you work at.");
          $state.go("app.selectStore");
        }
      },
      error: function(user, error) {
        // The login failed. Check error to see why.
        alert(error.message);
        console.log("error",error);
      }
    });
  };

  vm.globalFy = function(name,value){
    window[name] = value;
  };

  $scope.getChats = function(callback){
    var Conversation = Parse.Object.extend("Conversation");
    var query = new Parse.Query(Conversation);
    var conversations = [];
    query.equalTo("users", $scope.user.id);
    query.each(function(conversation) {
      var messages = [];
      var relation = conversation.relation("messages");
      var mQuery = relation.query();
      mQuery.include("sender");
      mQuery.include("recipient");
      return mQuery.each(function(message){
        messages.push(message);
      }).then(function() {
        var data = {
          conversation: conversation,
          messages: messages
        };
        
        conversations.push(data);
        
      });
      
    }).then(function(){
      //console.log(conversations);
      if(typeof callback == "function"){
        callback(conversations);
      }
      $scope.chats = conversations;
      $scope.chats.sort(function(a, b){
       return  b.conversation.get("updatedAt") - a.conversation.get("updatedAt");
      });
      for(var i in $scope.chats){
        $scope.chats[i].messages.sort(function(a, b){
          return  a.get("updatedAt") - b.get("updatedAt");
        });
      }
      if($scope.chat){
        for(var i in $scope.chats){
          if($scope.chats[i].conversation.id == $scope.chat.conversation.id){
            $scope.chat = $scope.chats[i];
          }
        }
      }
      $scope.$apply();
      $scope.globalFy("chats", conversations);
    }, function(error){
      console.log(error.message);
    });
  };

  $scope.selectChat = function(chat){
    console.log(chat);
    $scope.chat = chat;
    $scope.state.go("app.chat");
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
  $scope.$on('$ionicView.enter', function(e) {
    $scope.getChats();
  });
})
.controller('home', function($scope, $stateParams) {
  // $scope.$on('$ionicView.enter', function(e) {
  //   console.log("Setting history");
  //   $scope.fixHistory();
  // });
})
.controller('chat', function($scope, $stateParams) {
  $scope.message = {};
  $scope.sendMessage = function(){
      var Message = Parse.Object.extend("Message");
      var message = new Message();
      var data = $scope.message.data;
      if(!data){
        return false;
      }
      data = data.match(/.{1,40}/g).join(" <br/> ");
      console.log(data,$scope.chat);
      message.set("data", data);
      message.set("sender", $scope.user);
      if($scope.user != scope.chat.messages[0].get("sender"))
        message.set("recipient", scope.chat.messages[0].get("sender"));
      else
        message.set("recipient", scope.chat.messages[0].get("recipient"));
      message.save().then(function(){
        var conversation = $scope.chat.conversation;
        var relation = conversation.relation("messages");
        relation.add(message);
        conversation.save().then(function(user){
          console.log(user);
          $scope.message = {};
        },function(err){
          alert("Error sending message");
          console.log(err);
        });
      },function(err){
        alert("Error saving message");
        console.error(err);
      });
      
  };
  $scope.refresh = function(){
    $scope.getChats();
    $scope.$apply();
    $scope.timeout(function(){
      //console.log(scope);
      $scope.refresh();
      var lists = document.getElementsByClassName("list");
      for(var i in lists){
        document.querySelector("#Fix").children[0].id = "scrollTop";
        // // margin-bottom: 0px;max-height: 90%;height: calc( 98vh - 100px);overflow: scroll;
        // document.querySelector("#scrollTop").style.marginBottom = "0px";
        // document.querySelector("#scrollTop").style.maxHeight = "90%";
        // document.querySelector("#scrollTop").style.height = "calc( 98vh - 100px)";
        // //document.querySelector("#scrollTop").style.overflow = "scroll";
        document.querySelector("#scrollTop").scrollTop=99999;
        
      }
    },(window.location.hash=="#/app/chat")?1000:500000);
  };
  $scope.$on('$ionicView.enter', function(e) {
    console.log("Entered chat with ");
    $scope.refresh();
  });
})
.controller('conflictsNew', function($scope, $stateParams) {
  $scope.locals = [];
  $scope.title = "Conflict";
  $scope.$on('$ionicView.enter', function(e) {
    $scope.getLocals();
    console.log("Conflicts new.");
    $scope.globalFy("newScope",$scope);
    if($scope.conflict)
      $scope.title = $scope.conflictTypes[$scope.conflict.toJSON().type] + " Conflict";
  });
  $scope.sendUsingConvo = function(convo,msg,user1,user2){
      
      if(!convo){
        alert("Error making conversation");
      }
      var Message = Parse.Object.extend("Message");
      var message = new Message();
      var data = msg;
      if(!data){
        return false;
      }
      console.log(data,$scope.chat);
      message.set("data", data);
      message.set("sender", user1);
      message.set("recipient", user2);
      message.save().then(function(){
        console.log(convo);
        window.convo = convo;
        var relation = convo.relation("messages");
        relation.add(message);
        convo.save().then(function(user){
          $scope.getChats(function(chats){
            for(var chat in chats){
              try{
                if(chats[chat].conversation.id == convo.id){
                  console.log("======= we found it! =====");
                  $scope.selectChat(chats[chat]);
                  $scope.state.go("app.chat");
                }
              } catch(e){

              }
            }
          });
          console.log(user);

        },function(err){
          alert("Error sending message");
          console.log(err);
        });
      });
  };
  $scope.startConversation = function(person){
    console.log(person);
    var Conversation = Parse.Object.extend("Conversation");
    var query = new Parse.Query(Conversation);
    var doStuff = true;
    query.containsAll("users", [person.user.id, $scope.user.id]);
    query.find().then(function(results) {
        console.log("results");
      if(results.length > 0) {
        // conversation exists
        console.log("CONV FOUND");
        console.log(results);
        var str = $scope.user.get("username") +" wants to discuss " + $scope.conflictTypes[$scope.conflict.get("type")]+". Description: " + $scope.conflict.get("description");
        str = str.match(/.{1,40}/g).join(" <br/> ");
        console.log(results[0]);
        $scope.sendUsingConvo(results[0],str,$scope.user,person.user);
        return false;
      }
      
      var conversation = new Conversation();
      conversation.set("users", [person.user.id, $scope.user.id]);
      return conversation.save();
    }).then(function(conv){
      if(conv){
        var str = $scope.user.get("username") +" wants to discuss " + $scope.conflictTypes[$scope.conflict.get("type")]+". Description: " + $scope.conflict.get("description");
        str = str.match(/.{1,40}/g).join(" <br/> ");
        console.log(conv);
        $scope.sendUsingConvo(conv,str,$scope.user,person.user);
        
      }
      console.log("Successful conversation");
      console.log(conv);
    },function(err){
      alert("Error");
      console.log(err);
    });
  };
  $scope.logLocals = function(){
    console.log($scope.locals);
  };
  $scope.getLocals = function(){
    var Conflict = Parse.Object.extend("Conflict");
    var Store = new Parse.Object.extend("Store");
    var storeQuery = new Parse.Query(Store);
    var userStore = $scope.user.get("store");
    var userConflict = $scope.conflict;
    var similarConflicts = {};
    storeQuery.near("location", userStore.get("location"));
    storeQuery.limit(5);
    var conflictQuery = new Parse.Query(Conflict);
    conflictQuery.matchesQuery("store", storeQuery);
    conflictQuery.equalTo("type", userConflict.get("type"));
    conflictQuery.notEqualTo("objectId", userConflict.id);
    conflictQuery.notEqualTo("user", $scope.user);
    conflictQuery.include("user");
    conflictQuery.include("store");
    conflictQuery.each(function(conflict) {
      var data = {
        description: conflict.get("description"),
        user: conflict.get("user"),
        id: conflict.get("user").id,
        store: conflict.get("store")
      };
      similarConflicts[data.id] = data;
    }).then(function(data){
      console.log(similarConflicts);
      $scope.locals = similarConflicts;
      $scope.$apply();
    });
  };
})
.controller('conflictsAdd', function($scope, $stateParams) {
  // $scope.$on('$ionicView.enter', function(e) {
  //   console.log("Setting history");
  //   $scope.fixHistory();
  // });
  $scope.submitConflict = function(){
    console.log($scope.conflictType);
    console.log($scope.conflictTypes.indexOf($scope.conflictType.type));
      var Conflict = Parse.Object.extend("Conflict");
      var conflict = new Conflict();
      var type = $scope.conflictTypes.indexOf($scope.conflictType.type);
      var description = $scope.conflictType.description;
      if(type < 0){
        alert('Please select a conflict type');
        return false;
      }
      if(!description){
        alert('Please add a description');
        return false;
      }
      console.log($scope.user,$scope.user.score);
      conflict.set("type", type);
      conflict.set("description", description);
      conflict.set("user", $scope.user);
      conflict.set("store", $scope.user.get("store"));
      conflict.save().then(function(thing) {
          alert("Conflict successfully created");
          console.log("========Conflict========");
          console.log(thing);
          $scope.fixHistory();
          $scope.setConflict(thing);
          
      },function(err){
          alert("Conflict could not be saved!");
          console.error(err);
      });
  };
  $scope.conflictType = {};

  console.log("Conflicts Add.");
})
.controller('conflicts', function($scope, $stateParams) {
  $scope.conflicts = [];
  console.log("Setting conflict");
  $scope.$on('$ionicView.enter', function(e) {
    $scope.init();
    console.log($scope.conflicts);
    $scope.$apply();
  });
  $scope.init = function(){
    var Conflict = Parse.Object.extend("conflict");
    var query = new Parse.Query("Conflict");
    query.equalTo("user", $scope.user);
    query.find().then(function(result){
      console.log(result);
      $scope.conflicts = result;
      $scope.$apply();
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
        $scope.$apply();
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
      $scope.$apply();
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
  $scope.loading = false;
  $scope.conflictSearch = {};
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
        if(!$scope.heatmap){
          var heatmapD = new google.maps.visualization.HeatmapLayer({
            data: array,
            map: map
          });
          $scope.heatmap = heatmapD;
        }
        var heatmap = $scope.heatmap;
        $scope.globalFy("heatmap",heatmap);
        heatmap.setData(array);
        heatmap.set('gradient', gradient);
        heatmap.set('radius', 25);
        heatmap.set('opacity', 0.6);
        $scope.heatmap.setMap($scope.map);
        console.log("==========Loading Done ==========");
        $scope.loading = false;
        $scope.$apply();
  };
  $scope.updateType = function(){
    console.log($scope.conflictSearch.type,$scope.conflictTypes.indexOf($scope.conflictSearch.type));
    console.log("==========Loading Start ==========");
    $scope.loading = true;
    $scope.initialize();
    $scope.heatmap.setMap($scope.map);
  };
  $scope.getHeatMap = function(){
    var array = [];
    var Store = new Parse.Object.extend("Store");
    var type = $scope.conflictTypes.indexOf($scope.conflictSearch.type);
    var storeQuery = new Parse.Query(Store);
    var Conflict = Parse.Object.extend("Conflict");
    var storesWithCounts = [];
    storeQuery.each(function(store) {
      var conflictQuery = new Parse.Query(Conflict);
      conflictQuery.equalTo("store", store);
      if(type!=-1)
        conflictQuery.equalTo("type", type);
      return conflictQuery.find().then(function(conflicts) {
        // store conflict amount
        var data = {
          store: store,
          conflictCount: conflicts.length
        };

        console.log("Conflicts: "+conflicts.length);
        storesWithCounts.push(data);
      });
    }).then(function(){
      console.log(storesWithCounts);
      for (var i = 0; i < storesWithCounts.length; i++) {
        var star = storesWithCounts[i].store;
        //console.log(storesWithCounts[i].store.get("location")._latitude);
        if(star.get("location")){
          array.push(
            {
              location:
                new google.maps.LatLng(
                  (storesWithCounts[i].store.get("location")._latitude),
                  (storesWithCounts[i].store.get("location")._longitude)
                ),
              weight:
                storesWithCounts[i].conflictCount*5
            }
          );
        }
      }
      $scope.createHeatmap($scope.map,array);
      $scope.heatmap.setMap($scope.map);
    });
    console.log(array);
  };
  $scope.initialize = function(){
    console.log("Google maps done loading");
    if($scope.user){
      console.log("Attempting to get location data");
      $scope.getHeatMap();
      $scope.getLocationData(function(coords){
        console.log(coords);
        $scope.map.setCenter(new google.maps.LatLng(coords[0],coords[1]));
      }, function(err){
        alert("Could not get location data");
        console.error(err);
      });
    }
  };
  $scope.$on('$ionicView.enter', function(e) {
    var mapOptions = {
        center: new google.maps.LatLng(37.0005932,-122.0577319),
        zoom: 11,
        streetViewControl: false,
        disableDefaultUI:false,
        mapTypeControl:false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
    console.log(document.getElementById("map"));
    document.getElementById("map").innerHTML = "";
    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    $scope.globalFy("map",$scope.map);
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
