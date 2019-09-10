define(["jquery", "underscore", "backbone", "config"
], function ($, _, Backbone, Config) {
    var BasicModel = Backbone.Model.extend({
        defaults: {}
        , initialize: function (options) {
            if (typeof options !== 'undefined') {
                this.query = options.query ? '?' + options.query : '';
                this.path = options.path ? options.path : '';
                this.path = options.id ? this.path + '/' + options.id : this.path;
                this.overrideUrl = options.overrideUrl ? options.overrideUrl : '';
                options = {};
            }
        }
        , url: function () {
            if (this.overrideUrl !== "")
                return this.overrideUrl + this.path + this.query;
            else
                return Config.api.tags + this.path + this.query;
        }
        , navigate: function (data) {
//            var win = window.open(Config.api.url + Config.api.storagefiles + '?' + data, '_blank');
//            win && win.focus();
        }
        , save: function (key, val, options) {
            return Backbone.Model.prototype.save.call(this, key, val, options);
        }
    });
    return BasicModel;
});
