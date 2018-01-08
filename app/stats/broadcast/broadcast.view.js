define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.mediaitem.model', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper'
], function ($, _, Backbone, Template, Config, Global, MediaitemModel, toastr, Toolbar, Statusbar, pDatepicker, Tree) {
    var StatsBroadcastView = Backbone.View.extend({
        $modal: "#metadata-form-modal"
        , $itemsPlace: "#items-place"
        , model: 'MediaitemModel'
        , toolbar: [
            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
            , {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'show'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'enddate', addon: true, icon: 'fa fa-calendar'}} //persianDate().format('YYYY-MM-DD')
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'startdate', addon: true, icon: 'fa fa-calendar', value: Global.jalaliToGregorian(persianDate(SERVERDATE).subtract('days', 0).format('YYYY-MM-DD'))}}
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
            return false;
            var value = typeof e === "object" ? $(e.target).val() : e;
            var $printButton = $(".print-btn");
            var href  = '/stats/broadcastprint?type=' + $('[data-type=type]').val();
                href += '&startdate=' + Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00&enddate=' + Global.jalaliToGregorian($("[name=enddate]").val()) + 'T23:59:59';
            $printButton.attr('href', href);
            
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
        , load: function (e, extend) {
            console.info('Loading items');
            var params = {};
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('stats/broadcast', 'broadcast');
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
//            $("#tree").length && new Tree($("#tree"), Config.api.tree, this).render();
            this.attachDatepickers();
            this.loadItems();
            this.renderStatusbar();
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
            var definedItems = toolbar.getDefinedToolbar(71, 'type');
            var elements = $.merge($.merge([], self.toolbar), definedItems);
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
            var stats = {duration: 0, count: 0, totalbroadcast: 0, totalrepeats: 0};
            $rows.each(function () {
                if ($(this).is(":visible")) {
                    stats.count++;
                    stats.duration += $(this).data('duration');
                    $(this).find(".idx").html(stats.count);
                    
                    if ($(this).find(".broadcast-count").text() > 0) {
                        stats.totalbroadcast += ($(this).data('duration'));
                    }
                }
            });
            $("[data-type=duration]").html(Global.createTime(stats.duration));
            $("[data-type=count]").html(stats.count);
            $("[data-type=totalbroadcast]").html(Global.createTime(stats.totalbroadcast));
        }
        , processSum: function (items) {
            var data = {items: items, duration: 0, count: 0, totalbroadcast: 0, totalrepeats: 0, header: true};
            $.each(items, function () {
                    data.count++;
                    data.duration += this.ConductorDuration;
                    data.totalbroadcast += this.ConductorDuration;
            });
            console.log(data);
            return data;
        }
        , loadItems: function () {
            var self = this;
            var range = {
                start: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00'
                , end: Global.jalaliToGregorian($("[name=enddate]").val()) + 'T23:59:59'
            };
            var params = {
                overrideUrl: Config.api.schedule + '/typecountbydate?type=' + $('[data-type=type]').val() + '&startdate=' + range.start + '&enddate=' + range.end
            };
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
                            self.updatePrintButton();
                        });
                    });
                }
            });
        }
        , updatePrintButton: function() {
            var $printButton = $(".print-btn");
            var dates = '?type=' + $('[data-type=type]').val() + '&startdate=' + Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00' + '&enddate=' + Global.jalaliToGregorian($("[name=enddate]").val()) + 'T23:59:59';
            if ($printButton.attr('href').indexOf('startdate') === -1)
                $printButton.attr('href', $printButton.attr('href') + dates);
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
    return StatsBroadcastView;
});