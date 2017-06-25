define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.ingest.model', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper'
], function ($, _, Backbone, Template, Config, Global, IngestModel, toastr, Toolbar, Statusbar, pDatepicker, Tree) {
    var StatsIngestView = Backbone.View.extend({
        $modal: "#metadata-form-modal"
        , $metadataPlace: "#metadata-place"
        , model: 'IngestModel'
        , toolbar: [
            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
            , {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'show'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'enddate', addon: true, icon: 'fa fa-calendar'}} //persianDate().format('YYYY-MM-DD')
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'startdate', addon: true, icon: 'fa fa-calendar', value: Global.jalaliToGregorian(persianDate(SERVERDATE).subtract('days', 30).format('YYYY-MM-DD'))}}
        ]
        , statusbar: []
        , flags: {}
        , events: {
            'click [type=submit]': 'submit'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task=show]': 'load'
            , 'click [data-task=refresh]': 'reLoad'
            , 'change [data-type=state]': 'filterStates'
        }
        , filterStates: function (e) {
            var value = typeof e === "object" ? $(e.target).val() : e;

            var $printButton = $(".print-btn");
//            $printButton.attr('href', $printButton.attr('href').split('state=')[0] + 'state=' + value);
            var href  = '/stats/ingestprint?category=' + $("#items-table").attr('data-catid') + '&state=' + value;
                href += '&startdate=' + Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00' + '&enddate=' + Global.jalaliToGregorian($("[name=enddate]").val()) + 'T23:59:59';
            $printButton.attr('href', href);
            
            var $rows = $("#items-table tbody").find("tr");
            if (value == -1)
                $rows.show();
            else {
                $rows.hide();
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
        , load: function (e, extend) {
            console.info('Loading items');
            var params = {};
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('stats/ingest', 'ingest');
            var $container = $(Config.positions.main);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.afterRender();
                });
            });
        }
        , afterRender: function () {
            $("#tree").length && new Tree($("#tree"), Config.api.tree, this).render();
            this.renderStatusbar();
            this.attachDatepickers();
        }
        , attachDatepickers: function () {
            var self = this;
            var $datePickers = $(".datepicker");
            $.each($datePickers, function () {
                var $this = $(this);
                if ($this.data('datepicker') == undefined) {
                    $this.pDatepicker($.extend({}, CONFIG.settings.datepicker, {
                        onSelect: function () {
//                            self.render();
                        }
                    }));
                }
            });
            window.setTimeout(function() {
                self.filterStates($("[name=state]").val());
            }, 500);
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
        , prepareSave: function () {
            var data = [{}];
            $(this.$modal).find("input, textarea, select").each(function () {
                var $input = $(this);
                if (typeof $input.attr("name") !== "undefined") {
                    data[0][$input.attr("name")] = (/^\d+$/.test($input.val()) || ($input.attr("data-validation") === 'digit')) ? +$input.val() : $input.val();
                    if (typeof $input.attr('data-before-save') !== "undefined") {
                        switch ($input.attr('data-before-save')) {
                            case 'prepend-date':
                                data[0][$input.attr("name")] = Global.jalaliToGregorian($(this).parent().find("label").text()) + 'T' + $input.val();
                                break;
                            case 'timestamp':
                                data[0][$input.attr("name")] = Global.processTime($input.val());
                                break;
                        }
                    }
                }
            });
            return data;
        }
        , updateStats: function ($rows) {
            var stats = {duration: 0, count: 0};
            $rows.each(function () {
                if ($(this).is(":visible")) {
                    stats.count++;
                    stats.duration += $(this).data('duration');
                    $(this).find("td:first").html(stats.count);
                }
            });
            $("[data-type=duration]").html(Global.createTime(stats.duration));
            $("[data-type=count]").html(stats.count);
        }
        , processSum: function (items) {
            var data = {items: items, duration: 0, count: 0, header: true};
            $.each(items, function () {
                data.duration += this.Duration;
                data.count++;
            });
            return data;
        }
        , handleTreeCalls: function (routes, path) {
            var self = this;
            var pathId = routes.pop().toString();
            var params = {
                overrideUrl: Config.api.media
            };
            $("[data-type=path]").length && $("[data-type=path]").val(path.toString());
            $("[data-type=path-id]").length && $("[data-type=path-id]").val(pathId.toString());

            var template = Template.template.load('stats/ingest', 'metadata.partial');
            var $container = $(self.$metadataPlace);
            var model = new IngestModel(params);
            var modelData = {
                categoryId: pathId
                , startdate: (typeof $("[name=startdate]").val() !== "undefined" && $("[name=startdate]").val()) ? Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00' : Global.createDate('-30') + 'T00:00:00'
                , enddate: (typeof $("[name=enddate]").val() !== "undefined" && $("[name=enddate]").val()) ? Global.jalaliToGregorian($("[name=enddate]").val()) + 'T23:59:59' : Global.today() + 'T23:59:59'
            };
            model.fetch({
                data: $.param(modelData)
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
    return StatsIngestView;
});