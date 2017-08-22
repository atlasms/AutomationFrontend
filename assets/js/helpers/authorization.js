define(['jquery', 'underscore', 'backbone', 'config', 'storage.helper'], function ($, _, Backbone, Config, Storage) {
//    var Authorize = function (action, alias, permissions, params) {
//        var permit = false;
//        var key = (typeof action === "undefined") ? 'access' : action;
//        var permissions = (typeof permissions === "undefined") ? Storage('Access') : permissions;
//        $.each(permissions, function () {
//            if (this.Key == key && this.Value == alias)
//                permit = true;
//        });
//        return permit;
//    };
    var Authorize = {
        access : function (action, permissions, type) {
            var permit = false;
            var permissions = (typeof permissions !== "undefined" && permissions) ? permissions : Storage('Access');
            var type = (typeof type !== "undefined" && type) ? type : 'access';
            $.each(permissions, function () {
                if (this.Key === type && this.Value == action)
                    permit = true;
            });
            return permit;
        }
        , menu : function(action, permissions) {
            var permit = false;
            var permissions = (typeof permissions === "undefined") ? Storage('Access') : permissions;
            $.each(permissions, function () {
                if (this.Key === 'menu' && this.Value == action)
                    permit = true;
            });
            return permit;
        }
    };
    return Authorize;
});