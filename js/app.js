var app = function () {
  
  // https://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/
  Backbone.View.prototype.close = function(){
    this.remove();
    this.unbind();
    if (this.onClose){
      this.onClose();
    }
  }


  //MODELS
  var Shop = Backbone.Model.extend();

  //COLLECTIONS
  var Shops = Backbone.Collection.extend({
    model: Shop,
    url: "https://mroom.asioi.fi/api/pob-info-with-queue",
    sync: function shopsSync(method, collection, options) {
      // By setting the dataType to "jsonp", jQuery creates a function
      // and adds it as a callback parameter to the request, e.g.:
      // [url]&callback=jQuery19104472605645155031_1373700330157&q=bananarama
      // If you want another name for the callback, also specify the
      // jsonpCallback option.
      // After this function is called (by the JSONP response), the script tag
      // is removed and the parse method is called, just as it would be
      // when AJAX was used.
      options.dataType = "jsonp";
      return Backbone.sync(method, collection, options);
    },
    fetch: function shopsFetch(options) {
      if (options === undefined) {
        options = {};
      }
      // force timeout, it is the only way to get an error from jsonp call
      options.timeout = 5000;
      // error logging
      options.error = function ShopsError(collection, response, options) {
        console.log("shops fetch failed:", response.statusText);  
      };
      Backbone.Collection.prototype.fetch.call(this, options);
    },
    parse: function(response) {
      return _.filter(response, function(n) { return n.name != "uutiskirje" });
    }
  });
  
  //VIEWS
  var ShopView = Backbone.View.extend({
    // creates a new <div class="shop-row"> dom element
    tagName: 'div',
    className: 'shop-row',
    template: Handlebars.compile($("#shop-template").html()),
    initialize: function ShopViewInitialize() {
      this.listenTo(this.model, "change", this.render);
    },
    render: function ShopViewRender() {
      q = this.model.get("queue");
      if (q.count == "closed") {
        this.$el.addClass("closed");
      } else {
        this.$el.removeClass("closed");
      }
      this.$el.html(this.template(this.model.attributes));
      return this; 
    }
  });

  var ShopList = Backbone.View.extend({
    el: '#app',  // bind to the existing DOM element
    events: {
      "change #city-selector": "changeCity"
    },
    selectTemplate: Handlebars.compile($("#select-template").html()),
    initialize: function ShopListInitialize() {
      this.citySelector = this.$("#city-selector");
      this.loadingNotification = this.$(".loader");
      this.city = "Tampere";
      this.childViews = [];  // must keep track of child views for cleanup in replaceContent
      this.listenTo(this.collection, "reset", this.reset);  // the collection will be reset (loaded from the api) at app init, draw contents then
      this.listenTo(this, "city:change", this.routeCity);
    },
    reset: function () {
      this.loadingNotification.addClass('hide');
      this.render();
      this.replaceContent();
    },
    render: function ShopListRender() {
      router.navigate("city/" + this.city);
      cities = _.uniq(this.collection.pluck('city')).sort();
      this.$("#city-selector").html(this.selectTemplate({options: cities, selected: this.city}));
    },
    replaceContent: function ShopListReplaceContent() {
      _.invoke(this.childViews, "close");
      var cityShops = this.collection.filter({city: this.city});
      _.each(cityShops, function(shop) {
        shopView = new ShopView({model: shop});
        this.$('#shop-data').append(shopView.render().el);
        this.childViews.push(shopView);
      }, this);
    },
    changeCity: function ShopListChangeCity() {
      this.city = this.citySelector.val();
      router.navigate("city/" + this.city);
      this.replaceContent();
    },
    routeCity: function(city) {
      // router city selection handler
      this.city = city;
      this.citySelector.val(city);
      this.replaceContent();
    }
  });


  //ROUTER
  var Router = Backbone.Router.extend({
    routes: {
      "city/:city": "selectCity",
    },
    selectCity: function (city) {
      window.app.views.main.trigger('city:change', city);
    }
  });

  router = new Router();


  var init = function appInit() {
    shops = new Shops();
    shops.fetch({reset: true});
    var mainView = new ShopList({collection: shops});
    this.collections.shops = shops;
    this.views.main = mainView;
    Backbone.history.start(); // start tracking routes
    console.log("app started");
  };

  return {
    init: init,
    collections: {},
    views: {}
  }
}();
