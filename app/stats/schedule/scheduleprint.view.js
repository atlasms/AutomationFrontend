define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.mediaitem.model', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper', 'moment-with-locales', 'pdate'
], function ($, _, Backbone, Template, Config, Global, MediaitemModel, toastr, Toolbar, Statusbar, pDatepicker, Tree) {
    moment.locale('en');
    var StatsSchedulePrintView = Backbone.View.extend({
        $modal: "#metadata-form-modal"
        , $itemsPlace: "#items-place"
        , model: 'MediaitemModel'
        , toolbar: [
            { 'button': { cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh' } }
            , { 'button': { cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'show' } }
            , { 'input': { cssClass: 'form-control', placeholder: 'عبارت جستجو', type: 'text', name: 'q', addon: true, icon: 'fa fa-search' } }
            , { 'input': { cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'enddate', addon: true, icon: 'fa fa-calendar' } } //persianDate().format('YYYY-MM-DD')
            , {
                'input': {
                    cssClass: 'form-control datepicker',
                    placeholder: '',
                    type: 'text',
                    name: 'startdate',
                    addon: true,
                    icon: 'fa fa-calendar',
                    value: Global.moment(SERVERDATE).format('YYYY-MM-DD')
                }
            }
        ]
        , statusbar: []
        , flags: {}
        , events: {}
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            var params = {};
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('stats/broadcast', 'broadcastprint');
            var $container = $(Config.positions.wrapper);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate();
                $container.html(output).promise().done(function () {
                    self.loadItems();
//                    self.afterRender();
                });
            });
        }
        , afterRender: function () {
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
        }
        , prepareItems: function (items, params) {
            if (typeof items.query !== "undefined")
                delete items.query;
            var params = { q: "", totalbroadcast: 0, totalrepeats: 0, overrideUrl: '' };
            for (var prop in params) {
                delete items[prop];
            }
            return Object.values(items);
        }
        , prepareContent: function () {
            this.renderToolbar();
        }
        , processSum: function (items) {
            var data = { items: items, duration: 0, count: 0, totalbroadcast: 0, totalrepeats: 0, header: false, q: '' };
            $.each(items, function () {
                data.count++;
                data.duration += this.ConductorDuration;
                data.totalbroadcast += this.ConductorDuration;
            });
            return data;
        }
        , loadItems: function () {
            var self = this;
            var template = Template.template.load('stats/broadcast', 'items.partial');
            var $container = $(self.$itemsPlace);
            var selectedNodes = $_GET['category'].split(',');
            var range = {
                start: $_GET['startdate']
                , end: $_GET['enddate']
                , q: $_GET['q']
            };
            var params = {};
            var items = [];

            $.each(selectedNodes, function (i, node) {
                params = {
                    // overrideUrl: Config.api.schedule + '/categorycountbydate?CategoryId=' + $('[name=CategoryId]').val() + '&startdate=' + range.start + '&enddate=' + range.end
                    overrideUrl: Config.api.schedule + '/categorycountbydate?CategoryId=' + node + '&startdate=' + range.start + '&enddate=' + range.end
                };
                if (range.q !== null && range.q !== '') {
                    params.overrideUrl += '&q=' + range.q;
                }
                var model = new MediaitemModel(params);
                model.fetch({
                    success: function (data) {
                        items = $.merge(items, self.prepareItems(data.toJSON()));
                        if (i === selectedNodes.length - 1) {
                            items = self.processSum(items);
                            template.done(function (data) {
                                var handlebarsTemplate = Template.handlebars.compile(data);
                                var output = handlebarsTemplate(items);
                                $container.html(output);
                            });
                        }
                    }
                });
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
    });
    return StatsSchedulePrintView;
});
