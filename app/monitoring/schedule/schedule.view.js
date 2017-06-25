define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'broadcast.schedule.model', 'toolbar', 'toastr', 'pdatepicker', 'bootstrap-table', 'bootstrap/modal', 'bootstrap/tooltip'
], function ($, _, Backbone, Template, Config, Global, ScheduleModel, Toolbar, toastr) {
    var MonitoringScheduleView = Backbone.View.extend({
        $modal: "#schedule-log-modal"
        , toolbar: [
            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh-view', icon: 'fa fa-refresh'}}
        ]
        , events: {
            'click [data-task=filter_rows]': 'filter'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task=open-details]': 'openDetails'
        }
        , flags: {}
        , reLoad: function () {
            this.load();
        }
        , openDetails: function (e) {
            var self = this;
            var $this = $(e.target);
            if (!$this.next().is("textarea") || $this.next().val() === "")
                return false;
            var cachedData = $this.next().val().replace(/\\/g, "");
            var items = JSON.parse(cachedData);
            var template = Template.template.load('broadcast/schedule', 'scheduledetail.partial');
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate(items);
                $(self.$modal).find(".modal-body").html(output).promise().done(function () {
                    $(self.$modal).modal('toggle');
                });
            });
        }
        , load: function (extend) {
            console.info('Loading items');
            var params = {};
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , render: function (params) {
            var self = this;
            var params = {path: '/log'};
            var model = new ScheduleModel(params);
            var template = Template.template.load('monitoring/schedule', 'schedule');
            var $container = $(Config.positions.main);
            model.fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            self.afterRender();
                        });
                    });
                }
            });
        }
        , afterRender: function () {
            var $this = this;
            $('[data-toggle="tooltip"]').tooltip();
        }
        , renderToolbar: function () {
            var self = this;
            var elements = self.toolbar;
            var toolbar = new Toolbar();
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
            var $datePickers = $(".datepicker");
            var datepickerConf = {
                onSelect: function () {
                    self.load();
                    $datePickers.blur();
                }
            };
            $.each($datePickers, function () {
                $(this).pDatepicker($.extend({}, CONFIG.settings.datepicker, datepickerConf));
            });
            self.flags.toolbarRendered = true;
        }
        , prepareItems: function (items, params) {
            var $this = this;
            if (typeof items.query !== "undefined")
                delete items.query;
            if (typeof params !== "undefined") {
                for (var prop in params) {
                    delete items[prop];
                }
            }
            return items;
        }
        , prepareContent: function () {
            this.renderToolbar();
        }
        , prepareSave: function () {
            data = null;
            return data;
        }
    });
    return MonitoringScheduleView;
});