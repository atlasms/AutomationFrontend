define(["jquery", "underscore", "backbone", "config"
], function ($, _, Backbone, Config) {
    var CategoriesModel = Backbone.Model.extend({
        defaults: {}
        , initialize: function (options) {
            this.query = (options && options.query) ? '?' + options.query : '';
            this.path = (options && options.path) ? options.path : '';
        }
        , url: function () {
            return Config.api.tree + this.path + this.query;
        }
        , parse: function (data) {
            data = _.map(data, _.identity);
            return data;
        }
        , navigate: function (data) {
//            var win = window.open(Config.api.url + Config.api.storagefiles + '?' + data, '_blank');
//            win && win.focus();
        }
        , save: function (key, val, options) {
            return Backbone.Model.prototype.save.call(this, key, val, options);
        }
    });
    return CategoriesModel;
});
