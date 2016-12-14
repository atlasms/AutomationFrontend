// Filename: router.js
define(["jquery", "underscore", "backbone", "login.view", 'template', 'config', "app.view"
], function ($, _, Backbone, Login, Template, Config, AppView) {
    var AppRouter = Backbone.Router.extend({
        routes: {
            'login': 'Login'
            , '*actions': 'app' // Other routes
        }
        , Login: function () {
            var loginView = new Login();
            loginView.render();
        }
        , map: Config.routes
        , current: function () {
            var Router = this,
                    fragment = Backbone.history.fragment,
                    routes = _.pairs(Router.routes),
                    route = null, params = null, matched;

            matched = _.find(routes, function (handler) {
                route = _.isRegExp(handler[0]) ? handler[0] : Router._routeToRegExp(handler[0]);
                return route.test(fragment);
            });

            if (matched) {
                // NEW: Extracts the params using the internal
                // function _extractParameters 
                params = Router._extractParameters(route, fragment);
                route = matched[1];
            }

            return {
                route: route,
                fragment: fragment,
                params: params
            };
        }
    });

    var initMasterLayout = function (actions) {
        var app = new AppView();
        // App is accessible
        if (typeof app.load === "function") {
            // Master layout has not been loaded before
            if (!$("body").hasClass("has-master-layout")) {
                $("body").addClass("has-master-layout page-container-bg-solid page-sidebar-closed-hide-logo page-footer-fixed");
                var template = Template.template.load('', 'app');
                template.done(function (data) {
                    var html = $(data).wrap('<p/>').parent().html();
                    var handlebarsTemplate = Template.handlebars.compile(html);
                    var output = handlebarsTemplate();
                    $(Config.positions.wrapper).html(output);
                    app.load(actions);
                });
                // Master layout is present, only loading page contents
            } else {
                app.load(actions);
            }
        } else
            app.load(404);
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
        // TODO: make routig more dynamic by supporting url parameters, ids, etc.
        appRouter.on("route:app", function (actions) {
            actions = (actions === null) ? "/" : actions;
            var appAction = actions.split('/').slice(0, 2).join('/');
            if (typeof map[appAction] === "undefined") { /// show 404
                var app = new AppView();
                app.load(404);
                return;
            }
            if (user.authorize(appAction, map)) { // Page needs access, redirecting to login page
                if (typeof map[appAction].skipLayout !== "undefined" && map[appAction].skipLayout === true) { // Page doesn't need master layout
                    if (/print$/.test(appAction))
                        $("head link").length && $("head link").remove();
                    initCleanLayout(appAction);
                } else { // Normal Routing
                    initMasterLayout(appAction);
                }
            }
        });
        $(document).on("click", 'a[href^="/"]', function (evt) {
            var href = {prop: $(this).prop("href"), attr: $(this).attr("href")};
            var root = location.protocol + "//" + location.host + Backbone.history.options.root;

            if (href.prop && href.prop.slice(0, root.length) === root) {
                evt.preventDefault();
                Backbone.history.navigate(href.attr, true);
            }
        });
        Backbone.history.start({pushState: true});
    };

    return {
        initialize: initialize
    };
});