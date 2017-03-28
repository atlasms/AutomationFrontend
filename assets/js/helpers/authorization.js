define(['jquery', 'underscore', 'backbone', 'config', 'user.helper'], function ($, _, Backbone, Config, UserHelper) {
    var Authorize = function(permissions, action, alias, params) {
        var permit = false;
        var key = (typeof action === "undefined") ? 'access' : action;
        $.each(permissions, function() {
            if (this.Key == key && this.Value == alias)
                permit = true;
        });
        return permit;
    };
    return Authorize;
});