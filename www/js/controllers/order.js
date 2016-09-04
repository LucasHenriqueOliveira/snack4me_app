starter.controller('OrderCtrl', function($scope, $stateParams, $location, AuthService, DataService) {

  $scope.baseUrlLogo = "http://www.snack4me.com/global/images/concessions/tiny/";
  $scope.qrCodeBaseUrl = 'http://chart.apis.google.com/chart?chs=150x150&cht=qr&chld=L|0&chl=http://www.snack4me.com/global/read.php?ve=';
  $scope.order = {};
  $scope.lang = AuthService.getLang();

  $scope.getOrderById = function() {
    var postData = {
      order: $stateParams.orderId,
      uuid: AuthService.getUUID(),
      email: AuthService.getEmail(),
      id: AuthService.getUserId(),
      token: AuthService.getToken()
    };

    DataService.getOrderById(postData).then(function(response) {
      if (response.data.error === false) {
        $scope.order = response.data.response;
      } else {
        // trata o erro
      }
    });
  };

  $scope.$on('$stateChangeSuccess', function () {
    $scope.getOrderById();
  });
});