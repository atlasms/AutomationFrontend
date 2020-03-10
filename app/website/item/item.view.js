define(['jquery', 'underscore', 'backbone', 'template', 'config', 'user', 'toolbar', 'statusbar', 'website.service'
], function ($, _, Backbone, Template, Config, User, Toolbar, Statusbar, WebsiteService) {

    var WebsiteDashboardView = Backbone.View.extend({
        data: {}
        , events: {}
        , render: function () {
            var self = this;
            var id = this.getId();
            var template = Template.template.load('website/item', 'item');
            WebsiteService.getItem(id, function (item) {
                new Toolbar().render();
                new Statusbar().render();
                template.done(function (data) {
                    var handlebarsTemplate = Template.handlebars.compile(data);
                    var output = handlebarsTemplate(item);
                    $(Config.positions.main).html(output).promise().done(function () {
                        self.afterRender();
                    });
                });
            });
            return this;
        }
        , getId: function () {
            return Backbone.history.getFragment().split("/").pop().split("?")[0];
        }
        , afterRender: function () {

        }
    });

    return WebsiteDashboardView;

});
