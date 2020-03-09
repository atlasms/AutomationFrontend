define(["jquery", "underscore", "backbone", "config"
], function ($, _, Backbone, Config) {
    var WebsiteModel = Backbone.Model.extend({
        initialize: function (options) {
            !Backbone.History.started && Backbone.history.start({pushState: true});
            new Backbone.Router().navigate('website/dashboard', {trigger: true});
        }
    });
    return WebsiteModel;
});
