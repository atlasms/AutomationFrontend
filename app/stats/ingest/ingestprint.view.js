define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.ingest.model', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper'
], function ($, _, Backbone, Template, Config, Global, IngestModel, toastr, Toolbar, Statusbar, pDatepicker, Tree) {
    var StatsIngestPrintView = Backbone.View.extend({
        $metadataPlace: "#metadata-place"
        , model: 'IngestModel'
        , toolbar: []
        , statusbar: []
        , flags: {}
        , events: {
            'change [data-type=state]': 'filterStates'
        }
        , filterStates: function (e) {
            var value = $(e.target).val();
            var $rows = $("#items-table tbody").find("tr");
            if (value == -1)
                $rows.show();
            else {
                $rows.hide();
                if (value == 4)
                    $rows.each(function () {
                        if ($(this).data('broadcast-count') > 0)
                            $(this).show();
                    });
                else
                    $rows.each(function () {
                        if ($(this).data('state') == value)
                            $(this).show();
                    });
            }
            this.updateStats($rows);
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {}
        , render: function (params) {
            var self = this;
            var template = Template.template.load('stats/ingest', 'ingestprint');
            var $container = $(Config.positions.wrapper);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    var template = Template.template.load('stats/ingest', 'metadata.partial');
                    var $container = $(self.$metadataPlace);
                    var params = {overrideUrl: Config.api.media};
                    var model = new IngestModel(params);
                    model.fetch({
                        data: $.param({categoryId: $_GET['category'], startdate: $_GET['startdate'], enddate: $_GET['enddate']})
                        , success: function (data) {
                            items = self.processSum(self.prepareItems(data.toJSON(), params));
                            template.done(function (data) {
                                var handlebarsTemplate = Template.handlebars.compile(data);
                                var output = handlebarsTemplate(items);
                                $container.html(output).promise().done(function () {
                                    var state = $_GET['state'];
                                    $("[data-type=state]").val(state).trigger('change');
                                });
                            });
                        }
                    });
                });
            });
        }
        , afterRender: function () {}
        , renderToolbar: function () {}
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
        , updateStats: function ($rows) {
            var stats = {duration: 0, count: 0, totalbroadcast: 0, totalrepeats: 0};
            $rows.each(function () {
                if ($(this).is(":visible")) {
                    stats.count++;
                    stats.duration += $(this).data('duration');
                    $(this).find(".idx").html(stats.count);
                    
                    if ($(this).find(".broadcast-count").text() > 0) {
                        stats.totalbroadcast += ($(this).data('duration'));
                        stats.totalrepeats += ($(this).data('duration') * ($(this).find(".broadcast-count").text() - 1));
                    }
                }
            });
            $("[data-type=duration]").html(Global.createTime2(stats.duration));
            $("[data-type=count]").html(stats.count);
            $("[data-type=totalbroadcast]").html(Global.createTime2(stats.totalbroadcast));
            $("[data-type=totalrepeats]").html(Global.createTime2(stats.totalrepeats));
        }
        , processSum: function (items) {
            var data = {items: items, duration: 0, count: 0};
            $.each(items, function () {
                data.duration += this.Duration;
                data.count++;
            });
            return data;
        }
        , handleTreeCalls: function (routes, path) {
            var self = this;
            var pathId = routes.pop().toString();
            var params = {overrideUrl: Config.api.media};
            $("[data-type=path]").length && $("[data-type=path]").val(path.toString());
            $("[data-type=path-id]").length && $("[data-type=path-id]").val(pathId.toString());

            var template = Template.template.load('stats/ingest', 'metadata.partial');
            var $container = $(self.$metadataPlace);
            var model = new IngestModel(params);
            model.fetch({
                data: $.param({categoryId: pathId})
                , success: function (data) {
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
    return StatsIngestPrintView;
});