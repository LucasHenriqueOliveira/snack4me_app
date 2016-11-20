starter.controller('EventsCtrl', function($scope, $stateParams, $ionicPlatform, $cordovaGeolocation, DataService, GAService, CartService, $ionicHistory) {

 $scope.STATE_SEARCHING = 1;
 $scope.STATE_SEARCH_DONE = 2;
 $scope.STATE_SEARCH_ERROR = 3;
 $scope.STATE_SEARCH_USER = 4;
 $scope.SEARCH_TYPE_GPS = 1;
 $scope.SEARCH_TYPE_KEYBOARD = 2;

 $scope.baseUrlImage = 'http://www.snack4me.com/hotel/images/events/';
 $scope.baseUrlIcon  = 'img/ui/';

 $scope.state = $scope.STATE_SEARCHING;
 $scope.cityExpr = '';
 $scope.lastCitySearch = {}; // Para fazer cache da ultima cidade onde o usuario quis procurar

 CartService.startCart();
 $ionicHistory.clearCache();

 $scope.getEventsByGeolocation = function(lat, lon) {
  DataService.getEventsByGeolocation(lat, lon).then(function(events){
     $scope.events = events;
     $scope.state = $scope.STATE_SEARCH_DONE;
     $scope.$broadcast('scroll.refreshComplete');
   });
 };

 $scope.getEventsByCity = function(city) {
  DataService.getEventsByCity(city.id_city).then(function(events){
     $scope.lastCitySearch = city;
     $scope.events = events;
     $scope.state = $scope.STATE_SEARCH_DONE;
     $scope.$broadcast('scroll.refreshComplete');
   });
 };

 $scope.clearSearchBox = function() {
  document.getElementById('cityExpr').value = '';
  $scope.searchCity();
 };

 $scope.changeCity = function() {
  $scope.state = $scope.STATE_SEARCH_USER;
  $scope.lastCitySearch = {};
  $scope.events = [];
 };
 
 $scope.selectEvent = function(event) {
   GAService.trackView('Hotel: ' + event.name);
   DataService.selectEvent(event);
 };
 
 // Convert a date and time to human expression, like
 // 01-06-2015 19:30 as 'Today at 7h30 PM'
 $scope.eventMoment = function(event) {
  var nextWeek = moment().add(6, 'days');
  var eventDay = moment(event.date + ' ' + event.schedule, "MM-DD-YYYY hh:mm");
  return (eventDay.isAfter(nextWeek)) ? eventDay.fromNow() : eventDay.calendar();
 };

 /*
  * A busca por GPS falhou, entao sera apresentado um campo de busca por
  * cidades ao usuario. Nesse caso, busco a lista de cidades com eventos disponiveis
 */

 $scope.prepareSearchByKeyboard = function() {
  $scope.state = $scope.STATE_SEARCH_USER;
  $scope.searchType = $scope.SEARCH_TYPE_KEYBOARD;

  DataService.getCitiesWithEvents().then(function(cities){
     //Ordeno as cidades por ordem alfabetica
     $scope.cities = cities.sort(function(a, b) {
      var cityA = a.name_city.toLowerCase();
      var cityB = b.name_city.toLowerCase();
      if(cityA > cityB) return 1;
      if(cityA < cityB) return -1;
      return 0;
     });
  });

 };

 $scope.searchCity = function() {
  var cityExpr = document.getElementById('cityExpr').value;
  DataService.searchCities(cityExpr).then(
    function(matches) {
      $scope.cities = matches;
    }
  );
 };

 $ionicPlatform.ready(function () {
  $scope.getEvents = function() {
    $scope.events = [];
    $scope.state = $scope.STATE_SEARCHING;


    var posOptions = {enableHighAccuracy: false, timeout: 10000, maximumAge: 65000};

      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
      GAService.trackEvent('Search', 'Hotéis', 'Search hotels on device', 'By GPS');
      var lat  = position.coords.latitude;
      var lon = position.coords.longitude;

      $scope.searchType = $scope.SEARCH_TYPE_GPS;
        
      $scope.getEventsByGeolocation(lat, lon);
    }, function(err) {
          console.log(000);
      $scope.GPS_ERROR = err;
      if ($scope.lastCitySearch.id_city) {
        GAService.trackEvent('Search Error', 'Hotéis', 'Error searching hotels', 'By GPS');
        GAService.trackEvent('Search', 'Hotéis', 'Searching hotels on device', 'By City');
        $scope.getEventsByCity($scope.lastCitySearch);
      } else {
        $scope.prepareSearchByKeyboard();
      }
    });

    $scope.$on('$stateChangeSuccess', function () {
      $scope.getEvents();
    });
  };

  $scope.getEvents();

  
 });
 
});