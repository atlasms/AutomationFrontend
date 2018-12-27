define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'inbox.model', 'toolbar', 'toastr', 'pdatepicker', 'bootstrap-table'
], function ($, _, Backbone, Template, Config, Global, InboxModel, Toolbar, toastr) {
    var PricesLogsView = Backbone.View.extend({
        playerInstance: null
        , toolbar: [
            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh-view', icon: 'fa fa-refresh'}}
        ]
        , events: {
            'click [data-task=filter_rows]': 'filter'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click .inbox-content table tr': 'showMessageBody'
        }
        , flags: {}
        , reLoad: function () {
            this.load();
        }
        , load: function (extend) {
            var params = {query: 'externalid=0&kind=4&provider=inbox'};
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('user/notifications', 'notifications-details');
            var $container = $(Config.positions.main);
            var params = {query: 'externalid=0&kind=4&provider=log'};
            new InboxModel(params).fetch({
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
            $("#main table").bootstrapTable(Config.settings.bootstrapTable);
            var $this = this;
        }
        , showMessageBody: function(e) {
            e.preventDefault();
            var $tr = $(e.target).is('tr') ? $(e.target) : $(e.target).parents('tr:first');
            var $table = $tr.parents('table:first');
            $table.find('.alert:visible').slideUp();
            $tr.find('.alert').slideDown();
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
    });
    return PricesLogsView;
});