define(['jquery', 'underscore', 'backbone', 'template', 'config', 'user', 'toolbar', 'statusbar', 'website.service'
], function ($, _, Backbone, Template, Config, User, Toolbar, Statusbar, WebsiteService) {

    var WebsiteDashboardView = Backbone.View.extend({
        data: {}
        , events: {}
//        , el:
        , render: function () {
            var self = this;
            var template = Template.template.load('website/dashboard', 'dashboard');
            template.done(function (data) {
                new Toolbar().render();
                new Statusbar().render();
                var html = $(data).wrap('<p/>').parent().html();
                var handlebarsTemplate = Template.handlebars.compile(html);
                var output = handlebarsTemplate(this.data);
                $(Config.positions.main).html(output);
            });
            return this;
        }
    });

    return WebsiteDashboardView;

});
