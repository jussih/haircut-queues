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
  });
  
  //VIEWS
  var ShopView = Backbone.View.extend({
    // creates a new <tr class="shop-row"> dom element
    tagName: 'tr',
    className: 'shop-row',
    template: Handlebars.compile($("#shop-template").html()),
    render: function ShopViewRender() {
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
    },
    reset: function () {
      this.loadingNotification.addClass('hide');
      this.render();
      this.replaceContent();
    },
    render: function ShopListRender() {
      cities = _.uniq(this.collection.pluck('city')).sort();
      this.$("#city-selector").html(this.selectTemplate({options: cities, selected: this.city}));
    },
    replaceContent: function ShopListReplaceContent() {
      _.invoke(this.childViews, "close");
      var cityShops = this.collection.filter({city: this.city});
      _.each(cityShops, function(shop) {
        shopView = new window.app.views.ShopView({model: shop});
        this.$('#shop-data').append(shopView.render().el);
        this.childViews.push(shopView);
      }, this);
    },
    changeCity: function ShopListChangeCity() {
      this.city = this.citySelector.val();
      this.replaceContent();
    }
  });

  var init = function appInit() {
    shops = new this.collections.Shops();
    shops.fetch({reset: true});
    var mainView = new this.views.ShopList({collection: shops});
    console.log("app started");
  };

  return {
    models: {Shop: Shop},
    collections: {Shops: Shops},
    views: {ShopView: ShopView, ShopList: ShopList},
    init: init,
  }
}();
