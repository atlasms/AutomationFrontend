define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.mediaitem.model', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper'
], function ($, _, Backbone, Template, Config, Global, MediaitemModel, toastr, Toolbar, Statusbar, pDatepicker, Tree) {
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
                    value: Global.jalaliToGregorian(persianDate(SERVERDATE).subtract('days', 0).format('YYYY-MM-DD'))
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
            var range = {
                start: $_GET['startdate']
                , end: $_GET['enddate']
                , q: $_GET['q']
            };
            var params = {
                overrideUrl: Config.api.schedule + '/categorycountbydate?CategoryId=' + $_GET['CategoryId'] + '&startdate=' + range.start + '&enddate=' + range.end
            };
            if (range.q !== null && range.q !== '') {
                params.overrideUrl += '&q=' + range.q;
            }
            var template = Template.template.load('stats/broadcast', 'items.partial');
            var $container = $(self.$itemsPlace);
            var model = new MediaitemModel(params);
            model.fetch({
                success: function (data) {
                    items = self.processSum(self.prepareItems(data.toJSON(), params));
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                        });
                    });
                }
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
