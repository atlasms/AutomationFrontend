define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'toolbar', 'statusbar', 'pdatepicker', 'newsroom.model', 'resources.media.model', 'hotkeys', 'toastr', 'bootbox', 'news-tree.helper', 'tree.helper', 'storage.helper', 'jquery-ui', 'bootpag', 'bootstrap/modal', 'bootstrap/tab', 'pdate'
], function ($, _, Backbone, Template, Config, Global, Toolbar, Statusbar, pDatepicker, NewsroomModel, MediaModel, Hotkeys, toastr, bootbox, NewsTree, Tree, Storage, ui) {
    var NewsroomScheduleView = Backbone.View.extend({
        data: {}
        , itemContainer: ".item.box .mainbody"
        , treeInstance: {}
        , defaultEditorFontSize: function () {
            return this.getCachedFontSize();
        }
        , defaultListLimit: Config.defalutMediaListLimit
        , cache: {}
        , activeTab: 'item-body'
        , events: {
            'click [data-task="load"]': 'reLoad'
            , 'click button[data-task="refresh"]': 'reLoad'
            , 'click button[data-task="create-indices"]': 'createIndices'
            , 'click #news-items tr[data-id]': 'loadItem'
            , 'click [data-task="new"]': 'openItemModal'
            , 'click [data-task="reorder"]': 'reorderRows'
            , 'click [data-task="reorder-attachment"]': 'reorderAttachmentRows'
            , 'click [data-task="delete"]': 'deleteRow'
            , 'click [data-task="save"]': 'saveItem'
            , 'click [data-task="print"]': 'printItem'
            , 'click [data-task="print-schedule"]': 'printSchedule'
            , 'click [data-task="send"]': 'sendItems'
            , 'click #item-history table tbody tr': 'showHistoryItemBody'
            , 'submit #new-item-form': 'createItem'
            , 'click [data-task="load-history"]': 'loadHistory'
            , 'change [data-type="change-state"]': 'changeState'
            , 'change [data-type="change-attachment-state"]': 'changeAttachmentState'
            , 'blur [data-type="new-headline"]': function (e) {
                if ($(e.target).val() === '')
                    $(e.target).val('خبر خام');
            }
            , 'focus [data-type="new-headline"]': function (e) {
                if ($(e.target).val() === 'خبر خام')
                    $(e.target).val('');
            }
            , 'click .font-resize': 'resizeFont'
            , 'click [data-type="expand"]': 'expandEditor'
            , 'click [data-task="search-media"]': 'openMediaModal'
            , 'click [data-task="load-media"]': 'loadMedia'
            , 'click .nav-tabs li a': 'onTabChange'
            , 'click #itemlist tbody tr': 'addMedia'
            , 'hide.bs.modal': function (e) {
                if ($(e.target).is('#editor-modal')) {
                    var $modal = $('#editor-modal .modal-body');
                    var $editor = $('#item-editor');
                    $editor.detach().appendTo('#item-edit-form');
                }
            }
        }
        , toolbar: [
            // {'button': {cssClass: 'btn blue pull-right', text: 'ارسال', type: 'button', task: 'open-send-modal', icon: 'fa fa-share'}}
            // , {'button': {cssClass: 'btn yellow-gold pull-right', text: 'کپی', type: 'button', task: 'duplicate', icon: 'fa fa-clone'}}
            {'button': {cssClass: 'btn btn-success pull-right', text: 'جدید', type: 'button', task: 'new', icon: 'fa fa-plus'}}
            , {'button': {cssClass: 'btn yellow-gold pull-right', text: 'تولید چینش', type: 'button', task: 'create-indices', icon: 'fa fa-sort'}}
            , {'button': {cssClass: 'btn red-flamingo pull-right', text: 'ارسال اخبار', type: 'button', task: 'send', icon: 'fa fa-upload'}}
            // , {'button': {cssClass: 'btn btn-default pull-right', text: 'پرینت کلی', type: 'button', task: 'print', icon: 'fa fa-print'}}
            , {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
            , {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'load'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'date', value: Global.jalaliToGregorian(persianDate().format('YYYY-MM-DD')), addon: true, icon: 'fa fa-calendar'}} //persianDate().format('YYYY-MM-DD')
        ]
        , statusbar: [
//            {type: 'total-count', text: 'تعداد آیتم‌ها ', cssClass: 'badge badge-info'}
        ]
        , defaultParams: {
            date: Global.jalaliToGregorian(persianDate().format('YYYY-MM-DD'))
            , cid: 0
        }
        , currentItems: []
        , currentTreeNode: 0
        , currentTreePath: ''
        , sendItems: function (e) {
            e.preventDefault();
            var data = this.getParams();
            new NewsroomModel({overrideUrl: Config.api.newsSchedule + '/export'}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , success: function (d) {
                    toastr['success']('با موفقیت انجام شد', 'ارسال به پخش', Config.settings.toastr);
                }
                , error: function (z, x, c) {
                    console.log(z, x, c);
                }
            })
        }
        , onTabChange: function (e) {
            var $target = $(e.target).is('a') ? $(e.target) : $(e.target).parents('a:first');
            // cache active-tab
            this.activeTab = $target.attr('href').replace('#', '');
            switch (this.activeTab) {
                case 'item-attachments':
                    this.loadItemAttachments();
                    break;
            }
        }
        , loadItemAttachments: function () {
            var self = this;
            var params = {overrideUrl: Config.api.newsSchedule, id: 'attachments/' + this.getId()};
            var model = new NewsroomModel(params);
            var template = Template.template.load('newsroom/schedule', 'schedule-item-attachments.partial');
            model.fetch({
                success: function (data) {
                    var items = self.prepareItems(data.toJSON(), params);
                    items = Object.entries(items).map(function (e) {
                        return e[1];
                    });
                    // console.log(items);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $('#item-attachments-table').html(output);
                    });
                }
            });
        }
        , openMediaModal: function (e) {
            e.stopPropagation();
            e.preventDefault();
            var self = this;
            var $datePickers = $('.datepicker:not([name="date"])');
            $('#media-modal').on('shown.bs.modal', function () {
                if ($("#media-tree").length && $("#media-tree").is(':empty')) {
                    new Tree($("#media-tree"), Config.api.tree, this).render();
                }
                window.setTimeout(function () {
                    // if ($datePickers.data('datepicker') !== undefined) {
                    //     try {
                    //         $datePickers.data('datepicker').destroy();
                    //     } catch (e) {
                    //     }
                    //     $datePickers.val('');
                    // }
                    self.attachDatepickers();
                    if ($('#itemlist').is(':empty')) {
                        self.loadMedia();
                    }
                }, 500);
            });
            $('#media-modal').modal('toggle');
        }
        , addMedia: function (e) {
            var self = this;
            var $row = $(e.target).is('tr') ? $(e.target) : $(e.target).parents('tr:first');
            var mediaData = this.getMediaRowData($row);
            var modelParams = {overrideUrl: Config.api.newsSchedule + '/attachments/' + this.getId()};
            var model = new NewsroomModel(modelParams);
            var data = {Sort: 0, Cid: this.getId(), MediaId: mediaData.Id};
            model.save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , success: function (d) {
                    self.reorderAttachmentRows(function () {
                        self.loadItemAttachments();
                    });
                    toastr['success']('مدیا با موفقیت ثبت شد', 'افزودن مدیا', Config.settings.toastr);
                }
                , error: function (z, x, c) {
                    // console.log(z, x, c);
                }
            })
        }
        , getMediaRowData: function ($row) {
            return {
                Id: $row.attr('data-id'),
                Thumbnail: $row.find('img:first').attr('src'),
                Title: $row.find('.title').text(),
                Description: $row.find('small').text(),
                EpisodeNumber: $row.find('[data-field="EpisodeNumber"]').text(),
                Duration: $row.find('[data-field="Duration"]').text(),
                StateText: $row.find('[data-field="StateText"]').text(),
            }
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
            var params = (typeof params !== "undefined") ? params : self.getMediaParams();
            var data = $.param(params);
            var model = new MediaModel(params);
            model.fetch({
                data: data
                , success: function (items) {
                    items = items.toJSON();
                    var template = Template.template.load('resources/media', 'media.items-condensed.partial');
                    var $container = $("#itemlist");
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
//                            self.afterRender(items, params);
                        });
                    });
                }
            });
        }
        , getMediaParams: function (skipQueries) {
            var self = this;
            var mode = $("[data-type=change-mode]").val();
            var state = Global.getQuery('state') ? Global.getQuery('state') : $("[name=state]").val();
            var catid = '';
            if (typeof skipQueries !== 'undefined' && skipQueries)
                state = $("[name=state]").val();
            if (mode === 'tree')
                catid = $('#media-tree li[aria-selected="true"]').attr("id");
            var params = {
                q: $.trim($("[name=q]").val()),
                type: $("[name=type]").val(),
                offset: 0,
                count: self.defaultListLimit,
                categoryId: catid,
                state: state,
                startdate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00',
                enddate: Global.jalaliToGregorian($("[name=enddate]").val()) + 'T23:59:59'
            };
            return params;
        }
        , expandEditor: function (e) {
            e.preventDefault();
            var $modal = $('#editor-modal .modal-body');
            var $editor = $('#item-editor');

            if ($modal.is(':hidden') || !$modal.children().length) {
                $editor.detach().appendTo($modal);
                $('#editor-modal').modal('show');
            } else {
                $editor.detach().appendTo('#item-edit-form');
                $('#editor-modal').modal('hide');
            }
        }
        , cacheFontSize: function (size) {
            STORAGE.setItem('newsroom-font-size', size);
        }
        , getCachedFontSize: function () {
            if (STORAGE.getItem('newsroom-font-size')) {
                return STORAGE.getItem('newsroom-font-size');
            }
            return Config.defaultEditorFontSize + 'px';
        }
        , resizeFont: function (e) {
            e.preventDefault();
            var $button = $(e.currentTarget);
            var $editor = $('textarea[name="body"]');
            var type = $button.data('type');
            switch (type) {
                case 'increase':
                    var fontSize = (parseInt($editor.css('font-size')) + 2) + 'px';
                    this.cacheFontSize(fontSize);
                    $editor.css('font-size', fontSize);
                    break;
                case 'decrease':
                    if (parseInt($editor.css('font-size')) > 10) {
                        var fontSize = (parseInt($editor.css('font-size')) - 2) + 'px';
                        this.cacheFontSize(fontSize);
                        $editor.css('font-size', fontSize);
                    }
                    break;
                case 'reset':
                    var fontSize = Config.defaultEditorFontSize + 'px';
                    this.cacheFontSize(fontSize);
                    $editor.css('font-size', fontSize);
                    break;
            }
        }
        , render: function () {
            var self = this;
            this.renderTemplate(function () {
                self.loadTree();
            });
            this.attachDatepickers();
            this.initHotKeys();
            return this;
        }
        , renderTemplate: function (callback) {
            var self = this;
            var template = Template.template.load('newsroom/schedule', 'schedule');
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $(Config.positions.main).html(output).promise().done(function () {
                    if (typeof callback === 'function')
                        callback();
                });
            });
        }
        , reLoad: function (e, loadCallback) {
            typeof e !== 'undefined' && e.preventDefault();
            this.loadItems(undefined, undefined, loadCallback);
        }
        , deleteRow: function (e) {
            e.preventDefault();
            var self = this;
            var id = $(e.target).is('tr') ? $(e.target).attr('data-id') : $(e.target).parents('tr:first').attr('data-id');
            bootbox.confirm({
                message: "آیا مطمئن هستید می‌خواهید  مورد انتخاب شده را حذف کنید؟"
                , buttons: {
                    confirm: {className: 'btn-success'}
                    , cancel: {className: 'btn-danger'}
                }
                , callback: function (results) {
                    if (results) {
                        new NewsroomModel({id: id, overrideUrl: Config.api.newsSchedule}).destroy({
                            success: function (d) {
                                toastr.success('با موفقیت انجام شد', 'عملیات حذف', Config.settings.toastr);
                                self.reLoad();
                            }
                        });
                    }
                }
            });
        }
        , openItemModal: function (e) {
            e.preventDefault();
            $("#new-item-modal").modal('show');
        }
        , createItem: function (e) {
            typeof e !== "undefined" && e.preventDefault();
            var self = this;
            var params = this.getParams();
            var data = $("#new-item-form").serializeObject();
            data = $.extend({}, params, data);
            data.sort = 0;
            data.datetime = data.date;
            delete data.date;
            data.conductorId = data.cid;
            delete data.cid;
            new NewsroomModel({overrideUrl: Config.api.newsSchedule}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'خبر جدید', Config.settings.toastr);
                    $("#new-item-modal").modal('hide');
                    self.reLoad(undefined, function () {
                        self.reorderRows();
                    });
                }
            });
            return false;
        }
        , reorderRows: function (e) {
            var self = this;
            if (typeof e === 'object') {
                e.preventDefault();
                var $this = $(e.target).is('.btn') ? $(e.target) : $(e.target).parents('.btn:first');
                var $row = $this.parents('tr:first');
                var direction = $this.data('value');
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
            var data = [];
            $('#news-items tbody tr').each(function (i, row) {
                data.push({key: $(row).attr('data-id'), value: (i + 1)});
            });
            new NewsroomModel({id: 'sort', overrideUrl: Config.api.newsSchedule}).save(data, {
                patch: true
                , error: function (e, data) {
                    // toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
                , success: function (model, response) {
                    toastr.success('عملیات با موفقیت انجام شد', 'تغییر چیدمان', Config.settings.toastr);
                    if (typeof e === 'function') {
                        e();
                    } else {
                        self.reLoad();
                    }
                }
            });
        }
        , reorderAttachmentRows: function (e) {
            var self = this;
            if (typeof e === 'object') {
                e.preventDefault();
                var $this = $(e.target).is('.btn') ? $(e.target) : $(e.target).parents('.btn:first');
                var $row = $this.parents('tr:first');
                var direction = $this.data('value');
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
            var data = [];
            $('#item-attachments-table tr').each(function (i, row) {
                data.push({key: $(row).attr('data-id'), value: (i + 1)});
            });
            new NewsroomModel({id: this.getId(), overrideUrl: Config.api.newsSchedule + '/attachments/sort'}).save(data, {
                patch: true
                , error: function (e, data) {
                    // toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
                , success: function (model, response) {
                    toastr.success('عملیات با موفقیت انجام شد', 'تغییر چیدمان', Config.settings.toastr);
                    if (typeof e === 'function') {
                        e();
                    } else {
                        self.loadItemAttachments();
                    }
                }
            });
        }
        , initHotKeys: function () {
            var self = this;
            $.hotkeys.options.filterInputAcceptingElements = false;
            $.hotkeys.options.filterTextInputs = false;
            $(document).off('keydown', null);
            $(document).on('keydown', null, 'f6', function () {
                self.printItem();
                return false;
            });
            $(document).on('keydown', null, 'f4', function () {
                self.saveItem();
                return false;
            });
            $(document).on('keydown', null, 'f5', function () {
                self.reLoad();
                return false;
            });
            $(document).on('keydown', null, 'alt+f', function (e) {
                self.expandEditor(e);
                return false;
            });
        }
        , getItemId: function ($el) {
            if ($el.is('[data-id]') || $el.parents('[data-id]:first').length) {
                return $el.is('[data-id]') ? $el.data('id') : $el.parents('tr:first').data('id');
            } else {
                return null;
            }
        }
        , printItem: function (e) {
            var id = typeof e !== 'undefined' && this.getItemId($(e.target)) ? this.getItemId($(e.target)) : this.getId();
            if (typeof id === "undefined" || id === "")
                return false;
            var folder = this.getPrintFriendlyPath();
            var win = window.open('/newsroom/scheduleitemprint/' + id + '?path=' + folder, '_blank');
            win.focus();
        }
        , printSchedule: function (e) {
            e.preventDefault();
            var params = $.param(this.getParams());
            var win = window.open('/newsroom/scheduleprint/?' + params, '_blank');
            win.focus();
        }
        , getPrintFriendlyPath: function () {
            return this.currentTreePath.split('/').length > 1
                ? this.currentTreePath.split('/').splice(1).join(' $ ')
                : this.currentTreePath;
        }
        , saveItem: function () {
            var self = this;
            var id = this.getId();
            if (typeof id === "undefined" || id === "")
                return false;
            var params = this.getParams();
            var data = $('#item-edit-form').serializeObject();
            data.conductorId = params.cid;
            data.datetime = params.date;
            new NewsroomModel({id: self.getId(), overrideUrl: Config.api.newsSchedule}).save(data, {
                // patch: true
                error: function (e, data) {
                    // toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
                , success: function (response) {
                    toastr.success('عملیات با موفقیت انجام شد', 'ثبت اطلاعات', Config.settings.toastr);
                    // self.updateCurrentRowTitle(self.getId(), $('[name="title"]').val());
                    self.loadItems(undefined, true);
                }
            });
        }
        , showHistoryItemBody: function (e) {
            var $tr = $(e.target).is('tr') ? $(e.target).is('tr') : $(e.target).parents('tr:first');
            var content = $tr.find('.body').html();
            $('#item-history-modal').find('.modal-body').html(content);
            $('#item-history-modal').modal('show');
        }
        , updateCurrentRowTitle: function (id, title) {
            $("#news-items tr[data-id=" + id + "]").find('[data-type="headline"] strong').text(title);
        }
        , loadItems: function (overridePrams, onlyUpdateList, loadCallback) {
            var self = this;
            var $container = $('#newsroom-workspace');
            var overridePrams = typeof overridePrams === "object" ? overridePrams : {};
            var params = self.getParams();
            var currentId = this.getId();
            var requestParams = {query: $.extend({}, self.defaultParams, params, overridePrams), overrideUrl: Config.api.newsSchedule};
            if (requestParams.query.cid === 0)
                return false;
            requestParams.query = $.param(requestParams.query);
            var model = new NewsroomModel(requestParams);
            var template = Template.template.load('newsroom/schedule', 'schedule-items');
            model.fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), requestParams);
                    items = Object.entries(items).map(function (e) {
                        return e[1];
                    });
                    self.currentItems = items;
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            if (items.length) {
                                $('[data-task="print-schedule"]').show();
                                if (typeof onlyUpdateList !== 'undefined' && onlyUpdateList) {
                                    self.activateCurrentItem(currentId);
                                } else {
                                    self.activateFirstItem();
                                }
                            } else {
                                $('[data-task="print-schedule"]').hide();
                            }
                            self.afterRender(items, requestParams);
                            if (typeof loadCallback === 'function') {
                                loadCallback();
                            }
                        });
                    });
                }
            });
        }
        , loadItem: function (e) {
            var self = this;
            if ($(e.target).is('input') || $(e.target).is('label') || $(e.target).is('.btn') || $(e.target).parents('.btn').length)
                return true;
            if (typeof self.data.itemIsLoading !== "undefined" && self.data.itemIsLoading !== false)
                return false;
            if ($(e.target).is("a") || $(e.target).parents("a").length)
                return true;
            var $row = $(e.target).is("tr") ? $(e.target) : $(e.target).parents("tr:first");
            $row.parent().find(".active").removeClass('active info') && $row.addClass('active info');
            var params = {id: $row.data("id"), overrideUrl: 'nws/conductor'};
            var model = new NewsroomModel(params);
            var template = Template.template.load('newsroom/schedule', 'schedule-item.partial');
            self.data['itemIsLoading'] = true;
            model.fetch({
                success: function (item) {
                    item = self.prepareItems(item.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        item.id = $row.data("id");
                        item.activeTab = self.activeTab;
                        var output = handlebarsTemplate(item);
                        $(self.itemContainer).html(output).promise().done(function () {
                            self.data['currentItem'] = $row.data("id");
                            self.data['itemIsLoading'] = false;
                            var $editor = $('.metadata-inner [name="body"]');
                            // setTimeout(function () {
                            if ($editor.length > 1) {
                                $editor.each(function () {
                                    $(this).css('font-size', self.getCachedFontSize());
                                })
                            } else {
                                $editor.css('font-size', self.getCachedFontSize());
                            }
                            // console.log($editor, 'set font', self.getCachedFontSize(), output);
                            // }, 500);
                            if (item.activeTab !== 'item-body') {
                                try {
                                    $('[href*="' + item.activeTab + '"]').get(0).click();
                                } catch (e) {
                                    // ignore
                                    console.error(e);
                                }
                            }
                        });
                    });
                }
            });
        }
        , loadMetadata: function (id) {
            var self = this;
            var params = {query: $.param({id: id}), path: 'item'};
            var model = new NewsroomModel(params);
            var template = Template.template.load('newsroom/workspace', 'metadata.partial');
            model.fetch({
                success: function (item) {
                    item = self.prepareItems(item.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(item);
                        $("#metadata-tabs").html(output).promise().done(function () {
                        });
                    });
                }
            });
        }
        , getId: function () {
            return $('[name="NewsId"]').val();
        }
        , initSortable: function () {
            var self = this;
            try {
                $("#news-items tbody").sortable('refresh');
            } catch (e) {
                $("#news-items tbody").sortable({
                    items: "tr"
                    , cancel: 'a, button, input, textarea, select'
                    , axis: 'y'
                    , forcePlaceholderSize: true
                    , placeholder: ".sort-placeholder"
                    , containment: "parent"
                    , update: function () {
                        self.reorderRows();
                    }
                });
            }
        }
        , activateFirstItem: function () {
            $(".box.itemlist table tbody tr:first").trigger('click');
        }
        , activateCurrentItem: function (currentId) {
            // var currentId = this.getId();
            var $currentRow = $('.box.itemlist table tbody').find('[data-id="' + currentId + '"]');
            console.log(currentId, $currentRow, $currentRow.length);
            $currentRow.trigger('click');

        }
        , getParams: function () {
            return {
                date: Global.jalaliToGregorian($('[name="date"]').val())
                , cid: this.currentTreeNode
                , path: this.getPrintFriendlyPath()
            };
        }
        , createIndices: function (e) {
            e.preventDefault();
            var self = this;
            var viewParams = this.getParams();
            var requestParams = {overrideUrl: Config.api.newsSchedule, path: 'headlines', query: $.param(viewParams)};
            var model = new NewsroomModel(requestParams);
            model.save(null, {
                data: JSON.stringify('')
                , contentType: 'application/json'
                , success: function (d) {
                    toastr['success']('با موفقیت ایجاد شد.', 'چینش', Config.settings.toastr);
                    self.reLoad();
                }
                , error: function (z, x, c) {
                    console.log(z, x, c);
                }
            });
        }
        , loadTree: function (callback) {
            var self = this;
            if (STORAGE.getItem('news-tree')) {
                var storage = JSON.parse(STORAGE.getItem('news-tree'));
                storage.state.checkbox && delete storage.state.checkbox;
                storage.state.core.selected && delete storage.state.core.selected;
                STORAGE.setItem('news-tree', JSON.stringify(storage));
            }
            if ($("#tree").length) {
                var $tree = $("#tree");
                $tree.bind("loaded.jstree", function (e, data) {
                    var instance = $tree.jstree(true);
                    self.treeInstance = instance;
                    instance.open_all();
                    // self.loadItems();
                });
                $tree.bind("open_all.jstree", function (e, data) {
                    // self.loadItems();
                });
                self.tree = new NewsTree($("#tree"), Config.api.newsTree, this, {hasCheckboxes: false});
                self.tree.render();
                if (typeof callback === 'function') {
                    callback();
                }
            }
        }
        , loadHistory: function (e) {
            e.preventDefault();
            var self = this;
            if (!$('#item-history').children().length) {
                var template = Template.template.load('newsroom/schedule', 'history.partial');
                var params = {overrideUrl: 'nws/conductorlog', query: $.param({id: this.getId()})};
                var model = new NewsroomModel(params);
                model.fetch({
                    success: function (data) {
                        var items = self.prepareItems(data.toJSON(), params);
                        template.done(function (tmpl) {
                            var handlebarsTemplate = Template.handlebars.compile(tmpl);
                            var output = handlebarsTemplate(items);
                            $('#item-history').html(output);
                        })
                    }
                })
            }
        }
        , deleteItem: function (e) {
            var params = {state: 0, id: +$(e.target).parents('tr:first').attr('data-id')};
            this.changeState(undefined, params);
        }
        , changeState: function (e, params) {
            var self = this;
            var $select = $(e.target);
            var params = typeof params !== 'undefined' ? params : {state: +$select.val(), id: +$select.parents('tr:first').data('id')};
            new NewsroomModel({overrideUrl: Config.api.newsScheduleState, id: params.id + '/' + params.state}).save({}, {
                patch: true,
                success: function (d) {
                    self.loadItems(undefined, true);
                }
            });
        }
        , changeAttachmentState: function (e, params) {
            var self = this;
            var $select = $(e.target);
            var params = typeof params !== 'undefined' ? params : {state: +$select.val(), id: +$select.parents('tr:first').data('id')};
            // api/nws/conductorstate/attachments/
            // {cid}/{id}/{Status}
            new NewsroomModel({overrideUrl: Config.api.newsScheduleState + '/attachments', id: this.getId() + '/' + params.id + '/' + params.state}).save({}, {
                patch: true,
                success: function (d) {
                    self.loadItemAttachments();
                }
            });
        }
        , handleTreeCallbacks: function (params, $tree, node) {
            // var self = this;
            // // self.cache.currentCategory = params.id;
            // params.method === "ready" && self.loadItems({cid: params.id});
        }
        , handleTreeCalls: function (routes, path) {
            var pathId = routes.pop().toString();
            this.currentTreeNode = pathId;
            this.currentTreePath = path.toString();
            this.loadItems({cid: pathId});
        }
        , afterRender: function (items, requestParams) {
            this.attachDatepickers();
            this.handleDashboardHeight();
            this.handleStatusbar(items);
            this.initSortable();
            $('[data-type="total-count"]').html(items.length);
        }
        , handleDashboardHeight: function () {
            var self = this;
            window.setTimeout(function () {
                self.processDashboardHeight();
            }, 500);
            $(window).on('resize', function () {
                self.processDashboardHeight();
            });
        }
        , processDashboardHeight: function () {
            var height = $(window).outerHeight() - $(".page-header").outerHeight() - $(".page-footer").outerHeight() - $(".toolbar-box").outerHeight() - 27;
            $(".news-dashboard").height(height);
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
        }
        , renderStatusbar: function () {
            var elements = this.statusbar;
            var statusbar = new Statusbar();
            $.each(elements, function () {
                statusbar.addItem(this);
            });
            statusbar.render();
        }
        , handleStatusbar: function (items) {
        }
        , prepareContent: function () {
            this.renderToolbar();
        }
        , attachDatepickers: function () {
            var self = this;
            var $datePickers = $(".datepicker");
            $.each($datePickers, function () {
                var $this = $(this);
                if (typeof $this.data('datepicker') === "undefined") {
                    $this.pDatepicker($.extend({}, CONFIG.settings.datepicker, {
                        onSelect: function () {
                            if ($this.parents("#toolbar").length) {
                                self.loadItems();
                            }
                            $datePickers.blur();
                        }
                    }));
                }
            });
        }
        , prepareList: function (items) {
            return $.map(items, function (obj) {
                obj.text = obj.title;
                return obj;
            });
        }
        , prepareItems: function (items, params) {
            if (typeof items.query !== "undefined")
                delete items.query;
            if (typeof params !== "undefined")
                for (var prop in params)
                    delete items[prop];
            return items;
        }
    });
    return NewsroomScheduleView;
});
