starter.controller('ConfirmCtrl', function($scope, $state, $location, CartService, $ionicModal, $ionicHistory, $translate, $cordovaToast, GAService) {

  $scope.rating = 0;
  $scope.form = {};
  var tempRating = {};

  var qualityFood = $translate.instant('QUALITY_FOOD');
  var qualityService = $translate.instant('QUALITY_SERVICE');
  var waitingTime = $translate.instant('WAITING_TIME');

  $scope.ratings = [{
    current: -1,
    max: 5,
    text: qualityFood
  },
  {
    current: -1,
    max: 5,
    text: qualityService
  },
  {
    current: -1,
    max: 5,
    text: waitingTime
  }
  ];


  $scope.qrCodeBaseUrl = 'http://chart.apis.google.com/chart?chs=150x150&cht=qr&chld=L|0&chl=http://www.snack4me.com/global/read.php?ve=';
  $scope.orderConfirm = CartService.getOrderConfirm();

  CartService.startCart();
  $ionicHistory.clearCache();
  document.getElementById("coupon").value = "";

  $scope.continueOrdering = function(){
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $location.url('/app/events');
  };

  $ionicModal.fromTemplateUrl('rate-us.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  });

  $scope.openRating = function() {
    $scope.modal.show();
    GAService.trackEvent('Shopping Cart', 'Order', 'Open Rate-us', $scope.orderConfirm.id_order);
  };

  $scope.closeRating = function() {
    $scope.modal.hide();
  };

  $scope.getSelectedRating = function (rating, value) {
    tempRating[value] = rating;
  };

  $scope.saveRating = function() {

    var postData = {
      id_order: $scope.orderConfirm.id_order,
      comment: $scope.form.comment
    };

    var idx = 0;

    Object.keys(tempRating).forEach(function(prodId) {
      postData['rate_' + prodId] = tempRating[prodId];
      idx++;
    });

    CartService.submitRateUs(postData).then(function(response) {
      if(response.data.error === false) {
        $cordovaToast.show($translate.instant('THANK_RATE_US'), 'short', 'center');
        GAService.trackEvent('Shopping Cart', 'Order', 'Send Rate-us', $scope.orderConfirm.id_order);
      } else {
        $cordovaToast.show($translate.instant('ERROR_RATE_US'), 'short', 'center');
        GAService.trackEvent('Shopping Cart Error', 'Order', 'Not Send Rate-us', response.data.message);
      }
      postData = {};
      $scope.form = {};
      $scope.modal.hide();
    });
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  
});