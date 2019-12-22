define(['jquery', 'underscore', 'backbone', 'template', 'config', 'toolbar', 'dashboard.model', 'count-to', 'easy-pie-chart'
], function ($, _, Backbone, Template, Config, Toolbar, DashboardModel) {

    var DashboardView = Backbone.View.extend({
        data: {}
        , events: {}
        , toolbar: []
        , render: function () {
            // Initial redirect, if any
            if (typeof Config.initialRedirect !== "undefined" && location.pathname === '/') {
                new Backbone.Router().navigate(Config.initialRedirect, {trigger: true});
                return false;
            }

            // preventing url query to be passed here
            console.log(location.pathname)
            if (location.pathname === '') {

            }

            var self = this;
            var template = Template.template.load('dashboard', 'dashboard');
            template.done(function (data) {
                var html = $(data).wrap('<p/>').parent().html();
                var handlebarsTemplate = Template.handlebars.compile(html);
                var output = handlebarsTemplate({});
                $(Config.positions.main).html(output).promise().done(function () {
                    self.loadSystemData(function () {
                        self.loadUserData(function () {
                            self.afterRender();
                        })
                    });
                });
            });
            return this;
        }
        , loadSystemData: function (callback) {
            var template = Template.template.load('dashboard', 'system-data.partial');
            template.done(function (tmpl) {
                var handlebarsTemplate = Template.handlebars.compile(tmpl);
                new DashboardModel().fetch({
                    success: function (data) {
                        systemData = data.toJSON();
                        var output = handlebarsTemplate(systemData);
                        $('#system-data').html(output).promise().done(function () {
                            if (typeof callback === 'function') {
                                callback();
                            }
                        });
                    }
                });
            });
        }
        , loadUserData: function (callback) {
            var template = Template.template.load('dashboard', 'user-data.partial');
            template.done(function (tmpl) {
                var handlebarsTemplate = Template.handlebars.compile(tmpl);
                new DashboardModel({overrideUrl: Config.api.dashboardUser}).fetch({
                    success: function (data) {
                        userData = data.toJSON();
                        userData.activitiesLog.splice(4);
                        var output = handlebarsTemplate(userData);
                        $('#user-data').html(output).promise().done(function () {
                            if (typeof callback === 'function') {
                                callback();
                            }
                        });
                    }
                });
            });
        }
        , renderToolbar: function () {
            var elements = this.toolbar;
            var toolbar = new Toolbar();
            toolbar.render();
        }
        , afterRender: function () {
            var $counters = $('[data-counter="counterup"]');
            var $charts = $('.chart');
            $counters.each(function (ignore, counter) {
                $(this).countTo({
                    from: 0
                    , to: ~~$(this).attr('data-value')
                    , refreshInterval: 50
                    , speed: 1500
                });
            });
            $charts.each(function () {
                $(this).easyPieChart({
                    animate: {
                        duration: 1500,
                        enabled: true
                    },
                    onStep: function (from, to, percent) {
                        $(this.el).find('.percent').text(Math.round(percent));
                    }
                });
            });
        }
        , prepareContent: function () {
            this.renderToolbar();
        }
    });

    return DashboardView;

});
