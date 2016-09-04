starter.controller("SignUpCtrl", function($scope, $http, $cordovaDevice, $localStorage, $location, AuthService) {

    $scope.formData = {};
    $scope.hasError = false;
    $scope.errorMsg = '';

    $scope.formHasErrors = function(formStateValid) {
        if(!formStateValid) {
            return true;
        } else {
            return 
              !(($scope.formData.password === $scope.formData.passwordConfirm) &&
              ($scope.formData.name.length > 0) &&
              ($scope.formData.email === $scope.formData.emailConfirm));
        }
    }; 

    $scope.submitForm = function(isValid) {

        // check to make sure the form is completely valid
        if (isValid) {

            var lang = AuthService.getLang();

            AuthService.signUp($scope.formData).then(function(response) {
                if (response.data.error) {
                    $scope.hasError = true;
                    $scope.errorMsg = response.data.message[lang];
                } else {
                    $location.url('/app/events')
                }
            });

        } else {
            alert('Não foram informados todos os dados.');
        }

    };

});