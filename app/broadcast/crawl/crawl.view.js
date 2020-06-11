define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'broadcast.crawl.model', 'pr.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'crawlHelper', 'jquery-ui', 'bootbox', 'bootstrap/popover', 'editable.helper', 'bootstrap/modal', 'bootstrap/tooltip'
], function ($, _, Backbone, Template, Config, Global, moment, CrawlModel, PRModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, CrawlHelper, ui, bootbox, $popover, Editable) {
    bootbox.setLocale('fa');
    var CrawlView = Backbone.View.extend({
        model: 'CrawlModel'
        , playerInstance: {}
        , toolbar: [
           {'button': {cssClass: 'btn purple-wisteria pull-right', text: 'کپی', type: 'button', task: 'show-duplicate-form'}},
            {'button': {cssClass: 'btn red-flamingo pull-right', text: "ارسال به پخش", type: 'button', task: 'show-export-form', access: 524288}},
            {'button': {cssClass: 'btn blue', text: "پیامک‌ها", type: 'button', task: 'show-sms-modal', icon: 'fa fa-comment', access: 4194304}}
        ]
        , statusbar: []
        , whitelist: 'b, strong, i, font'
//        , crawlItemTmpl: '<tr><td><span class="text x-editable" data-type="textarea">{content}</span><button data-task="review"><i class="fa fa-edit"></i></button><button data-task="delete"><i class="fa fa-trash"></i></button></td></tr>'
        , crawlItemTmpl: '<tr><td></td><td class="ordering"><div style="width: 75px;"><span data-task="reorder" data-value="up" class="btn btn-sm btn-default"><i class="fa fa-arrow-up"></i></span> <span data-task="reorder" data-value="down" class="btn btn-sm btn-default"><i class="fa fa-arrow-down"></i></span></div></td><td><span class="text x-editable" data-type="textarea">{content}</span><button data-task="delete"><i class="fa fa-trash"></i></button></td></tr>'
        , flags: {}
        , events: {
            'click [data-task="save"]': 'submit'
            , 'click [data-task=load]': 'load'
            , 'click [data-task=load-sms]': 'loadSMSList'
            , 'click [data-task=show-sms-modal]': 'toggleSMSModal'
            , 'click [data-task=add-sms-items]': 'addSMSItems'
//            , 'click [data-task=add-sms-repo]': 'addRepoSMS'
            , 'click #pr-sms-page table tbody tr': 'selectSMSRow'
            , 'click [data-task=add-repository]': 'addToRepository'
            , 'click [data-task=add-crawl]': 'addSingle'
            , 'change [data-type="repo-type-select"]': 'loadRepositoryItems'
            , 'change [data-type="items-type-select"], [data-type="items-group-select"]': 'loadCrawlItems'
            , 'click [data-task="add-crawls"]': 'addBatch'
            , 'click [data-task="empty-list"]': 'emptyRepo'
            , 'click .crawl-items-select tbody tr': 'toggleRowSelection'
            , 'click [data-task=show-duplicate-form]': 'showDuplicateToolbar'
            , 'click [data-task=duplicate]': 'duplicateItems'
//            , 'click [data-task=show-export-form]': 'showExportToolbar'
            , 'click [data-task=show-export-form]': 'exportCrawls'
            , 'click [data-task=show-repository]': 'toggleRepositoryForm'
            , 'change [name=force]': 'warnForceDuplicate'
            , 'click [data-task="review"]': 'reviewItem'
            , 'click .crawl-items [data-task="delete"]': 'deleteItem'
            , 'click [data-task="delete-all"]': 'deleteAllItems'
            , 'click .repository-items [data-task="delete"]': 'deleteRepoItem'
            , 'click [data-task="reorder"]': 'reorderRows'
            , 'click .editor-toolbar .btn': function (e) {
                e.preventDefault();
                var button = $(e.currentTarget);
                switch (button.attr('data-task')) {
                    case 'bold':
                        document.execCommand("bold");
                        break;
                    case 'italic':
                        document.execCommand("insertHTML", false, '<i>' + document.getSelection() + "</i>");
                        break;
                    case 'color':
                        var value = button.attr('data-value');
                        document.execCommand("insertHTML", false, '<font color="' + value + '">' + document.getSelection() + "</font>");
                        break;
                }
            }
            , 'paste .editable-input': function (e) {
                e.preventDefault();
                var text = e.originalEvent.clipboardData.getData("text/plain");
                document.execCommand("insertHTML", false, text);
            }
        }
        , emptyRepo: function (e) {
            e.preventDefault();
            var self = this;
            var $items = $('.repository-items tbody tr');
            var idList = [];
            $items.each(function () {
                if ($(this).find('input[type="checkbox"]')[0].checked)
                idList.push($(this).attr('data-id'));
            });
            if (idList.length < 1)
                return false;
            bootbox.confirm({
                message: "آیا مطمئن هستید می‌خواهید  موارد انتخاب شده را حذف کنید؟"
                , buttons: {
                    confirm: {className: 'btn-success'}
                    , cancel: {className: 'btn-danger'}
                }
                , callback: function (results) {
                    if (results) {
                        for (var i = 0; i < idList.length; i++)
                            self.deleteRepoItems(idList[i]);
                        toastr.success('با موفقیت انجام شد', 'عملیات حذف', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    }
                }
            });
        }
        , deleteRepoItems: function (id) {
            // Used for batch delete
            new CrawlModel({id: id}).destroy({
                success: function () {
                    $('.repository-items tbody tr[data-id="' + id + '"]').remove();
                    $('.repo-count').text($(".repository tbody tr").length);
                }
            });
        }
        , reorderRows: function (e) {
            e.preventDefault();
            var $this = $(e.target).is('.btn') ? $(e.target) : $(e.target).parents('.btn:first');
            var $row = $this.parents('tr:first');
            var $rows = $this.parents('tbody:first tr');
            var direction = $this.data('value');
//            console.log($this, $row, direction, $row.prev().is('tr'), $row.next().is('tr'));
            if (direction === 'up') {
                if ($row.prev().is('tr')) {
                    $row.insertBefore($row.prev());
                }
            } else {
                if ($row.next().is('tr')) {
                    $row.insertAfter($row.next());
                }
            }
        }
        , updateRowsIndexes: function() {
            var $rows = $('.crawl-items table tbody tr');
            // var i = 1;
            $rows.each(function() {
                // console.log($(this).index());
                $(this).find('td:first').text($(this).index() + 1);
                // i++;
            });
        }
        , toggleSMSModal: function (e) {
            e.preventDefault();
            $("#sms-modal").modal('toggle');
            if (!$("#pr-sms-page table tbody tr").length)
                this.loadSMSList();
        }
        , selectSMSRow: function (e) {
            if (!$(e.target).is("input") && !$(e.target).is("label")) {
                e.preventDefault();
                var checkBox = $(e.target).parents("tr:first").find("input[type=checkbox]");
                checkBox.attr("checked", !checkBox.attr("checked"));
            }
        }
        , addSMSItems: function (e) {
            e.preventDefault();
            var self = this;
            $("#pr-sms-page table tbody tr").each(function () {
                if ($(this).find("input[name=selected]").attr("checked") === 'checked') {
                    self.addCrawl({content: $(this).find(".body").text()});
                }
            });
        }
//        , addRepoSMS: function(e) {
//            e.preventDefault();
//            var self = this;
//            $("#pr-sms-page table tbody tr").each(function () {
//                if ($(this).find("input[name=selected]").attr("checked") === 'checked') {
//                    self.addToRepository({content: $(this).find(".body").text()});
//                }
//            });
//        }
        , loadSMSList: function (e) {
            var self = this;
            typeof e !== "undefined" && e.preventDefault();
            var params = {start: Global.jalaliToGregorian($("[name=start]").val()) + 'T00:00:00', end: Global.jalaliToGregorian($("[name=start]").val()) + 'T23:59:59'};
            var model = new PRModel({query: $.param(params)});
            var template = Template.template.load('pr/sms', 'sms');
            var $container = $("#sms-items");
            model.fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    $.each(items, function () {
                        this.showCheckbox = true;
                    });
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
//                            self.afterRender();
                        });
                    });
                }
            });
        }
        , exportCrawls: function (e) {
            e.preventDefault();
            var data = {
                groupid: $('.portlet.crawl .actions [data-type="items-group-select"]').val()
                , sectionid: $('.portlet.crawl .actions [data-type="items-type-select"]').val()
                , date: Global.jalaliToGregorian($('.portlet.crawl .actions [data-type="items-datepicker"]').val()) + 'T' + '00:00:00'
            };
            new CrawlModel({overrideUrl: 'crawl/publish'}).fetch({
                data: $.param(data)
                , success: function (d) {
                    console.log(d);
                    toastr.success('با موفقیت انجام شد', 'ارسال زیرنویس', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
            });
            console.log(data);
        }
        , duplicateItems: function (e) {
            e.preventDefault();
            var self = this;
            var data = this.prepareSave();
            data.GroupId = $('[data-type="duplicate-group-select"]').val();
            data.SectionId = $('[data-type="duplicate-type-select"]').val();
            data.DateTime = Global.jalaliToGregorian($('[data-type="duplicate-datepicker"]').val()) + 'T' + '00:00:00';
            new CrawlModel({overrideUrl: 'crawl'}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'کپی زیرنویس‌ها', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
            });
        }
        , reviewItem: function (e) {
            e.stopPropagation();
            e.preventDefault();
            var text = $(e.target).parents('tr').find('.text').html();
            $(".editable-input").html(text);
        }
        , deleteItem: function (e) {
            e.stopPropagation();
            e.preventDefault();
            var $item = $(e.target).parents("tr:first");
            $item.remove();
        }
        , deleteAllItems: function (e) {
            e.stopPropagation();
            e.preventDefault();
            var $items = $(".crawl-items tr");
            $items.remove();
        }
        , deleteRepoItem: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var $item = $(e.target).parents("tr");
            bootbox.confirm({
                message: "مورد انتخاب شده حذف خواهد شد. آیا مطمئن هستید؟"
                , buttons: {
                    confirm: {className: 'btn-success'}
                    , cancel: {className: 'btn-danger'}
                }
                , callback: function (results) {
                    if (results) {
                        if (+$item.data('id') > 0) {
                            var params = {id: +$item.data('id')};
                            new CrawlModel({id: params.id}).destroy({
                                success: function () {
                                    $item.remove();
//                                toastr.success('با موفقیت انجام شد', 'عملیات حذف', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                                }
                            });
                        } else
                            $item.remove();
                        $('.repo-count').text($(".repository-items tbody tr").length);
                    }
                }
            });
        }
        , toggleRepositoryForm: function (e) {
            var $target = $(".repository-pane");
            if ($target.is(":visible"))
                $target.slideUp(300);
            else
                $target.slideDown(300);
        }
        , warnForceDuplicate: function (e) {
            var $checkbox = $(e.target);
            if ($checkbox.is(":checked"))
                $("#schedule-overwrite-alert").addClass('in');
            else
                $("#schedule-overwrite-alert").removeClass('in');
        }
        , showDuplicateToolbar: function () {
            if ($("#sub-toolbar").find(".portlet").not(".duplicate-crawl").is(":visible"))
                $("#sub-toolbar").find(".portlet").not(".duplicate-crawl").removeClass("in").addClass("hidden");
            if ($("#sub-toolbar .duplicate-crawl").is(":hidden"))
                $("#sub-toolbar .duplicate-crawl").removeClass('hidden').addClass("in");
            else
                $("#sub-toolbar .duplicate-crawl").removeClass("in").addClass("hidden");
            $("html, body").animate({'scrollTop': 0});
        }
        , showExportToolbar: function () {
            if ($("#sub-toolbar").find(".portlet").not(".export-crawl").is(":visible"))
                $("#sub-toolbar").find(".portlet").not(".export-crawl").removeClass("in").addClass("hidden");
            if ($("#sub-toolbar .export-crawl").is(":hidden"))
                $("#sub-toolbar .export-crawl").removeClass('hidden').addClass("in");
            else
                $("#sub-toolbar .export-crawl").removeClass("in").addClass("hidden");
            $("html, body").animate({'scrollTop': 0});
        }
        , toggleRowSelection: function (e) {
            if (!$(e.target).is('button')) {
                e.preventDefault();
                $(e.currentTarget).find("input[type=checkbox]").prop("checked", !$(e.currentTarget).find("input[type=checkbox]").prop("checked"));
                return true;
            }
        }
        , loadRepositoryItems: function (e, callback) {
            typeof e === "object" && e && e.preventDefault();
            var self = this;
            var params = {groupid: $('[data-type="repo-type-select"]').val()};
            var template = Template.template.load('broadcast/crawl', 'crawl.repository-items.partial');
            var $container = $(".crawl-items-select").find("tbody");
            new CrawlModel(params).fetch({
                data: $.param(params)
                , success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            $('.repo-count').text(Object.keys(items).length);
                            var editable = new Editable({simple: true, el: '.repository-items'}, self);
                            if (Object.keys(items).length) {
                                editable.init();
                                if (!$('[data-task="empty-list"]').is(':visible'))
                                    $('[data-task="empty-list"]').show(1);
                            } else
                                $('[data-task="empty-list"]').hide(1);
                            typeof callback === "function" && callback(items);
//                            $('[data-tooltip]').tooltip({title: $(this).data('created'), container: 'body'});
                        });
                    });
                }
            });
        }
        , handleEditables: function (id, params, callback) {
            var self = this;
            new CrawlModel({id: id}).save(params, {
                patch: true
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
                , success: function (model, response) {
                    toastr.success('عملیات با موفقیت انجام شد', 'تغییر اطلاعات', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
            });
        }
        , loadCrawlItems: function (e, callback) {
            typeof e === "object" && e && e.preventDefault();
            var self = this;
            var params = {
                groupid: $('[data-type="items-group-select"]').val()
                , sectionid: $('[data-type="items-type-select"]').val()
                , date: Global.jalaliToGregorian($('[data-type="items-datepicker"]').val())
            };
            var template = Template.template.load('broadcast/crawl', 'crawl.items.partial');
            var $container = $(".portlet.crawl .portlet-body");
            new CrawlModel({overrideUrl: 'crawl'}).fetch({
                data: $.param(params)
                , success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    if (typeof items.Items !== "undefined")
                        items.Items = JSON.parse(items.Items);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            if (typeof callback === "function")
                                callback(items);
                            else
                                self.initSortable(true);
                            var editable = new Editable({simple: true});
                            editable.init();
                        });
                    });
                }
            });
        }
        , addBatch: function (e) {
            e.preventDefault();
            var self = this;
            var items = $(".crawl-items-select").find("input[type=checkbox]:checked");
            items.each(function () {
                var row = $(this).parents("tr:first");
                self.addCrawl({
                    content: row.find(".text").html()
                    , type: $('[data-type="type-select"]').val()
                });
            });
            items.prop('checked', false);
        }
        , addSingle: function (e) {
            var self = this;
            e.preventDefault();
            $editor = $(".editable-input");
            if ($editor.text() === "")
                return;
            self.addCrawl({
                content: $editor.html()
                , type: $('[data-type="type-select"]').val()
            });
        }
        , addCrawl: function (params) {
            var self = this;
            $(".crawl-items").find("tbody").append(self.crawlItemTmpl.replace(/{content}/, params.content)).promise().done(function () {
//                $(".crawl-items").find("tr:last")
                var editable = new Editable({simple: true});
                editable.init();
                self.updateRowsIndexes();
            });
        }
        , addToRepository: function (e) {
            var self = this;
            e.preventDefault();
            $editor = $(".editable-input");
            if ($editor.text() === "")
                return;
            $editor.find("*").not(self.whitelist).each(function () {
                var content = $(this).contents();
                $(this).replaceWith(content);
            });
            var params = {
                Text: $editor.html()
                , GroupId: +$('[data-type="repo-type-select"]').val()
            };
            // Save item and get insert id
            new CrawlModel().save(null, {
                data: JSON.stringify(params)
                , contentType: 'application/json'
                , processData: false
                , success: function (d) {
                    $editor.empty();
                    toastr.success('با موفقیت انجام شد', 'ذخیره زیرنویس', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    $(".crawl-items-select").find("tbody").prepend('<tr data-id="0"><td><div class="checkbox checkbox-success checkbox-circle"><input type="checkbox" /><label></label></div></td><td><span class="text">' + params.Text + '</span><button data-task="review"><i class="fa fa-edit"></i></button><button data-task="delete"><i class="fa fa-trash"></i></button></td></tr>');
                    $('.repo-count').text($(".repository-items tbody tr").length);
                }
            });

        }
        , submit: function (e) {
            e.preventDefault();
            var self = this;
            var data = self.prepareSave();
            new CrawlModel({overrideUrl: 'crawl'}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    self.updateRowsIndexes();
                    toastr.success('با موفقیت انجام شد', 'ذخیره زینویس', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
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
                    break;
            }
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
            var template = Template.template.load('broadcast/crawl', 'crawl');
            var $container = $(Config.positions.main);
            var model = new CrawlModel(params);
            var self = this;
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.afterRender();
                });
            });
            self.renderStatusbar();
        }
        , afterRender: function () {
            var self = this;
            self.loadRepositoryItems(null, function (items) {

            });
            if (typeof this.flags.helperLoaded === "undefined") {
                CrawlHelper.init();
                this.flags.helperLoaded = true;
            } else
                CrawlHelper.init(true);
            var $datePickers = $(".datepicker");
            var datepickerConf = {
                onSelect: function (timestamp, data) {
//                    console.log();
                    $(data.inputElem).attr('data-type') === 'items-datepicker' && self.loadCrawlItems();
                    $datePickers.blur();
                }
            };
            $.each($datePickers, function () {
                $(this).pDatepicker($.extend({}, CONFIG.settings.datepicker, datepickerConf));
//                if ($(this).attr('name') === "start")
//                    $(this).val(Global.jalaliToGregorian(persianDate().subtract('days', 1).format('YYYY-MM-DD')));
            });
            self.loadCrawlItems(null, function () {
                self.initSortable();
                var editable = new Editable({simple: true});
                editable.init();
            });
        }
        , initSortable: function (refresh) {
            var refresh = (typeof refresh !== "undefined") ? refresh : false;
            try {
                $(".crawl-items").sortable('refresh');
            } catch (e) {
                $(".crawl-items").sortable({
                    items: "tr"
                    , cancel: 'a, button, input, textarea'
                    , axis: 'y'
                    , forcePlaceholderSize: true
                    , placeholder: ".sort-placeholder"
                    , containment: "parent"
                });
            }
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
        }
        , renderStatusbar: function () {
            var elements = this.statusbar;
            var statusbar = new Statusbar();
            $.each(elements, function () {
                statusbar.addItem(this);
            });
            statusbar.render();
        }
        , prepareItems: function (items, params) {
            if (typeof items.query !== "undefined")
                delete items.query;
            if (typeof params !== "undefined")
                for (var prop in params)
                    delete items[prop];
            return items;
        }
        , prepareContent: function () {
            this.renderToolbar();
        }
        , prepareSave: function () {
            var data = {
                Items: []
                , GroupId: $('[data-type="items-group-select"]').val()
                , SectionId: $('[data-type="items-type-select"]').val()
                , DateTime: Global.jalaliToGregorian($('[data-type="items-datepicker"]').val()) + 'T' + '00:00:00'
            };
            $(".crawl-items table tbody tr").each(function () {
                data.Items.push($(this).find(".text").html());
            });
            data.Items = JSON.stringify(data.Items);
            return data;
        }
    });
    return CrawlView;
});
