define(["jquery", "underscore", "backbone", "config"
], function ($, _, Backbone, Config) {
    var BroadcastModel = Backbone.Model.extend({
        initialize: function (options) {
            !Backbone.History.started && Backbone.history.start({pushState: true});
            new Backbone.Router().navigate('broadcast/schedule', {trigger: true});
        }
    });
    return BroadcastModel;
});
