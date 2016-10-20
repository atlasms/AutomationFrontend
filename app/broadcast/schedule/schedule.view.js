define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'broadcast.schedule.model', 'mask', 'toolbar', 'pdatepicker', 'scheduleHelper'
], function ($, _, Backbone, Template, Config, Global, moment, ScheduleModel, Mask, Toolbar, pDatepicker, ScheduleHelper) {
    var ScheduleView = Backbone.View.extend({
        el: $(Config.positions.wrapper)
        , model: 'ScheduleModel'
        , toolbar: [
            {'button': {cssClass: 'btn green-jungle pull-right hide fade', text: 'ذخیره', type: 'submit', task: 'save'}}
            , {'button': {cssClass: 'btn c-btn-border-1x c-btn-grey-salsa', text: 'PDF', type: 'pdf', task: 'file'}}
            , {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'load'}}
//            , {'input': {cssClass: 'form-control datepicker hide', placeholder: '', type: 'text', name: 'enddate', value: persianDate().format('YYYY-MM-DD')}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'startdate', value: persianDate().format('YYYY-MM-DD')}}
        ]
        , flags: {}
        , events: {
            'click [type=submit]': 'submit'
            , 'keyup input.time': 'processTime'
            , 'click [data-task=load]': 'load'
            , 'click [data-task=file]': 'loadFile'
        }
        , submit: function () {
            var helper = new ScheduleHelper.validate();
            if (!helper.beforeSave())
                return;
            var data = this.prepareSave();
            new ScheduleModel().save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
            });
        }
        , loadFile: function (e) {
            var params = {
                startdate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00'
                , enddate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T23:59:59'
                , format: $(e.currentTarget).attr("type")
            };
            var model = new ScheduleModel(params);
            model.navigate((typeof params !== "undefined") ? $.param(params) : null);
        }
        , processTime: function (options) {
            var validate = new ScheduleHelper.validate();
            validate.time($(options.target));
        }
        , load: function (e, extend) {
            console.info('Loading items');
            var params = {
                startdate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00'
                , enddate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T23:59:59'
            };
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
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
            ScheduleHelper.mask("time");
            $("#toolbar button[type=submit]").removeClass('hide').addClass('in');
            if (typeof this.flags.helperLoaded === "undefined") {
                ScheduleHelper.init();
                this.flags.helperLoaded = true;
            } else
                ScheduleHelper.init(true);
        }
        , renderToolbar: function () {
            var self = this;
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
            var datepickerConf = {
                onSelect: function () {
                    self.load();
                    $datePickers.blur();
                }
            };
            $.each($datePickers, function () {
                $(this).pDatepicker($.extend({}, CONFIG.settings.datepicker, datepickerConf));
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
            var $this = this;
            $(document).on('change', 'tr input', function () {
                if (typeof $this.flags.updatedContent !== "undefined" && $this.flags.updatedContent === true)
                    return;
                var myEvent = window.attachEvent || window.addEventListener;
                var chkevent = window.attachEvent ? 'onbeforeunload' : 'beforeunload'; /// make IE7, IE8 compitable
                myEvent(chkevent, function (e) { // For >=IE7, Chrome, Firefox
                    var confirmationMessage = 'Are you sure to leave the page?';  // a space
                    (e || window.event).returnValue = confirmationMessage;
                    return confirmationMessage;
                });
                $this.flags.updatedContent = true;
            });
        }
        , prepareSave: function () {
            var data = [];
            var $rows = $("table:first tbody tr");
            $rows.each(function () {
                var row = {};
                $(this).find("input, textarea, select").each(function () {
                    var $input = $(this);
                    if (typeof $input.attr("name") !== "undefined") {
                        row[$input.attr("name")] = (/^\d+$/.test($input.val()) || ($input.attr("data-validation") === 'digit')) ? +$input.val() : $input.val();
//                        row[$input.attr("name")] = ($input.attr("data-validation") === 'digit')
                        if (typeof $input.attr('data-before-save') !== "undefined") {
                            switch ($input.attr('data-before-save')) {
                                case 'prepend-date':
                                    row[$input.attr("name")] = Global.jalaliToGregorian($(this).parent().find("label").text()) + 'T' + $input.val();
                                    break;
                                case 'timestamp':
                                    row[$input.attr("name")] = Global.processTime($input.val());
                                    break;
                            }
                        }
                    }
                });
                data.push(row);
            });
            return data;
        }
    });
    return ScheduleView;
});