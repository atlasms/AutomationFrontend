define(['jquery', 'underscore', 'backbone', 'template', 'config'
], function ($, _, Backbone, Template, Config) {
    var AppView = Backbone.View.extend({
        el: $(Config.positions.main)
        , render: function () {
            this.$el.html('<h1>App</h1>');
        }
        , load: function (actions) {
            if (typeof actions !== "undefined" && actions) {
                var request = (actions + '.view').replace(/\//g, '.');
                requirejs([request], function (View) {
                    var view = new View();
                    var content = view.prepareContent();
                    view.render(content);
                });
            }
        }
    });
    return AppView;
});