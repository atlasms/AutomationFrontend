define(["jquery", "underscore", "backbone", "config"
], function ($, _, Backbone, Config) {
    var DashboardModel = Backbone.Model.extend({
        defaults: {}
        , initialize: function (options) {
            this.query = (options && options.query) ? '?' + options.query : '';
            this.path = (options && options.path) ? options.path : '';
            this.path = (options && options.id) ? '/' + options.id : this.path;
            options = {};
        }
        , url: function () {
            return Config.api.dashboardSystem + this.path + this.query;
        }
        , save: function (key, val, options) {
            return Backbone.Model.prototype.save.call(this, key, val, options);
        }
    });
    return DashboardModel;
});
