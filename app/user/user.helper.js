define(['jquery', 'underscore', 'backbone', 'config'
], function ($, _, Backbone, Config) {
    var UserHelper = {
        authorize: function (actions, map) {
            if (typeof map[actions] !== "undefined" && map[actions].private === false)
                return true;
            else {
                if (STORAGE.getItem(this.storageKey)) {
                    var content = JSON.parse(STORAGE.getItem(this.storageKey));
                    if (content.username && content.token) {
                        return true;
                    }
                }
            }
            this.redirect();
            return false;
        }
        , storageKey: typeof storageKey !== "undefined" ? Config.storageKey : Config.title.toLowerCase() + '_' + window.location.host.replace(/\./g, '').split(":")[0]
        , redirect: function () {
            // Redirecting User to login page
            location.href = '/login';
            return false;
        }
        , getUser: function () {
            if (STORAGE.getItem(UserHelper.storageKey)) {
                var content = JSON.parse(STORAGE.getItem(UserHelper.storageKey));
                if (content.data) {
                    return content.data;
                }
            }
        }
        , getToken: function () {
            if (STORAGE.getItem(UserHelper.storageKey)) {
                var content = JSON.parse(STORAGE.getItem(UserHelper.storageKey));
                if (content.token) {
                    return content.token;
                }
            }
            return null;
        }
    };
    return UserHelper;
});