require.config({
    waitSeconds: 300,
    shim: {
        enforceDefine: true
        , underscore: {exports: "_"}
        , backbone: {deps: ["underscore", "jquery", "handlebars"], exports: "Backbone"}
        , moment: {deps: ["jquery"], exports: "moment"}
        , "moment-hijri": {deps: ["jquery", "moment", "moment-with-locales"], exports: "moment"}
        , cookie: {deps: ["jquery"], exports: "Cookies"}
        , mask: {deps: ["jquery"], exports: "mask"}
        , toastr: {deps: ["jquery"], exports: "toastr"}
        , pdate: {deps: ["jquery"], exports: "pdate"}
        , pdatepicker: {deps: ["jquery", "pdate"], exports: "pdatepicker"}
        , "bootstrap/affix": {deps: ["jquery"], exports: "$.fn.affix"}
        , "bootstrap/alert": {deps: ["jquery"], exports: "$.fn.alert"}
        , "bootstrap/button": {deps: ["jquery"], exports: "$.fn.button"}
        , "bootstrap/collapse": {deps: ["jquery"], exports: "$.fn.collapse"}
        , "bootstrap/dropdown": {deps: ["jquery"], exports: "$.fn.dropdown"}
        , "bootstrap/modal": {deps: ["jquery"], exports: "$.fn.modal"}
        , "bootstrap/scrollspy": {deps: ["jquery"], exports: "$.fn.scrollspy"}
        , "bootstrap/tab": {deps: ["jquery"], exports: "$.fn.tab"}
        , "bootstrap/tooltip": {deps: ["jquery"], exports: "$.fn.tooltip"}
        , "bootstrap/popover": {deps: ["jquery", "bootstrap/tooltip"], exports: "$.fn.popover"}
        , "bootstrap/transition": {deps: ["jquery"], exports: "$.fn.transition"}
        , "x-editable": {deps: ["jquery", "bootstrap/tooltip", "bootstrap/popover"], exports: "jQuery"}
        , "hotkeys": {deps: ["jquery"], exports: "jQuery"}
        , "jwplayer": {exports: "jwplayer"}
        , "ladda": {deps: ["spin"]}
        , "wysihtml5": {deps: ["jquery", "vendor/wysihtml5-0.3.0"], exports: "jQuery"}
    }
    , urlArgs: "bust=" + (new Date()).getTime()
    , paths: {
        // Library Dependencies
        jquery: ["vendor/jquery-3.1.1.min"]
        , "jquery-ui": ["vendor/jquery-ui.min"]
        , "underscore": ["vendor/underscore-min"]
        , "backbone": ["vendor/backbone-min"]
        , "handlebars": ["vendor/handlebars-v4.0.5"]
        , "moment": ["vendor/moment.min"]
        , "moment-with-locales": ["vendor/moment-with-locales.min"]
        , "moment-hijri": ["vendor/moment-hijri"]
        , "bootstrap": ["vendor/bootstrap"]
        , "toastr": ["vendor/toastr.min"]
        , "pdate": ["vendor/persian-date"]
        , "pdatepicker": ["vendor/persian-datepicker-0.4.5.min"]
        , "jdate": ["vendor/jdate.min"]
        , "mousetrap": ["vendor/mousetrap.min"]
        , "hotkeys": ["vendor/jquery.hotkeys"]
        , "jstree": ["vendor/jstree.min"]
        , "tus": ["vendor/tus"]
        , "jwplayer": ["vendor/jwplayer/jwplayer"]
        , "bootbox": ["vendor/bootbox.min"]
        , "spin": ["vendor/spin.min"]
        , "ladda": ["vendor/ladda.min"]
        , "pace": ["vendor/pace.min"]
        , "x-editable": ["vendor/bootstrap-editable.min"]
        , "wysihtml5": ["vendor/bootstrap-wysihtml5"]

        , "typeahead": ["vendor/typeahead.jquery.min"]
        , "bloodhound": ["vendor/bloodhound.min"]

                // Application Dependencies
        , "app": ["app/app"]
        , "router": ["app/router"]

                // Config
        , "defines": ["app/defines"]
        , "config": ["../../config"]

                // Models
        , "user": ["../../app/user/user.model"]
        , "definitions": ["../../app/shared/definitions.model"]
        , "broadcast.model": ["../../app/broadcast/broadcast.model"]
        , "broadcast.schedule.model": ["../../app/broadcast/schedule/schedule.model"]
        , "broadcast.crawl.model": ["../../app/broadcast/crawl/crawl.model"]
        , "resources.ingest.model": ["../../app/resources/ingest/ingest.model"]
        , "resources.metadata.model": ["../../app/resources/metadata/metadata.model"]
        , "resources.categories.model": ["../../app/resources/categories/categories.model"]
        , "resources.review.model": ["../../app/resources/review/review.model"]
        , "resources.mediaitem.model": ["../../app/resources/mediaitem/mediaitem.model"]
        , "users.model": ["../../app/users/users.model"]
        , "users.manage.model": ["../../app/users/manage/manage.model"]
        , "inbox.model": ["../../app/user/messages/inbox.model"]

                // Views
//        , "app.master": ["../../app/a"]
        , "app.view": ["../../app/app.view"]
        , "login.view": ["../../app/user/login.view"]
        , "user.helper": ["../../app/user/user.helper"]
        , "dashboard.view": ["../../app/dashboard/dashboard.view"]
        , "broadcast.view": ["../../app/broadcast/broadcast.view"]
        , "broadcast.schedule.view": ["../../app/broadcast/schedule/schedule.view"]
        , "broadcast.scheduleprint.view": ["../../app/broadcast/schedule/scheduleprint.view"]
        , "broadcast.crawl.view": ["../../app/broadcast/crawl/crawl.view"]
        , "resources.ingest.view": ["../../app/resources/ingest/ingest.view"]
        , "resources.metadata.view": ["../../app/resources/metadata/metadata.view"]
        , "resources.categories.view": ["../../app/resources/categories/categories.view"]
        , "resources.review.view": ["../../app/resources/review/review.view"]
        , "resources.returnees.view": ["../../app/resources/returnees/returnees.view"]
        , "resources.mediaitem.view": ["../../app/resources/mediaitem/mediaitem.view"]
        , "user.messages.view": ["../../app/user/messages/inbox.view"]
        , "users.view": ["../../app/users/users.view"]
        , "users.manage.view": ["../../app/users/manage/manage.view"]
        , "toolbar": ["helpers/toolbar"]
        , "statusbar": ["helpers/statusbar"]

                // Helpers
        , "layout": ["app/layout"]
        , "cookie": ["helpers/cookie"]
        , "localstorage": ["helpers/localstorage"]
        , "template": ["helpers/template"]
        , "global": ["helpers/global"]
        , "mask": ["vendor/jquery.mask.min"]
        , "scheduleHelper": ["../../app/broadcast/schedule/schedule.helper"]
        , "crawlHelper": ["../../app/broadcast/crawl/crawl.helper"]
        , "ingestHelper": ["../../app/resources/ingest/ingest.helper"]
        , "reviewHelper": ["../../app/resources/review/review.helper"]
//        , "metadataHelper": ["../../app/resources/ingest/metadata.helper"]
//        , "metadataHelper": ["../../app/resources/ingest/categories.helper"]
        , "tree.helper": ["helpers/tree"]
        , "player.helper": ["helpers/player"]
        , "editable.helper": ["helpers/editable"]
    }
});

require([
    'jquery', 'config', 'defines', 'app', 'router', 'user.helper', 'toastr'
], function ($, Config, Defines, App, Router, UserHelper, toastr) {
    Defines.initialize();
//    var user = new User();
    var backboneSync = Backbone.sync;
    Backbone.sync = function (method, model, options) {
        /*
         * Change the `url` property of options to begin
         * with the URL from settings
         * This works because the options object gets sent as
         * the jQuery ajax options, which includes the `url` property
         */
        options = _.extend(options, {
            url: (((_.isFunction(model.url) ? model.url() : model.url)).indexOf('//') === -1 ? Config.api.url : '') + (_.isFunction(model.url) ? model.url() : model.url)
        });
        if (UserHelper.getToken() !== null) {
            options = _.extend(options, {
                headers: {"Authorization": UserHelper.getToken()}
            });
        }
        /*
         *  Call the stored original Backbone.sync
         * method with the new url property
         */
        backboneSync(method, model, options);
    };

    toastr.options.positionClass = 'toast-bottom-left';
    toastr.options.progressBar = true;
    toastr.options.closeButton = true;
    $.ajaxSetup({
        statusCode: {
            0: function () {
                toastr.error('Not connect.\n Verify Network.', 'خطا');
            },
            400: function () {
                toastr.error('درخواست نا معتبر. [400]', 'خطا');
            },
            401: function () {
                toastr.error('درخواست غیر مجاز [401]', 'خطا');
            },
            403: function () {
                toastr.error('شما به این سرویس دسترسی ندارید. [403]', 'خطا');
            },
            404: function () {
                toastr.error('سرویس پیدا نشد! [404]', 'خطا');
            },
            500: function () {
                toastr.error('خطا در سرور. [500]', 'خطا');
            },
            503: function () {
                toastr.error('سرویس در دسترس نیست. [503]', 'خطا');
            }
        }
    });
    Router.initialize(UserHelper.getUser());
    // The "app" dependency is passed in as "App"
    // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
    App.initialize();
    return {};
});
