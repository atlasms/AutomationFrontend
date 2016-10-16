define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'broadcast.schedule.model', 'mask', 'toolbar', 'pdatepicker'
], function ($, _, Backbone, Template, Config, Global, moment, ScheduleModel, Mask, Toolbar, pDatepicker) {
    var ScheduleView = Backbone.View.extend({
        el: $(Config.positions.wrapper)
        , model: 'ScheduleModel'
        , toolbar: [
            {'button': {cssClass: 'btn green-jungle pull-right', text: 'ذخیره', type: 'submit', task: 'save'}}
            , {'button': {cssClass: 'btn c-btn-border-1x c-btn-grey-salsa', text: 'PDF', type: 'pdf', task: 'file'}}
            , {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'load'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'enddate', value: persianDate().format('YYYY-MM-DD')}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'startdate', value: persianDate().format('YYYY-MM-DD')}}
        ]
        , flags: {}
        , events: {
            'submit': 'submit'
            , 'keyup input.time': 'processTime'
            , 'click [data-task=load]': 'load'
            , 'click [data-task=file]': 'loadFile'
        }
//        , initialize: function () {
//            _.bindAll(this, "render", "eventCatcher");
//        }
//        , eventCatcher: function (e) {
//            alert();
//        }
        , loadFile: function (e) {
             var params = {
                startdate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00'
                , enddate: Global.jalaliToGregorian($("[name=enddate]").val()) + 'T23:59:59'
                , format: $(e.currentTarget).attr("type")
            };
            var model = new ScheduleModel(params);
            model.navigate((typeof params !== "undefined") ? $.param(params) : null);
        }
        , processTime: function (options) {
            var $element = $(options.target);
            if (!moment($element.val(), 'HH:mm:SS', true).isValid())
                $element.parent().addClass("has-error");
            else
                $element.parent().removeClass("has-error");
        }
        , load: function (e, extend) {
            var params = {
                startdate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00'
                , enddate: Global.jalaliToGregorian($("[name=enddate]").val()) + 'T23:59:59'
            };
            extend = (typeof extend === "object") ? extend : {};
//            console.log();
            this.render($.extend({}, params, extend));
        }
        , render: function (params) {
            var template = Template.template.load('broadcast/schedule', 'schedule');
            var $container = $(Config.positions.main);
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
            });
            self.renderToolbar();
        }
        , afterRender: function () {
            var $timePickers = $(".time");
            $.each($timePickers, function () {
                $(this).mask('H0:M0:S0', {
                    placeholder: '00:00:00', translation: {'H': {pattern: /[0-2]/}, 'M': {pattern: /[0-5]/}, 'S': {pattern: /[0-5]/}}
                });
            });
        }
        , renderToolbar: function () {
            if (this.flags.toolbarRendered)
                return;
            var elements = this.toolbar;
            var toolbar = new Toolbar();
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
                toolbar.render();
            });
            var $datePickers = $(".datepicker");
            $.each($datePickers, function () {
                $(this).pDatepicker(CONFIG.settings.datepicker);
            });
            this.flags.toolbarRendered = true;
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
            // var model = new ScheduleModel();
            // model.initialize();
        }
    });
    return ScheduleView;
});