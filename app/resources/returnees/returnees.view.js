define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.media.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper', 'bootstrap-table', 'bootpag'
], function ($, _, Backbone, Template, Config, Global, MediaModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, Tree) {
    var ReturneesView = Backbone.View.extend({
        playerInstance: null
        , model: 'MediaModel'
        , toolbar: [
            {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'load_returnees'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'enddate', addon: true, icon: 'fa fa-calendar',
                    value: Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD'))}} //persianDate().format('YYYY-MM-DD')
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'startdate', addon: true, icon: 'fa fa-calendar',
                    value: Global.jalaliToGregorian(persianDate(SERVERDATE).subtract('days', 7).format('YYYY-MM-DD'))}} // moment().subtract(7, 'day').format('YYYY-MM-DD')
        ]
        , statusbar: []
        , flags: {toolbarRendered: false}
        , events: {
            'click #returnees-table tbody tr': 'openItem'
            , 'click [data-task=refresh-view]': 'reLoad'
        }
        , openItem: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            var id = $el.attr("data-id");
            window.open('/resources/mediaitem/' + id);
            return false;
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            var params = this.getToolbarParams();
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , getToolbarParams: function () {
            var params = {
                state: 2
                , type: $("#toolbar [name=type]").val()
                , startdate: Global.jalaliToGregorian($("#toolbar [name=startdate]").val()) + 'T00:00:00'
                , enddate: Global.jalaliToGregorian($("#toolbar [name=enddate]").val()) + 'T23:59:59'
            };
            return params;
        }
        , render: function (params) {
            var params = (typeof params !== "undefined") ? params : this.getToolbarParams();
            var template = Template.template.load('resources/returnees', 'returnees');
            var $container = $(Config.positions.main);
            var model = new MediaModel(params);
            var self = this;
            model.fetch({
                data: (typeof params !== "undefined") ? $.param(params) : null
                , success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            self.afterRender();
                        });
                    });

                }
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    if ($("#returnees-table tbody tr").length)
                        $("#returnees-table tbody").empty();
                }
            });
        }
        , afterRender: function () {
            if ($("#review-table").length)
                $("#review-table").attr('id', 'returnees-table');
            this.renderStatusbar();
        }
        , renderToolbar: function () {
            var self = this;
            var toolbar = new Toolbar();
            var typeSelect = toolbar.getDefinedToolbar(47, 'type');
            var elements = $.merge($.merge([], self.toolbar), typeSelect);
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
            $(document).on('change', "#toolbar select", function () {
                self.load();
            });
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
        }
        , renderStatusbar: function () {
            var elements = this.statusbar;
            var statusbar = new Statusbar();
            $.each(elements, function () {
                statusbar.addItem(this);
            });
            statusbar.render();
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
    return ReturneesView;
});