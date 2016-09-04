starter.factory('CartService', function($http) {

    var MAX_ALOWED_PRODUCT_QUANTITY = 10; // Quantidade maxima de um produto na mesma compra
	var tempCart = {};
	var tempTimeInitial = {};
	var tempTimeFinal = {};
	var tempTimeName = {};
	var tempIdCart = [];
	var tempTypeCart = [];
	var tempCommentCart = [];
	var subtotals= {};
	var orderConfirm = {};

	return {
		applyCoupon: function(event, couponCode) {

          var eventId = event.id_event;
	      var urlPost = "http://www.snack4me.com/hotel/coupon.php";
	      formData = {id_event: eventId, coupon: couponCode}
	      var params = snack4meLib.toQueryString(formData);        
 
	       return $http.post(urlPost, params,
	        { headers: {'Content-Type': 'application/x-www-form-urlencoded'} }
	       )
	       .then(function(response) {
	        return response;
	       });

	    },

		checkSchedule: function(schedule) {
			var now = new Date();
			var unavailable = [];
			var error = false;

			Object.keys(tempTimeInitial).forEach(function(prodId) {
				var startDate = dateObj(tempTimeInitial[prodId] + ':00');
				var scheduleTime = 'undefined';

				if(typeof schedule !== 'undefined') {
					scheduleTime = dateObj(schedule.getHours() + ':' + schedule.getMinutes() + ':' + schedule.getSeconds());
				}

				if((now <= startDate && typeof schedule === 'undefined') || (now <= startDate && scheduleTime < startDate)){
					unavailable.push({ "initial": tempTimeInitial[prodId], "final": tempTimeFinal[prodId], "name": tempTimeName[prodId] });
					error = true;
				}
			});

			return { error: error, response: unavailable};
		},

		submitCheckout: function(orderData) {

		  var urlPost = "http://www.snack4me.com/hotel/checkout.php";

          var postData = {
			id_event: orderData.eventId,
          	num_products: Object.keys(tempCart).length,
          	floor: orderData.seatPath.andar.label,
          	seat: orderData.seatPath.apartamento.label,
          	coupon: orderData.coupon,
          	id_user: orderData.userId,
	  		schedule: orderData.schedule,
			local: orderData.local,
		  	lang: orderData.lang,
		  	email: orderData.email,
		  	name: orderData.name,
		  	token: orderData.token,
		  	uuid: orderData.uuid
          };

          var idx = 0;

          Object.keys(tempCart).forEach(function(prodId) {
          	postData['id_product_' + idx] = prodId;
          	postData['qtd_product_' + idx] = tempCart[prodId];
          	idx++;
          });

		  var stringId = '';
		  var stringType = '';
		  var stringComment = '';

			for(var i = 0; i < tempIdCart.length; i++) {
				stringId = stringId + tempIdCart[i] + '|';
				stringType = stringType + tempTypeCart[i] + '|';
				stringComment = stringComment + tempCommentCart[i] + '|';
			}
			stringId = stringId.slice(0, -1);
			stringType = stringType.slice(0, -1);
			stringComment = stringComment.slice(0, -1);

			postData['id_products'] = stringId;
			postData['type_products'] = stringType;
			postData['comment_products'] = stringComment;

          var params = snack4meLib.toQueryString(postData);

		  return $http.post(urlPost, params,
		  	{ headers: {'Content-Type': 'application/x-www-form-urlencoded'} }
		  )
		  .then(function(response) {
			return response;
		  });

	    },	    

		submitPayment: function(orderData) {

		  var schedule = snack4meLib.string2Date(orderData.schedule).getBeautifulHour();
		  var urlPost = "http://www.snack4me.com/hotel/payment.php";

          var postData = {
          	checkout: orderData.checkoutId,
          	email: orderData.email,
          	credit_card: orderData.ccNumber,
          	month_expiration: orderData.ccExpiryObj.month,
          	schedule: schedule,
          	bdaytime: schedule,
          	security_card: orderData.ccSecurity,
          	type_card: orderData.ccType,
          	year_expiration: orderData.ccExpiryObj.year
          };

          var params = snack4meLib.toQueryString(postData);        
 
		  return $http.post(urlPost, params,
		  	{ headers: {'Content-Type': 'application/x-www-form-urlencoded'} }
		  )
		  .then(function(response) {
			return response;
		  });

	    },

		submitRateUs: function(postData) {

			var urlPost = "http://www.snack4me.com/hotel/rate-us.php";

			var params = snack4meLib.toQueryString(postData);

			return $http.post(urlPost, params,
				{ headers: {'Content-Type': 'application/x-www-form-urlencoded'} }
				)
				.then(function(response) {
					return response;
				});

		},

	    setOrderConfirm: function(confirmData) {
	    	orderConfirm = confirmData;
	    },

	    getOrderConfirm: function() {
	    	return orderConfirm;
	    },

		startCart: function() {
			tempCart = {};
			subtotals= {};
			tempIdCart = [];
			tempTypeCart = [];
			tempCommentCart = [];
		},

		subtotal: function() {
			var subtotal = 0;
    		for(var sub in subtotals) {
      			subtotal = subtotal + parseFloat(subtotals[sub]);
            }
            return subtotal;
		},

		addToCart: function(product) {

			if (this.canAddProduct(product)) {
				var quantity = this.productQuantity(product);
				var type = '';
				var comment = '';

				if (product.type && product.complement == 0) {
					type = product.typeSelect.id;
				} else if(product.type && product.complement == 1){
					for (var i in product.typeSelect) {
						type = type + i + '*';
					}
					type = type.slice(0, -1);
				}

				if(product.comment) {
					comment = product.comment;
				}

				quantity = quantity + 1;
	      		tempCart[product.id] = quantity;
				tempTimeInitial[product.id] = product.hour_initial;
				tempTimeFinal[product.id] = product.hour_final;
				tempTimeName[product.id] = product.name;
				tempIdCart.push(product.id);
				tempTypeCart.push(type);
				tempCommentCart.push(comment);
	      		subtotals[product.id] = quantity * parseFloat(product.price);
			}
        },

        removeFromCart: function(product) {
			var quantity = tempCart[product.id];
		    quantity = (isNaN(quantity) || quantity - 1 < 0) ? 0 : quantity - 1;
		    tempCart[product.id] = quantity;
		    subtotals[product.id] = quantity * parseFloat(product.price);
			var lastProductId = tempIdCart.lastIndexOf(product.id);
			tempIdCart.splice(lastProductId, 1);
			tempTypeCart.splice(lastProductId, 1);
			tempCommentCart.splice(lastProductId, 1);

			if(quantity == 0){
				delete tempTimeInitial[product.id];
				delete tempTimeFinal[product.id];
				delete tempTimeName[product.id];
			}
        },

        productQuantity: function(product) {
        	var quantity = tempCart[product.id];
            return (!isNaN(quantity)) ? quantity : 0;
        },

        canAddProduct: function(product) {
        	if (this.productQuantity(product)  + 1 > MAX_ALOWED_PRODUCT_QUANTITY) {
        		return false;
        	} else {
        		return true;
        	}
        },

        hasProductOnCart: function() {
        	return (this.subtotal() > 0);
        },

        MAX_ALOWED_PRODUCT_QUANTITY: MAX_ALOWED_PRODUCT_QUANTITY

	};
	
});