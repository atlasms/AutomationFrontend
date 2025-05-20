define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'toolbar','moment-with-locales', 'broadcast.schedule.model', 'pdatepicker', 'bootstrap-table', 'pdate'
], function ($, _, Backbone, Template, Config, Global, Toolbar, moment, ScheduleModel, pDatepicker) {
    var ScheduleReportView = Backbone.View.extend({
        model: 'ScheduleModel'
        , toolbar: [
            { 'button': { cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'load', icon: 'fa fa-monitor' } }
            , {
                'input': {
                    cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'startdate', addon: true, icon: 'fa fa-calendar'
                    , value: Global.getVar("date") ? Global.jalaliToGregorian(Global.getVar("date")) : moment(SERVERDATE).format('YYYY-MM-DD')
                }
            }
        ]
        , statusbar: []
        , flags: {}
        , events: {
            'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task=load]': 'load'
        }
        , processTime: function (options) {
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            this.render();
        }
        , render: function (params) {
            var template = Template.template.load('broadcast/schedule', 'schedulereport');
            var $container = $(Config.positions.main);
            var params = {
                startdate: Global.getVar("startdate") ? Global.getVar("startdate") : Global.today() + 'T00:00:00'
                , enddate: Global.getVar("startdate") ? Global.getVar("startdate").split('T')[0] + 'T23:59:59' : Global.today() + 'T23:59:59'
            };
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            var model = new ScheduleModel(params);
            var self = this;
            model.fetch({
                data: (typeof params !== "undefined") ? $.param(params) : null
                , success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            self.afterRender();
                        });
                    });
                }
                , error: function (e, data) {
                    if ($("#schedule-page tbody tr").length)
                        $("#schedule-page tbody").empty();
                }
            });
        }
        , afterRender: function () {
            $('#schedule-report').bootstrapTable($.extend({}, Config.settings.bootstrapTable, {pageSize: 500}));
        }
        , prepareItems: function (items, params) {
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
        , renderToolbar: function () {
            var self = this;
            var elements = this.toolbar;
            var toolbar = new Toolbar();
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
            self.attachDatepickers();
        }
        , attachDatepickers: function () {
            var self = this;
            var $datePickers = $(".datepicker");
            $.each($datePickers, function () {
                var $this = $(this);
                if ($this.data('datepicker') == undefined) {
                    $this.pDatepicker($.extend({}, CONFIG.settings.datepicker, {
                        onSelect: function (e) {
                            if ($this.parents("#toolbar").length) {
                                self.load();
                            }
                            $datePickers.blur();
                            if ($this.parents("#duplicate-schedule").length) {
                                self.loadScheduleItem($this);
                            }
                        }
                    }));
                }
            });
        }
    });
    return ScheduleReportView;
});
