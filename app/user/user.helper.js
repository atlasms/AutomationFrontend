define(['jquery', 'underscore', 'backbone', 'config', 'authorization'
], function ($, _, Backbone, Config, authorization) {
    var UserHelper = {
        // Simple public or restricted pages access check
        authorize: function (actions, map) {
            if (typeof map[actions] !== "undefined" && map[actions].private === false)
                return true;
            else {
                if (typeof STORAGE !== "unedfined" && STORAGE && STORAGE.getItem(this.storageKey)) {
                    var content = JSON.parse(STORAGE.getItem(this.storageKey));
                    if (content.username && content.token) {
                        return true;
                    }
                }
            }
            this.redirect();            
            return false;
        }
        // Method to check user access based on Authorization class and server-side data
        , Authorize: function (type, action) {
            var user = UserHelper.getUser();
            return authorization[type](action, user.Access);
        }
        , storageKey: Config.storageKey
        , redirect: function (post, data) {
            // Redirecting User to login page
            if (typeof post === "undefined" || post !== true)
                location.href = '/login';
            else
                location.href = '/login?msg=' + data.msg + '&redirect=' + data.url;
            return false;
        }
        , getUser: function () {
            if (typeof STORAGE === "undefined" || !STORAGE || !STORAGE.getItem)
                return null;
            if (STORAGE.getItem(UserHelper.storageKey)) {
                var content = JSON.parse(STORAGE.getItem(UserHelper.storageKey));
                if (content.data) {
                    return content.data;
                }
            }
        }
        , getToken: function () {
            if (typeof STORAGE === "undefined" || !STORAGE || !STORAGE.getItem)
                return null;
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