
var app = angular.module('coPower', ['ionic', 'coPower.controllers','ngCordova'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
        }
      }
    })
    .state('app.chats', {
      url: '/chats',
      views: {
        'menuContent': {
          templateUrl: 'templates/chats.html',
          controller: 'chats'
        }
      }
    })
    .state('app.login', {
      url: '/login',
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html',
          controller: 'login'
        }
      }
    })
    .state('app.home', {
      url: '/',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html',
          controller: 'home'
        }
      }
    })
    .state('app.register', {
      url: '/register',
      views: {
        'menuContent': {
          templateUrl: 'templates/register.html',
          controller: 'register'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/');
}).config(function () {
  Parse.initialize("1e7weWiU3snwOoff1Lx9cEiztHxn844QSiW9B03W", "bmxKUUJpmX4MppY9LvQEYlGMuivzDsKiI1aZByX7");
});
