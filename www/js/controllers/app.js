starter.controller('AppCtrl', function($rootScope, $state, $ionicHistory, $location, AuthService, $scope) {

  	if(AuthService.isLogged()) {		
		$location.path('/app/events');
	} else {
		$location.path('/login');
	}

	$scope.logout = function() {
		AuthService.logout();
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$location.path('/login');
	};

});