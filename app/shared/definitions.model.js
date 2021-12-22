define(["jquery", "underscore", "backbone"
], function ($, _, Backbone) {
    var DefinitionsModel = Backbone.Model.extend({
        initialize: function (config) {
            this.config = config;
        }
        , url: function() {
            return this.config.api.url + this.config.api.definitions + '?_=20211221';
        }
    });
    return DefinitionsModel;
});
