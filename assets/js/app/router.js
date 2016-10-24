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

        }
        , map: {
            "/": {private: true, access: null}
            , "broadcast": {private: true, access: null}
            , "broadcast/schedule": {private: true, access: null}
            , "broadcast/scheduleprint": {private: false, access: null, skipLayout: false}
        }
    });

    var initMasterLayout = function (actions) {
        $("body").addClass("page-container-bg-solid page-sidebar-closed-hide-logo page-footer-fixed");
        var template = Template.template.load('', 'app');
        template.done(function (data) {
            var html = $(data).wrap('<p/>').parent().html();
            var handlebarsTemplate = Template.handlebars.compile(html);
            var output = handlebarsTemplate();
            $(Config.positions.wrapper).html(output);
            var app = new AppView();
            if (typeof app.load === "function")
                app.load(actions);
            else
                app.load(404);
        });
    };

    var initCleanLayout = function (actions) {
        var app = new AppView();
        if (typeof app.load === "function")
            app.load(actions);
        else
            app.load(404);
    };

    var initialize = function (user) {
        var appRouter = new AppRouter();
        var map = appRouter.map;
        appRouter.on("route:app", function (actions) {
            actions = (actions == null) ? "/" : actions;
            if (typeof map[actions] === "undefined") { /// show 404
                var app = new AppView();
                app.load(404);
                return;
            }
            if (user.authorize(actions, map)) { // Page needs access, redirecting to login page
                if (typeof map[actions].skipLayout !== "undefined" && map[actions].skipLayout === false) { // Page doesn't need master layout
                    if (/print$/.test(actions))
                        $("head link").length && $("head link").remove();
                    initCleanLayout(actions);
                } else { // Normal Routing
                    initMasterLayout(actions);
                }
            }
        });

        Backbone.history.start({pushState: true});
    };

    return {
        initialize: initialize
    };
});