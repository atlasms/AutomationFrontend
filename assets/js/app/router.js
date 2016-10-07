// Filename: router.js
define([
    "jquery"
    , "underscore"
    , "backbone"
    , "login.view"
    , 'template'
    , 'config'
//    , "app.master"
], function ($, _, Backbone, Login, Template, Config) {
    var AppRouter = Backbone.Router.extend({
        routes: {
            // Define some URL routes
            '': 'index',
            'login': 'Login',
            // Default
            '*actions': 'index'
        }
        , Login: function () {
            var loginView = new Login();
            loginView.render();
        }
    });

    var initialize = function () {
        var appRouter = new AppRouter;
        appRouter.on("route:index", function () {
            $("body").addClass("page-container-bg-solid page-sidebar-closed-hide-logo page-header-fixed page-footer-fixed");
            var template = Template.template.load('', 'app');
            template.done(function (data) {
                var html = $(data).wrap('<p/>').parent().html();
                var handlebarsTemplate = Template.handlebars.compile(html);
                var output = handlebarsTemplate();
                $(Config.positions.wrapper).html(output);
            });
        });

        Backbone.history.start({ pushState: true });
    };

    return {
        initialize: initialize
    };
});