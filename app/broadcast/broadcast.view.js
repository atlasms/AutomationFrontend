define(['jquery', 'underscore', 'backbone', 'template', 'config', 'broadcast.model'
], function ($, _, Backbone, Template, Config, BroadcastModel) {
    var BroadcastView = Backbone.View.extend({
        el: $(Config.positions.wrapper)
        , model: 'BroadcastModel'
        , render: function (content) {
            this.$el.html('<h1>Broadcast</h1>' + content);
        }
        , prepareContent: function () {
            var model = new BroadcastModel();
            model.initialize();
        }
    });
    return BroadcastView;
});