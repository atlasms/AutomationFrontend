define(['jquery', 'underscore', 'backbone', 'template', 'config', 'cookie', 'layout'
], function ($, _, Backbone, Template, Config, Cookies, Layout) {
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
                var request = (actions === '' || actions === '/') ? 'dashboard.view' : (actions.replace(/\$/, '') + '.view').replace(/\//g, '.');
                requirejs([request], function (View) {
                    var view = new View();
                    var content = (typeof view.prepareContent !== "undefined") ? view.prepareContent() : null;
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