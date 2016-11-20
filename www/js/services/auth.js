starter.factory('AuthService', function($http, $localStorage, $cordovaOauth, $cordovaDevice, $timeout, $ionicHistory, $location, $q) {
  var DOCTRINE = "http://snack4me.com/hotel/snack4me_webapi/public/index.php/";

    var mergeDeviceInfo = function(formData) {
    if(ionic.Platform.isWebView()) {
        formData['device']   = $cordovaDevice.getDevice();
        formData['cordova']  = $cordovaDevice.getCordova();
        formData['model']    = $cordovaDevice.getModel();
        formData['platform'] = $cordovaDevice.getPlatform();
        formData['uuid']     = $cordovaDevice.getUUID();
        formData['version']  = $cordovaDevice.getVersion();        
    } else {
      formData['uuid'] = 'WEBTEST';
    }
    return formData;
  };
  
  return {
    signUp: function(formData) {
        
      var urlPost = "http://www.snack4me.com/hotel/customer-register.php";
      formData = mergeDeviceInfo(formData);
      var params = snack4meLib.toQueryString(formData);        
 
       return $http.post(urlPost, params,
        { headers: {'Content-Type': 'application/x-www-form-urlencoded'} }
       )
       .then(function(response) {
        if(response.data.error === false) {
            $localStorage.userId = response.data.response.customer_id;
            $localStorage.userName = formData.name;
            $localStorage.authToken = response.data.response.XSRF;
            $localStorage.uuid = formData.uuid;
        }
        return response;
       });

    },
    
    loginSnack4me: function(user) {    
    
      var urlPost = DOCTRINE + "customer";
      var formData = { email: user.email, password: user.password };
      formData = mergeDeviceInfo(formData);
      var params = snack4meLib.toQueryString(formData);

      return $http.post(urlPost, params,
        { headers: {'Content-Type': 'application/x-www-form-urlencoded'} }
       )
       .then(function(response) {
        if(response.data.error === false) {
            $localStorage.userId = response.data.response.id;
            $localStorage.email = response.data.response.email;
            $localStorage.userName = response.data.response.name;
            $localStorage.authToken = response.data.response.XSRF;
            $localStorage.userType = response.data.response.type;
            $localStorage.uuid = formData.uuid;
        }
        return response;
       });
    },

    loginFacebook: function() {
        /*
         * Primeiro conecta-se ao facebook e se obtem o token de authenticacao
        */

        $cordovaOauth.facebook("911400065561554", ["email"]).then(function(result) {
            $localStorage.fbAccessToken = result.access_token;

            /*
             * Depois solicito dados pessoais do usuario, enviando o token_access
            */
            $http.get("https://graph.facebook.com/v2.2/me", 
              { params: { access_token: $localStorage.fbAccessToken, fields: "id,name,email", format: "json" } })
            .then(function(result) {
              var formData = { name: result.data.name, email: result.data.email, type: 3 };
              formData = mergeDeviceInfo(formData);
              var params = snack4meLib.toQueryString(formData); 
              /*
               * Por ultimo, faco o login no snack4me
              */
              var urlPost = "http://www.snack4me.com/hotel/customer-social.php";
              $http.post(urlPost, params,
                { headers: {'Content-Type': 'application/x-www-form-urlencoded'} }
              )
              .then(function(response) {

                if(response.data.error === false) {
                    $localStorage.userId = response.data.response.id;
                    $localStorage.email = response.data.response.email;
                    $localStorage.userName = response.data.response.name;
                    $localStorage.authToken = response.data.response.XSRF;
                    $localStorage.userType = response.data.response.type;
                    $localStorage.uuid = formData.uuid;
                }

                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $location.path('/app/events');
                
              }, function(error) {
                alert("Login failure" + JSON.stringify(error));
                console.log(error);
              });

            }, function(error) {
              console.log(error);
            });

        }, function(error) {
            console.log(error);
        });
    },

    loginGoogle: function() {
      $cordovaOauth.google("1000165596977-6bcd1el1tio1cej27c5h5a8ped35ta6r.apps.googleusercontent.com", ["email"]).then(function(result) {
          $localStorage.gplusAccessToken = result.access_token;
          /*
           * Depois solicito dados pessoais do usuario, enviando o token_access
          */
          $http.get("https://www.googleapis.com/oauth2/v1/userinfo", 
            { params: { access_token: $localStorage.gplusAccessToken, alt: "json" } })
          .then(function(result) {

              var formData = { name: result.data.name, email: result.data.email, type: 3 };
              formData = mergeDeviceInfo(formData);
              var params = snack4meLib.toQueryString(formData); 
              /*
               * Por ultimo, faco o login no snack4me
              */
              var urlPost = "http://www.snack4me.com/hotel/customer-social.php";
              $http.post(urlPost, params,
                { headers: {'Content-Type': 'application/x-www-form-urlencoded'} }
              )
              .then(function(response) {

                if(response.data.error === false) {
                    $localStorage.userId = response.data.response.id;
                    $localStorage.email = response.data.response.email;
                    $localStorage.userName = response.data.response.name;
                    $localStorage.authToken = response.data.response.XSRF;
                    $localStorage.userType = response.data.response.type;
                    $localStorage.uuid = formData.uuid;
                }

                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $location.path('/app/events');
              }, function(error) {
                alert("Login failure" + JSON.stringify(error));
                console.log(error);
              });
          }, function(error) {
            alert("Login failure" + JSON.stringify(error));
            console.log(error);
          });

      }, function(error) {
          JSON.stringify(error)
      });
    },
    
    logout: function(callback) {
        delete $localStorage.userId;
        delete $localStorage.userName;
        delete $localStorage.authToken;
        delete $localStorage.uuid;
        delete $localStorage.email;
    },
    
    isLogged: function() {
        return ($localStorage.userId && $localStorage.authToken && $localStorage.email);
    },
    
    getToken: function() {
        return $localStorage.authToken;
    },

    getUUID: function() {
      return $localStorage.uuid;
    },

    getUserId: function() {
      return $localStorage.userId;
    },

    getEmail: function() {
      return $localStorage.email;
    },

    getUserName: function() { 
      return $localStorage.userName;
    },

    getLang: function() {
      return $localStorage.lang;
    }
  }    
});