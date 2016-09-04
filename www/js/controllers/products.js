starter.controller('ProductsCtrl', function($scope, $stateParams, $location, $ionicPopup, AuthService, $cordovaToast, DataService, CartService, $ionicModal, $translate, $ionicScrollDelegate, GAService) {

  $scope.baseUrlLogo   = 'img/brands/';
  $scope.baseUrlProd   = 'http://www.snack4me.com/hotel/events';
  $scope.selectedEvent = DataService.getSelectedEvent(); // Obtem o evento selecionado no controller EventsCtrl
  $scope.productList   = {};
  $scope.concessions   = [];
  $scope.currentConcession = {};
  $scope.currentProduct = {};
  $scope.lang = AuthService.getLang();
  $scope.type_products = {};
  $scope.currentTypeProduct = '';
  $scope.form = {};


  $scope.startCart = function() {
    CartService.startCart();   
  };

  $scope.startCart();

  // Caso nao seja possivel obter o evento selecionado anteriormente, redireciona novamente para a Home
  if ($scope.selectedEvent.id === undefined) {
    $location.url('/app/events');
  };

  GAService.trackView('Products in event: ' + $scope.selectedEvent.id);

  // Busca a configuracao com informacoes sobre assentos na arena
  DataService.getProductList($stateParams.eventId).then(function(products) {
    $scope.productList = products;
  });

  $scope.getCurrentConcession = function() {
    if (!$scope.currentConcession.id) {
      return $scope.productList.concessions[0];
    } else {
      return $scope.currentConcession;
    }
  };

  $scope.isCurrentConcession = function(concession) {
    if (!$scope.currentConcession.id && $scope.productList.concessions[0].id === concession.id) {
      return true;
    } else if($scope.currentConcession.id === concession.id) {
      return true;
    } else {
      return false;
    }
  };

  $scope.selectConcession = function(concession) {
    if (!$scope.isCurrentConcession(concession)) {
      /*
       * Alertar o usuario que se trocar de concessao com produtos no carrinho
       * o carrinho sera' zerado
      */
      if (CartService.subtotal() > 0) {
        $ionicPopup.confirm({
          title: 'Concession change',
          template: 'If you change concession your cart will be empty. You can only buy from one concession per order'
        }).then(function(res) {
          if(res) {
            CartService.startCart();
            $scope.currentConcession = concession;             
          }
        });
      } else {
          $scope.currentConcession = concession;
      }
    } else {
      $scope.currentConcession = concession;
    }   
  };

  $scope.isSingleConcession = function() {
    return ($scope.productList.concessions && $scope.productList.concessions.length === 1);
  };

  $scope.hasVariousConcessions = function() {
    return !$scope.isSingleConcession();
  };

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

      if (product.type) {
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
      $scope.currentProduct = {};
      $scope.form = {};
      $scope.type_products = {};
      $scope.modal.hide();
    } else {
      $cordovaToast.show($translate.instant('MESSAGE_QTD'), 'short', 'center');
    }

  };

  $scope.cancelProductCurrent = function() {
    $scope.currentProduct = {};
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
    $scope.modal = modal;
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

  $scope.showProductDetail = function(product) {
    //DataService.setCurrentProduct($scope.getCurrentConcession(), product);
    DataService.setCurrentProduct(product);
    $location.url('/app/product');
  };

  $scope.checkout = function() {
    $location.url('/app/checkout');
  };

});