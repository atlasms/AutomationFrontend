define(['jquery', 'underscore', 'backbone', 'template', 'config', 'user', 'toolbar', 'statusbar'
], function ($, _, Backbone, Template, Config, User, Toolbar, Statusbar) {

    var WebsiteDashboardView = Backbone.View.extend({
        data: {}
        , events: {}
//        , el:
        , render: function () {
            var self = this;
            var template = Template.template.load('website/item', 'item');
            template.done(function (data) {
                new Toolbar().render();
                new Statusbar().render();
                var html = $(data).wrap('<p/>').parent().html();
                var handlebarsTemplate = Template.handlebars.compile(html);
                var output = handlebarsTemplate({id: self.getId()});
                $(Config.positions.main).html(output);
            });
            return this;
        }
        , getId: function () {
            return Backbone.history.getFragment().split("/").pop().split("?")[0];
        }
    });

    return WebsiteDashboardView;

});
