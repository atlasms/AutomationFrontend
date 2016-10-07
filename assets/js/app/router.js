// Filename: router.js
define([
    "jquery"
    , "underscore"
    , "backbone"
    , "login.view"
], function ($, _, Backbone, Login) {
    var AppRouter = Backbone.Router.extend({
        routes: {
            // Define some URL routes
            '': 'index',
            'login': 'Login',
            // Default
            '*actions': 'index'
        }
        , index: function() {
            console.log('You are in index!');
        }
        , Login: function() {
            var loginView = new Login();
            loginView.render();
        }
    });

    var initialize = function () {
        var app_router = new AppRouter;
        app_router.on("route:index", function() {
            console.log('You are in index!');
        });
        app_router.on("route:login", function() {
            alert();
            var loginView = new LoginView();
            loginView.render();
        });

//        app_router.on('route:index', function (actions) {
//            console.log(actions);
//            // Call render on the module we loaded in via the dependency array
//            var index = new Index();
//            index.render();
//        });

        Backbone.history.start();
    };

    return {
        initialize: initialize
    };
});