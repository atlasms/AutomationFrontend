define(["jquery", "underscore", "backbone", "config"
], function ($, _, Backbone, Config) {
    var WebsiteModel = Backbone.Model.extend({
        defaults: {}
        , initialize: function (options) {
            this.query = (options && options.query) ? '?' + options.query : '';
            this.path = (options && options.path) ? options.path : '';
            this.path = (options && options.id) ? '/' + options.id : this.path;
            this.overrideUrl = (options && options.overrideUrl) ? options.overrideUrl : '';
            options = {};
        }
        , url: function () {
            if (this.overrideUrl !== "")
                return this.overrideUrl + this.path + this.query;
            else
                return Config.api.website + this.path + this.query;
        }
        , save: function (key, val, options) {
            return Backbone.Model.prototype.save.call(this, key, val, options);
        }
    });
    return WebsiteModel;
});
