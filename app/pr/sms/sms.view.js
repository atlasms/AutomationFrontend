define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'pr.model', 'toolbar', 'toastr', 'statusbar', 'bootstrap/modal', 'pdatepicker', 'bootstrap-table'
], function ($, _, Backbone, Template, Config, Global, PRModel, Toolbar, toastr, Statusbar) {
    var PRSMSView = Backbone.View.extend({
        modal_register: '#register-modal'
        , toolbar: [
            {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'filter_rows'}}
//            , {'input': {cssClass: 'form-control', placeholder: 'جستجو', type: 'text', name: 'q', value: "", text: "جستجو", addon: true, icon: 'fa fa-search'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'end', value: Global.jalaliToGregorian(persianDate().format('YYYY-MM-DD')), addon: true, icon: 'fa fa-calendar'}} //persianDate().format('YYYY-MM-DD')
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'start', value: Global.jalaliToGregorian(persianDate().subtract('days', 1).format('YYYY-MM-DD')), addon: true, icon: 'fa fa-calendar'}} // moment().subtract(7, 'day').format('YYYY-MM-DD')
        ]
        , events: {
            'click [data-task=filter_rows]': 'filter'
            , 'click [data-task=refresh-view]': 'reLoad'
        }
        , defatulFilter: {
            start: Global.jalaliToGregorian(persianDate().subtract('days', 1).format('YYYY-MM-DD')) + 'T00:00:00'
            , end: Global.jalaliToGregorian(persianDate().format('YYYY-MM-DD')) + 'T23:59:59'
        }
        , filter: function (e) {
            e.preventDefault();
            this.load({
                start: Global.jalaliToGregorian($("[name=start]").val()) + 'T00:00:00'
                , end: Global.jalaliToGregorian($("[name=end]").val()) + 'T23:59:59'
            });
        }
        , flags: {}
        , reLoad: function () {
            this.load();
        }
        , load: function (extend) {
            console.info('Loading items');
            var params = this.defatulFilter;
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , render: function (params) {
            var self = this;
            var params = (typeof params === "object") ? $.extend({}, this.defatulFilter, params) : this.defatulFilter;
            var model = new PRModel({query: $.param(params)});
            var template = Template.template.load('pr/sms', 'sms');
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
        , afterRender: function () {
            $("#pr-sms-page table").bootstrapTable(Config.settings.bootstrapTable);
            this.renderStatusbar();
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
    return PRSMSView;
});