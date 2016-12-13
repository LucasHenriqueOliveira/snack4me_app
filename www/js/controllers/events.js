starter.controller('EventsCtrl', function($scope, $stateParams, $ionicPlatform, $cordovaGeolocation, DataService, GAService, CartService, $ionicHistory,$location,$ionicPopup,$localStorage) {

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



  $scope.vercpf = function(cpf) {
      cpf = cpf.replace(/[^\d]+/g,'');
      if(cpf == '') return false;
      // Elimina CPFs invalidos conhecidos
      if (cpf.length != 11 ||
          cpf == "00000000000" ||
          cpf == "11111111111" ||
          cpf == "22222222222" ||
          cpf == "33333333333" ||
          cpf == "44444444444" ||
          cpf == "55555555555" ||
          cpf == "66666666666" ||
          cpf == "77777777777" ||
          cpf == "88888888888" ||
          cpf == "99999999999")
          return false;
      // Valida 1o digito
      add = 0;
      for (i=0; i < 9; i ++)
          add += parseInt(cpf.charAt(i)) * (10 - i);
      rev = 11 - (add % 11);
      if (rev == 10 || rev == 11)
          rev = 0;
      if (rev != parseInt(cpf.charAt(9)))
          return false;
      // Valida 2o digito
      add = 0;
      for (i = 0; i < 10; i ++)
          add += parseInt(cpf.charAt(i)) * (11 - i);
      rev = 11 - (add % 11);
      if (rev == 10 || rev == 11)
          rev = 0;
      if (rev != parseInt(cpf.charAt(10)))
          return false;
      return true;
  };

    $scope.validarCPF = function(cpf) {

        if ($scope.vercpf(cpf))
        {
            return true;
        } else {
            errors = "1";
            if (errors){
                $ionicPopup.alert({
                    title: '',
                    template: 'CPF Invádido!'
                });
                return false;
            }

        }
    };



 $scope.getIntegration = function (event) {
     $scope.data = {};
     //ng-href="#/app/events/{{event.id}}/seats"
     $scope.selectEvent(event);

     if(event.integration == 0){

         var myPopup = $ionicPopup.show({
             template: '<input type="text" ng-model="data.cpf" autofocus>',
             title: 'Digite o seu CPF',
             scope: $scope,
             cssClass: 'customPopup', //se quiser colocar um estilo para o popup
             buttons: [
                 { text: 'Cancel' , onTap: function(e) { return false; } },
                 {
                     text: '<b>Save</b>',
                     type: 'button-positive',
                     onTap: function(e) {
                         return $scope.data.cpf || false;
                     }
                 }
             ]
         });

         myPopup.then(function(res) {

             if(res) {
                 if(!$scope.data.cpf) {
                     $ionicPopup.alert({
                         title: '',
                         template: 'CPF é obrigatório!'
                     });
                     return false;
                 }else{
                     if($scope.validarCPF($scope.data.cpf)){
                         $localStorage.cpf = $scope.data.cpf;
                         $location.path('/app/events/'+ event.id +'/seats');

                     }
                 }



             }
         });

     }else{
         var c = '29659859805';//retorno da api de integracao
         $localStorage.cpf = c;
         $location.path('/app/events/'+ event.id +'/seats');
     }

 }



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