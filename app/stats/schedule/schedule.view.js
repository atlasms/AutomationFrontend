define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.mediaitem.model', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper', 'jstree', 'pdate'
], function ($, _, Backbone, Template, Config, Global, MediaitemModel, toastr, Toolbar, Statusbar, pDatepicker, Tree, jstree) {
    moment.locale('en');
    var StatsScheduleView = Backbone.View.extend({
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
                    value: Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD'))
                }
            }
        ]
        , statusbar: []
        , flags: {
            treeRendered: false
        }
        , tree: {}
        , events: {
            'click [type=submit]': 'submit'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task=show]': 'loadItems'
            , 'click [data-task=refresh]': 'reLoad'
            , 'keyup [data-type="tree-search"]': 'searchTree'
        }
        , searchTree: function (e) {
            $('#tree').jstree(true).show_all();
            $('#tree').jstree('search', $(e.target).val());
        }
        , handleTreeCalls: function (routes, path) {
            // var self = this;
            // var pathId = routes.pop().toString();
            // var params = { overrideUrl: Config.api.media };
            // $("[name=CategoryId]").length && $("[name=CategoryId]").val(pathId.toString());
            this.loadItems();
        }
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
            var template = Template.template.load('stats/schedule', 'schedule');
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
//            this.loadItems();
            this.attachDatepickers();
            if (!this.flags.treeRendered && $("#tree").length) {
                // new Tree($("#tree"), Config.api.tree, this).render();
                this.initTree();
            }
            this.renderStatusbar();
        }
        , initTree: function () {
            var self = this;
            if ($("#tree").length) {
                var $tree = $("#tree");
                $tree.bind("loaded.jstree", function (e, data) {
                    var instance = $tree.jstree(true);
                    self.treeInstance = data.instance;
                    instance.open_all();
                });
                $tree.bind("open_all.jstree", function (e, data) {
                    $tree.jstree(true).uncheck_all();
                    $tree.jstree(true).deselect_all();
                    if (STORAGE.getItem('tree')) {
                        var storage = JSON.parse(STORAGE.getItem('tree'));
                        try {
                            storage.state.checkbox && delete storage.state.checkbox;
                            storage.state.core.selected && delete storage.state.core.selected;
                            STORAGE.setItem('tree', JSON.stringify(storage));
                        } catch (e) {
                            //
                        }
                    }
                });
                self.tree = new Tree($("#tree"), Config.api.tree, self, { hasCheckboxes: true });
                self.tree.render();
                self.flags.treeRendered = true;
            }
        }
        , attachDatepickers: function () {
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
        }
        , renderToolbar: function () {
            var self = this;
            var elements = self.toolbar;
            var toolbar = new Toolbar();
//            var definedItems = toolbar.getDefinedToolbar(71, 'type');
            var elements = $.merge([], self.toolbar);
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
        }
        , prepareItems: function (items) {
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
            var stats = { duration: 0, count: 0, totalbroadcast: 0, totalrepeats: 0 };
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
            var data = { items: items, duration: 0, count: 0, totalbroadcast: 0, totalrepeats: 0, header: true, q: '' };
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
            var template = Template.template.load('stats/broadcast', 'items.partial');
            var $container = $(self.$itemsPlace);
            var selectedNodes = $("#tree").jstree(true).get_checked();
            var range = {
                start: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00'
                , end: Global.jalaliToGregorian($("[name=enddate]").val()) + 'T23:59:59'
                , q: $("[name=q]").val()
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
                                $container.html(output).promise().done(function () {
                                    self.updatePrintButton();
                                });
                            });
                        }
                    }
                });
            });
        }
        , updatePrintButton: function () {
            var $printButton = $(".print-btn");
            var params = '/stats/scheduleprint?CategoryId=' + $('[name=CategoryId]').val()
                + '&startdate=' + Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00'
                + '&enddate=' + Global.jalaliToGregorian($("[name=enddate]").val()) + 'T23:59:59'
                + '&q=' + $('[name=q]').val()
                // + '&category=' + $('#' + $('#tree').jstree(true).get_selected()).text();
                + '&category=' + $('#tree').jstree(true).get_checked().join(',');
            if ($printButton.attr('href').indexOf('startdate') === -1)
                $printButton.attr('href', $printButton.attr('href') + params);
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
    return StatsScheduleView;
});
