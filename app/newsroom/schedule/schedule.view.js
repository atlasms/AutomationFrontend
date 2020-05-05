define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'toolbar', 'statusbar', 'pdatepicker', 'newsroom.model', 'hotkeys', 'toastr', 'bootbox', 'news-tree.helper', 'bootpag', 'bootstrap/modal', 'bootstrap/tab'
], function ($, _, Backbone, Template, Config, Global, Toolbar, Statusbar, pDatepicker, NewsroomModel, Hotkeys, toastr, bootbox, Tree) {
    var NewsroomScheduleView = Backbone.View.extend({
        data: {}
        , itamContainer: ".item.box .mainbody"
        , treeInstance: {}
        , events: {
            'click [data-task="load"]': 'reLoad'
            , 'click button[data-task="refresh"]': 'reLoad'
            , 'click button[data-task="create-indices"]': 'createIndices'
            , 'click #tree .jstree-anchor': 'reLoad'
            , 'click #news-items tr[data-id]': 'loadItem'
            , 'click [data-task="new"]': 'openItemModal'
            , 'click [data-task="reorder"]': 'reorderRows'
            , 'click [data-task="delete"]': 'deleteRow'
            , 'click [data-task="save"]': 'saveItem'
            , 'click [data-task="print"]': 'printItem'
            , 'click #item-history table tbody tr': 'showHistoryItemBody'
            , 'submit #new-item-form': 'createItem'
            , 'click [data-task="load-history"]': 'loadHistory'
            , 'blur [data-type="new-headline"]': function (e) {
                if ($(e.target).val() === '')
                    $(e.target).val('خبر خام');
            }
            , 'focus [data-type="new-headline"]': function (e) {
                if ($(e.target).val() === 'خبر خام')
                    $(e.target).val('');
            }
        }
        , toolbar: [
            // {'button': {cssClass: 'btn blue pull-right', text: 'ارسال', type: 'button', task: 'open-send-modal', icon: 'fa fa-share'}}
            // , {'button': {cssClass: 'btn yellow-gold pull-right', text: 'کپی', type: 'button', task: 'duplicate', icon: 'fa fa-clone'}}
            {'button': {cssClass: 'btn btn-success pull-right', text: 'جدید', type: 'button', task: 'new', icon: 'fa fa-plus'}}
            , {'button': {cssClass: 'btn yellow-gold pull-right', text: 'تولید چینش', type: 'button', task: 'create-indices', icon: 'fa fa-sort'}}
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
        , reLoad: function (e) {
            typeof e !== 'undefined' && e.preventDefault();
            this.loadItems();
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
                                toastr.success('با موفقیت انجام شد', 'عملیات حذف', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
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
                    toastr.success('با موفقیت انجام شد', 'خبر جدید', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    $("#new-item-modal").modal('hide');
                    self.reLoad();
                }
            });
            return false;
        }
        , reorderRows: function (e) {
            e.preventDefault();
            var self = this;
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
            var data = [];
            $('#news-items tbody tr').each(function (i, row) {
                data.push({key: $(row).attr('data-id'), value: i});
            });
            new NewsroomModel({id: 'sort', overrideUrl: Config.api.newsSchedule}).save(data, {
                patch: true
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
                , success: function (model, response) {
                    toastr.success('عملیات با موفقیت انجام شد', 'تغییر چیدمان', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    self.reLoad();
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
        }
        , getItemId: function ($el) {
            if ($el.is('[data-id]') || $el.parents('[data-id]:first').length) {
                return $el.is('[data-id]') ? $el.data('id') : $el.parents('tr:first').data('id');
            } else {
                return null;
            }
        }
        , printItem: function (e) {
            var self = this;
            var id = typeof e !== 'undefined' && this.getItemId($(e.target)) ? this.getItemId($(e.target)) : this.getId();
            if (typeof id === "undefined" || id === "")
                return false;
            var win = window.open('/newsroom/itemprint/' + id, '_blank');
            win.focus();
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
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
                , success: function (response) {
                    toastr.success('عملیات با موفقیت انجام شد', 'ثبت اطلاعات', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
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
        , loadItems: function (overridePrams, onlyUpdateList) {
            var self = this;
            var $container = $('#mewsroom-workspace');
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
                                if (typeof onlyUpdateList !== 'undefined' && onlyUpdateList)
                                    self.activateCurrentItem(currentId);
                                else
                                    self.activateFirstItem();
                            }
                            self.afterRender(items, requestParams);
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
                        var output = handlebarsTemplate(item);
                        $(self.itamContainer).html(output).promise().done(function () {
                            self.data['currentItem'] = $row.data("id");
                            self.data['itemIsLoading'] = false;
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
                    toastr['success']('با موفقیت ایجاد شد.', 'چینش', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
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
                    // $tree.jstree(true).uncheck_all();
                    // $tree.jstree(true).deselect_all();
                    // var params = self.getParams();
                    // $.each(params.categoryId.split(','), function () {
                    //     var node = data.instance.get_node($('#' + this));
                    //     $tree.jstree(true).check_node(node);
                    // });
                    self.loadItems();
                });
                self.tree = new Tree($("#tree"), Config.api.newsTree, this, {hasCheckboxes: false});
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
        , handleTreeCallbacks: function (params, $tree, node) {
            var self = this;
            // self.cache.currentCategory = params.id;
            params.method === "ready" && self.loadItems({cid: params.id});
        }
        , handleTreeCalls: function (routes, path) {
            var self = this;
            var pathId = routes.pop().toString();
            this.currentTreeNode = pathId;
            self.loadItems({cid: pathId});
        }
        , afterRender: function (items, requestParams) {
            this.handleDashboardHeight();
            this.handleStatusbar(items);
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
            var height = $(window).outerHeight() - $(".page-header").outerHeight() - $(".page-footer").outerHeight() - $(".toolbar-box").outerHeight() - 45;
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
                if ($this.data('datepicker') == undefined) {
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
