define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'monitoring.model', 'toolbar', 'toastr', 'pdatepicker', 'bootstrap-table', 'bootstrap/collapse', 'bootstrap/tooltip'
], function ($, _, Backbone, Template, Config, Global, MonitoringModel, Toolbar, toastr) {
    var MonitoringPlaylistView = Backbone.View.extend({
        playerInstance: null
        , toolbar: [
            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh-view', icon: 'fa fa-refresh'}}
        ]
        , events: {
            'click [data-task=filter_rows]': 'filter'
            , 'click [data-task=refresh-view]': 'reLoad'
        }
        , flags: {}
        , reLoad: function () {
            this.load();
        }
//        , group: 'CmdGroup'
        , load: function (extend) {
            console.info('Loading items');
            var params = {};
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , render: function (params) {
            var self = this;
            var params = {path: '/PlayoutPlayList'};
            var model = new MonitoringModel(params);
            var template = Template.template.load('monitoring', 'list');
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
            var $this = this;
            $('[data-toggle="tooltip"]').tooltip();
//            $("#pr-recordings-page table").bootstrapTable(Config.settings.bootstrapTable);
        }
        , handlePlayerCallbacks: function () {

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
            self.flags.toolbarRendered = true;
        }
        , prepareItems: function (items, params) {
            var $this = this;
            if (typeof items.query !== "undefined")
                delete items.query;
            if (typeof params !== "undefined") {
                for (var prop in params) {
                    delete items[prop];
                }
            }
//            var data = {};
//            $.each(items, function () {
//                if (typeof data[this[$this.group]] === "undefined")
//                    data[this[$this.group]] = [];
//                data[this[$this.group]].push(this);
//            });
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
    return MonitoringPlaylistView;
});