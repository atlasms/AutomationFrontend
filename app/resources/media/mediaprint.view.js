define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.media.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'bootstrap-table', 'bootpag'
], function ($, _, Backbone, Template, Config, Global, MediaModel, Mask, toastr, Toolbar, Statusbar, pDatepicker) {
    var MediaPrintView = Backbone.View.extend({
        model: 'MediaModel'
        , toolbar: []
        , statusbar: []
        , defaultListLimit: Config.defalutMediaListLimit
        , flags: {}
        , cache: {
            currentCategory: ''
        }
        , mode: 'latest'
        , events: {}
        , reLoad: function (e) {
            if (typeof e !== "undefined")
                e.preventDefault();
            this.load();
        }
        , load: function (e, extend) {
            if (typeof e !== "undefined")
                e.preventDefault();
            var params = this.getParams(true);
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.loadItems(params);
            return false;
        }
        , getParams: function (skipQueries) {
            var params = $_GET;
            params.count = 1000000;
            return params;
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('resources/media', 'mediaprint');
            var $container = $(Config.positions.wrapper);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.loadItems();
                });
            });
            return;
        }
        , loadItems: function (params) {
            var self = this;
            var params = (typeof params !== "undefined") ? params : self.getParams();
            var data = $.param(params);
            var model = new MediaModel(params);
            model.fetch({
                data: data
                , success: function (items) {
                    items = items.toJSON();
                    var template = Template.template.load('resources/media', 'mediaprint.items.partial');
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
        , afterRender: function (items) {
            $('[data-type="total-count"]').html(items.count);
            $('[data-type="total-duration"]').html(Global.createTime2(items.duration));
        }
        , renderToolbar: function () {
            var self = this;
            var toolbar = new Toolbar();
            $.each(self.toolbar, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
            $(document).on('change', "#toolbar select[data-type=type]", function () {
                self.loadItems();
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
        }
    });
    return MediaPrintView;
});