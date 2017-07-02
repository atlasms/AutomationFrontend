define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'resources.categories.model', 'resources.media.model', 'resources.metadata.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper', 'bootstrap/tab', 'bootstrap-table'
], function ($, _, Backbone, Template, Config, Global, moment, CategoriesModel, MediaModel, MetadataModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, Tree) {
    var CategoriesView = Backbone.View.extend({
        model: 'CategoriesModel'
        , toolbar: []
        , statusbar: []
        , flags: {}
        , events: {
            'click [data-task=refresh-view]': 'reLoad'
            , 'click #tree .jstree-anchor': 'loadData'
            , 'submit .categories-metadata-form': 'saveMetadata'
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
                    toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات برنامه', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
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
                    $("[name=" + key + "]:checkbox:checked").each(function(i) {
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
            var id = (typeof e === "object") ? $(e.target).parent().attr('id') : e;
            id = parseInt(id);
            if (typeof id !== "undefined" && id) {
                var self = this;
                var mediaItemsParams = {query: 'categoryId=' + id};
                var itemsModel = new MediaModel(mediaItemsParams);
                // Loading folder media
                itemsModel.fetch({
                    success: function (mediaItems) {
                        mediaItems = self.prepareItems(mediaItems.toJSON(), mediaItemsParams);
                        // Loading metadata
                        var params = {query: 'MasterId=' + id};
                        var model = new MetadataModel(params);
                        model.fetch({
                            success: function (item) {
                                item = self.prepareItems(item.toJSON(), params);
                                item.media = mediaItems;
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
                            }
                        });
                    }
                });
            }
        }
        , attachDatepickers: function () {
            var self = this;
            var $datePickers = $(".datepicker");
            $.each($datePickers, function () {
                var $this = $(this);
                if ($this.data('datepicker') == undefined) {
                    $this.pDatepicker($.extend({}, CONFIG.settings.datepicker, {
                        onSelect: function () {}
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
                        onSelect: function () {}
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
                            toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                        }
                        , success: function (model, response) {
                            $tree.jstree(true).set_id(node, response);
                        }
                    });
                    break;
                case 'put':
                    new CategoriesModel({id: params.id}).save({
                        text: params.text
                        , pid: params.parent
                        , error: function (e, data) {
                            toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                        }
                        , success: function (d) {}
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
    });
    return CategoriesView;
});