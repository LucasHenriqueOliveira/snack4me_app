starter.controller('CheckoutCtrl', function($scope, $location, $ionicHistory, $ionicPlatform, AuthService, DataService, CartService, GAService, $translate, $cordovaToast) {

  $scope.formData = {
    tip: 0.00
  };

  $scope.errors = [];
  $scope.locals = {};
  $scope.selectedEvent = DataService.getSelectedEvent();

  $scope.discounts = 0.0;
  $scope.couponApplied = false;
  $scope.lang = AuthService.getLang();
  var wordCoupon = '';
  var wordDiscount = '';

  $translate('COUPON').then(function(data) {
    wordCoupon = data;
  });

  $translate('DISCOUNT').then(function(data) {
    wordDiscount = data;
  });

  GAService.trackView('Shopping Cart');


  DataService.getLocalsOrder($scope.selectedEvent.id).then(function(data) {
    $scope.locals = data.response;
  });

  $scope.applyCoupon = function(coupon) {
    CartService.applyCoupon($scope.selectedEvent, coupon).then(function(response) {
      $scope.discounts = 0.0;
      if(response.data.error === false) {
        if (response.data.response) {
          $scope.formData.coupon = coupon;
          $scope.couponApplied = true;
          $scope.discounts = parseFloat(response.data.response);
          $scope.couponText = wordCoupon + coupon + ': ' + ($scope.discounts * 100) + '% ' + wordDiscount;
        } else {
          $scope.couponText = response.data.message[$scope.lang];
          $scope.formData.coupon = '';
        }
      } else {
        $scope.couponError = response.data.message;
        $scope.formData.coupon = '';
      }
    });
  };

  $scope.discountReadable = function() {
    if ($scope.discounts > 0) {
      return CartService.subtotal() * $scope.discounts;
    } else {
      return $scope.discounts;
    }
  };

  $scope.getServiceTaxesInValue = function() { 
    return CartService.subtotal() * $scope.getServiceTaxes();
  };

  $scope.getServiceTaxes = function() { 
    return DataService.getServiceTaxes();
  };

  $scope.subtotal = function() { 
    return CartService.subtotal();
  };

  $scope.totalOrder = function() {
    var subtotal = CartService.subtotal();
    return  subtotal + 
            (parseFloat($scope.discounts) * subtotal * -1) + 
            parseFloat($scope.formData.tip || 0) +
            parseFloat($scope.getServiceTaxesInValue());
  };

  $scope.getSeatDescription = function() { 
    var seatInfo = DataService.getSelectedSeat();
    var seatPath = [];
    Object.keys(seatInfo).forEach(function(k) {
      seatPath.push(seatInfo[k].label.toUpperCase());
    });
    return seatPath.join('-');
  };

  $scope.validateCCNumber = function() {
    // comentado para nao validar o cartao
    //$scope.formData.ccType = $.payment.cardType($scope.formData.ccNumber);
    //return $.payment.validateCardNumber($scope.formData.ccNumber);
    return true;
  };

  $scope.validateCVC = function() {
    // comentado para nao validar o cartao
    //return $.payment.validateCardCVC($scope.formData.ccSecurity, $scope.formData.ccType);
    return true;
  };

  $scope.validateCCExpiry = function() {
    // comentado para nao validar o cartao
    //if ($scope.formData.ccExpiry) {
    //  var ccExpiryObj = $.payment.cardExpiryVal($scope.formData.ccExpiry);
    //  $scope.formData.ccExpiryObj = ccExpiryObj;
    //  return $.payment.validateCardExpiry(ccExpiryObj.month, ccExpiryObj.year);
    //} else {
    //  return false;
    //}
    return true;
  };

  $scope.currentEvent = function() {
    return DataService.getSelectedEvent()
  };

  $scope.submitOrder = function() {
    var dateNow = new Date();
    var scheduleTime = '';

    if(typeof $scope.formData.schedule !== 'undefined') {
      scheduleTime = dateObj($scope.formData.schedule.getHours() + ':' + $scope.formData.schedule.getMinutes() + ':' + $scope.formData.schedule.getSeconds());

      if(scheduleTime < dateNow) {
        $cordovaToast.show($translate.instant('SCHEDULE_MESSAGE'), 'short', 'center');
        return false;
      }
    }

    GAService.trackEvent('Shopping Cart', 'Order', 'Submit Order', new Date());
    var orderData = {
      eventId: $scope.selectedEvent.id,
      coupon: $scope.formData.coupon,
      local: $scope.formData.local,
      schedule: $scope.formData.schedule,
      lang: AuthService.getLang(),
      seatPath: DataService.getSelectedSeat(),
      userId: AuthService.getUserId(),
      email: AuthService.getEmail(),
      name: AuthService.getUserName(),
      token: AuthService.getToken(),
      uuid: AuthService.getUUID()
    };

    var checkSchedule = CartService.checkSchedule($scope.formData.schedule);

    if(checkSchedule.error){
      var product = '';

      for(var i = 0; i < checkSchedule.response.length; i++) {
        product = product + "\n" + checkSchedule.response[i].name[$scope.lang] + ": " + checkSchedule.response[i].initial + $translate.instant('TO') + checkSchedule.response[i].final;
      }
      $cordovaToast.show($translate.instant('SCHEDULE_CHECKOUT') + product, 'short', 'center');
      return false;
    }

    /*
     * Primeiro envia dados para checkout
    */
    CartService.submitCheckout(orderData).then(function(response) {
      if(response.data.error === false) {
        orderData.orderId = response.data.response.id_order;
        GAService.trackEvent('Shopping Cart', 'Order', 'Order Created', orderData.orderId);
        GAService.addTransaction(orderData.orderId, CartService.subtotal(), DataService.getServiceTaxes());

        CartService.setOrderConfirm(response.data.response);
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $location.path('/app/confirm');

      } else {
        GAService.trackEvent('Shopping Cart Error', 'Order', 'Order not created', response.data.message);
        alert(response.data.message);
      }
    });

  };

  $scope.formHasErrors = function() {
    return !$scope.validateCCExpiry() ||
           !$scope.validateCCNumber() ||
           !$scope.validateCVC() ||
           !$scope.validateCCNumber();
  };

  (function() {
    $('#tip').priceFormat({
      prefix: '',
      centsSeparator: '.',
      thousandsSeparator: ',',
      onSet: function(value) {
        $scope.formData.tip = Number(value);
        $scope.$apply();
      }
    });

    $('#ccNumber').payment('formatCardNumber');
    $('#ccExpiry').payment('formatCardExpiry');
    $('#ccSecutiry').payment('formatCardCVC');

  })();

});