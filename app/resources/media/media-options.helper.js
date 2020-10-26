define(['jquery', 'underscore', 'backbone', 'config', 'global', 'toastr', 'resources.media.model', 'authorization'
], function ($, _, Backbone, Config, Global, toastr, MediaModel, Authorize) {
    var MediaOptionsHelper = {
        update: function(params, callback) {
            if (typeof params.task === 'undefined')
                return;
            switch(params.task.toLowerCase()) {
                case 'state':
                    MediaOptionsHelper.state(params, function(response) {
                        if (typeof callback === 'function')
                            callback({success: response.success, error: response.error})
                    });
                    break;
                case 'whatever':
                    break;
            }
        }
        , state: function(params, callback) {
            if (Authorize.access(params.value, null, 'media-state')) {
                new MediaModel({id: params.id}).save({
                    key: 'State'
                    , value: params.value
                }, {
                    patch: true
                    , error: function (e, data) {
                        callback({success: false, error: data.responseJSON.Message});
                    }
                    , success: function (model, response) {
                        callback({success: response, error: false});
                    }
                });
            } else {
                toastr.warning('شما دسترسی این تغییر وضعیت را ندارید.', 'خطا', Config.settings.toastr);
            }
        }
    };
    return MediaOptionsHelper;
});
