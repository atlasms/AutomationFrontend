define(["jquery", "underscore", "backbone", "config"
], function ($, _, Backbone, Config) {
    var CategoriesModel = Backbone.Model.extend({
        defaults: {}
        , initialize: function (options) {
            this.query = (options && options.query) ? '?' + options.query : '';
            this.path = (options && options.path) ? options.path : '';
            this.path = (options && options.id) ? '/' + options.id : this.path;
            options = {};
        }
        , url: function () {
            return Config.api.tree + this.path + this.query;
        }
        , save: function (key, val, options) {
            return Backbone.Model.prototype.save.call(this, key, val, options);
        }
    });
    return CategoriesModel;
});
