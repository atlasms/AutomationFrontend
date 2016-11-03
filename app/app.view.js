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
            $("body").attr('class', 'page-404-full-page')
            this.$el.html('<div class="page-404"><div class="number font-red"> 404 </div><div class="details"><h3>پیدا نشد!</h3><p>متاسفانه صفحه مورد نظر شما وجود ندارد.<br><a href="/"> بازگشت به داشبورد </a></p></div></div></div>');
        }
    });
    return AppView;
});