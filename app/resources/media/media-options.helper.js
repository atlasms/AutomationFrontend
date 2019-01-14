define(['jquery', 'underscore', 'backbone', 'config', 'global', 'toastr', 'resources.media.model'
], function ($, _, Backbone, Config, Global, toastr, MediaModel) {
    var MediaOptionsHelper = {
        update: function(params, callback) {
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
        }
    };
    return MediaOptionsHelper;
});