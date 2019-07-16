define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'toastr', 'toolbar', 'resources.persons.model', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, Global, toastr, Toolbar, PersonsModel) {
    var PersonsView = Backbone.View.extend({
        playerInstance: null
        , modal_add: '#person-add-modal'
        , toolbar: [
            {
                'select': {
                    cssClass: 'form-control', name: 'change-type', addon: true, icon: 'fa fa-user', label: 'عوامل', options: [
                        {value: '0', text: 'همه'}
                        , {value: '1', text: 'کارگردان'}
                        , {value: '2', text: 'تهیه کننده'}
                        , {value: '3', text: 'بازیگر'}
                        , {value: '4', text: 'مجری'}
                    ]
                }
            }
            , {'button': {cssClass: 'btn blue-sharp pull-right', text: 'مورد جدید ', type: 'button', task: 'add', icon: 'fa fa-plus'}}
        ]
        , statusbar: []
        , flags: {toolbarRendered: false}
        , events: {
            'click [data-task=refresh]': 'reLoad'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task="add"]': 'openPersonForm'
            // , 'change [data-type="change-type"]': 'reLoad'
            , 'click [data-task="add-person"]': 'addPerson'
        }
        , addPerson: function (e) {
            var self = this;
            var $form = $('#person-add');
            var $modal = $(self.modal_add);
            var data = $form.serializeObject();
            new PersonsModel({}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , success: function (d) {
                    toastr['success']('مورد جدید با موفقیت ایجاد شد.', 'ایجاد عوامل', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    $modal.modal('hide');
                    self.reLoad();
                }
                , error: function (z, x, c) {
                    console.log(z, x, c);
                }
            });
            e.preventDefault();
        }
        , openPersonForm: function (e) {
            var self = this;
            e.preventDefault();
            $(self.modal_add).modal('show');
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
                type: $('[data-type="change-type"]').val()
            };
        }
        , loadItems: function (params) {
            var self = this;
            var params = (typeof params !== "undefined") ? params : this.getParams();
            var data = (typeof params.type === 'undefined' || ~~params.type === 0) ? '' : $.param(params);
            var model = new PersonsModel(params);
            model.fetch({
                data: data
                , success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
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
            var elements = $.merge(self.toolbar, {});
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
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