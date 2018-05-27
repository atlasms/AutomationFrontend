define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'broadcast.schedule.model'
], function ($, _, Backbone, Template, Config, Global, moment, ScheduleModel) {
    var SchedulePrintView = Backbone.View.extend({
//        el: $(Config.positions.wrapper)
        model: 'ScheduleModel'
        , toolbar: []
        , statusbar: []
        , flags: {}
        , events: {}
        , processTime: function (options) {
//            var validate = new ScheduleHelper.validate();
//            validate.time($(options.target));
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
        }
        , render: function (params) {
            var template = Template.template.load('broadcast/schedule', 'scheduleprint');
            var $container = $(Config.positions.wrapper);
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
//                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    if ($("#schedule-page tbody tr").length)
                        $("#schedule-page tbody").empty();
                }
            });
        }
        , afterRender: function () {
//            ScheduleHelper.mask("time");
//            $("#toolbar button[type=submit]").removeClass('hidden').addClass('in');
//            if (typeof this.flags.helperLoaded === "undefined") {
//                ScheduleHelper.init();
//                this.flags.helperLoaded = true;
//            } else
//                ScheduleHelper.init(true);
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

        }
    });
    return SchedulePrintView;
});