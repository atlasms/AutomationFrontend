define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'pr.model', 'toolbar', 'player.helper', 'toastr', 'pdatepicker', 'bootstrap/modal', 'bootstrap-table'
], function ($, _, Backbone, Template, Config, Global, PRModel, Toolbar, Player, toastr) {
    var PRRecordingsView = Backbone.View.extend({
        playerInstance: null
        , toolbar: [
            {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'filter_rows'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'end', value: Global.jalaliToGregorian(persianDate().format('YYYY-MM-DD')), addon: true, icon: 'fa fa-calendar'}} //persianDate().format('YYYY-MM-DD')
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'start', value: Global.jalaliToGregorian(persianDate().subtract('days', 1).format('YYYY-MM-DD')), addon: true, icon: 'fa fa-calendar'}} // moment().subtract(7, 'day').format('YYYY-MM-DD')
        ]
        , events: {
            'click [data-task=filter_rows]': 'filter'
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
            var template = Template.template.load('pr/recordings', 'recordings');
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
            
            
            //// TEMP
            var player = new Player('#aplayer', {
                file: '/assets/data/sample.mp3'
                , height: 40
                , aspectratio: false
                , template: {
                    controls: false
                    , seekbar: false
                }
//                , controls: false
            }, this.handlePlayerCallbacks);
            player.render();
            $this.playerInstance = player.instance;
            
            
            $("#pr-recordings-page table").bootstrapTable(Config.settings.bootstrapTable);
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
    return PRRecordingsView;
});