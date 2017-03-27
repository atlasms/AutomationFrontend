define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'toastr', 'toolbar', 'live.model'
], function ($, _, Backbone, Template, Config, Global, toastr, Toolbar, LiveModel) {
    var LiveView = Backbone.View.extend({
        playerInstance: null
        , toolbar: []
        , statusbar: []
        , flags: {toolbarRendered: false}
        , events: {

        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            var params = this.getToolbarParams();
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , render: function (params) {
            var template = Template.template.load('resources/live', 'live');
            var $container = $(Config.positions.main);
            var self = this;
//            var params = typeof params !== "undefined" ? params : {};
            var model = new LiveModel({});
            model.fetch({
                success: function(d) {
                    var items = self.prepareItems(d.toJSON(), {});
                    console.log(items);
                }
            });
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.afterRender();
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
    return LiveView;
});