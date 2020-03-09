define(['jquery', 'underscore', 'backbone', 'template', 'config', 'website.model'
], function ($, _, Backbone, Template, Config, WebsiteModel) {
    var WebsiteView = Backbone.View.extend({
//        el: $(Config.positions.wrapper)
        model: 'BroadcastModel'
        , initialize: function(options) {
            var model = new WebsiteModel();
            model.initialize();
        }
    });
    return WebsiteView;
});
