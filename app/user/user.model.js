define(["jquery", "underscore", "backbone", "config", 'toastr'
], function ($, _, Backbone, Config, toastr) {
    var UserModel = Backbone.Model.extend({
        defaults: {
            storageKey: ''
        }
        , storage: {}
        , initialize: function (options) {
            this.storageKey = Config.title.toLowerCase() + '_' + window.location.host.replace(/\./g, '').split(":")[0];
            //            this.storage = new Storage(this.storageKey);
//            console.log('Login Model Init');
        }
        , authorize: function () {
            var items = STORAGE.getItem(this.storageKey);
            if (items) {
                var content = JSON.parse(items);
                if (content.username && content.token) {
                    console.log('User found: ' + JSON.stringify(content));
                    return true;
                }
            }
            this.redirect();
        }
        , redirect: function () {
            // Redirecting User to login page
            !Backbone.History.started && Backbone.history.start({pushState: true});
            new Backbone.Router().navigate('login', {trigger: true});
        }
        , logout: function() {
            this.redirect();
        }
        , login: function (form) {
            var key = this.storageKey;
            $.ajax({
                url: CONFIG.api.login
                , data: form
                , type: 'post'
                , dataType: "json"
                , success: function (d) {
                    if (d.status && d.status !== 200)
                        return false;
                    var userData = {
                        username: form.username
                        , token: d.token_type + ' ' + d.access_token
                        , expire: new Date().getTime() + (parseInt(d.expires_in) * 1000)
                    };
                    STORAGE.setItem(key, JSON.stringify(userData));
                    STORAGE.setItem(key + '_token', d.token_type + ' ' + d.access_token);
                    // Redirect to home
                    !Backbone.History.started && Backbone.history.start({pushState: true});
                    new Backbone.Router().navigate('', {trigger: true});
                }
                , error: function (jqXHR, exception) {
                    var msg = '';
                    var type = 'error';
                    if (jqXHR.status === 0) {
                        msg = 'Not connect.\n Verify Network.';
                    } else if (jqXHR.status === 400) {
                        msg = 'درخواست نا معتبر. [400]';
                    } else if (jqXHR.status === 403) {
                        msg = 'عدم مجوز اجرای دستور. [403]';
                        type = 'warning';
                    } else if (jqXHR.status === 500) {
                        msg = 'خطا در سرور. [500]';
                    } else if (jqXHR.status === 503) {
                        msg = 'خطا در اجرای دستور. [503]';
                    } else if (exception === 'timeout') {
                        msg = 'Time out error.';
                    } else if (exception === 'abort') {
                        msg = 'Request aborted.';
                        type = 'warning';
                    } else {
                        msg = 'Uncaught Error.\n' + jqXHR.responseText;
                    }
                    toastr.error(msg, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
//                    TODO: Toast
                }
            });
        }


    });
    return UserModel;
});
