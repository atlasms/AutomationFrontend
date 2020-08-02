define(["jquery", "underscore", "backbone", "config"
], function ($, _, Backbone, Config) {
    var CheckInfoModel = Backbone.Model.extend({
        defaults: {}
        , initialize: function (defaults, options) {
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
                return Config.api.checkInfo + this.path + this.query;
        }
        , save: function (key, val, options) {
            return Backbone.Model.prototype.save.call(this, key, val, options);
        }
        , fetch: function (options) {
            options = _.extend(options || {}, {
                dataType: 'text',
                parse: true
            });
            var model = this;
            var success = options.success;
            options.success = function (resp) {
                var serverAttrs = options.parse ? model.parse(resp, options) : resp;
                if (!model.set(serverAttrs, options)) return false;
                if (success) success.call(options.context, model, resp, options);
                model.trigger('sync', model, resp, options);
            };
            var error = options.error;
            options.error = function (resp) {
                var serverAttrs = options.parse ? model.parse(resp.responseText, options) : resp.responseText;
                if (!model.set(serverAttrs, options)) return false;
                if (error) error.call(options.context, model, resp, options);
                model.trigger('error', model, resp, options);
            };
            return this.sync('read', this, options);
        },

        // store response in content attribute
        parse: function (response) {
            return {content: response};
        }
    });
    return CheckInfoModel;
});

