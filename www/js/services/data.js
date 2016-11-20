starter.factory('DataService', function($http, $timeout, $q) {

  var events        = [];
  var cities        = [];  
  var orders        = [];
  var arenaConfig   = {};
  var localsOrder   = {};
  var productList   = {};
  var currentConcession = {};
  var serviceTaxes  = 0;
  var currentProduct = {};
  var selectedEvent = {};
  var selectedSeat  = {};
  var userInfo      = {};
  var tempCart      = {};
  var subtotals     = {};
  var DOCTRINE = "http://snack4me.com/hotel/snack4me_webapi/public/index.php/";


    return {
    /*
     * Busco o historico de pedidos do usuario
    */
    getOrders: function(params) {

      var urlPost = "http://www.snack4me.com/hotel/page-personal.php";
      params = snack4meLib.toQueryString(params);        

      return $http.post(urlPost, params,
        { headers: {'Content-Type': 'application/x-www-form-urlencoded'} }
      )
      .then(function(response) {
        return response;
      });

    },

    getOrderById: function(params) {
      var urlPost = "http://www.snack4me.com/hotel/order.php";
      params = snack4meLib.toQueryString(params);

      return $http.post(urlPost, params,
        { headers: {'Content-Type': 'application/x-www-form-urlencoded'} }
      )
      .then(function(response) {
        return response;
      });
      
    },
    
    /*
     * Busco eventos baseados em coordenadas geograficas
    */
    getEventsByGeolocation: function(lat, lon) {
      return $http.get(DOCTRINE + "event?lat="+lat+"&lon="+lon+"&d=" + Date.now())
       .then(function(response) {
         events = response.data.response;
         return events;
       });
    },
    /*
     * Busco eventos por cidade
    */
    getEventsByCity: function(cityId) {
      return $http.get("http://www.snack4me.com/hotel/call_events.php?city="+cityId+"&d=" + Date.now())
       .then(function(response) {
         events = response.data.response;
         return events;
       });
    },
    /*
     * Busco as cidades com eventos disponiveis
    */
    getCitiesWithEvents: function() {
      return $http.get("http://www.snack4me.com/hotel/cities.php?d=" + Date.now())
       .then(function(response) {
        cities = response.data.response;
        return cities;
       });
    },

    searchCities : function(searchFilter) {
      var deferred = $q.defer();
      var matches = cities.filter( function(city) {
        if(city.name_city.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1 ) return true;
      });

      $timeout( function(){    
         deferred.resolve( matches );
      }, 100);

      return deferred.promise;
    },

    /*
     * Procuro por detalhes de um evento
    */
    getEvent: function(eventId) {
      events.forEach(function(item) {
        if (item.id === eventId) {
          return item;
        }
      });
    },
    /*
     * Recupero a configuracao dos assentos da arena para um dado evento
    */
    getArenaConfig: function(eventId) {     
      return $http.get("http://www.snack4me.com/hotel/events/" + eventId + "/config.json?d=" + Date.now())
       .then(function(response) {
         arenaConfig = response.data;
         return arenaConfig;
       });
    },
    /*
     * Recupero a lista de produtos para o evento
    */
    getProductList: function(eventId) {     
      return $http.get("http://www.snack4me.com/hotel/product.php?id_event=" + eventId + "&d=" + Date.now())
       .then(function(response) {
         productList = response.data;
         return productList;
       });
    },
    /*
     * Recupero a configuracao dos assentos da arena para um dado evento
     */
    getLocalsOrder: function(eventId) {
      return $http.get("http://www.snack4me.com/hotel/local_order.php?id_event=" + eventId + "&d=" + Date.now())
          .then(function(response) {
            localsOrder = response.data;
            return localsOrder;
          });
    },
    /*
     * Armazeno o produto selecionado para ser detalhado
    */

    setCurrentProduct: function(product) {
      //currentConcession = concession;
      currentProduct = product;
    },
    /*
     * Recupero o produto definido como produto a detalhar
    */
    getCurrentProduct: function() {
      return currentProduct;      
    }, 
    /*
     * Recupero a taxa de servico 
    */
    getServiceTaxes: function() {
      return (productList.tax_service) ? productList.tax_service : 0;
    },
    /*
     * Recupero a concessao para detalhar
    */
    getCurrentConcession: function() {
      return currentConcession;      
    },   
    /*
     * Armazeno o evento selecionado em um cache
    */
    selectEvent: function(event) {
      selectedEvent = event;
    },
    /*
     * Recupero o evento selecionado pelo usuario
    */    
    getSelectedEvent: function() {
      return selectedEvent;
    },
    /*
     * Armzeno o assento informado pelo usuario
    */
    selectSeat: function(seatInfo) {
      selectedSeat = snack4meLib.cloneObject(seatInfo);
    },
    /*
     * Recupero o assento informado pelo usuario
    */    
    getSelectedSeat: function() {
      return selectedSeat;
    },
    /* 
     * Guarda e recupera informacoes sobre o usuario
    */
    setUserInfo: function(key, value) {
      userInfo[key] = value;
    },
    getUserInfo: function() {
      return userInfo;
    }
  };
  
});