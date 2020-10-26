define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'basic.model', 'editable.helper', 'toolbar', 'toastr', 'bootstrap-table', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, Global, Model, Editable, Toolbar, toastr) {
    var BasicTagsView = Backbone.View.extend({
        playerInstance: null
        , modal: '#tags-modal'
        , toolbar: [
            {'button': {cssClass: 'btn blue-sharp', text: 'مورد جدید ', type: 'button', task: 'add', icon: 'fa fa-plus'}}
            , {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh-view', icon: 'fa fa-refresh'}}
        ]
        , events: {
            'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task="add"]': 'initAdd'
            , 'click form [data-task="add-tag"]': 'submit'
            , 'change [name="IsActive"]': 'changeItemState'
        }
        , flags: {}
        , reLoad: function () {
            this.load();
        }
        , load: function (extend) {
            var params = this.getParams();
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , getParams: function (id) {
            var params = {path: 'manage'};
            if (typeof id !== 'undefined')
                params.id = id;
            return params;
        }
        , render: function (params) {
            var self = this;
            var params = typeof params !== 'undefined' ? params : this.getParams();
            var model = new Model(params);
            var template = Template.template.load('basic/tags', 'tags');
            var $container = $(Config.positions.main);
            model.fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            self.afterRender();
                        });
                    });
                }
            });
        }
        , initEditables: function () {
            var self = this;
            var editable = new Editable({simple: true}, self);
            editable.init();
        }
        , handleEditables: function (id, params) {
            new Model(this.getParams(id)).save(params, {
                patch: true
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
                , success: function (model, response) {
                    toastr.success('عملیات با موفقیت انجام شد', 'تغییر اطلاعات', Config.settings.toastr);
                }
            });
        }
        , changeItemState: function(e) {
            var state = e.target.checked;
            this.handleEditables($(e.target).parents('tr:first').data('id'), {
                key: 'state',
                value: +state
            });
        }
        , submit: function (e) {
            e.preventDefault();
            var self = this;
            var $form = $('#tag-form');
            var $modal = $(self.modal);
            var data = $form.serializeObject();
            var params = this.getParams();
            new Model(params).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , success: function (d) {
                    toastr['success']('مورد جدید با موفقیت ایجاد شد.', 'کلیدواژه', Config.settings.toastr);
                    $modal.modal('hide');
                    $form[0].reset();
                }
                , error: function (z, x, c) {
                    console.log(z, x, c);
                }
            });
            return false;
        }
        , initAdd: function (e) {
            e.preventDefault();
            $(this.modal).modal('show');
        }
        , afterRender: function () {
            $(".mainbody table").bootstrapTable(Config.settings.bootstrapTable);
            this.initEditables();
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
            // self.flags.toolbarRendered = true;
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
    return BasicTagsView;
});
