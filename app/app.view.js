define(['jquery', 'underscore', 'backbone', 'template', 'config', 'cookie', 'layout', 'bootstrap/dropdown'
], function ($, _, Backbone, Template, Config, Cookies, Layout, Dropdown) {
    var AppView = Backbone.View.extend({
        el: $(Config.positions.wrapper)
        , render: function () {
            this.$el.html('<h1>App</h1>');
        }
        , load: function (actions) {
            if (actions === 404) {
                this.render404();
                return;
            }
            if (typeof actions !== "undefined" && actions) {
                var request = (actions.replace(/\$/, '') + '.view').replace(/\//g, '.');
                requirejs([request], function (View) {
                    var view = new View();
                    var content = view.prepareContent();
                    view.render(content);
                });
            }
        }
        , render404: function () {
            this.$el.html('<h1 class="text-center">404!</h1>');
        }
    });
    return AppView;
});