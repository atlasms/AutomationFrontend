define(['jquery', 'underscore', 'backbone', 'template', 'config', 'user', 'toolbar', 'statusbar'
], function ($, _, Backbone, Template, Config, User, Toolbar, Statusbar) {

    var PRView = Backbone.View.extend({
        data: {}
        , events: {}
        , render: function () {
            var self = this;
            var template = Template.template.load('pr', 'pr');
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

    return PRView;

});
