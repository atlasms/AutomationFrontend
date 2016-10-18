define(["config", "jquery", "underscore", "backbone", "router", "template"], function (Config, $, _, Backbone, Router, Template) {
    var initialize = function () {
        (function () {
            window.CONFIG = Config;
            window.DEBUG = (Config.env === "dev") ? true : false;
            window.STORAGE = localStorage;
            window.SESSION = sessionStorage;
            window.$$ = function (element) {
                return document.querySelectorAll(element);
            }
        })();
        setRoutes(Config);
        registerHandlebarsHelpers();
        $("title").text(Config.title);
    };
    var registerHandlebarsHelpers = function () {
        Template.template.handlebarHelpers();
        Template.template.handlebarPartials();
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