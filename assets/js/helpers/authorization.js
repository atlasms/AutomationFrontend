define(['jquery', 'underscore', 'backbone', 'config', 'storage.helper'], function ($, _, Backbone, Config, Storage) {
    var Authorize = {
        access: function (action, permList, requestedType) {
            var permit = false;
            var permissions = (typeof permList !== "undefined" && permList) ? permList : Storage('Access');
            var type = (typeof requestedType !== "undefined" && requestedType) ? requestedType : 'access';

            var permissionByType = _.filter(permissions, function (permission) {
                return permission.Key === type;
            });
            if (permissionByType.length > 0) {
                if (!isNaN(action)) {
                    // if action is a number
                    _.find(permissionByType, function (permission) {
                        if (parseInt(permission.Value, 10) === parseInt(action, 10)) {
                            permit = true;
                        }
                    });
                } else {
                    // if action is a string
                    _.find(permissionByType, function (permission) {
                        if (permission.Value == action) {
                            permit = true;
                        }
                    });
                }
            }


            // $.each(permissions, function () {
            //     // if (this.Key === type && parseInt(this.Value, 10) === parseInt(action, 10)) {
            //     if (this.Key === 'media-state' && parseInt(this.Value, 10) === parseInt(action, 10)) {
            //         console.log(this.Key, parseInt(this.Value, 10), parseInt(action, 10));
            //     }
            //     if ((this.Key === 'access' || this.Key === 'media-state' || this.Key === 'state') && parseInt(this.Value, 10) === parseInt(action, 10)) {
            //         permit = true;
            //     } else if (requestedType === 'schedule-report' && action == this.Value) {
            //         permit = true;
            //     } else {
            //
            //     }
            // });
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
    window.authorize = Authorize;
    return Authorize;
});
