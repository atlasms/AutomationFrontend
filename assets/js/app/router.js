// Filename: router.js
define([
    "jquery"
    , "underscore"
    , "backbone"
    , ""
], function ($, _, Backbone) {
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
    });

    var initialize = function () {
        var app_router = new AppRouter;

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
        , n: 1
    };
});
//
//define([
//    'jquery'
//    , 'underscore'
//    , 'backbone'
//], function ($, _, Backbone) {
//    var Index = Backbone.View.extend({
//        el: $("body")
//        , render: function () {
//            this.$el.append("Index route has been called..");
//        }
//    });
//    return Index;
//});