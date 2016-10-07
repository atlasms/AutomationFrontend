require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
    },
    paths: {
        // Libs Dependencies
        jquery: ["vendor/jquery-3.1.1.min"]
        , underscore: ["vendor/underscore-min"]
        , backbone: ["vendor/backbone-min"]
        , handlebars: ["vendor/handlebars-v4.0.5"]

                // Application Dependencies
        , app: ["app/app"]
        , user: ["../../app/user/user.model"]
        , router: ["app/router"]
        
                // Config
        , config: ["../../config"]
    }
});
require([
    'config', 'app', 'user'
], function (Config, App, User) {
    window.CONFIG = Config;
    window.DEBUG = (Config.env === "dev") ? true : false;

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
    var user = new User();
    if (user.authorize())
        // The "app" dependency is passed in as "App"
        // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
        App.initialize();
    else {
//        Login.redirect();
    }
    return {};
});
