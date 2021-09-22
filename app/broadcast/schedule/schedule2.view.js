define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.media.model', 'resources.media2.model', 'broadcast.schedule.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'scheduleHelper2', 'ladda', 'bootbox', 'tree.helper', 'prayer-times', 'bootstrap/modal', 'bootstrap/tab', 'bootstrap-table'
], function ($, _, Backbone, Template, Config, Global, MediaModel, Media2Model, ScheduleModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, ScheduleHelper, Ladda, bootbox, Tree, PrayerTimes) {
    bootbox.setLocale('fa');
    var ScheduleView2 = Backbone.View.extend({
//        el: $(Config.positions.wrapper)
        autoSaveInterval: null
        , lastSave: ''
        , model: 'ScheduleModel'
        , toolbar: [
            {
                'select': {
                    cssClass: 'pull-right', text: 'ذخیره خودکار', name: 'auto-save', options: [
                        { value: '0', text: 'خاموش' },
                        { value: '5', text: 'هر پنج دقیقه' },
                        { value: '10', text: 'هر ده دقیقه' },
                        { value: '15', text: 'هر پانزده دقیقه' }
                    ], addon: true, icon: 'fa fa-save', access: '2'
                }
            }
            , {
                'select': {
                    cssClass: 'pull-right', text: '', name: 'change-theme', options: [
                        { value: 'light', text: 'روشن' },
                        { value: 'dark', text: 'تاریک' }
                    ], addon: true, icon: 'fa fa-lightbulb-o'
                }
            }
            , { 'button': { cssClass: 'btn btn-default pull-right', text: 'راهنما', type: 'button', task: 'help', icon: 'fa fa-life-ring' } }
            , { 'button': { cssClass: 'btn red-mint pull-right', text: 'حذف آیتم‌ها', type: 'button', task: 'truncate-table', icon: 'fa fa-trash', access: '131072' } }
            , { 'button': { cssClass: 'btn purple-wisteria pull-right', text: 'کپی', type: 'button', task: 'show-duplicate-form', access: '256', icon: 'fa fa-copy' } }
            , { 'button': { cssClass: 'btn green-jungle pull-right hidden fade', text: 'ذخیره', type: 'submit', task: 'save', access: '2', icon: 'fa fa-save' } }
            , { 'button': { cssClass: 'btn red-flamingo', text: 'ارسال پلی‌لیست', type: 'button', task: 'show-export-form', access: '128', icon: 'fa fa-upload' } }
            , { 'button': { cssClass: 'btn c-btn-border-1x c-btn-grey-salsa', text: 'PDF', type: 'pdf', task: 'file', icon: 'fa fa-file-pdf-o' } }
            , { 'button': { cssClass: 'btn btn-default', text: 'نسخه چاپی', type: 'print', task: 'print', icon: 'fa fa-print' } }
            , { 'button': { cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'load', icon: 'fa fa-monitor' } }
            , {
                'input': {
                    cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'startdate', addon: true
                    , value: Global.getVar("date") ? Global.jalaliToGregorian(Global.getVar("date")) : Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD'))
                }
            }
        ]
        , statusbar: [
            { type: 'total-count', text: 'تعداد آیتم‌ها ', cssClass: 'badge badge-info' }
            , { type: 'total-duration', text: 'مجموع زمان کنداکتور', cssClass: 'badge grey-salsa' }
        ]
        , $toolbarPortlets: "#sub-toolbar .portlet"
        , $duplicatePortlet: "#sub-toolbar .duplicate-schedule"
        , $exportPortlet: "#sub-toolbar .export-schedule"
        , defaultListLimit: Config.defalutMediaListLimit
        , timeArrays: {}
        , cache: {}
        , flags: { toolbarRendered: false }
        , events: {
            'click [type=submit]': 'submit'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'keyup input.time': 'processTime'
            , 'click [data-task=load]': 'load'
            , 'click [data-task=file]': 'loadFile'
            , 'click [data-task=print]': 'openPrintWindow'
            , 'click [data-task=show-duplicate-form]': 'showDuplicateToolbar'
            , 'click [data-task=show-export-form]': 'showExportToolbar'
            , 'click [data-task=duplicate]': 'duplicate'
            , 'click [data-task=export]': 'exportPlaylist'
            , 'click [data-task=refresh]': 'refreshList'
            , 'click [data-task=help]': 'showHelp'
            , 'change [name=force]': 'warnForceDuplicate'
            , 'change [name=CondcutorIsFixed]': 'fixRow'
            , 'focus input.time': 'selectInput'
            , 'click [data-task=show-titlerow]': 'showTitlesRow'
            , 'change [data-task=update-title-rows]': 'handleTitleRows'
            , 'change [name=change-theme]': 'changeTheme'
            , 'change [name=auto-save]': 'toggleAutoSave'
            , 'click [data-task=save-titles]': 'saveTitles'
            , 'click [data-task=save-subtitle]': 'saveSubtitle'
            , 'click [data-task=edit-subtitle]': 'editSubtitle'
            , 'click [data-task=edit-title]': 'editTitle'
            , 'click [data-task=delete-title]': 'deleteTitle'
            , 'click [data-task=delete-subtitle]': 'deleteSubtitle'
            , 'click [data-task=truncate-table]': 'truncateTable'
            , 'click .remove-meta': 'removeMetaId'
            , 'click .advanced-search': 'showAdvancedSearchModal'
            , 'click [data-task="load-media"]': 'loadMedia'
            , 'click [data-task="load-broadcast-media"]': 'loadBroadcastMedia'
            , 'click #media-modal table tbody tr': 'setMedia'
            , 'change [data-type="change-mode"]': 'toggleMode'
            , 'keyup #media-broadcast-date-search': 'searchInMediaList'
            , 'keyup [data-type="tree-search"]': 'searchTree'
            , 'click #tree .jstree-anchor': 'loadTreeItems'
            , 'click .item-link': function (e) {
                e.stopPropagation();
            }
        }
        , changeTheme: function (e) {
            console.log($(e.target).val());
            var $container = $('#schedule-page .portlet-body');
            var method = $(e.target).val() === 'dark' ? 'addClass' : 'removeClass';
            var cssClass = 'bg-dark bg-font-dark';
            $container[method](cssClass);
        }
        , searchInMediaList: function (e) {
            var query = $(e.target).val();
            var $list = $('#broadcast-itemlist tbody tr');
            if (query === '') {
                $list.show();
            } else {
                $list.hide();
                $list.each(function () {
                    if ($(this).find('.title-holder').text().indexOf(query) !== -1) {
                        $(this).show();
                    }
                });
            }
        }
        , openPrintWindow: function (e) {
            e.preventDefault();
            var win = window.open('/broadcast/scheduleprint?startdate=' + Global.jalaliToGregorian($('[name="startdate"]').val()), '_blank');
            win && win.focus();
        }
        , showAdvancedSearchModal: function (e) {
            e.preventDefault();
            $('#media-modal').modal('show');
        }
        , toggleMode: function (e) {
            var value = $(e.target).val();
            if (value === 'tree') {
                this.toggleAdvancedSearchDatepickers(true);
                this.toggleTreeSidebar(false);
            } else {
                this.toggleAdvancedSearchDatepickers(false);
                this.toggleTreeSidebar(true);
            }
        }
        , toggleTreeSidebar: function (disable) {
            if (disable) {
                $('.search-sidebar').removeClass('enabled');
            } else {
                $('.search-sidebar').addClass('enabled');
            }
        }
        , toggleAdvancedSearchDatepickers: function (disable) {
            $('[name="media-search-startdate"]').attr('disabled', disable);
            $('[name="media-search-enddate"]').attr('disabled', disable);
        }
        , setMedia: function (e) {
            var $row = $(e.target).is('tr') ? $(e.target) : $(e.target).parents('tr:first');
            var $activeRow = $('#schedule-table').find('.table-row.active');
            $activeRow.attr('data-media-state', $row.attr('data-media-state'))
                .attr('data-media-id', $row.attr('data-id'))
                .attr('data-has-hq', 'true');
            $activeRow.find('.thumbnail').attr('src', $row.find('img:first').attr('src'));
            $activeRow.find('[data-type="duration"]').val($row.data('duration'));
            $activeRow.find('[data-type="title"]').val($row.data('program-title'));
            $activeRow.find('[data-type="title"]').parents('.form-group:first').find('label[for^="pr"]').text($row.data('program-title'));
            $activeRow.find('[name="ConductorMetaCategoryId"]').val($row.data('program-id'));
            $activeRow.find('[data-type="episode-title"]').val($row.find('span.title').text());
            $activeRow.find('[data-type="episode-title"]').parents('.form-group:first').find('label[for^="ep"]').text($row.find('span.title').text());
            $activeRow.find('[name="ConductorMediaId"]').val($row.data('id'));
            $activeRow.find('[data-type="media-id"]').text($row.data('id'));
            $activeRow.find('[data-type="episode-number"]').val($.trim($row.find('[data-field="EpisodeNumber"]').text()));
            $activeRow.find('[data-type="broadcast-count"]').val($row.find('[data-field="broadcast-count"]').text());
            if (!$activeRow.find('[name="ConductorMediaId"]').next().is('.remove-meta')) {
                $activeRow.find('[name="ConductorMediaId"]').after('<a href="#" class="remove-meta">×</a>');
            }
            if (!$activeRow.find('[name="ConductorMetaCategoryId"]').next().is('.remove-meta')) {
                $activeRow.find('[name="ConductorMetaCategoryId"]').after('<a href="#" class="remove-meta">×</a>');
            }
            if ($activeRow.find('.td.id').not('.ep').find('.item-link').length) {
                $activeRow.find('.td.id').not('.ep').find('.item-link').attr('href', '/resources/mediaitem/' + $row.data('id'));
            } else {
                $activeRow.find('.td.id').not('.ep').append('<a class="item-link" href="/resources/mediaitem/' + $row.data('id') + '" target="_blank"><i class="fa fa-info-circle"></i></a>');
            }
            ScheduleHelper.updateTimes($activeRow);
            $('#media-modal').modal('hide');
            toastr.success('سطر انتخاب شده در کنداکتور جایگزین شد', 'انتخاب مدیا', Config.settings.toastr);
        }
        , truncateTable: function (e) {
            e.preventDefault();
            var $this = this;
            bootbox.confirm({
                message: "تمامی موارد کنداکتور روز انتخاب شده حذف خواهد شد. آیا مطمئن هستید؟"
                , buttons: {
                    confirm: { className: 'btn-success' }
                    , cancel: { className: 'btn-danger' }
                }
                , callback: function (results) {
                    if (results) {
                        var params = {
                            startdate: Global.jalaliToGregorian($("#duplicate-schedule [name=startdate]").val()) + 'T00:00:00',
                            enddate: Global.jalaliToGregorian($("#duplicate-schedule [name=startdate]").val()) + 'T23:59:59',
                            id: 0,
                            path: '/?startdate=' + Global.jalaliToGregorian($("#duplicate-schedule [name=startdate]").val()) + 'T00:00:00' + '&enddate=' + Global.jalaliToGregorian($("#duplicate-schedule [name=startdate]").val()) + 'T23:59:59'
                        };
                        new ScheduleModel(params).destroy({
                            data: params
                            , error: function (e, data) {
                                toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                            }
                            , success: function () {
                                $this.reLoad();
                                toastr.success('با موفقیت انجام شد', 'عملیات حذف', Config.settings.toastr);
                            }
                        });
                    }
                }
            });
        }
        , fixRow: function (e) {
            var $row = $(e.currentTarget).parents("li:first");
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
            $parent.parents("li:first").find('.item-link').remove();
        }
        , deleteTitle: function (e) {
            e.preventDefault();
            var $this = this;
            bootbox.confirm({
                message: "تایتل انتخاب شده حذف خواهد شد. آیا مطمئن هستید؟"
                , buttons: {
                    confirm: { className: 'btn-success' }
                    , cancel: { className: 'btn-danger' }
                }
                , callback: function (results) {
                    if (results) {
                        $(e.target).parents("li:first").remove();
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
                    confirm: { className: 'btn-success' }
                    , cancel: { className: 'btn-danger' }
                }
                , callback: function (results) {
                    if (results) {
                        $(e.target).parents("li:first").remove();
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
            var $data = $(e.target).parents("li:first");
            var $relatedForm = $($data.parents("#schedule-table:first").attr('data-related-form'));
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
            var $data = $(e.target).parents("li:first");
            var $relatedForm = $($data.parents("#schedule-table:first").attr('data-related-form'));
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
            var lastRow = $table.find("li:last");
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
            var $mainRow = $("#schedule-table").find('li[data-id="' + rowId + '"]');
            switch (type) {
                case 'subtitle':
                    var subtitles = [];
                    // Get data from table and push it to array
                    $table.find("li").each(function () {
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
                    $table.find("li").each(function () {
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
        , getBroadcastMediaParams: function () {
            return {
                RecommendedBroadcastDateStart: Global.jalaliToGregorian($('[name="media-broadcast-date-start"]').val()),
                RecommendedBroadcastDateEnd: Global.jalaliToGregorian($('[name="media-broadcast-date-end"]').val()),
                state: $('[name="media-broadcast-state"]').val()
            }
        }
        , getMediaParams: function () {
            var self = this;
            var mode = $("[data-type=change-mode]").val();
            var state = $("[name=state]").val();
            var catid = '';
            if (mode === 'tree') {
                var $tree = $('#tree');
                var nodeChildren = $tree.jstree('get_node', $tree.jstree('get_selected')[0]).children_d;
                catid = typeof self.cache.currentCategory !== "undefined"
                    ? self.cache.currentCategory
                    : $('#tree li[aria-selected="true"]').attr("id");
                catid += nodeChildren.length ? ',' + nodeChildren.join(',') : '';
            }
            var defaultParams = {
                q: ''
                , type: 0
                , offset: 0
                , count: 10000
                , categoryId: ''
                , state: Config.mediaList.defaultStateValue
                , episode: ''
                , startdate: '1970-01-01T00:00:00'
                , enddate: Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD')) + 'T23:59:59'
                , subjects: ''
                , tags: ''
                , persons: ''
                , users: ''
                , duration: '0;180'
                , recommendedBroadcastStartDate: ''
                , recommendedBroadcastEndDate: ''
                , broadcastStartdate: ''
                , broadcastEnddate: ''
                , structure: ''
                , metaSubject: ''
                , classification: ''
                , MetaDataProductionGroup: ''
                , ordering: 'MediaCreated desc'
            };
            var params = {
                q: $.trim($("[name=q]").val()),
                type: $("[name=type]").val(),
                offset: 0,
                count: 10000,
                categoryId: catid,
                state: state,
                startdate: $("[name=media-search-startdate]").is('[disabled]')
                    ? '1970-01-01T00:00:00'
                    : Global.jalaliToGregorian($("[name=media-search-startdate]").val()) + 'T00:00:00',
                enddate: $("[name=media-search-enddate]").is('[disabled]')
                    ? Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD')) + 'T23:59:59'
                    : Global.jalaliToGregorian($("[name=media-search-enddate]").val()) + 'T23:59:59'
            };
            return $.extend({}, defaultParams, params);
        }
        , loadBroadcastMedia: function (e) {
            if (typeof e !== "undefined")
                e.preventDefault();
            var params = this.getBroadcastMediaParams();
            this.loadBroadcastMediaItems(params);
        }
        , loadBroadcastMediaItems: function (params) {
            var self = this;
            var params = (typeof params !== "undefined") ? params : self.getBroadcastMediaParams();
            var data = $.param(params);
            var model = new MediaModel(params);
            model.fetch({
                data: data
                , success: function (items) {
                    var items = { items: self.prepareItems(items.toJSON(), params) };
                    var template = Template.template.load('broadcast/schedule', 'media.items.partial');
                    var $container = $("#broadcast-itemlist");
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            $('#media-broadcast-date-search').val('');
//                            self.afterRender(items, params);
                        });
                    });
                }
            });
        }
        , loadMedia: function (e, extend) {
            if (typeof e !== "undefined")
                e.preventDefault();
            var params = this.getMediaParams();
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.loadMediaItems(params);
            return false;
        }
        , loadMediaItems: function (params) {
            var self = this;
            var params = (typeof params !== "undefined") ? params : self.getParams();
            var data = $.param(params);
            // params.path = 'list';
            var model = new Media2Model(params);
            model.fetch({
                data: data
                , success: function (items) {
                    items = items.toJSON();
                    var template = Template.template.load('broadcast/schedule', 'media.items.partial');
                    var $container = $("#itemlist");
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
//                            self.afterRender(items, params);
//                             $container.find('table:first').bootstrapTable($.extend({}, Config.settings.bootstrapTable, {sortable: true, search: false}));
                        });
                    });
                }
            });
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
                        data[$input.attr('data-group')].push({ text: $input.val() });
                    } else
                        data[$input.attr("name")] = (/^\d+$/.test($input.val()) || ($input.attr("data-validation") === 'digit')) ? +$input.val() : $input.val();
                }
            });
            if (_.isEmpty(data))
                return;
            // Append data to table
            var $table = $("#titles-form table");
            var lastRow = $table.find("li:last");
            var html = '';
            if (typeof data.editing !== "undefined" && data.editing !== "") {
                for (var prop in data) {
//                    delete html;
                    if (_.isArray(data[prop])) {
                        html = '';
                        for (var i = 0; i < data[prop].length; i++)
                            html += '<p><small><span class="badge badge-info badge-sm">' + (i + 1) + '</span> <span class="title">' + data[prop][i]["text"] + '<span></small></p>';
                    }
                    if ($table.find("li").eq(data.editing).find('[data-field=' + prop + ']').length)
                        $table.find("li").eq(data.editing).find('[data-field=' + prop + ']').html((typeof html !== "undefined") ? html : data[prop]);
                }
            } else {
                var clone = lastRow.clone();
                for (var prop in data) {
//                    delete html;
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
                    var data = $('li[data-id="' + id + '"]').find('[name="subtitles"]').val();
                    return data = (typeof data !== "undefined" && data !== "") ? JSON.parse(data) : [];
                    break;
                case 'titles':
                    var data = $('li[data-id="' + id + '"]').find('[name="titles"]').val();
                    return data = (typeof data !== "undefined" && data !== "") ? JSON.parse(data) : [];
                    break;
            }
        }
        , showTitlesRow: function (e) {
            e.preventDefault();
            var $row = $(e.target).parents("li:first");
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
                                    { file: media.video, label: 'LQ', default: true }
                                    , { file: media.video.replace('_lq', '_hq'), label: 'HQ' }
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
            var self = this;
            if (typeof e !== 'undefined' && e !== null) {
                e.preventDefault();
            }
            var helper = new ScheduleHelper.validate();
            if (!helper.beforeSave())
                return;
            var data = this.prepareSave();
            if (this.autoSaveInterval !== null) {
                if (this.lastSave === JSON.stringify(data)) {
                    toastr.warning('هیچ تغییری برای ثبت وجود ندارد.', '', Config.settings.toastr);
                    return false;
                }
            }
            var onSaveError = [];
            $('#schedule-table .table-row').each(function (i) {
                if (~~$(this).attr('data-media-id') !== 0 && ~~$(this).attr('data-media-state') !== 1) {
                    onSaveError.push('در سطر ' + (i + 1) + ' از فایل تایید نشده استفاده شده است.');
                }
                if (~~$(this).attr('data-media-id') !== 0 && $(this).attr('data-has-hq') !== 'true') {
                    onSaveError.push('در سطر ' + (i + 1) + ' فایل مربوط به پخش وجود ندارد و در زمان ارسال پلی‌لیست ارسال نخواهد شد.');
                }
            });
            if (onSaveError.length) {
                bootbox.confirm({
                    message: onSaveError.join('<br>') + '<br><br>' + '<strong>آیا از ثبت اطمینان دارید؟</strong>'
                    , buttons: {
                        confirm: { className: 'btn-success' }
                        , cancel: { className: 'btn-danger' }
                    }
                    , callback: function (results) {
                        if (results) {
                            self.saveSchedule(data);
                        }
                    }
                });
            } else {
                this.saveSchedule(data);
            }
        }
        , saveSchedule: function (data) {
            new ScheduleModel().save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    self.lastSave = JSON.stringify(data);
                    toastr.success('با موفقیت انجام شد', 'ذخیره کنداکتور', Config.settings.toastr);
                }
                , error: function () {
                    toastr.error('خطا در ثبت اطلاعات', 'ذخیره کنداکتور', Config.settings.toastr);
                }
            });
        }
        , toggleAutoSave: function (e) {
            var self = this;
            var value = $(e.target).val();
            if (this.autoSaveInterval !== null) {
                clearInterval(this.autoSaveInterval);
                this.autoSaveInterval = null;
            }
            if (parseInt(value) !== 0) {
                toastr.info('ذخیره خودکار برای هر ' + value + ' دقیقه فعال شد', '', Config.settings.toastr);
                this.autoSaveInterval = setInterval(function () {
                    self.submit();
                }, parseInt(value) * 1000 * 60);
            } else {
                toastr.info('ذخیره خودکار غیرفعال شد', '', Config.settings.toastr);
            }
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
            new ScheduleModel({ path: '/copy' }).save(null, {
                data: JSON.stringify(params)
                , contentType: 'application/json'
                , processData: false
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'عملیات کپی', Config.settings.toastr);
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
                toastr.warning('زمان شروع از زمان پایان بزرگتر است.', 'خطا', Config.settings.toastr);
                return false;
            }
            if ($("#schedule-table tbody").find('.edited, .new, .error').length) {
                toastr.error('تغییرات ذخیره نشده است.', 'خطا', Config.settings.toastr);
                return false;
            }
            params.startdate = Global.jalaliToGregorian($("#toolbar [name=startdate]").val()) + 'T' + params.startdate;
            params.enddate = Global.jalaliToGregorian($("#toolbar [name=startdate]").val()) + 'T' + params.enddate;
            bootbox.confirm({
                message: "آیا مطمئن هستید پلی‌لیست از روی جدول پخش انتخاب شده ساخته شود؟"
                , buttons: {
                    confirm: { className: 'btn-success' }
                    , cancel: { className: 'btn-danger' }
                }
                , callback: function (results) {
                    if (results) {
                        var l = Ladda.create(e.currentTarget);
                        l.start();
                        new ScheduleModel({ path: '/export' }).save(null, {
                            data: JSON.stringify(params)
                            , contentType: 'application/json'
                            , processData: false
                            , error: function (e, data) {
                                toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                                l.stop();
                            }
                            , success: function () {
                                toastr.success('با موفقیت انجام شد', 'ارسال پلی‌لیست', Config.settings.toastr);
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
            $("html, body").animate({ 'scrollTop': 0 });
        }
        , showExportToolbar: function () {
            if ($(this.$toolbarPortlets).not(".export-schedule").is(":visible"))
                $(this.$toolbarPortlets).not(".export-schedule").removeClass("in").addClass("hidden");
            if ($(this.$exportPortlet).is(":hidden"))
                $(this.$exportPortlet).removeClass('hidden').addClass("in");
            else
                $(this.$exportPortlet).removeClass("in").addClass("hidden");
            $("html, body").animate({ 'scrollTop': 0 });
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
        , getParams: function (extend) {
            var params = {
                startdate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00'
                , enddate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T23:59:59'
            };
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            return params;
        }
        , render: function (params) {
            var template = Template.template.load('broadcast/schedule', 'schedule2');
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
                    if (typeof data.responseJSON !== "undefined" && typeof data.responseJSON.Message !== "undefined")
                        toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                    if ($("#schedule-table li").length)
                        $("#schedule-table .table-body").empty();
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
                ScheduleHelper.init(false, this);
                this.flags.helperLoaded = true;
            } else {
                ScheduleHelper.init(true, this);
            }

            var dateParts = $("[name=startdate]").val().split('-');
            for (var i = 0; i < dateParts.length; i++)
                dateParts[i] = parseInt(dateParts[i]);
            $("#toolbar [name=startdate]").parent().find(".input-group-addon").text(persianDate(dateParts).format('dddd'));
//            ScheduleHelper.generateTimeArray(this);

            ScheduleHelper.checkForOverlaps();

            $("#schedule-table .table-body li").each(function () {
                var readonly = $(this).attr('data-readonly');
                if (readonly === "true")
                    $(this).find("input, textarea, select").attr('disabled', 'disabled');
            });

            if (typeof Config.schedule.pagination === 'undefined' || Config.schedule.pagination) {
                var $items = $("#schedule-table .table-body li");
                var itemsCount = $items.length;
                if (itemsCount > Config.schedule.pageLimit) {
                    var itemsPerPage = Config.schedule.pageLimit;
                    var pagesCount = (Math.floor(itemsCount / itemsPerPage) !== (itemsCount / itemsPerPage)) ? (Math.floor(itemsCount / itemsPerPage) + 1) : Math.floor(itemsCount / itemsPerPage);
                    var pages = [];
                    for (var i = 0; i < pagesCount; i++)
                        pages.push('<li data-page="' + (i + 1) + '" ' + ((i === 0) ? ' class="active"' : '') + '><a href="#">' + (i + 1) + '</a></li>');
                    $("#schedule-page .pagination").html(pages.join(''));
                    $items.each(function () {
                        $(this).attr('data-page', Math.floor($(this).index() / itemsPerPage) + 1);
                    });
                    $items.slice(itemsPerPage).addClass('hide');
                    $(document).on('click', "#schedule-page .pagination a", function (e) {
                        var page = $(this).text();
                        $("#schedule-page .pagination").find("li").removeClass('active');
                        $("#schedule-page .pagination").find("li[data-page=" + page + "]").addClass('active');
                        var $items = $(".table-body li");
                        $items.addClass('hide');
                        $items.parent().find("[data-page=" + page + "]").removeClass('hide');
                        e.preventDefault();
                        $items = {};
                    });
                    $items = {};
                }
            }

            $(".datepicker.source, .datepicker.destination").val($("#toolbar .datepicker").val());

            this.renderTree();
            this.loadPrayerTimes();
        }
        , renderTree: function () {
            var self = this;
            var $tree = $("#tree");
            if ($tree.length) {
                $tree.bind("loaded.jstree", function (e, data) {
                    var instance = $tree.jstree(true);
                    self.treeInstance = instance;
                    instance.open_all();
                    // self.load();
                });
                new Tree($("#tree"), Config.api.tree, this).render();
            }
        }
        , searchTree: function (e) {
            $('#tree').jstree(true).show_all();
            $('#tree').jstree('search', $(e.target).val());
        }
        , loadTreeItems: function (e) {
            var id;
            if (typeof e === "object") {
                var $target = $(e.target);
                id = $target.parent().attr('id');
                if ($target.hasClass('jstree-disabled') || $target.parent().data('disabled') === 'true') {
                    toastr.warning('برنامه انتخاب شده حذف شده است.', 'خطا', Config.settings.toastr);
                    return false;
                }
            } else {
                id = e;
            }
            var params = this.getMediaParams();
            this.loadMediaItems(params);
            // return;
            // if (typeof id !== "undefined" && id) {
            //     this.cache.currentPathId = id = parseInt(id);
            //     var self = this;
            //     var mediaItemsParams = {
            //         query: $.param({
            //             categoryId: id,
            //             offset: 0,
            //             count: 2000,
            //             state: $('#media-search [name="state"]').val()
            //         })
            //     };
            //     var itemsModel = new MediaModel(mediaItemsParams);
            //     // Loading folder media
            //     itemsModel.fetch({
            //         success: function (items) {
            //             items = items.toJSON();
            //             var template = Template.template.load('broadcast/schedule', 'media.items.partial');
            //             var $container = $("#itemlist");
            //             template.done(function (data) {
            //                 var handlebarsTemplate = Template.handlebars.compile(data);
            //                 var output = handlebarsTemplate(items);
            //                 $container.html(output);
            //             });
            //         }
            //     })
            // }
        }
        , loadPrayerTimes: function () {
            // var tehranCoords = ['35.6961', '51.4231'];
            var tehranCoords = ['35.7', '51.42'];
            PrayerTimes.setMethod('Tehran');
            var times = PrayerTimes.getTimes(new Date(GLOBAL.jalaliToGregorian($("#toolbar .datepicker").val())), [tehranCoords[0], tehranCoords[1]], 3.5);
            var $list = $("ul.prayers");
            $list.find("[data-type=fajr] .time").text(times.fajr);
            $list.find("[data-type=dhuhr] .time").text(times.dhuhr);
            $list.find("[data-type=maghrib] .time").text(times.maghrib);
            $list.find("[data-type=sunrise] .time").text(times.sunrise);
            $list.find("[data-type=sunset] .time").text(times.sunset);
            $list.find("[data-type=midnight] .time").text(times.midnight);
            $('.prayer-times').show();
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
                    ScheduleHelper.resetCounters();
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
            var $rows = $("#schedule-table .table-body li");
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
        , showHelp: function (e) {
            e.preventDefault();
            var shorcuts = Config.shortcuts.schedule;
            var template = Template.template.load('shared', 'help');
            var $container = $("#help-modal .modal-body");
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate(shorcuts);
                $container.html(output).promise().done(function () {
                    $("#help-modal").modal('show');
                });
            })
        }
    });
    return ScheduleView2;
});
