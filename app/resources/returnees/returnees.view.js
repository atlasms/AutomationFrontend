define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.review.model', 'toastr', 'toolbar', 'pdatepicker', 'reviewHelper', 'moment-with-locales'
], function ($, _, Backbone, Template, Config, Global, ReviewModel, toastr, Toolbar, pDatepicker, ReviewHelper, moment) {
    var ReturneesView = Backbone.View.extend({
        el: $(Config.positions.wrapper)
        , playerInstance: null
        , model: 'ReviewModel'
        , toolbar: [
            {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'load'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'enddate', value: persianDate().format('YYYY-MM-DD')}} //persianDate().format('YYYY-MM-DD')
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'startdate', value: persianDate().subtract('days', 7).format('YYYY-MM-DD')}} // moment().subtract(7, 'day').format('YYYY-MM-DD')
        ]
        , statusbar: []
        , flags: {toolbarRendered: false}
        , events: {
            'click #review-table tbody tr': 'openItem'
        }
        , openItem: function (e) {
            var $el = $(e.currentTarget);
            var id = $el.attr("data-id");
            window.open('/resources/mediaitem/' + id);
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            var params = this.getToolbarParams();
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , getToolbarParams: function () {
            var params = {
                state: 2
                , startdate: Global.jalaliToGregorian($("#toolbar [name=startdate]").val()) + 'T00:00:00'
                , enddate: Global.jalaliToGregorian($("#toolbar [name=enddate]").val()) + 'T23:59:59'
            };
            return params;
        }
        , render: function (params) {
//            if (!this.flags.toolbarRendered)
//            this.renderToolbar();
            if (typeof params === "undefined")
                var params = this.getToolbarParams();
            var template = Template.template.load('resources/review', 'review');
            var $container = $(Config.positions.main);
            var model = new ReviewModel(params);
            var self = this;
            model.fetch({
                data: (typeof params !== "undefined") ? $.param(params) : null
                , success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            self.afterRender();
                        });
                    });

                }
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    if ($("#review-table tbody tr").length)
                        $("#review-table tbody").empty();
                }
            });
        }
        , afterRender: function () {
            var self = this;
            ReviewHelper.mask("time");
        }
        , renderToolbar: function () {
            var self = this;
//            if (self.flags.toolbarRendered)
//                return;
            var toolbar = new Toolbar();
//            var definedItems = toolbar.getDefinedToolbar("resources.review");
            var elements = $.merge(self.toolbar, {});
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
//            self.flags.toolbarRendered = true;
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
                // TODO: Set default value to datepicker
//                var val = $(this).val();
//                console.log(val);
                $(this).pDatepicker($.extend({}, CONFIG.settings.datepicker, datepickerConf));
//                if (val !== "") {
//                    try {
//                        $(this).pDatepicker("setDate", val);
//                    } catch (e) {
//                        console.warn(e)
//                    }
//                }
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
    return ReturneesView;
});