starter.controller('OrdersCtrl', function($scope, $state, $location, AuthService, DataService) {

  $scope.STATE_SEARCHING = 1;
  $scope.STATE_SEARCH_DONE = 2;
  $scope.STATE_SEARCH_ERROR = 3;
  $scope.orders = [];
  $scope.lang = AuthService.getLang();

  $scope.getOrders = function() {
    $scope.state = $scope.STATE_SEARCHING;
    var params = {
      uuid: AuthService.getUUID(),
      token: AuthService.getToken(),
      email: AuthService.getEmail(),
      id: AuthService.getUserId()
    };

    DataService.getOrders(params).then(function(response) {
      if(response.data.error === false) {
        $scope.state = $scope.STATE_SEARCH_DONE;
        $scope.orders = response.data.response;
      } else {
        $scope.state = STATE_SEARCH_ERROR;
        // Trata o erro
      }
    });
  };

  $scope.$on('$stateChangeSuccess', function () {
    $scope.getOrders();
  });

});