define(["jquery", "underscore", "backbone", "config", "user.helper"
], function ($, _, Backbone, Config, UserHelper) {
    var UserModel = Backbone.Model.extend({
        url: function () {
            if (this.overrideUrl !== "")
                return this.overrideUrl + this.path + this.query;
            else
                return Config.api.users + this.path + this.query;
        }
        , initialize: function (options) {
            this.query = (options && options.query) ? '?' + options.query : '';
            this.path = (options && options.path) ? options.path : '';
            this.path = (options && options.id) ? '/' + options.id : this.path;
            this.overrideUrl = (options && options.overrideUrl) ? options.overrideUrl : '';
            options = {};
        }
    });
    return UserModel;
});
