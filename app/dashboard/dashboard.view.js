define(['jquery', 'underscore', 'backbone', 'template', 'config', 'dashboard.model', 'count-to'
], function ($, _, Backbone, Template, Config, DashboardModel) {

    var DashboardView = Backbone.View.extend({
        data: {}
        , events: {}
        , render: function () {
            // Initial redirect, if any
            if (typeof Config.initialRedirect !== "undefined" && location.pathname === '/') {
                new Backbone.Router().navigate(Config.initialRedirect, {trigger: true});
                return false;
            }

            var self = this;
            var template = Template.template.load('dashboard', 'dashboard');
            template.done(function (data) {
                var html = $(data).wrap('<p/>').parent().html();
                var handlebarsTemplate = Template.handlebars.compile(html);

                new DashboardModel().fetch({
                    success: function (data) {
                        systemData = data.toJSON();
                        var output = handlebarsTemplate(systemData);
                        $(Config.positions.main).html(output).promise().done(function () {
                            self.afterRender();
                        });
                    }
                });
            });
            return this;
        }
        , afterRender: function () {
            var $counters = $('[data-counter="counterup"]');
            $counters.each(function (ignore, counter) {
                $(this).countTo({
                    from: 0
                    , to: ~~$(this).attr('data-value')
                    , refreshInterval: 50
                    , speed: 1500
                });
            });
        }
    });

    return DashboardView;

});
