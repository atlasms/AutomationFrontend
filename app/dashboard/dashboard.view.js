define(['jquery', 'underscore', 'backbone', 'template', 'config', 'user', 'toolbar', 'statusbar'
], function ($, _, Backbone, Template, Config, User, Toolbar, Statusbar) {

    var DashboardView = Backbone.View.extend({
        data: {}
        , events: {}
        , el: $(Config.positions.main)
        , render: function () {
            var self = this;
            var template = Template.template.load('dashboard', 'dashboard');
            template.done(function (data) {
                new Toolbar().render();
                new Statusbar().render();
                var html = $(data).wrap('<p/>').parent().html();
                var handlebarsTemplate = Template.handlebars.compile(html);
                var output = handlebarsTemplate(this.data);
                self.$el.html(output);
            });
            return this;
        }
    });

    return DashboardView;

});
