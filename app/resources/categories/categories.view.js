define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'resources.categories.model', 'resources.media.model', 'resources.metadata.model', 'users.manage.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper', 'bootbox', 'bootstrap/tab', 'bootstrap-table'
], function ($, _, Backbone, Template, Config, Global, moment, CategoriesModel, MediaModel, MetadataModel, UsersManageModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, Tree, bootbox) {
    bootbox.setLocale('fa');
    var CategoriesView = Backbone.View.extend({
        model: 'CategoriesModel'
        , toolbar: []
        , statusbar: []
        , defaultListLimit: Config.defalutMediaListLimit
        , flags: {}
        , cache: {
            currentPathId: ''
        }
        , events: {
            'click [data-task=refresh-view]': 'reLoad'
            , 'click #tree .jstree-anchor': 'loadData'
            , 'submit .categories-metadata-form': 'saveMetadata'

            , 'submit #person-search-form': 'searchPersons'
            , 'click [data-task="search-persons"]': 'searchPersons'
            , 'click [data-task="select-person"]': 'selectPerson'
            , 'click [data-task="delete-person"]': 'deletePerson'
            , 'click [data-task="submit-persons"]': 'submitPersons'
            , 'click [data-task="revoke-access"]': 'revokeAccess'
            , 'click [data-task="grant-access"]': 'grantAccess'

            , 'keyup [data-type="tree-search"]': 'searchTree'
        }
        , searchTree: function(e) {
            $('#tree').jstree(true).search($(e.target).val());
        }
        , saveMetadata: function (e) {
            e.preventDefault();
            var self = this;
            var data = $(e.target).serializeObject();
            var $form = $(".categories-metadata-form");
            for (var key in data) {
                var type = $("[name=" + key + "]").attr('data-validation');
                data[key] = self.handleData(key, data[key], type);
            }
            new MetadataModel().save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات برنامه', Config.settings.toastr);
                }
            });
        }
        , handleData: function (key, value, type) {
            if (typeof type === "undefined")
                return value;
            switch (type) {
                case 'date':
                    return Global.jalaliToGregorian(value) + 'T00:00:00';
                case 'date-time':
                    return Global.jalaliToGregorian(value.split(' ')[0]) + 'T' + value.split(' ')[1];
                case 'multiple':
                    var items = $("[name=" + key + "]").val();
                    if (typeof items === "object")
                        return items.join(',');
                    else
                        return value;
                case 'checkbox':
                    var items = [];
                    $("[name=" + key + "]:checkbox:checked").each(function (i) {
                        items[i] = $(this).val();
                    });
                    if (typeof items === "object")
                        return items.join(',');
                    else
                        return value;
            }
            return value;
        }
        , loadData: function (e) {
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
            // var id = (typeof e === "object") ? $target.parent().attr('id') : e;
            if (typeof id !== "undefined" && id) {
                this.cache.currentPathId = id = parseInt(id);
                var self = this;
                var mediaItemsParams = {query: $.param({categoryId: id, offset: 0, count: this.defaultListLimit})};
                var itemsModel = new MediaModel(mediaItemsParams);
                // Loading folder media
                itemsModel.fetch({
                    success: function (mediaItems) {
                        mediaItems = mediaItems.toJSON();
                        // Loading metadata
                        var params = {query: 'MasterId=' + id};
                        var model = new MetadataModel(params);
                        model.fetch({
                            success: function (item) {
                                item = self.prepareItems(item.toJSON(), params);
                                item.media = mediaItems;
                                // var categoryAccessParams = {overrideUrl: Config.api.tree, path: '/users', query: 'id=' + id};
                                // var categoryAccessModel = new CategoriesModel(categoryAccessParams);
                                // categoryAccessModel.fetch({
                                //     success: function (data) {
                                //         var accessList = self.prepareItems(data.toJSON(), categoryAccessParams);
                                //         item.accessList = accessList;
                                var template = Template.template.load('resources/categories', 'category.metadata.partial');
                                var $container = $(".metadata.portlet-body");
                                template.done(function (data) {
                                    var handlebarsTemplate = Template.handlebars.compile(data);
                                    var output = handlebarsTemplate(item);
                                    $container.html(output).promise().done(function () {
                                        // After Render
                                        self.attachDatepickers();
                                        var overrideConfig = {search: true, showPaginationSwitch: false, pageSize: 20};
                                        $(".categories-metadata-form table").bootstrapTable($.extend({}, Config.settings.bootstrapTable, overrideConfig));
                                    });
                                });
                                // }
                                // });
                            }
                        });
                    }
                });
                this.loadPersonsList(id);
                this.loadAccessList(id);
            }
        }
        , attachDatepickers: function () {
            var self = this;
            var $datePickers = $(".datepicker");
            $.each($datePickers, function () {
                var $this = $(this);
                if ($this.data('datepicker') == undefined) {
                    $this.pDatepicker($.extend({}, CONFIG.settings.datepicker, {
                        onSelect: function () {
                        }
                    }));
                }
            });
            var $dateTimePickers = $(".datetimepicker");
            $.each($dateTimePickers, function () {
                var $this = $(this);
                var reset = ($.trim($this.val()) == "") ? true : false;
                if ($this.data('datepicker') == undefined) {
                    var dateTimePickerSettings = {
                        format: 'YYYY-MM-DD HH:mm:ss'
                        , timePicker: {enabled: true}
                    };
                    $this.pDatepicker($.extend({}, CONFIG.settings.datepicker, dateTimePickerSettings, {
                        onSelect: function () {
                        }
                    }));
                }
                if (reset)
                    $this.val($this.attr('data-default'));
            });
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            console.info('Loading items');
            var params = {};
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('resources/categories', 'categories');
            var $container = $(Config.positions.main);

            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.afterRender();
                });
            });
        }
        , afterRender: function () {
            var self = this;
            $("#tree").length && new Tree($("#tree"), Config.api.tree, this).render();
            this.renderStatusbar();
        }
        , handleTreeCallbacks: function (params, $tree, node) {
//            console.log(params, $tree, node);
            var self = this;
            if (typeof params === "undefined")
                return false;
            switch (params.method) {
                case 'delete':
                    new CategoriesModel({id: params.id}).destroy({
                        success: function (d) {
                            var node = $tree.jstree(true).get_node(params.id, true);
                            node.attr('deleted', 'true');
                            $tree.jstree(true).disable_node(node);
                        }
                    });
                    break;
                case 'post':
                    new CategoriesModel().save(null, {
                        data: JSON.stringify({
                            text: params.text
                            , pid: params.parent
                        })
                        , contentType: 'application/json'
                        , processData: false
                        , error: function (e, data) {
                            toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                        }
                        , success: function (model, response) {
                            $tree.jstree(true).set_id(node, response);
                        }
                    });
                    break;
                case 'undelete':
                    new CategoriesModel({path: 'active', id: params.id}).save({}, {
                        patch: true
                        , pid: params.parent
                        , error: function (e, data) {
                            toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                        }
                        , success: function (d) {
                            var node = $tree.jstree(true).get_node(params.id, true);
                            node.attr('deleted', 'false');
                            $tree.jstree(true).enable_node(node);
                        }
                    });
                    break;
                case 'put':
                    new CategoriesModel({id: params.id}).save({
                        text: params.text
                        , pid: params.parent
                        , error: function (e, data) {
                            toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                        }
                        , success: function (d) {
                        }
                    });
                    break;
                case 'ready':
                    self.loadData(params.id);
                    break;
            }
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
            self.flags.toolbarRendered = true;
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
            if (typeof params !== "undefined") {
                for (var prop in params) {
                    delete items[prop];
                }
            }
            return items;
        }
        , prepareContent: function () {
            this.renderToolbar();
        }
        , prepareSave: function () {
            data = null;
            return data;
        }
        , getId: function () {
            return this.cache.currentPathId;
        }
        , loadAccessList: function (id) {
            if (typeof id === 'undefined' || id <= 0)
                return false;
            var self = this;
            var item = {};
            var categoryAccessParams = {overrideUrl: Config.api.tree, path: '/users', query: 'id=' + id};
            var categoryAccessModel = new CategoriesModel(categoryAccessParams);
            categoryAccessModel.fetch({
                success: function (data) {
                    self.loadUsersList();
                    var accessList = self.prepareItems(data.toJSON(), categoryAccessParams);
                    item.accessList = accessList;
                    // #tab-access
                    var template = Template.template.load('resources/categories', 'category-access.partial');
                    var $container = $("#tab-access");
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(item);
                        $container.html(output).promise().done(function () {
                            // After Render
                            self.attachDatepickers();
                            var overrideConfig = {search: true, showPaginationSwitch: false, pageSize: 20};
                            $(".categories-metadata-form table").bootstrapTable($.extend({}, Config.settings.bootstrapTable, overrideConfig));
                        });
                    });
                }
            });
        }
        , loadPersonsList: function (categoryId) {
            if (typeof categoryId === 'undefined' || categoryId <= 0)
                return false;
            var self = this;
            var params = {overrideUrl: Config.api.mediapersons + '/?type=2&externalid=' + categoryId};
            var model = new MediaModel(params);
            var $container = $('#persons-group');
            $container.empty();
            model.fetch({
                success: function (data) {
                    var items = self.prepareItems(data.toJSON(), params);
                    // console.log(items);
                    var template = Template.template.load('resources/mediaitem', 'persons.partial');
                    template.done(function (tmplData) {
                        var handlebarsTemplate = Template.handlebars.compile(tmplData);
                        var output = handlebarsTemplate({items: items, cols: true, placeholder: false});
                        $container.html(output).promise().done(function () {
                        });
                    });
                }
            });
        }
        , searchPersons: function (e) {
            e.preventDefault();
            var self = this;
            var data = $.param({q: $('#person-q').val(), type: $('[data-type="person-type"]').val()});
            var params = {overrideUrl: Config.api.persons};
            new MediaModel(params).fetch({
                data: data
                , success: function (items) {
                    var items = self.prepareItems(items.toJSON(), params);
                    var template = Template.template.load('resources/persons', 'person-results.partial');
                    var $container = $('#person-search-results');
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output);
                    });
                }
            });
        }
        , getPersonResultItemParams: function ($row) {
            return params = {
                id: $row.data('id')
                , name: $row.find('[data-type="name"]').text()
                , family: $row.find('[data-type="family"]').text()
                , type: $row.find('select').val()
            }
        }
        , selectPerson: function (e) {
            e.preventDefault();
            var params = this.getPersonResultItemParams($(e.target).parents('tr:first'));
            var foundDuplicate = false;
            $('#persons-table tbody tr').each(function () {
                if (~~$(this).attr('data-id') == ~~params.id)
                    foundDuplicate = true;
            });
            if (foundDuplicate)
                return false;
            $clonedRow = $('#persons-table tfoot tr:first').clone();
            $clonedRow.attr('data-id', params.id);
            $clonedRow.find('[data-type="id"]').text(params.id);
            $clonedRow.find('[data-type="name"]').text(params.name);
            $clonedRow.find('[data-type="family"]').text(params.family);
            $clonedRow.find('select').val(params.type);
            $('#persons-table tbody').append($clonedRow);
        }
        , deletePerson: function (e) {
            e.preventDefault();
            var $row = $(e.target).parents('tr:first');
            bootbox.confirm({
                message: "مورد انتخابی حذف خواهد شد، مطمئن هستید؟"
                , buttons: {
                    confirm: {className: 'btn-success'}
                    , cancel: {className: 'btn-danger'}
                }
                , callback: function (results) {
                    if (results) {
                        $row.remove();
                    }
                }
            });
        }
        , submitPersons: function (callback) {
            // typeof e !== 'undefined' && e.preventDefault();
            var self = this;
            var items = [];
            $('#persons-table tbody tr').each(function () {
                // items.push({id: $(this).attr('data-id'), name: '', family: '', type: ''});
                items.push(~~$(this).attr('data-id'));
            });
            new MediaModel({overrideUrl: Config.api.mediapersons + '?type=2&externalid=' + self.getId()}).save(null, {
                data: JSON.stringify(items)
                , contentType: 'application/json'
                , processData: false
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
                , success: function (model, response) {
                    if (typeof callback === 'function')
                        callback();
                    toastr.success('با موفقیت انجام شد', 'ثبت اطلاعات عوامل', Config.settings.toastr);
//                    self.loadComments({query: 'externalid=' + data[0].externalid + '&kind=1', overrideUrl: Config.api.comments});
                }
            });
        }
        , revokeAccess: function (e) {
            e.preventDefault();
            var self = this;
            var uid = $(e.target).parents('tr:first').attr('data-id');
            var cid = this.getId();
            bootbox.confirm({
                message: "آیا مطمئن هستید می‌خواهید  دسترسی کاربر انتخاب شده را لغو کنید؟"
                , buttons: {
                    confirm: {className: 'btn-success'}
                    , cancel: {className: 'btn-danger'}
                }
                , callback: function (results) {
                    if (results) {
                        var params = {overrideUrl: Config.api.tree, id: 'users', query: 'uid=' + uid + '&cid=' + cid};
                        new CategoriesModel(params).destroy({
                            success: function (d) {
                                toastr.success('با موفقیت انجام شد', 'عملیات حذف', Config.settings.toastr);
                                self.loadAccessList(cid);
                            }
                        });
                    }
                }
            });
        }
        , grantAccess: function (e) {
            e.preventDefault();
            var self = this;
            var uid = $('select[name="uid"]').val();
            var cid = this.getId();
            var params = {overrideUrl: Config.api.tree, path: '/users', query: 'uid=' + uid + '&cid=' + cid};
            new CategoriesModel(params).save(null, {
                success: function (d) {
                    toastr.success('با موفقیت انجام شد', 'اعطای دسترسی', Config.settings.toastr);
                    self.loadAccessList(cid);
                    $('#grant-access-modal').modal('hide');
                }
            });
        }
        , loadUsersList: function () {
            if ($('select[name="uid"] option').length > 1)
                return false;
            new UsersManageModel({}).fetch({
                success: function (items) {
                    var items = items.toJSON();
                    $.each(items, function () {
                        $('select[name="uid"]').append('<option value="' + this.Id + '">' + this.Family + '، ' + this.Name + '</option>');
                    });
                }
            });
        }
    });
    return CategoriesView;
});
