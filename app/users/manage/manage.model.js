define(["jquery", "underscore", "backbone", "config"
], function ($, _, Backbone, Config) {
    var UsersManageModel = Backbone.Model.extend({
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
                return Config.api.users + this.path + this.query;
        }
        , parse: function (data) {
            data = _.map(data, _.identity);
            return data;
        }
        , save: function (key, val, options) {
            return Backbone.Model.prototype.save.call(this, key, val, options);
        }
    });
    return UsersManageModel;
});
