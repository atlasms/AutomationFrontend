define(['jquery', 'underscore', 'backbone', 'template', 'config', 'cookie', 'layout', 'pace'
], function ($, _, Backbone, Template, Config, Cookies, Layout, pace) {
    var AppView = Backbone.View.extend({
        el: $(Config.positions.wrapper)
        , render: function () {
            this.$el.html('<h1>App</h1>');
        }
        , load: function (actions, actionArray) {
            if (actions === 404) {
                this.render404();
                return;
            }
            if (typeof actions !== "undefined" && actions) {
                var request = (actions === '' || actions === '/') ? 'dashboard.view' : (actions.replace(/\$/, '') + '.view').replace(/\//g, '.');
                requirejs([request], function (View) {
//                    pace.start();
                    var view = new View(actions, actionArray);
                    var content = (typeof view.prepareContent !== "undefined") ? view.prepareContent() : null;
                    view.render(content, actionArray);
                    var $sidebarMenu = $(Config.positions.sidebar).find("ul:first");
                    
                    // Setting active menu
                    $sidebarMenu.find("li").removeClass("active open");
                    $sidebarMenu.find('a[href="/' + actions + '"]').parents("li").addClass("active open");
                });
            }
        }
        , render404: function () {
            $("body").attr('class', 'page-404-full-page');
            this.$el.html('<div class="page-404"><div class="number font-red"> 404 </div><div class="details"><h3>پیدا نشد!</h3><p>متاسفانه صفحه مورد نظر شما وجود ندارد.<br><a href="/"> بازگشت به داشبورد </a></p></div></div></div>');
        }
    });
    return AppView;
});