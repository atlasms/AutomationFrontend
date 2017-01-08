define(['jquery', 'underscore', 'backbone', 'template', 'config', 'broadcast.model'
], function ($, _, Backbone, Template, Config, BroadcastModel) {
    var BroadcastView = Backbone.View.extend({
//        el: $(Config.positions.wrapper)
        model: 'BroadcastModel'
        , initialize: function(options) {
            var model = new BroadcastModel();
            model.initialize();
        }
    });
    return BroadcastView;
});