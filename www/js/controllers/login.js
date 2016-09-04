starter.controller("LoginCtrl", function($scope, $ionicHistory, $localStorage, $location, AuthService, $ionicModal) {

	$scope.user = {};

	if(AuthService.isLogged()) {
		$ionicHistory.nextViewOptions({
	  		disableBack: true
		});
		$location.path('/app/events');
	}

	var lang = AuthService.getLang();

	$scope.loginSnack4me = function() {
		AuthService.loginSnack4me($scope.user).then(function(response) {
			if(response.data.error) {
	            $scope.hasError = true;
	            $scope.errorMsg = response.data.message[lang];
				$scope.user.password = '';
			} else {
				$scope.user = {};
				$scope.modal.hide();
				$scope.errorMsg = '';
				$ionicHistory.nextViewOptions({
		  			disableBack: true
				});
				$location.path('/app/events');
			}
		});
	};

	$ionicModal.fromTemplateUrl('templates/login-snack4me.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal
	});

	$scope.loginWithSnack4me = function() {
		$scope.modal.show();
	};

	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});

	$scope.loginFacebook = function() {
		AuthService.loginFacebook();
	};

	$scope.loginGoogle = function() {
		AuthService.loginGoogle();
	};
	
    $scope.signUp = function() {
    	$location.path("/signup");
    };

	$scope.termsUse = function(){
		$location.path("/terms");
	};

});