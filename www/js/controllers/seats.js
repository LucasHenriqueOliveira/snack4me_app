starter.controller('SeatsCtrl', function($scope, $stateParams, $location, $ionicPopup, $ionicActionSheet, DataService, $translate, AuthService) {

 var mapInfo          = {}; // Define qual a hierarquia de lugares de dada arena ["level", "sector", "row", "seat"]
 var zoneCached       = {};
 $scope.selectedEvent = DataService.getSelectedEvent(); // Obtem o evento selecionado no controller EventsCtrl
 $scope.arenaConfig   = {}; // Configuracao de cadeiras na arena, lidas do backend
 $scope.seatInfo      = {}; // Informacoes sobre a cadeira que o usuario esta informando
 $scope.zoneTracking  = {};
 $scope.lang = AuthService.getLang();
 var cancelText = '';
 var buttonConfirmLocal = '';
 var textConfirmLocal = '';

 $translate('CANCEL').then(function(data) {
     cancelText = data;
 });
 $translate('BUTTON_CONFIRM_LOCAL').then(function(data) {
     buttonConfirmLocal = data;
 });
 $translate('TEXT_CONFIRM_LOCAL').then(function(data) {
     textConfirmLocal = data;
 });
 
 // Caso nao seja possivel obter o evento selecionado anteriormente, redireciona novamente para a Home
 if ($scope.selectedEvent.id === undefined) {
   $location.url('/app/events');
 };

 // Busca a configuracao com informacoes sobre assentos na arena
 DataService.getArenaConfig($stateParams.eventId).then(function(arenaConfig) {
   $scope.arenaConfig = arenaConfig;
   mapInfo = arenaConfig.map;
 });

 /*
  * Define a funcao para marcar o assento do usuario
 */

 $scope.markSeat = function(zone, value, index) {
    $scope.seatInfo[zone] = value;        // Marca uma informacao hierarquica. seatInfo['level'] = 'Especial'
    
    var zoneIndex = mapInfo.indexOf(zone);          // Obtem qual a ordem desta zona na hierarquia. 0, 1...
    mapInfo.forEach(function(key, keyIndex) {   
        if(zoneIndex < keyIndex) {              // Se a zona informada ainda nao e' o ultimo nivel, zera os niveis mais interiores
          delete $scope.seatInfo[key];
          delete $scope.zoneTracking[key];
        }
    });

    if (mapInfo.indexOf(zone) < mapInfo.length - 1) {
      zoneCached = ($scope.zoneTracking[zone]) ?  $scope.zoneTracking[zone][index] : $scope.arenaConfig[zone][index];
      var nextLevel = mapInfo[mapInfo.indexOf(zone)+1];
      $scope.zoneTracking[nextLevel] = zoneCached[nextLevel];
    }

    if ($scope.seatCompleteInformed()) {
      confirmSeatSheet();
    }

 }

 $scope.seatCompleteInformed = function() {
  return !($scope.seatInfo[mapInfo[mapInfo.length-1]] === undefined);
 };

 /*
  * Se mostra ou nao o label do setor na interface
 */
 $scope.showZoneLabel = function(zone) {
  if (zone === mapInfo[0] || $scope.zoneTracking[zone] !== undefined) {
      return true;
    } else {
      return false;
    }
 }

 /*
  * Obtenho a lista de elementos de uma determinada zona (level, sector, row, seat)
  * Utilizo um array cacheado com os itens, obtidos no momento da marcacao da zona ancestral a esta
 */
 $scope.getZoneItens = function(zone) {
    if (zone === mapInfo[0]) {
      return $scope.arenaConfig[zone];
    } else {
      return $scope.zoneTracking[zone];
    }
 }

 /*
  * Verifico se um determinado item esta escolhido
 */

 $scope.isSelected = function(zone, id) {
  return ($scope.seatInfo[zone]) ? $scope.seatInfo[zone].id === id : false;
 }

 $scope.isNotSelected = function(zone, id) {
  return !$scope.isSelected(zone, id);
 }

 /*
  * Diz se um determinado nivel (zona) e' o primeiro na hierarquia de lugares da arena
 */
 $scope.isFirstLevelZone = function(zone) {
  return mapInfo.indexOf(zone) == 0;
 }

 $scope.seatInfoDescription = function() {
  var info = [];
  mapInfo.forEach(function(zone) {
    info.push($scope.seatInfo[zone].label.toUpperCase());
  });
  return info.join('-');
 };

 /*
 * Exibe o action sheet para confirmacao do assento e vai a tela de produtos
 */
 var confirmSeatSheet = function() {
  $ionicActionSheet.show({
     buttons: [
       { text: buttonConfirmLocal }
     ],
     titleText:
        textConfirmLocal + '<br /><strong>' +
         $scope.seatInfoDescription() + 
         '</strong>',
     cancelText: cancelText,
     cancel: function() {
      delete $scope.seatInfo[mapInfo[mapInfo.length-1]];
     },
     buttonClicked: function(index) {
      DataService.selectSeat($scope.seatInfo);
      $location.url('/app/events/' + $stateParams.eventId + '/products');       
     }
   });
 };

 /*
  * Manipula as datas de forma mais humana
 */

 $scope.eventMoment = function(event) {
  var eventDay = moment(event.date + ' ' + event.schedule, "MM-DD-YYYY hh:mm");
  return eventDay.format('MMMM Do, h:mm A');
 };
  
});