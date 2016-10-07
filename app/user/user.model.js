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
            !Backbone.History.started && Backbone.history.start();
            new Backbone.Router().navigate('login', {trigger: true}); 
        }
    });
    return UserModel;
});
