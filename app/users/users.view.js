define(['jquery', 'underscore', 'backbone', 'template', 'config', 'users.model'
], function ($, _, Backbone, Template, Config, UsersModel) {
    var UsersView = Backbone.View.extend({
//        el: $(Config.positions.wrapper)
        model: 'UsersModel'
        , initialize: function(options) {
            var model = new UsersModel();
            model.initialize();
        }
    });
    return UsersView;
});