define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'resources.categories.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper', 'tus'
], function ($, _, Backbone, Template, Config, Global, moment, CategoriesModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, Tree, tus) {
    var CategoriesView = Backbone.View.extend({
        el: $(Config.positions.wrapper)
        , model: 'CategoriesModel'
        , toolbar: []
        , statusbar: []
        , flags: {}
        , events: {
            'click [type=submit]': 'submit'
            , 'click #storagefiles': 'selectRow'
        }
        , submit: function () {
            var $this = this;
            var data = this.prepareSave();
            new CategoriesModel().save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'ذخیره کنداکتور', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    $this.reLoad();
                }
            });
        }
        , selectRow: function (e) {
            var $el = $(e.target);
            var $row = $el.parents("tr:first");
            $el.parents("tbody").find("tr").removeClass('active');
            $row.addClass('active');
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
            var $this = this;
            $("#tree").length && new Tree($("#tree"), Config.api.tree, $this).render();
        }
        , handleTreeCallbacks: function (params, $tree, node) {
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
                        , success: function (d) {
//                            $tree.jstree(true).set_id(node, d);
//                            node.attr('deleted', 'true');
                        }
                    });
                    break;
            }
        }
        , renderToolbar: function () {
            var self = this;
            if (self.flags.toolbarRendered)
                return;
            var elements = self.toolbar;
            var toolbar = new Toolbar();
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
            self.flags.toolbarRendered = true;
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
            data = null;
            return data;
        }
    });
    return CategoriesView;
});