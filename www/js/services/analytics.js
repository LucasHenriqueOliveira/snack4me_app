starter.factory('GAService', function($http, $ionicPlatform, $localStorage, $cordovaGoogleAnalytics) {

  var gaCode = "UA-59282708-1";
  var userId = $localStorage.userId;
  var available = false;

  $ionicPlatform.ready(function(){
    if(typeof analytics !== "undefined") {
        $cordovaGoogleAnalytics.startTrackerWithId(gaCode);
        $cordovaGoogleAnalytics.setUserId(userId);
        available = true;
    } else {
        console.log("Google Analytics Unavailable");
    }
  });

  return {

    trackView: function(view) {
      if (available) $cordovaGoogleAnalytics.trackView(view);
    },

    trackEvent: function(category, action, label, value) {
      if (available) $cordovaGoogleAnalytics.trackEvent(category, action, label, value);
    },

    addTransaction: function(id, concession, revenue, tax) {
      if (available) $cordovaGoogleAnalytics.addTransaction(id, concession, revenue, 0, tax, 'USD');
    },

    addTransactionItem: function(id, product, sku, price, quantity) {
      if (available) $cordovaGoogleAnalytics.addTransactionItem(
        id, product, sku, 'Food', price, quantity, 'USD'
      );
    }
  };
  
});