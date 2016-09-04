starter.controller("AccountCtrl", function($scope, $ionicHistory, $location, AuthService) {
  $scope.userInfo = {};

  $scope.getUserInfo = function() {
    $scope.userInfo['uuid'] = AuthService.getUUID();
    $scope.userInfo['email'] = AuthService.getEmail();
    $scope.userInfo['token'] = AuthService.getToken();
    $scope.userInfo['userName'] = AuthService.getUserName();  
  };

  $scope.getUserInfo();

});