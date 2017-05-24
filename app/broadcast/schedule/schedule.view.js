define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'broadcast.schedule.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'scheduleHelper', 'ladda', 'bootbox', 'player.helper', 'bootstrap/modal', 'bootstrap/transition', 'bootstrap/tab'
], function ($, _, Backbone, Template, Config, Global, moment, ScheduleModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, ScheduleHelper, Ladda, bootbox, Player) {
    bootbox.setLocale('fa');
    var ScheduleView = Backbone.View.extend({
//        el: $(Config.positions.wrapper)
        model: 'ScheduleModel'
        , toolbar: [
            {'button': {cssClass: 'btn purple-wisteria pull-right', text: 'کپی', type: 'button', task: 'show-duplicate-form', access: '256'}}
            , {'button': {cssClass: 'btn green-jungle pull-right hidden fade', text: 'ذخیره', type: 'submit', task: 'save', access: '2'}}
            , {'button': {cssClass: 'btn red-flamingo', text: 'ارسال پلی‌لیست', type: 'button', task: 'show-export-form', access: '128'}}
            , {'button': {cssClass: 'btn c-btn-border-1x c-btn-grey-salsa', text: 'PDF', type: 'pdf', task: 'file'}}
            , {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'load'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'startdate', addon: true
                    , value: Global.getVar("date") ? Global.jalaliToGregorian(Global.getVar("date")) : Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD'))
                }
            }
        ]
        , statusbar: [
            {type: 'total-count', text: 'تعداد آیتم‌ها ', cssClass: 'badge badge-info'}
            , {type: 'total-duration', text: 'مجموع زمان کنداکتور', cssClass: 'badge grey-salsa'}
        ]
        , $toolbarPortlets: "#sub-toolbar .portlet"
        , $duplicatePortlet: "#sub-toolbar .duplicate-schedule"
        , $exportPortlet: "#sub-toolbar .export-schedule"
        , timeArrays: {}
        , flags: {toolbarRendered: false}
        , events: {
            'click [type=submit]': 'submit'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'keyup input.time': 'processTime'
            , 'click [data-task=load]': 'load'
            , 'click [data-task=file]': 'loadFile'
            , 'click [data-task=show-duplicate-form]': 'showDuplicateToolbar'
            , 'click [data-task=show-export-form]': 'showExportToolbar'
            , 'click [data-task=duplicate]': 'duplicate'
            , 'click [data-task=export]': 'exportPlaylist'
            , 'click [data-task=refresh]': 'refreshList'
            , 'change [name=force]': 'warnForceDuplicate'
            , 'change [name=CondcutorIsFixed]': 'fixRow'
            , 'focus input.time': 'selectInput'
            , 'click [data-task=show-titlerow]': 'showTitlesRow'
            , 'change [data-task=update-title-rows]': 'handleTitleRows'
            , 'click [data-task=save-titles]': 'saveTitles'
            , 'click [data-task=save-subtitle]': 'saveSubtitle'
            , 'click [data-task=edit-subtitle]': 'editSubtitle'
            , 'click [data-task=edit-title]': 'editTitle'
            , 'click [data-task=delete-title]': 'deleteTitle'
            , 'click [data-task=delete-subtitle]': 'deleteSubtitle'
            , 'click .remove-meta': 'removeMetaId'
        }
        , fixRow: function (e) {
            var $row = $(e.currentTarget).parents("tr:first");
            if (e.currentTarget.checked)
                $row.addClass('fixed');
            else
                $row.removeClass('fixed');
        }
        , removeMetaId: function (e) {
            e.preventDefault();
            var $this = $(e.currentTarget);
            var $parent = $this.parent();
            $this.remove();
            $parent.find("label").empty();
            $parent.find('input[type="hidden"]').val('');
            $parent.parents("tr:first").find('.item-link').remove();
        }
        , deleteTitle: function (e) {
            e.preventDefault();
            var $this = this;
            bootbox.confirm({
                message: "تایتل انتخاب شده حذف خواهد شد. آیا مطمئن هستید؟"
                , buttons: {
                    confirm: {className: 'btn-success'}
                    , cancel: {className: 'btn-danger'}
                }
                , callback: function (results) {
                    if (results) {
                        $(e.target).parents("tr:first").remove();
                        var $table = $("#titles-form table");
                        var $form = $("#titles-form form:first");
                        var id = $form.parents(".preview-pane").attr('data-relating-id');
                        $this.saveScheduleTitles($table, 'title', id);
                    }
                }
            });
        }
        , deleteSubtitle: function (e) {
            e.preventDefault();
            var $this = this;
            bootbox.confirm({
                message: "زیرنویس انتخاب شده حذف خواهد شد. آیا مطمئن هستید؟"
                , buttons: {
                    confirm: {className: 'btn-success'}
                    , cancel: {className: 'btn-danger'}
                }
                , callback: function (results) {
                    if (results) {
                        $(e.target).parents("tr:first").remove();
                        var $table = $("#subtitle-form table");
                        var $form = $("#subtitle-form form:first");
                        var id = $form.parents(".preview-pane").attr('data-relating-id');
                        $this.saveScheduleTitles($table, 'subtitle', id);
                    }
                }
            });
        }
        , editTitle: function (e) {
            e.preventDefault();
            var $this = this;
            var $data = $(e.target).parents("tr:first");
            var $relatedForm = $($data.parents("table:first").attr('data-related-form'));
            $relatedForm.find('[name=editing]').val($data.index());
            $data.find("[data-field]").each(function () {
                $relatedForm.find('[name="' + $(this).attr('data-field') + '"]').val($(this).text());
                if (typeof $(this).attr('data-group') !== "undefined") {
                    $this.generateTitleRows($(this).find(">p").length);
                    for (var i = 0; i < $(this).find(">p").length; i++)
                        $relatedForm.find('[name="' + $(this).attr('data-group') + '[]"]').eq(i).val($(this).find(">p").eq(i).text());
                }
            });
        }
        , editSubtitle: function (e) {
            e.preventDefault();
            var $data = $(e.target).parents("tr:first");
            var $relatedForm = $($data.parents("table:first").attr('data-related-form'));
            $relatedForm.find('[name=editing]').val($data.index());
            $data.find("[data-field]").each(function () {
                $relatedForm.find('[name="' + $(this).attr('data-field') + '"]').val($(this).text());
            });
        }
        , saveSubtitle: function (e) {
            e.preventDefault();
            var $form = $("#subtitle-form form:first");
            var id = $form.parents(".preview-pane").attr('data-relating-id');
            var data = {};
            $form.find("input, textarea, select").each(function () {
                var $input = $(this);
                if (typeof $input.attr("name") !== "undefined")
                    data[$input.attr("name")] = (/^\d+$/.test($input.val()) || ($input.attr("data-validation") === 'digit')) ? +$input.val() : $input.val();
            });
            if (_.isEmpty(data))
                return;
            // Append data to table
            var $table = $("#subtitle-form table");
            var lastRow = $table.find("tr:last");
            if (typeof data.editing !== "undefined" && data.editing !== "") {
                for (var prop in data)
                    if ($table.find("tr").eq(data.editing).find('[data-field=' + prop + ']').length)
                        $table.find("tr").eq(data.editing).find('[data-field=' + prop + ']').text(data[prop]);
            } else {
                var clone = lastRow.clone();
                for (var prop in data)
                    if (clone.find('[data-field=' + prop + ']').length) {
                        clone.removeClass('active');
                        clone.find('[data-field=' + prop + ']').text(data[prop]);
                    }
                clone.insertAfter(lastRow);
            }
            // Add data to main object
            this.saveScheduleTitles($table, 'subtitle', id);
            // Reset subtitle form
            $form.trigger('reset');
        }
        , saveScheduleTitles: function ($table, type, rowId) {
            var $mainRow = $("#schedule-page table").find('tr[data-id="' + rowId + '"]');
            switch (type) {
                case 'subtitle':
                    var subtitles = [];
                    // Get data from table and push it to array
                    $table.find("tr").each(function () {
                        var rowData = {};
                        $(this).find("[data-field]").each(function () {
                            // TODO: Save Validations
                            rowData[$(this).attr('data-field')] = $(this).text();
                        });
                        subtitles.push(rowData);
                    });
                    // Save data to the corresponding field
                    $mainRow.find('[name="subtitles"]').val(JSON.stringify(subtitles));
                    break;
                case 'title':
                    var titles = [];
                    $table.find("tr").each(function () {
                        var rowData = {};
                        $(this).find("[data-field]").each(function () {
                            var field = $(this).attr("data-field");
                            // TODO: Save Validations
                            if (typeof $(this).attr('data-group') !== "undefined") {
                                rowData[field + 's'] = [];
                                $(this).find(".title").each(function () {
                                    rowData[field + 's'].push($(this).text());
                                });
                            } else
                                rowData[$(this).attr('data-field')] = $(this).text();
                        });
                        titles.push(rowData);
                    });
                    // Save data to the corresponding field
                    $mainRow.find('[name="titles"]').val(JSON.stringify(titles));
                    break;
            }
        }
        , saveTitles: function (e) {
            e.preventDefault();
            var $form = $("#titles-form form:first");
            var id = $form.parents(".preview-pane").attr('data-relating-id');
            var data = {};
            $form.find("input, textarea, select").each(function () {
                var $input = $(this);
                if (typeof $input.attr("name") !== "undefined") {
                    if ($input.attr('data-type') === "array") {
                        if (typeof data[$input.attr('data-group')] === "undefined")
                            data[$input.attr('data-group')] = [];
                        data[$input.attr('data-group')].push({text: $input.val()});
                    } else
                        data[$input.attr("name")] = (/^\d+$/.test($input.val()) || ($input.attr("data-validation") === 'digit')) ? +$input.val() : $input.val();
                }
            });
            if (_.isEmpty(data))
                return;
            // Append data to table
            var $table = $("#titles-form table");
            var lastRow = $table.find("tr:last");
            if (typeof data.editing !== "undefined" && data.editing !== "") {
                for (var prop in data) {
                    delete html;
                    if (_.isArray(data[prop])) {
                        html = '';
                        for (var i = 0; i < data[prop].length; i++)
                            html += '<p><small><span class="badge badge-info badge-sm">' + (i + 1) + '</span> <span class="title">' + data[prop][i]["text"] + '<span></small></p>';
                    }
                    if ($table.find("tr").eq(data.editing).find('[data-field=' + prop + ']').length)
                        $table.find("tr").eq(data.editing).find('[data-field=' + prop + ']').html((typeof html !== "undefined") ? html : data[prop]);
                }
            } else {
                var clone = lastRow.clone();
                for (var prop in data) {
                    delete html;
                    if (_.isArray(data[prop])) {
                        html = '';
                        for (var i = 0; i < data[prop].length; i++) {
                            html += '<p><small><span class="badge badge-info badge-sm">' + (i + 1) + '</span> <span class="title">' + data[prop][i]["text"] + '<span></small></p>';
                        }
                    }
                    if (clone.find('[data-field=' + prop + ']').length) {
                        clone.removeClass('active');
                        clone.find('[data-field=' + prop + ']').html((typeof html !== "undefined") ? html : data[prop]);
                    }
                }
                clone.insertAfter(lastRow);
            }
            // Add data to main object
            this.saveScheduleTitles($table, 'title', id);
            // Reset subtitle form
            $form.trigger('reset');
        }
        , handleTitleRows: function (e) {
            var $target = $(e.target);
            var rows = $target.find("option:selected").attr('data-rows');
            this.generateTitleRows(rows);
        }
        , generateTitleRows: function (count) {
            var $container = $(".title-rows-container");
            var children = $container.children();
            var count = parseInt(count);
            if (typeof count === "undefined" || $.isNumeric(count) === false || count === null || count === children.length)
                return;
            if (count < children.length)
                children.slice(count).remove();
            else {
                for (var i = children.length; i < count; i++) {
                    var clone = children.first().clone();
                    clone.find("label").text(i + 1);
                    clone.find("input, textarea, select").val('');
                    clone.insertAfter(children.last());
                }
            }
        }
        , getMedia: function (imageSrc) {
            return imageSrc.replace('.jpg', '_lq.mp4');
        }
        , getRowData: function (type, id) {
            switch (type) {
                case 'subtitles':
                    var data = $('tr[data-id="' + id + '"]').find('[name="subtitles"]').val();
                    return data = (typeof data !== "undefined" && data !== "") ? JSON.parse(data) : [];
                    break;
                case 'titles':
                    var data = $('tr[data-id="' + id + '"]').find('[name="titles"]').val();
                    return data = (typeof data !== "undefined" && data !== "") ? JSON.parse(data) : [];
                    break;
            }
        }
        , showTitlesRow: function (e) {
            e.preventDefault();
            var $row = $(e.target).parents("tr:first");
            var $this = this;
            var media = {
                thumbnail: $row.find(".thumbnail").attr('src')
                , video: $this.getMedia($row.find(".thumbnail").attr('src'))
                , duration: Global.processTime($row.find("[data-type=duration]").val())
            };
            if ($row.hasClass('preview-pane') || $row.parents(".preview-pane").length || typeof media.video === "undefined")
                return;
            if ($(document).find(".preview-pane").length)
                $(document).find(".preview-pane").fadeOut(200, function () {
                    var $target = $(this);
                    $this.player.remove();
                    window.setTimeout(function () {
                        $target.remove();
                    }, 50);
                });
            // Loading review partial template
            window.setTimeout(function () {
                var template = Template.template.load('broadcast/schedule', 'schedule.titles.partial');
                template.done(function (data) {
                    var templateData = {
                        id: $row.attr("data-id")
                        , subtitles: $this.getRowData('subtitles', $row.attr("data-id"))
                        , titles: $this.getRowData('titles', $row.attr("data-id"))
                        , definitions: Config.temp
                    };
                    // Temporary solution for Handlebars problem
                    templateData.titleRowsHelper = [];
                    for (var i = 0; i < Config.temp.titleTypes.Children[0].Value; i++)
                        templateData.titleRowsHelper.push(i);

                    // Loading partial template
                    var handlebarsTemplate = Template.handlebars.compile(data);
                    var output = handlebarsTemplate(templateData);
                    $row.after(output).promise().done(function () {
                        var player = new Player('#player-container', {
                            file: media.video
                            , duration: media.duration
                            , playlist: [{
                                    image: media.thumbnail
                                    , sources: [
                                        {file: media.video, label: 'LQ', default: true}
                                        , {file: media.video.replace('_lq', '_hq'), label: 'HQ'}
//                                        , {file: media.video.replace('_lq', '_orig'), label: 'ORIG'}
                                    ]
                                }]
                        }, $this.handlePlayerCallbacks);
                        player.render();
                        $this.player = player;
                        $this.playerInstance = player.instance;
                    });
                });
            }, 300);
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
                startdate: Global.jalaliToGregorian($("#duplicate-schedule [name=startdate]").val()) + 'T' + $("#duplicate-schedule .source[name=starttime]").val()
                , enddate: Global.jalaliToGregorian($("#duplicate-schedule [name=startdate]").val()) + 'T' + $("#duplicate-schedule .source[name=endtime]").val()
                , destinationdate: Global.jalaliToGregorian($("#duplicate-schedule [name=destinationdate]").val()) + 'T' + $("#duplicate-schedule .destination[name=starttime]").val()
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
            if ($(this.$toolbarPortlets).not(".duplicate-schedule").is(":visible"))
                $(this.$toolbarPortlets).not(".duplicate-schedule").removeClass("in").addClass("hidden");
            if ($(this.$duplicatePortlet).is(":hidden"))
                $(this.$duplicatePortlet).removeClass('hidden').addClass("in");
            else
                $(this.$duplicatePortlet).removeClass("in").addClass("hidden");
            $("html, body").animate({'scrollTop': 0});
        }
        , showExportToolbar: function () {
            if ($(this.$toolbarPortlets).not(".export-schedule").is(":visible"))
                $(this.$toolbarPortlets).not(".export-schedule").removeClass("in").addClass("hidden");
            if ($(this.$exportPortlet).is(":hidden"))
                $(this.$exportPortlet).removeClass('hidden').addClass("in");
            else
                $(this.$exportPortlet).removeClass("in").addClass("hidden");
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
            var params = this.getParams();
            this.render(params);
        }
        , getParams: function () {
            var params = {
                startdate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00'
                , enddate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T23:59:59'
            };
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            return params;
        }
        , render: function (params) {
            var template = Template.template.load('broadcast/schedule', 'schedule');
            var $container = $(Config.positions.main);
            var model = new ScheduleModel(params);
            var self = this;
            model.fetch({
                data: (typeof params !== "undefined") ? $.param(params) : $.param(self.getParams())
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
                    if (typeof data.responseJSON.Message !== "undefined")
                        toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    if ($("#schedule-page tbody tr").length)
                        $("#schedule-page tbody").empty();
                }
            });
            self.renderStatusbar();
        }
        , afterRender: function () {
            var self = this;

            ScheduleHelper.mask("time");

            self.attachDatepickers();

            $("#toolbar button[type=submit]").removeClass('hidden').addClass('in');
            if (typeof this.flags.helperLoaded === "undefined") {
                ScheduleHelper.init();
                this.flags.helperLoaded = true;
            } else
                ScheduleHelper.init(true);

            var dateParts = $("[name=startdate]").val().split('-');
            for (var i = 0; i < dateParts.length; i++)
                dateParts[i] = parseInt(dateParts[i]);
            $("#toolbar [name=startdate]").parent().find(".input-group-addon").text(persianDate(dateParts).format('dddd'));
            ScheduleHelper.generateTimeArray(this);

            ScheduleHelper.checkForOverlaps();

            $("#schedule-page tr").each(function () {
                var readonly = $(this).attr('data-readonly');
                if (readonly === "true")
                    $(this).find("input, textarea, select").attr('disabled', 'disabled');
            });
            
            $(".datepicker.source, .datepicker.destination").val($("#toolbar .datepicker").val());
        }
        , renderToolbar: function () {
            var self = this;
//            if (this.flags.toolbarRendered)
//                return;
            var elements = this.toolbar;
            var toolbar = new Toolbar();
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
            self.attachDatepickers();
//            this.flags.toolbarRendered = true;
        }
        , loadScheduleItem: function ($this) {
            var self = this;
            var params = {
                startdate: Global.jalaliToGregorian($this.val()) + 'T00:00:00'
                , enddate: Global.jalaliToGregorian($this.val()) + 'T23:59:59'
            };
            new ScheduleModel({}).fetch({
                data: params
                , success: function (items) {
                    var items = self.prepareItems(items.toJSON(), params);
                    ScheduleHelper.fillDuplicateSelects(_.values(items), $this.hasClass('source'));
//                    console.log(items, $this.hasClass('source'));
                }
            })
        }
        , attachDatepickers: function () {
            var self = this;
            var $datePickers = $(".datepicker");
            $.each($datePickers, function () {
                var $this = $(this);
                if ($this.data('datepicker') == undefined) {
                    $this.pDatepicker($.extend({}, CONFIG.settings.datepicker, {
                        onSelect: function () {
                            if ($this.parents("#toolbar").length) {
                                self.load();
//                                $('.datepicker.source').val($this.val());
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
        , renderStatusbar: function () {
//            var self = this;
//            if (this.flags.statusbarRendered)
//                return;
            var elements = this.statusbar;
            var statusbar = new Statusbar();
            $.each(elements, function () {
                statusbar.addItem(this);
            });
            statusbar.render();
//            this.flags.statusbarRendered = true;
        }
        , prepareItems: function (items, params) {
            if (typeof items.query !== "undefined")
                delete items.query;
            if (typeof params !== "undefined") {
                for (var prop in params) {
                    delete items[prop];
                }
            }
            $.each(items, function () {
                if (this.ConductorCategoryTitle === "" && this.ConductorTitle === "" && this.ConductorEpisodeNumber < 1)
                    this.gap = true;
            });
            return items;
        }
        , prepareContent: function () {
            this.renderToolbar();
        }
        , prepareSave: function () {
            var data = [];
            var $rows = $("table:first tbody tr");
            $rows.each(function () {
                var row = {};
                $(this).find("input, textarea, select").each(function () {
                    var $input = $(this);
                    if ($input.parents(".preview-pane").length)
                        return;
                    if (typeof $input.attr("name") !== "undefined") {
                        row[$input.attr("name")] = (/^\d+$/.test($input.val()) || ($input.attr("data-validation") === 'digit')) ? +$input.val() : $input.val();
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
                if (!_.isEmpty(row))
                    data.push(row);
            });
            return data;
        }
    });
    return ScheduleView;
});