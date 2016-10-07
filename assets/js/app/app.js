define([
    "jquery"
    , "underscore"
    , "backbone"
    , "router"
], function ($, _, Backbone, Router) {
    var initialize = function () {
        Router.initialize();
        // Setting Global Variables
        (function () {
            window.STORAGE = localStorage;
            window.SESSION = sessionStorage;
        })();
    };

    return {
        initialize: initialize
    };
});