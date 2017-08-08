// TODO: Colors for crawl items
// TODO: Using real data services
// TODO: Make editor as an standalone helper
define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'broadcast.crawl.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'crawlHelper', 'bootbox', 'jquery-ui', 'bootbox', 'bootstrap/modal', 'bootstrap/tooltip'
], function ($, _, Backbone, Template, Config, Global, moment, CrawlModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, CrawlHelper, bootbox, ui, bootbox) {
    bootbox.setLocale('fa');
    var CrawlView = Backbone.View.extend({
        model: 'CrawlModel'
        , playerInstance: {}
        , toolbar: [
//            {'button': {cssClass: 'btn purple-wisteria pull-right', text: 'کپی', type: 'button', task: 'show-duplicate-form'}}
            {'button': {cssClass: 'btn red-flamingo pull-right', text: "ارسال زیرنویس", type: 'button', task: 'show-export-form'}}
        ]
        , statusbar: []
        , whitelist: 'b, strong, i, font'
        , flags: {}
        , events: {
            'click [data-task="save"]': 'submit'
            , 'click [data-task=load]': 'load'
            , 'click [data-task=add-repository]': 'addToRepository'
            , 'click [data-task=add-crawl]': 'addSingle'
            , 'change [data-type="repo-type-select"]': 'loadRepositoryItems'
            , 'change [data-type="items-type-select"], [data-type="items-group-select"]': 'loadCrawlItems'
            , 'click [data-task="add-crawls"]': 'addBatch'
            , 'click .crawl-items-select tbody tr': 'toggleRowSelection'
            , 'click [data-task=show-duplicate-form]': 'showDuplicateToolbar'
            , 'click [data-task=duplicate]': 'duplicateItems'
            , 'click [data-task=show-export-form]': 'showExportToolbar'
            , 'click [data-task=show-repository]': 'toggleRepositoryForm'
            , 'change [name=force]': 'warnForceDuplicate'
            , 'click [data-task="review"]': 'reviewItem'
            , 'click .crawl-items [data-task="delete"]': 'deleteItem'
            , 'click [data-task="delete-all"]': 'deleteAllItems'
            , 'click .repository-items [data-task="delete"]': 'deleteRepoItem'
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
        , duplicateItems: function(e) {
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
            e.preventDefault();
            $(e.currentTarget).find("input[type=checkbox]").prop("checked", !$(e.currentTarget).find("input[type=checkbox]").prop("checked"));
            return true;
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
                            typeof callback === "function" && callback(items);
//                            $('[data-tooltip]').tooltip({title: $(this).data('created'), container: 'body'});
                        });
                    });
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
//            $(".crawl-items").find("tbody").append('<tr><td><span class="label label-info label-sm">' + $('[data-type="type-select"]').find(":selected").text() + '</span> <span class="text">' + params.content + '</span></td></tr>');
            $(".crawl-items").find("tbody").append('<tr><td><span class="text">' + params.content + '</span><button data-task="review"><i class="fa fa-edit"></i></button><button data-task="delete"><i class="fa fa-trash"></i></button></td></tr>');
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
                    toastr.success('با موفقیت انجام شد', 'ذخیره کنداکتور', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    $(".crawl-items-select").find("tbody").prepend('<tr data-id="0"><td><div class="checkbox checkbox-success checkbox-circle"><input type="checkbox" /><label></label></div></td><td><span class="text">' + params.Text + '</span><button data-task="review"><i class="fa fa-edit"></i></button><button data-task="delete"><i class="fa fa-trash"></i></button></td></tr>');
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
            });
            self.loadCrawlItems(null, function () {
                self.initSortable();
            });
        }
        , initSortable: function (refresh) {
            var refresh = (typeof refresh !== "undefined") ? refresh : false;
            try {
                $(".crawl-items").sortable('refresh');
            } catch(e) {
                $(".crawl-items").sortable({
                    items: "tr"
                    , cancel: 'a, button'
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