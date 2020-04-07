define(["config", "jquery", "underscore", "backbone", "router", "template", "global", 'user.helper', 'toastr'
], function (Config, $, _, Backbone, Router, Template, Global, UserHelper, toastr) {
    var initialize = function (pace) {
        var self = this;
        var clockUpdateInterval = null;
        var clockInterval = null;
        pace.start();
        (function () {
            window.CONFIG = Config;
            window.DEBUG = (Config.env === "dev") ? true : false;
            window.STORAGEKEY = Config.storageKey;
            window.STORAGE = localStorage;
            window.SESSION = sessionStorage;
            window.SERVERDATE = '';
            window.GLOBAL = Global;
            window.$$ = function (element) {
                return document.querySelectorAll(element);
            };

            var backboneSync = Backbone.sync;
            Backbone.sync = function (method, model, options) {
                if (method === "read")
                    if (typeof model.query !== "undefined" && model.query.indexOf('externalid=0&kind=3') === -1) {
//                        console.log('started pace for: ' + model.query);
                        pace.restart();
                    }
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

            Backbone.View.prototype.el = $(Config.positions.wrapper);
            Backbone.View.prototype.close = function () {
                this.undelegateEvents();
                this.stopListening();
            };

            toastr.options.positionClass = 'toast-bottom-left';
            toastr.options.progressBar = true;
            toastr.options.closeButton = true;
            $.ajaxSetup({
                statusCode: {
//                    0: function () {
//                        toastr.error('Request Cancelled.', 'خطا');
//                    },
                    400: function () {
                        toastr.error('درخواست نا معتبر. [400]', 'خطا');
                    },
                    401: function () {
                        toastr.error('درخواست غیر مجاز [401]', 'خطا');
                        if (Backbone.history.fragment.lastIndexOf('login', 0) !== 0)
                            UserHelper.redirect(true, {msg: 'TOKEN_EXPIRED', url: Backbone.history.fragment});
                    },
                    403: function () {
                        toastr.error('شما به این سرویس دسترسی ندارید. [403]', 'خطا');
                    },
                    404: function () {
                        toastr.error('سرویس پیدا نشد! [404]', 'خطا');
                    },
                    409: function () {
                        toastr.error('کاربر تکراری!', 'خطا');
                    },
                    500: function () {
                        toastr.error('خطا در سرور. [500]', 'خطا');
                    },
                    503: function () {
                        toastr.error('سرویس در دسترس نیست. [503]', 'خطا');
                    }
                }
            });
        })();

        registerHandlebarsHelpers();
        $("title").text(Config.title);

        var systemDate = function () {
            Global.getServerDate(function (request) {
                var serverDate = request.getResponseHeader('Date');
                var d = new Date(serverDate);
                window.SERVERDATE = d;
                d.setSeconds(d.getSeconds() + 1);
                if (typeof self.clockInterval !== null)
                    window.clearInterval(self.clockInterval);
                self.clockInterval = window.setInterval(function () {
                    d.setSeconds(d.getSeconds() + 1);
                    var dateTime = Global.gregorianToJalali(d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()) + ' ' + Global.zeroFill(d.getHours()) + ':' + Global.zeroFill(d.getMinutes()) + ':' + Global.zeroFill(d.getSeconds());
                    $("#server-time span").text(dateTime);
                }, 1000);
            });
        };
        systemDate();
        if (clockUpdateInterval !== null)
            window.clearInterval(clockUpdateInterval);
        clockUpdateInterval = window.setInterval(function () {
            systemDate();
        }, 900000);


        return true;
    };

    var registerHandlebarsHelpers = function () {
        Template.template.handlebarHelpers();
        Template.template.handlebarPartials();
    };

    return {
        initialize: initialize
    };
});
