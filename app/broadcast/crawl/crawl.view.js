define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'broadcast.crawl.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'crawlHelper', 'ladda', 'bootbox', 'bootstrap/modal', 'bootstrap/transition', 'bootstrap/tab'
], function ($, _, Backbone, Template, Config, Global, moment, CrawlModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, CrawlHelper, Ladda, bootbox) {
    bootbox.setLocale('fa');
    var CrawlView = Backbone.View.extend({
        el: $(Config.positions.wrapper)
        , model: 'CrawlModel'
        , toolbar: [
            {'button': {cssClass: 'btn green-jungle pull-right hidden fade', text: 'ذخیره', type: 'submit', task: 'save'}}
            , {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'load'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'startdate', value: persianDate().format('YYYY-MM-DD'), addon: true}}
        ]
        , statusbar: [
            {type: 'total-duration', text: 'مجموع زمان کنداکتور', cssClass: 'badge grey-salsa'}
        ]
        , timeArrays: {}
        , flags: {}
        , events: {
            'click [type=submit]': 'submit'
            , 'click [data-task=load]': 'load'
        }
        , submit: function (e) {
            e.preventDefault();
            var $this = this;
            var helper = new CrawlModel.validate();
            if (!helper.beforeSave())
                return;
            var data = this.prepareSave();
            new CrawlModel().save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'ذخیره کنداکتور', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    $this.reLoad();
                }
            });
        }
        , selectInput: function (e) {
            $(e.target).trigger('select');
        }
        , refreshList: function (e) {
            e.preventDefault();
            var target = $(e.currentTarget).attr('data-target');
            switch (target) {
                case 'export':
                    break;
            }
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            console.info('Loading items');
            var params = {
                startdate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00'
                , enddate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T23:59:59'
            };
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , render: function (params) {
            var template = Template.template.load('broadcast/schedule', 'schedule');
            var $container = $(Config.positions.main);
            var model = new CrawlModel(params);
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
                    if ($("#crawl-page tbody tr").length)
                        $("#crawl-page tbody").empty();
                }
            });
            self.renderToolbar();
            self.renderStatusbar();
        }
        , afterRender: function () {
            CrawlHelper.mask("time");
            $("#toolbar button[type=submit]").removeClass('hidden').addClass('in');
            if (typeof this.flags.helperLoaded === "undefined") {
                CrawlHelper.init();
                this.flags.helperLoaded = true;
            } else
                CrawlHelper.init(true);

            var dateParts = $("[name=startdate]").val().split('-');
            for (var i = 0; i < dateParts.length; i++)
                dateParts[i] = parseInt(dateParts[i]);
            $("[name=startdate]").parent().find(".input-group-addon").text(persianDate(dateParts).format('dddd'));
        }
        , renderToolbar: function () {
            var self = this;
            if (this.flags.toolbarRendered)
                return;
            var elements = this.toolbar;
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
            this.flags.toolbarRendered = true;
        }
        , renderStatusbar: function () {
//            var self = this;
            if (this.flags.statusbarRendered)
                return;
            var elements = this.statusbar;
            var statusbar = new Statusbar();
            $.each(elements, function () {
                statusbar.addItem(this);
            });
            statusbar.render();
            this.flags.statusbarRendered = true;
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
            var data = [];
            var $rows = $("table:first tbody tr");
            $rows.each(function () {
                var row = {};
                $(this).find("input, textarea, select").each(function () {
                    var $input = $(this);
                    if ($input.parents(".preview-pane").length)
                        return;
                    if (typeof $input.attr("name") !== "undefined") {
                        row[$input.attr("name")] = (/^\d+$/.test($input.val()) || ($input.attr("data-validation") === 'digit')) ? +$input.val() : $input.val();
                        if (typeof $input.attr('data-before-save') !== "undefined") {
                            switch ($input.attr('data-before-save')) {
                                case 'prepend-date':
                                    row[$input.attr("name")] = Global.jalaliToGregorian($(this).parent().find("label").text()) + 'T' + $input.val();
                                    break;
                                case 'timestamp':
                                    row[$input.attr("name")] = Global.processTime($input.val());
                                    break;
                            }
                        }
                    }
                });
                if (!_.isEmpty(row))
                    data.push(row);
            });
            return data;
        }
    });
    return CrawlView;
});