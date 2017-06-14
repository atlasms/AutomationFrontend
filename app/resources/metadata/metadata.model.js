define(["jquery", "underscore", "backbone", "config"
], function ($, _, Backbone, Config) {
    var MetadataModel = Backbone.Model.extend({
        defaults: {}
        , initialize: function (options) {
            this.query = (options && options.query) ? '?' + options.query : '';
            this.path = (options && options.path) ? '/' + options.path : '';
            this.path = (options && options.id) ? '/' + options.id : this.path;
            this.overrideUrl = (options && options.overrideUrl) ? options.overrideUrl : '';
            this.type = (options && options.type) ? options.type : -1;
            options = {};
        }
        , url: function () {
            if (this.overrideUrl !== "")
                return this.overrideUrl + this.path + this.query + (this.query !== "" ? '&'  : '?') + 'type=' + this.type;
            else
                return Config.api.metadata + this.path + this.query + (this.query !== "" ? '&'  : '?') + 'type=' + this.type;
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
    return MetadataModel;
});
