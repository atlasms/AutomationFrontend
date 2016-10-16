// Filename: router.js
define(["jquery", "underscore", "backbone", "login.view", 'template', 'config', "app.view"
], function ($, _, Backbone, Login, Template, Config, AppView) {
    var AppRouter = Backbone.Router.extend({
        routes: {
            // Define some URL routes
            'login': 'Login',
            // Other routes
            '*actions': 'app'
        }
        , Login: function () {
            var loginView = new Login();
            loginView.render();
        }
        , app: function (actions) {
            var app = new AppView();
            app.load(actions);
        }
    });

    var initialize = function () {
        var appRouter = new AppRouter;
        appRouter.on("route:app", function () {
            $("body").addClass("page-container-bg-solid page-sidebar-closed-hide-logo page-footer-fixed");
            var template = Template.template.load('', 'app');
            template.done(function (data) {
                var html = $(data).wrap('<p/>').parent().html();
                var handlebarsTemplate = Template.handlebars.compile(html);
                var output = handlebarsTemplate();
                $(Config.positions.wrapper).html(output);
            });
        });

        Backbone.history.start({pushState: true});
    };

    return {
        initialize: initialize
    };
});