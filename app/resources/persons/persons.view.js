define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'toastr', 'toolbar', 'resources.persons.model', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, Global, toastr, Toolbar, PersonsModel) {
    var PersonsView = Backbone.View.extend({
        playerInstance: null
        , modal_edit: '#person-edit-modal'
        , toolbar: [
            {'button': {cssClass: 'btn blue-sharp pull-right', text: 'مورد جدید ', type: 'button', task: 'add', icon: 'fa fa-plus'}}
            , {'button': {cssClass: 'btn btn-success', text: 'جستجو', type: 'button', task: 'search'}}
            , {'input': {cssClass: 'form-control', placeholder: 'جستجو', type: 'text', name: 'q', value: "", text: "جستجو", addon: true, icon: 'fa fa-search'}}
        ]
        , statusbar: []
        , cachedData: null
        , flags: {toolbarRendered: false}
        , events: {
            'click [data-task=refresh]': 'reLoad'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task="search"]': 'search'
            , 'click [data-task="add"]': 'initAdd'
            , 'click [data-task="edit"]': 'initEdit'
            , 'click form [type="submit"]': 'submit'
            // , 'change [data-type="change-type"]': 'reLoad'
        }
        , submit: function (e) {
            var self = this;
            var $form = $('#person-form');
            var $modal = $(self.modal_edit);
            var data = $form.serializeObject();
            var params = (~~$form.attr('data-id') > 0) ? {id: $form.attr('data-id')} : {};
            new PersonsModel(params).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , success: function (d) {
                    toastr['success']('مورد جدید با موفقیت ایجاد شد.', 'ایجاد عوامل', Config.settings.toastr);
                    $modal.modal('hide');
                    $form.attr('data-id', '');
                    $form[0].reset();
                    self.reLoad();
                }
                , error: function (z, x, c) {
                    console.log(z, x, c);
                }
            });
            e.preventDefault();
        }
        , search: function (e) {
            // TODO
            e.preventDefault();
            this.reLoad();
            console.log('loading');
        }
        , openModal: function (e) {
            var self = this;
            if (typeof e !== "undefined" && e !== null)
                e.preventDefault();
            var $modal = $(self.modal_edit);
            $modal.modal('show');
        }
        , initAdd: function (e) {
            e.preventDefault();
            var self = this;
            var template = Template.template.load('resources/persons', 'persons-form.partial');
            var $container = $("#person-edit-modal");
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.openModal();
                });
            });
        }
        , initEdit: function (e) {
            e.preventDefault();
            var self = this;
            // var data = $form.serializeObject();
            var id = $(e.target).parents('tr[data-id]:first').data('id');
            var item = {};
            for (var entry in this.cachedData) {
                if (this.cachedData.hasOwnProperty(entry)) {
                    if (~~this.cachedData[entry]['id'] === ~~id)
                        item = this.cachedData[entry];
                }
            }
            var template = Template.template.load('resources/persons', 'persons-form.partial');
            var $container = $("#person-edit-modal");
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate(item);
                $container.html(output).promise().done(function () {
                    self.openModal();
                });
            });
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            // var params = this.getToolbarParams();
            var params = (typeof extend === "object") ? $.extend({}, params, extend) : this.getParams();
            this.loadItems(params);
        }
        , getParams: function () {
            return {
                type: $('[data-type="persons-type"]').val()
                , q: $('[name="q"]').val()
            };
        }
        , loadItems: function (params) {
            var self = this;
            var params = (typeof params !== "undefined") ? params : this.getParams();

            // var data = (typeof params.type === 'undefined' || ~~params.type === 0) ? '' : $.param(params);
            var data = $.param(params);
            var model = new PersonsModel(params);
            model.fetch({
                data: data
                , success: function (items) {
                    self.cachedData = items = self.prepareItems(items.toJSON(), params);
                    var template = Template.template.load('resources/persons', 'persons-items.partial');
                    var $container = $("#itemlist");
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            self.afterRender(items, params);
                        });
                    });
                }
            });
        }
        , render: function (params) {
            var template = Template.template.load('resources/persons', 'persons');
            var $container = $(Config.positions.main);
            var self = this;
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.load();
                });
            });
        }
        , afterRender: function () {
            var self = this;
        }
        , renderToolbar: function () {
            var self = this;
            var toolbar = new Toolbar();
            var definedTypes = toolbar.getDefinedToolbar(135, 'persons-type', [{Value: 0, Key: 'همه'}]);
            // var elements = $.merge(self.toolbar, {});
            var elements = $.merge($.merge([], self.toolbar), definedTypes);
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render(function() {
                // $(document).off('change', "#toolbar select[data-type=type]");
            });
            $(document).on('change', "#toolbar select", function () {
                self.load();
            });
            var $datePickers = $(".datepicker");
            var datepickerConf = {
                onSelect: function () {
                    self.load();
                    $datePickers.blur();
                }
            };
            $.each($datePickers, function () {
                $(this).pDatepicker($.extend({}, CONFIG.settings.datepicker, datepickerConf));
            });
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
    return PersonsView;
});
