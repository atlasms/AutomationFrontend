define(["jquery", "underscore", "backbone", "config", "user.helper"
], function ($, _, Backbone, Config, UserHelper) {
    var UserModel = Backbone.Model.extend({
        url: function () {
            if (this.overrideUrl !== "")
                return this.overrideUrl + this.path + this.query;
            else
                return Config.api.users + this.path + this.query;
        }
        , parse: function (data) {
            return data;

            data = _.map(data, _.identity);
            return data;
        }
        , token: ''
        , initialize: function (options) {
            this.query = (options && options.query) ? '?' + options.query : '';
            this.path = (options && options.path) ? options.path : '';
            this.path = (options && options.id) ? '/' + options.id : this.path;
            this.overrideUrl = (options && options.overrideUrl) ? options.overrideUrl : '';
            options = {};
//            this.token = JSON.parse(STORAGE.getItem(STORAGEKEY)) && JSON.parse(STORAGE.getItem(STORAGEKEY)).token;
        }
    });
    return UserModel;
});
