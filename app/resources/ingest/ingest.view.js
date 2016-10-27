define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'resources.ingest.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'ingestHelper', 'tree.helper', 'tus'
], function ($, _, Backbone, Template, Config, Global, moment, IngestModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, IngestHelper, Tree, tus) {
    var IngestView = Backbone.View.extend({
        el: $(Config.positions.wrapper)
        , model: 'IngestModel'
        , toolbar: [
            {'button': {cssClass: 'btn green-jungle pull-right hidden fade', text: 'ذخیره', type: 'submit', task: 'save'}}
        ]
        , statusbar: []
        , flags: {}
        , events: {
            'click [type=submit]': 'submit'
        }
        , submit: function () {
            var $this = this;
            var helper = new ScheduleHelper.validate();
            if (!helper.beforeSave())
                return;
            var data = this.prepareSave();
            new IngestModel().save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'ذخیره کنداکتور', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    $this.reLoad();
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
            var template = Template.template.load('resources/ingest', 'ingest');
            var $container = $(Config.positions.main);
            var model = new IngestModel(params);
            var self = this;
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
            IngestHelper.mask("time");
            $("#tree").length && new Tree($("#tree"), Config.api.tree).render();

            $("#toolbar button[type=submit]").removeClass('hidden').addClass('in');
            if (typeof this.flags.helperLoaded === "undefined") {
                IngestHelper.init();
                this.flags.helperLoaded = true;
            } else
                IngestHelper.init(true);
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
            this.flags.toolbarRendered = true;
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
                data.push(row);
            });
            return data;
        }
    });
    return IngestView;
});