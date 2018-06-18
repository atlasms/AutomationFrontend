define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'economy.model', 'toastr', 'toolbar'
], function ($, _, Backbone, Template, Config, Global, EconomyModel, toastr, Toolbar) {
    var PricesView = Backbone.View.extend({
        $modal: "#metadata-form-modal"
        , $itemsPlace: "#items-place"
        , model: 'EconomyModel'
        , toolbar: [
            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
//            , {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'show'}}
//            , {'button': {cssClass: 'btn green-jungle', text: 'ذخیره', type: 'button', task: 'submit'}}
        ]
        , statusbar: []
        , flags: {}
        , events: {
            'click [type=submit]': 'submit'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task=show]': 'load'
            , 'click [data-task=refresh]': 'reLoad'
            , 'show.bs.collapse #accordion': 'collapse'
            , 'blur input[type="text"]': 'setEdited'
            , 'change [name="State"]': 'changeState'
        }
        , changeState: function(e) {
//            var $item = $(e.target);
            var state = e.target.checked;
            new EconomyModel({id: 'tree/' + $(e.target).parents('.panel-heading').data('id')}).save({state: state}, {
                patch: true
                , error: function(e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
                , success: function (model, response) {
                    toastr.success('عملیات با موفقیت انجام شد', 'تغییر اطلاعات', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
            });
        }
        , setEdited: function (e) {
            if ($(e.target).val() !== "")
                $(e.target).addClass('edited');
            else
                $(e.target).removeClass('edited');
        }
        , collapse: function (e) {
            var $target = $(e.target);
            if ($.trim($target.text()) === '') {
                var id = $target.data('id');
                this.loadItems(id, $target);
            }
        }
        , submit: function (e) {
            e.preventDefault();
            var self = this;
            var data = [];
            var $items = $(e.target).parents('form:first').find('table tbody tr');
            $items.each(function () {
                data.push({Tree_Id: $(this).data('id'), Value: $(this).find('[data-type="value"]').val()});
            });
            var params = {
                path: '/data'
            };
            new EconomyModel(params).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function (d) {
                    self.loadItems($(".collapse.in").data('id'), $(".collapse.in"));
                }
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
            var params = {
                path: '/tree?pid=1'
            };
            var template = Template.template.load('broadcast/prices', 'prices');
            var $container = $(Config.positions.main);
            var model = new EconomyModel(params);
            model.fetch({
                success: function (data) {
                    items = self.prepareItems(data.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
//                            self.updatePrintButton();
                        });
                    });
                }
            });
        }
        , afterRender: function () {
            this.loadItems();
        }
        , renderToolbar: function () {
            var self = this;
            var elements = self.toolbar;
            var toolbar = new Toolbar();
            var elements = $.merge([], self.toolbar);
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
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
            var data = [{}];
            $(this.$modal).find("input, textarea, select").each(function () {
                var $input = $(this);
                if (typeof $input.attr("name") !== "undefined") {
                    data[0][$input.attr("name")] = (/^\d+$/.test($input.val()) || ($input.attr("data-validation") === 'digit')) ? +$input.val() : $input.val();
                    if (typeof $input.attr('data-before-save') !== "undefined") {
                        switch ($input.attr('data-before-save')) {
                            case 'prepend-date':
                                data[0][$input.attr("name")] = Global.jalaliToGregorian($(this).parent().find("label").text()) + 'T' + $input.val();
                                break;
                            case 'timestamp':
                                data[0][$input.attr("name")] = Global.processTime($input.val());
                                break;
                        }
                    }
                }
            });
            return data;
        }
        , loadItems: function (id, $container) {
            var self = this;
            var params = {
                path: '/data?pid=' + id
            };
            var template = Template.template.load('broadcast/prices', 'items.partial');
            var $container = $container.find('.panel-body');
            var model = new EconomyModel(params);
            model.fetch({
                success: function (data) {
                    items = self.prepareItems(data.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
//                            self.updatePrintButton();
                        });
                    });
                }
            });
        }
    });
    return PricesView;
});