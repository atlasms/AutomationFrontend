define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.metadata.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker'
], function ($, _, Backbone, Template, Config, Global, MetadataModel, Mask, toastr, Toolbar, Statusbar, pDatepicker) {
    var MetadataView = Backbone.View.extend({
//        el: $(Config.positions.wrapper),
        model: 'MetadataModel'
        , toolbar: [
            {'button': {cssClass: 'btn btn-success', text: 'جستجو', type: 'submit', task: 'load_metadata'}}
            , {'input': {cssClass: 'form-control', placeholder: 'جستجو', type: 'text', name: 'q', value: "", text: "جستجو", addon: true, icon: 'fa fa-search'}}
            , {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
        ]
        , statusbar: []
        , flags: {}
        , events: {
            'click [data-task=load_metadata]': 'load'
            , 'click #metadata-page tbody tr': 'selectRow'
            , 'click [data-task=refresh]': 'reLoad'
            , 'click [data-task=refresh-view]': 'reLoad'
        }
        , selectRow: function (e) {
            var $el = $(e.currentTarget);
            var id = $el.attr("data-id");
            window.open('/resources/mediaitem/' + id + '#review');
//            !Backbone.History.started && Backbone.history.start({pushState: true});
//            new Backbone.Router().navigate('resources/mediaitem/' + id, {trigger: true});
            return;
        }
        , reLoad: function (e) {
            if (typeof e !== "undefined")
                e.preventDefault();
            this.load();
        }
        , load: function (e, extend) {
            if (typeof e !== "undefined")
                e.preventDefault();
            console.info('Loading items');
            var params = {};
            params.q = $("[name=q]").val();
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
            return false;
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('resources/metadata', 'metadata');
            var $container = $(Config.positions.main);
            var model = new MetadataModel(params);
            var self = this;
            params = (typeof params !== "undefined") ? params : {q: ' '};
            var data = (typeof params !== "undefined") ? $.param(params) : null;
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
            });
        }
        , afterRender: function () {
            this.renderStatusbar();
        }
        , renderToolbar: function () {
            var elements = this.toolbar;
            var toolbar = new Toolbar();
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
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
    return MetadataView;
});