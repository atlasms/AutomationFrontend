define(["config", "jquery", "underscore", "backbone", "router", "template", "global"], function (Config, $, _, Backbone, Router, Template, Global) {
    var initialize = function () {
        (function () {
            window.CONFIG = Config;
            window.DEBUG = (Config.env === "dev") ? true : false;
            window.STORAGE = localStorage;
            window.SESSION = sessionStorage;
            window.$$ = function (element) {
                return document.querySelectorAll(element);
            };
        })();
        setRoutes(Config);
        registerHandlebarsHelpers();
        $("title").text(Config.title);
        
        $.ajax({
            type: 'HEAD'
            , url: window.location.href.toString()
            , success: function(data, textStatus, request) {
                var serverDate = request.getResponseHeader('Date');
//                console.log(serverDate);
                var d = new Date(serverDate);
                d.setSeconds(d.getSeconds() + 1);
                window.setInterval(function() {
                    d.setSeconds(d.getSeconds() + 1);
                    var dateTime = Global.gregorianToJalali(d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()) + ' ' + Global.zeroFill(d.getHours()) + ':' + Global.zeroFill(d.getMinutes()) + ':' + Global.zeroFill(d.getSeconds());
                    $("#server-time span").text(dateTime);
                }, 1000);
            }
        });
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