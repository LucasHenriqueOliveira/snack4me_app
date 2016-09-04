starter.controller('PreferencesCtrl', function($scope, $localStorage, $translate, AuthService) {

    $scope.language = AuthService.getLang();

    $scope.ChangeLanguage = function(language){
        $translate.use(language);
        $localStorage.lang = language;
    };
});