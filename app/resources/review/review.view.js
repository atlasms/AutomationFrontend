define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'resources.review.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'reviewHelper', 'jwplayer'
], function ($, _, Backbone, Template, Config, Global, moment, ReviewModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, ReviewHelper, jwplayer) {
    var ReviewView = Backbone.View.extend({
        el: $(Config.positions.wrapper)
        , model: 'MetadataModel'
        , toolbar: [
            {'button': {cssClass: 'btn red pull-right', text: 'رد', type: 'button', task: 'reject'}}
            , {'button': {cssClass: 'btn green-jungle pull-right', text: 'قبول', type: 'button', task: 'accept'}}
            , {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'load'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'startdate', value: persianDate().subtract('days', 7).format('YYYY-MM-DD')}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'enddate', value: persianDate().format('YYYY-MM-DD')}}
            , {'select': {text: 'فیلتر', name: 'filter-table', addon: true, icon: 'fa fa-filter', options: [
                        {value: '0', text: 'بازبینی نشده'}
                        , {value: '1', text: 'تائید شده'}
                        , {value: '2', text: 'رد شده'}
                    ]}}
        ]
        , statusbar: []
        , flags: {}
        , events: {
            'click [type=submit]': 'submit'
            , 'change [data-type=filter-table]': function (e) {
                alert($(e.target).val());
            }
            , 'click #review-table tbody tr': function (e) {
                var target = ($(e.target).is("tr")) ? $(e.target) : $(e.target).parents("tr:first");
//                $('<tr><td colspan="100%"><h1>a</h1></td></tr>').insertAfter(target);
            }
        }
        , submit: function () {
            var $this = this;
            var helper = new ReviewHelper.validate();
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
            console.log(jwplayer.api)
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
                    self.renderToolbar();
                }
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    if ($("#review-table tbody tr").length)
                        $("#review-table tbody").empty();
                }
            });
        }
        , afterRender: function () {
            ReviewHelper.mask("time");
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
            
            var $datePickers = $(".datepicker");
            var datepickerConf = {
                onSelect: function () {
                    self.load();
                    $datePickers.blur();
                }
            };
            $.each($datePickers, function () {
                // TODO: Set default value to datepicker
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
        }
        , prepareSave: function () {
            data = null;
            return data;
        }
    });
    return ReviewView;
});