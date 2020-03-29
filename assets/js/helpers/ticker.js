define(['jquery', 'underscore', 'backbone', 'config', 'template', 'global', 'newsroom.model'
], function ($, _, Backbone, Config, Template, Global, NewsroomModel) {
    var Ticker = Backbone.View.extend({
        interval: {}
        , lastItems: []
        , events: {
            'click .ticker li[data-id]': 'loadItem'
        }
        , initialize: function () {
            // var self = this;
            if (Config.newsTicker)
                this.checkNewItems();
        }
        , loadItem: function (e) {
            e.preventDefault();
            var id = $(e.target).is('li') ? $(e.target).data('id') : $(e.target).parents('li:first').data('id');
            var win = window.open('/newsroom/news/?topic=283&id=' + id, '_blank');
        }
        , startTicker: function () {
            if (typeof this.interval !== 'undefined')
                window.clearInterval(this.interval);
            this.interval = window.setInterval(function () {
                var $items = $(".ticker");
                $items.find("li:first").slideUp(500, function () {
                    $(this).appendTo($items).slideDown(1);
                });
            }, Config.tickerInterval);
        }
        , getParams: function () {
            return {
                keyword: ''
                , topic: 283
                , source: ''
                , q: ''
                , offset: 0
                , count: 10
                // , startdate: Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD')) + 'T00:00:00'
                , startdate: Global.today() + 'T00:00:00'
                // , enddate: Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD')) + 'T23:59:59'
                , enddate: Global.today() + 'T23:59:59'
            };
        }
        , checkNewItems: function () {
            var self = this;
            var requestParams = this.getParams();
            var template = Template.template.load('newsroom', 'ticker.partial');
            template.done(function (data) {
                self.getNewItems(requestParams, data);
                window.setInterval(function () {
                    $('#news-ticker').empty();
                    self.getNewItems(requestParams, data);
                }, Config.tickerUpdateInterval)
            });
        }
        , getNewItems: function (requestParams, templateData) {
            var self = this;
            var model = new NewsroomModel({query: $.param(requestParams), path: 'list'});
            model.fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), $.extend({}, requestParams, {path: 'list'}));
                    var handlebarsTemplate = Template.handlebars.compile(templateData);
                    var output = handlebarsTemplate(items);
                    $('#news-ticker').html(output).promise().done(function () {
                        self.startTicker();
                    });
                }
            });
        }
        , prepareItems: function (items, params) {
            if (typeof items.query !== "undefined")
                delete items.query;
            if (typeof params !== "undefined")
                for (var prop in params)
                    delete items[prop];
            return items;
        }
    });
    return Ticker;
});
