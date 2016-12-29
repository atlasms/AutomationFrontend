define(["jquery", "underscore", "backbone", "config"
], function ($, _, Backbone, Config) {
    var MediaitemModel = Backbone.Model.extend({
        defaults: {}
        , initialize: function (options) {
            this.query = (options && options.query) ? '?' + options.query : '';
            this.path = (options && options.path) ? '/' + options.path : '';
            this.path = (options && options.id) ? '/' + options.id : this.path;
            this.overrideUrl = (options && options.overrideUrl) ? options.overrideUrl : '';
            options = {};
        }
        , url: function () {
            if (this.overrideUrl !== "")
                return this.overrideUrl + this.path + this.query;
            else
                return Config.api.metadata + this.path + this.query;
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
        , toJSON: function () {
            if (this._isSerializing) {
                return this.id || this.cid;
            }
            this._isSerializing = true;
            var json = _.clone(this.attributes);
            _.each(json, function (value, name) {
                _.isFunction((value || "").toJSON) && (json[name] = value.toJSON());
            });
            this._isSerializing = false;
            return json;
        }
    });
    return MediaitemModel;
});
