// Snack4me App

angular.module('starter', ['ionic', 'ngCordova', 'ngStorage', 'ngCordovaOauth', 'ngIOS9UIWebViewPatch', 'pascalprecht.translate'])

.run(function($rootScope, $ionicPlatform, $ionicLoading, $translate, $localStorage) {

  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on('loading:show', function() {
    $ionicLoading.show(
      {
        content: '',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 300,
        showDelay: 10
      }
    );
  });

  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide();
  });

  if($localStorage.lang) {
    $translate.use($localStorage.lang);

  } else if(typeof navigator.globalization !== "undefined") {
    navigator.globalization.getPreferredLanguage(function(language) {
      $translate.use((language.value).split("-")[0]).then(function(data) {
        $localStorage.lang = (language.value).split("-")[0];
        console.log("SUCCESS -> " + data);
      }, function(error) {
        console.log("ERROR -> " + error);
      });
    }, null);
  } else {
    $localStorage.lang = "pt";
  }
})

.config(function($httpProvider, $stateProvider, $urlRouterProvider, $translateProvider, $ionicConfigProvider) {

  $ionicConfigProvider.backButton.previousTitleText(false);
  $ionicConfigProvider.backButton.text('');

  $translateProvider.useStaticFilesLoader({
    prefix: 'locales/',
    suffix: '.json'
  });
  $translateProvider.preferredLanguage("pt");
  $translateProvider.fallbackLanguage("pt");

  $httpProvider

  .interceptors.push(function($q, $rootScope) {
    return{
      request: function(config) {
        $rootScope.$broadcast('loading:show');
        return config;
      },
      response: function(response) {
        $rootScope.$broadcast('loading:hide');
        return response;
      },
      requestError: function(rejection) {
        if (rejection.code !== 404) {
          alert('Request error ' + rejection.data);
          console.log(rejection)
        }
        $rootScope.$broadcast('loading:hide');
        return $q.reject(rejection);
      },
      responseError: function(rejection) {
        $rootScope.$broadcast('loading:hide');
        return $q.reject(rejection);
      }
    }

  });

  $stateProvider

      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })

      .state('signup', {
        url: '/signup',
        templateUrl: 'templates/signup.html',
        controller: 'SignUpCtrl'
      })

      .state('app', {
        url: "/app",
        templateUrl: "templates/menu.html",
        controller: 'AppCtrl'
      })

      .state('terms', {
        url: '/terms',
        templateUrl: "templates/terms.html"
      })

      .state('app.use', {
        url: '/use',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "templates/use.html"
          }
        }
      })

      .state('app.account', {
        url: '/account',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "templates/account.html",
            controller: 'AccountCtrl'
          }
        }
      })

      .state('app.preferences', {
        url: '/preferences',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "templates/preferences.html",
            controller: 'PreferencesCtrl'
          }
        }
      })

      .state('app.confirm', {
        url: '/confirm',
        views: {
          'menuContent': {
            templateUrl: "templates/confirm.html",
            controller: 'ConfirmCtrl'
          }
        }
      })

      .state('app.orders', {
        url: '/orders',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "templates/orders.html",
            controller: 'OrdersCtrl'
          }
        }
      })

      .state('app.order', {
        url: '/order/:orderId',
        views: {
          'menuContent': {
            templateUrl: "templates/order.html",
            controller: 'OrderCtrl'
          }
        }
      })

      .state('app.events', {
        url: "/events",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "templates/events.html",
            controller: 'EventsCtrl'
          }
        }
      })

      .state('app.seats', {
        url: "/events/:eventId/seats",
        views: {
          'menuContent': {
            templateUrl: "templates/seats.html",
            controller: 'SeatsCtrl'
          }
        }
      })

      .state('app.products', {
        url: "/events/:eventId/products",
        views: {
          'menuContent': {
            templateUrl: "templates/products.html",
            controller: 'ProductsCtrl'
          }
        }
      })

      .state('app.product', {
        url: "/product",
        views: {
          'menuContent': {
            templateUrl: "templates/product.html",
            controller: 'ProductCtrl'
          }
        }
      })
      .state('app.checkout', {
        url: "/checkout",
        cache: false,
        views: {
          'menuContent': {
            templateUrl: "templates/checkout.html",
            controller: 'CheckoutCtrl'
          }
        }
      });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app');
});

var starter = angular.module('starter');
