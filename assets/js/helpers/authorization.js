define(['jquery', 'underscore', 'backbone', 'config', 'storage.helper'], function ($, _, Backbone, Config, Storage) {
    var Authorize = {
        access: function (action, permList, requestedType) {
            var permit = false;
            var permissions = (typeof permList !== "undefined" && permList) ? permList : Storage('Access');
            var type = (typeof requestedType !== "undefined" && requestedType) ? requestedType : 'access';
            $.each(permissions, function () {
                // if (this.Key === type && String(this.Value) === String(action)) {
                if (this.Key === type && parseInt(this.Value, 10) === parseInt(action, 10)) {
                    permit = true;
                }
            });
            return permit;
        }
        , menu: function (action, permissions) {
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
