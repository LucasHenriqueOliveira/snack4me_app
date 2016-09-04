starter.controller('ProductCtrl', function($scope, $ionicHistory, $location, $cordovaToast, DataService, CartService, AuthService, $ionicModal, $translate, $ionicScrollDelegate, GAService) {
  $scope.baseUrlLogo   = 'img/brands/';
  $scope.baseUrlProd   = 'http://www.snack4me.com/hotel/events';
  $scope.currentProduct = DataService.getCurrentProduct();
  //$scope.currentConcession = DataService.getCurrentConcession();
  $scope.selectedEvent = DataService.getSelectedEvent();
  $scope.lang = AuthService.getLang();
  $scope.type_products = {};
  $scope.currentTypeProduct = '';
  $scope.form = {};

  $scope.backToProducts = function() {
    $ionicHistory.goBack();
  };

  GAService.trackEvent('Shopping Cart', 'Products', 'View Product', $scope.currentProduct.id);

  $scope.checkProductUnavailable = function(hour_initial, hour_final) {

    if(hour_initial != '00:00' && hour_final != '00:00'){
      var now       = new Date();
      var startDate = dateObj(hour_initial + ':00');
      var endDate   = dateObj(hour_final + ':00');

      var unavailable = now <= endDate ? false : true;
      return unavailable;
    } else{
      return false;
    }
  };

  $scope.addToCart = function(product) {

    if($scope.checkProductUnavailable(product.hour_initial, product.hour_final)){
      var time = product.hour_initial + $translate.instant('TO') + product.hour_final + '.';
      $cordovaToast.show($translate.instant('PRODUCT_UNAVAILABLE') + time, 'short', 'center');
      return false;
    }

    if(CartService.canAddProduct(product)) {
      GAService.trackEvent('Shopping Cart', 'Products', 'Check Type', product.id);
      $scope.modal.show();
      $ionicScrollDelegate.$getByHandle('main').scrollTop(false);

      if(product.type) {
        $scope.type_products = product.type;
      }

      $scope.currentProduct = product;
    } else {
      $cordovaToast.show($translate.instant('MESSAGE_QTD'), 'short', 'center');
    }
  };

  $scope.checkedComplement = function(){

    $('input[type=checkbox]').on('change', function (e) {
      if ($('input[type=checkbox]:checked').length > 2) {
        $(this).prop('checked', false);
        $cordovaToast.show($translate.instant('PRODUCT_COMPLEMENT'), 'short', 'center');
      }
    });
  };

  $scope.addToCartSubmit = function() {

    var product = $scope.currentProduct;
    GAService.trackEvent('Shopping Cart', 'Products', 'Add Cart', product.id);

    if(product.type && product.complement == 0) {
      product.typeSelect = product.type[$scope.form.currentTypeProduct];
    } else if(product.type && product.complement == 1) {
      product.typeSelect = $scope.form.currentTypeProduct;
    }

    if(product.type && !product.typeSelect) {
      $cordovaToast.show($translate.instant('PRODUCT_TYPE'), 'short', 'center');
      return false;
    }

    product.comment = $scope.form.comment;

    if (CartService.canAddProduct(product)) {
      CartService.addToCart(product);
      $scope.form = {};
      $scope.type_products = {};
      $scope.modal.hide();
    } else {
      $cordovaToast.show($translate.instant('MESSAGE_QTD'), 'short', 'center');
    }

  };

  $scope.cancelProductCurrent = function() {
    $scope.form = {};
    $scope.type_products = {};
    $scope.modal.hide();
  };

  $scope.removeFromCart = function(product) {
    CartService.removeFromCart(product);
  };

  $ionicModal.fromTemplateUrl('templates/type-product.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  });

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.showRemoveButton = function(product) {
    return (CartService.productQuantity(product) > 0);
  };

  $scope.showAddButton = function(product) {
    return (CartService.productQuantity(product) < CartService.MAX_ALOWED_PRODUCT_QUANTITY);
  };

  $scope.productQuantity = function(product) {
    return CartService.productQuantity(product);
  };

  $scope.subtotal = function() {
    var subtotal = CartService.subtotal();
    return subtotal;
  };

  $scope.hasProductOnCart = function() {
    return CartService.hasProductOnCart();
  };

  $scope.checkout = function() {
    $location.url('/app/checkout');
  };
});