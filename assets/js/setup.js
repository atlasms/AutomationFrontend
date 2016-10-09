require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        moment: {
            exports: 'moment'
        }
    },
    paths: {
        // Libs Dependencies
        jquery: ["vendor/jquery-3.1.1.min"]
        , underscore: ["vendor/underscore-min"]
        , backbone: ["vendor/backbone-min"]
        , handlebars: ["vendor/handlebars-v4.0.5"]
        , moment: ["vendor/moment.min"]
        , "moment-with-locales": ["vendor/moment-with-locales.min"]

                // Application Dependencies
        , app: ["app/app"]
        , router: ["app/router"]

                // Config
        , defines: ["app/defines"]
        , config: ["../../config"]

                // Models
        , user: ["../../app/user/user.model"]
        , "broadcast.model": ["../../app/broadcast/broadcast.model"]
        , "broadcast.schedule.model": ["../../app/broadcast/schedule/schedule.model"]

                // Views
//        , "app.master": ["../../app/a"]
        , "app.view": ["../../app/app.view"]
        , "login.view": ["../../app/user/login.view"]
        , "broadcast.view": ["../../app/broadcast/broadcast.view"]
        , "broadcast.schedule.view": ["../../app/broadcast/schedule/schedule.view"]

                // Helpers
        , "localstorage": ["helpers/localstorage"]
        , "template": ["helpers/template"]
        , "global": ["helpers/global"]
    }
});
require([
    'config', 'defines', 'app', 'router', 'user'
], function (Config, Defines, App, Router, User) {
    Defines.initialize();
//    Defines.initialize();
    var backboneSync = Backbone.sync;
    Backbone.sync = function (method, model, options) {
        /*
         * Change the `url` property of options to begin
         * with the URL from settings
         * This works because the options object gets sent as
         * the jQuery ajax options, which includes the `url` property
         */
        options = _.extend(options, {
            url: config.api.url + (_.isFunction(model.url) ? model.url() : model.url)
        });

        /*
         *  Call the stored original Backbone.sync
         * method with the new url property
         */
        backboneSync(method, model, options);
    }
    Router.initialize();
    var user = new User();
    if (user.authorize())
        // The "app" dependency is passed in as "App"
        // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
        App.initialize();
    else {
        user.redirect();
    }
    return {};
});
