require.config({
    shim: {
        enforceDefine: true,
        underscore: {exports: '_'},
        backbone: {deps: ['underscore', 'jquery', 'handlebars'], exports: 'Backbone'},
        moment: {deps: ['jquery'], exports: 'moment'},
        cookie: {deps: ['jquery'], exports: 'Cookies'},
        mask: {deps: ['jquery'], exports: 'mask'},
        toastr: {deps: ['jquery'], exports: 'toastr'},
//        'bootstrap': {deps: ['jquery'], exports: 'Bootstrap'},
        'bootstrap/affix': {deps: ['jquery'], exports: '$.fn.affix'},
        'bootstrap/alert': {deps: ['jquery'], exports: '$.fn.alert'},
        'bootstrap/button': {deps: ['jquery'], exports: '$.fn.button'},
//        'bootstrap/carousel':   { deps: ['jquery'], exports: '$.fn.carousel' },
//        'bootstrap/collapse':   { deps: ['jquery'], exports: '$.fn.collapse' },
        'bootstrap/dropdown': {deps: ['jquery'], exports: '$.fn.dropdown'},
        'bootstrap/modal': {deps: ['jquery'], exports: '$.fn.modal'},
//        'bootstrap/popover':    { deps: ['jquery'], exports: '$.fn.popover' },
//        'bootstrap/scrollspy':  { deps: ['jquery'], exports: '$.fn.scrollspy' },
        'bootstrap/tab': {deps: ['jquery'], exports: '$.fn.tab'},
        'bootstrap/tooltip': {deps: ['jquery'], exports: '$.fn.tooltip'},
        'bootstrap/transition': {deps: ['jquery'], exports: '$.fn.transition'},
        "bootstrapSwitch": {deps: ['jquery'], exports: 'jQuery.fn.BootstrapSwitch'}
    },
    urlArgs: "bust=" + (new Date()).getTime(),
    paths: {
        // Library Dependencies
        jquery: ["vendor/jquery-3.1.1.min"]
        , underscore: ["vendor/underscore-min"]
        , backbone: ["vendor/backbone-min"]
        , handlebars: ["vendor/handlebars-v4.0.5"]
        , moment: ["vendor/moment.min"]
        , "moment-with-locales": ["vendor/moment-with-locales.min"]
        , "bootstrap": ["vendor/bootstrap"]
        , "bootstrapSwitch": ["vendor/bootstrap-switch.min"]
        , "toastr": ["vendor/toastr.min"]

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
                
        // Collections
        , "broadcast.schedule.collection": ["../../app/broadcast/schedule/schedule.collection"]

                // Views
//        , "app.master": ["../../app/a"]
        , "app.view": ["../../app/app.view"]
        , "login.view": ["../../app/user/login.view"]
        , "broadcast.view": ["../../app/broadcast/broadcast.view"]
        , "broadcast.schedule.view": ["../../app/broadcast/schedule/schedule.view"]
        , "toolbar": ["helpers/toolbar"]

                // Helpers
        , "layout": ["app/layout"]
        , "cookie": ["helpers/cookie"]
        , "localstorage": ["helpers/localstorage"]
        , "template": ["helpers/template"]
        , "global": ["helpers/global"]
        , "mask": ["vendor/jquery.mask.min"]
    }
});
require([
    'jquery', 'config', 'defines', 'app', 'router', 'user'
], function ($, Config, Defines, App, Router, User) {
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
            url: Config.api.url + (_.isFunction(model.url) ? model.url() : model.url)
        });
        /*
         *  Call the stored original Backbone.sync
         * method with the new url property
         */
        backboneSync(method, model, options);
    };
    Router.initialize();
    var user = new User();
    if (user.authorize())
        // The "app" dependency is passed in as "App"
        // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
        App.initialize();
//    else {
//        user.redirect();
//    }
    return {};
});
