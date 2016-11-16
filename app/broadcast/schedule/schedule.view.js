define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'broadcast.schedule.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'scheduleHelper', 'ladda', 'bootbox', 'bootstrap/modal', 'bootstrap/transition'
], function ($, _, Backbone, Template, Config, Global, moment, ScheduleModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, ScheduleHelper, Ladda, bootbox) {
    bootbox.setLocale('fa');
    var ScheduleView = Backbone.View.extend({
        el: $(Config.positions.wrapper)
        , model: 'ScheduleModel'
        , toolbar: [
            {'button': {cssClass: 'btn purple-wisteria pull-right', text: 'کپی', type: 'button', task: 'show-duplicate-form'}}
            , {'button': {cssClass: 'btn green-jungle pull-right hidden fade', text: 'ذخیره', type: 'submit', task: 'save'}}
            , {'button': {cssClass: 'btn red-flamingo', text: 'ارسال پلی‌لیست', type: 'button', task: 'show-export-form'}}
            , {'button': {cssClass: 'btn c-btn-border-1x c-btn-grey-salsa', text: 'PDF', type: 'pdf', task: 'file'}}
            , {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'load'}}
//            , {'input': {cssClass: 'form-control datepicker hidden', placeholder: '', type: 'text', name: 'enddate', value: persianDate().format('YYYY-MM-DD')}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'startdate', value: persianDate().format('YYYY-MM-DD'), addon: true}}
        ]
        , statusbar: [
            {type: 'total-count', text: 'تعداد آیتم‌ها ', cssClass: 'badge badge-info'}
            , {type: 'total-duration', text: 'مجموع زمان کنداکتور', cssClass: 'badge grey-salsa'}
        ]
        , timeArrays: {}
        , flags: {}
        , events: {
            'click [type=submit]': 'submit'
            , 'keyup input.time': 'processTime'
            , 'click [data-task=load]': 'load'
            , 'click [data-task=file]': 'loadFile'
            , 'click [data-task=show-duplicate-form]': 'showDuplicateToolbar'
            , 'click [data-task=show-export-form]': 'showExportToolbar'
            , 'click [data-task=duplicate]': 'duplicate'
            , 'click [data-task=export]': 'exportPlaylist'
            , 'click [data-task=refresh]': 'refreshList'
            , 'change [name=force]': 'warnForceDuplicate'
            , 'focus input.time': 'selectInput'
        }
        , submit: function (e) {
            e.preventDefault();
            var $this = this;
            var helper = new ScheduleHelper.validate();
            if (!helper.beforeSave())
                return;
            var data = this.prepareSave();
            new ScheduleModel().save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'ذخیره کنداکتور', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    $this.reLoad();
                }
            });
        }
        , selectInput: function (e) {
            $(e.target).trigger('select');
        }
        , refreshList: function (e) {
            e.preventDefault();
            var target = $(e.currentTarget).attr('data-target');
            switch (target) {
                case 'export':
                    ScheduleHelper.generateTimeArray();
                    break;
            }
        }
        , duplicate: function (e) {
            e.preventDefault();
            var params = {
                startdate: Global.jalaliToGregorian($("#duplicate-schedule [name=startdate]").val()) + 'T00:00:00'
                , enddate: Global.jalaliToGregorian($("#duplicate-schedule [name=startdate]").val()) + 'T23:59:59'
                , destinationdate: Global.jalaliToGregorian($("#duplicate-schedule [name=destinationdate]").val()) + 'T00:00:00'
                , force: +$("#duplicate-schedule [name=force]").val()
            };
            new ScheduleModel({path: '/copy'}).save(null, {
                data: JSON.stringify(params)
                , contentType: 'application/json'
                , processData: false
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'عملیات کپی', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    $("#sub-toolbar .duplicate-schedule").removeClass("in");
                }
            });
        }
        , exportPlaylist: function (e) {
            e.preventDefault();
            var params = $("#export-schedule").serializeObject();
            // Validation
            if (Global.processTime(params.startdate) > Global.processTime(params.enddate)) {
                $("#export-schedule").find("select").addClass('has-error');
                toastr.warning('زمان شروع از زمان پایان بزرگتر است.', 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                return false;
            }
            if ($("#schedule-page table tbody").find('.edited, .new, .error').length) {
                toastr.error('تغییرات ذخیره نشده است.', 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                return false;
            }
            params.startdate = Global.jalaliToGregorian($("#toolbar [name=startdate]").val()) + 'T' + params.startdate;
            params.enddate = Global.jalaliToGregorian($("#toolbar [name=startdate]").val()) + 'T' + params.enddate;
            bootbox.confirm({
                message: "آیا مطمئن هستید پلی‌لیست از روی جدول پخش انتخاب شده ساخته شود؟"
                , buttons: {
                    confirm: {className: 'btn-success'}
                    , cancel: {className: 'btn-danger'}
                }
                , callback: function (results) {
                    if (results) {
                        var l = Ladda.create(e.currentTarget);
                        l.start();
                        new ScheduleModel({path: '/export'}).save(null, {
                            data: JSON.stringify(params)
                            , contentType: 'application/json'
                            , processData: false
                            , error: function (e, data) {
                                toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                                l.stop();
                            }
                            , success: function () {
                                toastr.success('با موفقیت انجام شد', 'ارسال پلی‌لیست', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                                $("#sub-toolbar .export-schedule").removeClass("in");
                                l.stop();
                            }
                        });
                    }
                }
            });
        }
        , warnForceDuplicate: function (e) {
            var $checkbox = $(e.target);
            if ($checkbox.is(":checked"))
                $("#schedule-overwrite-alert").addClass('in');
            else
                $("#schedule-overwrite-alert").removeClass('in');
        }
        , showDuplicateToolbar: function () {
            if ($("#sub-toolbar").find(".portlet").not(".duplicate-schedule").is(":visible"))
                $("#sub-toolbar").find(".portlet").not(".duplicate-schedule").removeClass("in").addClass("hidden");
            if ($("#sub-toolbar .duplicate-schedule").is(":hidden"))
                $("#sub-toolbar .duplicate-schedule").removeClass('hidden').addClass("in");
            else
                $("#sub-toolbar .duplicate-schedule").removeClass("in").addClass("hidden");
            $("html, body").animate({'scrollTop': 0});
        }
        , showExportToolbar: function () {
            if ($("#sub-toolbar").find(".portlet").not(".export-schedule").is(":visible"))
                $("#sub-toolbar").find(".portlet").not(".export-schedule").removeClass("in").addClass("hidden");
            if ($("#sub-toolbar .export-schedule").is(":hidden"))
                $("#sub-toolbar .export-schedule").removeClass('hidden').addClass("in");
            else
                $("#sub-toolbar .export-schedule").removeClass("in").addClass("hidden");
            $("html, body").animate({'scrollTop': 0});
        }
        , loadFile: function (e) {
            e.preventDefault();
            var params = {
                startdate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00'
                , enddate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T23:59:59'
                , format: $(e.currentTarget).attr("type")
            };
            var model = new ScheduleModel(params);
            model.navigate((typeof params !== "undefined") ? $.param(params) : null);
            return false;
        }
        , processTime: function (options) {
            var validate = new ScheduleHelper.validate();
            validate.time($(options.target));
        }
        , reLoad: function () {
            this.load();
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
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    if ($("#schedule-page tbody tr").length)
                        $("#schedule-page tbody").empty();
                }
            });
            self.renderToolbar();
            self.renderStatusbar();
        }
        , afterRender: function () {
            ScheduleHelper.mask("time");
            $("#toolbar button[type=submit]").removeClass('hidden').addClass('in');
            if (typeof this.flags.helperLoaded === "undefined") {
                ScheduleHelper.init();
                this.flags.helperLoaded = true;
            } else
                ScheduleHelper.init(true);

            var dateParts = $("[name=startdate]").val().split('-');
            for (var i = 0; i < dateParts.length; i++)
                dateParts[i] = parseInt(dateParts[i]);
            $("[name=startdate]").parent().find(".input-group-addon").text(persianDate(dateParts).format('dddd'));
            ScheduleHelper.generateTimeArray(this);
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
            this.flags.toolbarRendered = true;
        }
        , renderStatusbar: function () {
//            var self = this;
            if (this.flags.statusbarRendered)
                return;
            var elements = this.statusbar;
            var statusbar = new Statusbar();
            $.each(elements, function () {
                statusbar.addItem(this);
            });
            statusbar.render();
            this.flags.statusbarRendered = true;
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