define(["config", "jquery", "underscore", "backbone", "router", "template"], function (Config, $, _, Backbone, Router, Template) {
    var initialize = function () {
        (function () {
            window.CONFIG = Config;
            window.DEBUG = (Config.env === "dev") ? true : false;
            window.STORAGE = localStorage;
            window.SESSION = sessionStorage;
        })();
        setRoutes(Config);
        registerHandlebarsHelpers();
    };
    var registerHandlebarsHelpers = function() {
        Template.template.handlebarHelpers();
    };

    var setRoutes = function (Config) {
//        var Routes = {}
//        $.each(Config.routes, function () {
//            Routes[this.path] = this.action;
//        });
//        var AppRouter = Backbone.Router.extend({routes: Routes, BroadcastView: function () {
//                alert();
//            }
//        });
    };

    return {
        initialize: initialize
    };
});