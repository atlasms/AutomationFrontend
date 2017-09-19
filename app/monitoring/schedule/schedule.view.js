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
            , 'click [data-task=restore-schedule]': 'restoreSchedule'
        }
        , flags: {}
        , reLoad: function () {
            this.load();
        }
        , restoreSchedule: function (e) {
            e.preventDefault();
            var date = Global.jalaliToGregorian($('[name="schedule-dest"]').val());
            var data = JSON.parse($("#raw-data").val());
            $.each(data, function() {
                this.CondcutorStartTime = date + 'T' + this.CondcutorStartTime.split("T")[1];
            });
            new ScheduleModel().save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'انتقال کنداکتور', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    $this.reLoad();
                }
            });
        }
        , openDetails: function (e) {
            var self = this;
            var $this = $(e.target);
            if (typeof $this.data('id') === "undefined")
                return false;
            var params = {path: '/log/' + $this.data('id')};
            new ScheduleModel(params).fetch({
                success: function (items) {
                    items = JSON.parse(self.prepareItems(items.toJSON(), params)[0]["logData"]);
                    var template = Template.template.load('broadcast/schedule', 'scheduledetail.partial');
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $(self.$modal).find(".modal-body").html(output).promise().done(function () {
                            $(self.$modal).modal('toggle');

                            $('[name="schedule-dest"]').val() === "" && $('[name="schedule-dest"]').pDatepicker(CONFIG.settings.datepicker) && $(".datepicker-plot-area").css({'z-index': 100000});
                        });
                    });
                }
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