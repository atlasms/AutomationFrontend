define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'resources.metadata.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'metadataHelper', 'tree.helper', 'tus'
], function ($, _, Backbone, Template, Config, Global, moment, MetadataModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, MetadataHelper, Tree, tus) {
    var MetadataView = Backbone.View.extend({
        el: $(Config.positions.wrapper)
        , model: 'MetadataModel'
        , toolbar: [
            {'button': {cssClass: 'btn green-jungle pull-right', text: 'ذخیره', type: 'submit', task: 'save'}}
            , {'button': {cssClass: 'btn red', text: 'Delete Node', type: 'button', task: 'delete-node', icon: 'fa fa-trash'}}
            , {'button': {cssClass: 'btn green', text: 'New node', type: 'button', task: 'add-node', icon: 'fa fa-plus'}}
        ]
        , statusbar: []
        , flags: {}
        , events: {
            'click [type=submit]': 'submit'
            , 'click #storagefiles': 'selectRow'
        }
        , submit: function () {
            var $this = this;
            var helper = new MetadataHelper.validate();
            if (!helper.beforeSave())
                return;
            var data = this.prepareSave();
            new MetadataModel().save(null, {
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
            var template = Template.template.load('resources/metadata', 'metadata');
            var $container = $(Config.positions.main);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.afterRender();
                });
            });
            self.renderToolbar();
        }
        , afterRender: function () {
            MetadataHelper.mask("time");
            $("#tree").length && new Tree($("#tree"), Config.api.tree).render();
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
    return MetadataView;
});