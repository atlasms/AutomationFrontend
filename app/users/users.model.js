define(["jquery", "underscore", "backbone", "config"
], function ($, _, Backbone, Config) {
    var UsersModel = Backbone.Model.extend({
        initialize: function (options) {
            !Backbone.History.started && Backbone.history.start({pushState: true});
            new Backbone.Router().navigate('users/manage', {trigger: true});
        }
    });
    return UsersModel;
});
