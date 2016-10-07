define([
    "jquery"
            , "underscore"
            , "backbone"
            , "router"
            , "config"
            , "localstorage"
], function ($, _, Backbone, Router, Config, Storage) {
    var UserModel = Backbone.Model.extend({
        defaults: {
            storageKey: ''
        }
        , storage: {}
        , initialize: function (options) {
            this.storageKey = Config.title.toLowerCase() + '_' + window.location.host.replace(/\./g, '').split(":")[0];
//            this.storage = new Storage(this.storageKey);
            console.log('Login Model Init');
        }
        , authorize: function () {
            var items = STORAGE.getItem(this.storageKey);
            if (items) {
                var content = JSON.parse(items);
                if (content.username && content.token) {
                    return true;
                }
            }
            return false;
        }
        , redirect: function () {
            // Redirecting User to login page
            !Backbone.History.started && Backbone.history.start({pushState: true});
            new Backbone.Router().navigate('login', {trigger: true});
        }
        , login: function (form) {
            var key = this.storageKey;
            $.ajax({
                url: CONFIG.api.url + CONFIG.api.login
                , data: JSON.stringify(form)
                , type: 'post'
                , dataType: "json"
                , success: function (d) {
                    var userData = {
                        username: form.username
                        , token: d.token
                    }
                    STORAGE.setItem(key, JSON.stringify(userData));
                    STORAGE.setItem(key + '_token', d.token);
                    // Redirect to home
                    !Backbone.History.started && Backbone.history.start({pushState: true});
                    new Backbone.Router().navigate('', {trigger: true});
                }
            });
        }


    });
    return UserModel;
});
