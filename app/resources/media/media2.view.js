define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.media.model', 'resources.media-options.helper', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper', 'select2', 'shared.model', 'bootstrap-table', 'bootpag'
], function ($, _, Backbone, Template, Config, Global, MediaModel, MediaOptionsHelper, Mask, toastr, Toolbar, Statusbar, pDatepicker, Tree, select2, SharedModel) {
    var MediaView2 = Backbone.View.extend({
//        el: $(Config.positions.wrapper),
        model: 'MediaModel'
        , toolbar: [
            {'filters': {}}
            , {'button': {cssClass: 'btn btn-success pull-left', text: 'جستجو', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
            , {'button': {cssClass: 'btn btn-default pull-right', text: '', type: 'button', task: 'print', icon: 'fa fa-print', style: 'margin-left: 10px;'}}
            , {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
        ]
        , statusbar: []
        , defaultListLimit: Config.defalutMediaListLimit
        , flags: {}
        , cache: {
            currentCategory: ''
        }
        , filters: []
        , fields: {
            q: ''
            , type: 0
            , offset: 0
            , count: Config.defalutMediaListLimit
            , categoryId: ''
            , state: 0
            , startdate: Global.jalaliToGregorian(persianDate(SERVERDATE).subtract('month', 1).format('YYYY-MM-DD')) + 'T00:00:00'
            , enddate: Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD')) + 'T23:59:59'
            , subjects: ''
            , tags: ''
            , persons: ''
        }
        , treeInstance: {}
        , events: {
            'click [data-task=load_metadata]': 'load'
            , 'click #metadata-page tbody tr': 'selectRow'
            , 'click [data-task=refresh]': 'reLoad'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click .media-options a': 'UpdateMediaParams'

            // , 'change select.form-control': 'reLoad'
        }
        , loadSharedParams: function (callback) {
            var params = {tags: [], subjects: [], persons: []};
            new SharedModel().fetch({
                success: function (tags) {
                    params.tags = tags.toJSON();
                    new SharedModel({overrideUrl: 'share/persons'}).fetch({
                        success: function (persons) {
                            params.persons = persons.toJSON();
                            new SharedModel({overrideUrl: 'share/subjects'}).fetch({
                                success: function (subjects) {
                                    params.subjects = subjects.toJSON();
                                    if (typeof callback === "function")
                                        callback(params);
                                }
                            });
                        }
                    });
                }
            });
        }
        , UpdateMediaParams: function (e) {
            e.preventDefault();
            var self = this;
            var $li = $(e.target).parents('li:first');
            var params = {task: $li.data('task'), value: $li.data('value'), id: $(e.target).parents('tr:first').data('id')};
            MediaOptionsHelper.update(params, function (response) {
                if (response.error !== false)
                    toastr.error(response.error, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                else {
                    toastr.success('عملیات با موفقیت انجام شد', 'تغییر وضعیت', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    self.reLoad();
                }
            });
        }
        , selectRow: function (e) {
            if ($(e.target).is('.media-options') || $(e.target).parents('.media-options').length)
                return true;
            var $el = $(e.currentTarget);
            var id = $el.attr("data-id");
            window.open('/resources/mediaitem/' + id);
        }
        , reLoad: function (e) {
            if (typeof e !== "undefined")
                e.preventDefault();
            this.load();
        }
        , load: function (e, extend) {
            if (typeof e !== "undefined")
                e.preventDefault();
            var params = this.getParams();
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.loadItems(params);
            return false;
        }
        , getParams: function (skipQueries) {
            var fields = $.extend({}, this.fields);

            // read fields values
            for (var field in fields) {
                var $element = $('[name="' + field + '"]');
                var $checkbox = $element.parents('.pane:first').find('.checkbox input[type="checkbox"]');
                if ($checkbox.length && $checkbox.get(0).checked) {
                    if ($element.length && typeof $element.val() !== 'undefined' && $element.val()) {
                        var value = $element.val();
                        if (typeof value !== 'string') {
                            fields[field] = value.join(',');
                        } else if (field.indexOf('date') !== -1) {
                            if (field === 'startdate')
                                fields[field] = Global.jalaliToGregorian(value) + 'T00:00:00';
                            else
                                fields[field] = Global.jalaliToGregorian(value) + 'T23:59:59';
                        } else {
                            fields[field] = value;
                        }
                    }
                }
            }
            fields.categoryId = this.treeInstance.get_checked().join(',');

            // if query is enabled
            if (!skipQueries) {
                for (var field in fields) {
                    var qvalue = Global.getVar(field);
                    if (qvalue) {
                        fields[field] = qvalue.indexOf('$$') !== -1 ? qvalue.split('$$')[0] : qvalue;
                    }
                }
                this.setInputValues();
            }

            this.checkFilters(fields);
            $('pre').html(JSON.stringify(fields, null, 2));

            return fields;
        }
        , setInputValues: function () {

        }
        , checkFilters(fields) {
            this.filters = [];
            var defaultFields = this.fields;
            for (var field in fields) {
                if (fields[field] !== defaultFields[field]) {
                    this.filters.push({field: field, title: $('[data-type="' + field + '"]').parents('.mt-element-ribbon:first').find('.ribbon').text(), value: fields[field]});
                }
            }
            this.updateFilters(this.filters);
        }
        , updateFilters(filters) {
            var $filters = $('#filters');
            $filters.empty();
            if (filters.length) {
                for (var i = 0; i < filters.length; i++) {
                    var label = '<span class="label label-primary">' + filters[i]['title'] + ': ' + filters[i]['value'] + '</span>';
                }
            }
        }
        , handleDatepickers() {
            var $datePickers = $(".datepicker");
            var datepickerConf = {
                onSelect: function () {
                    $datePickers.blur();
                }
            };
            $.each($datePickers, function () {
                if ($(this).attr('name') === 'startdate') {
                    $(this).val(Global.jalaliToGregorian(persianDate(SERVERDATE).subtract('month', 1).format('YYYY-MM-DD')));
                }
                if ($(this).attr('name') === 'enddate') {
                    $(this).val(Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD')));
                }
                $(this).pDatepicker($.extend({}, CONFIG.settings.datepicker, datepickerConf));
            });
        }
        , render: function (params) {
            this.renderToolbar();
            var self = this;
            var template = Template.template.load('resources/media', 'media2');
            var $container = $(Config.positions.main);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.loadTree();
                    self.handleDatepickers();
                });
            });
        }



        , loadTree: function () {
            var self = this;
            if (STORAGE.getItem('tree')) {
                var storage = JSON.parse(STORAGE.getItem('tree'));
                storage.state.checkbox && delete storage.state.checkbox;
                storage.state.core.selected && delete storage.state.core.selected;
                STORAGE.setItem('tree', JSON.stringify(storage));
            }
            if ($("#tree").length) {
                var $tree = $("#tree");
                $tree.bind("loaded.jstree", function (e, data) {
                    self.treeInstance = data.instance;

                    // initialize the view
                    self.load();
                });
                self.tree = new Tree($("#tree"), Config.api.tree, null, {hasCheckboxes: true});
                self.tree.render();
            }
        }
        , loadItems: function (params) {
            var self = this;
            var params = (typeof params !== "undefined") ? params : self.getParams();
            // set date from url query
            var data = $.param(params);
            var model = new MediaModel(params);
            model.fetch({
                data: data
                , success: function (items) {
                    items = items.toJSON();
                    var template = Template.template.load('resources/media', 'media.items.partial');
                    var $container = $("#itemlist");
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            self.afterRender(items, params);
                        });
                    });
                }
            });
        }
        , handleTreeCallbacks: function (params, $tree, node) {
            var self = this;
            self.cache.currentCategory = params.id;
            params.method === "ready" && $('[name="cat-name"]').val(params.text) && self.loadItems();
        }
        , afterRender: function (items, requestParams) {

            window.setTimeout(function () {
                $("select.select2").each(function () {
                    if ($(this).hasClass("select2-hidden-accessible"))
                        $(this).select2('destroy');
                    $(this).select2({dir: "rtl", multiple: true, tags: true, placeholder: $(this).parent().find('span').text(), dropdownParent: $(this).parents('form:first')});
                });
            }, 500);

            $('[data-type="total-count"]').html(items.count);
            $('[data-type="total-duration"]').html(Global.createTime2(items.duration));
            this.renderPagination(items, requestParams);
            this.renderStatusbar();
        }
        , renderPagination: function (items, requestParams) {
            var self = this;
            $('.paginator').bootpag({
                total: Math.ceil(items.count / requestParams.count),
                page: (requestParams.offset / requestParams.count) + 1,
                maxVisible: 10,
                leaps: true,
                firstLastUse: true,
                first: '→',
                last: '←',
                wrapClass: 'pagination',
                activeClass: 'active',
                disabledClass: 'disabled',
                nextClass: 'next',
                prevClass: 'prev',
                lastClass: 'last',
                firstClass: 'first'
            }).on("page", function (event, num) {
                requestParams.offset = (num - 1) * requestParams.count;
                self.loadItems(requestParams);
            });
        }
        , renderToolbar: function () {
            var self = this;
            var toolbar = new Toolbar();
            // var definedTypes = toolbar.getDefinedToolbar(47, 'type');
            // var definedStates = toolbar.getDefinedToolbar(2, 'state');
            // var elements = $.merge($.merge($.merge([], self.toolbar), definedTypes), definedStates);
            $.each(self.toolbar, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render(function () {
                self.afterRenderToolbar();
                $(document).off('change', "#toolbar select[data-type=type]");
                $(document).on('change', "#toolbar select[data-type=type]", function () {
                    self.loadItems();
                });
            });
        }
        , afterRenderToolbar: function () {
            if (Global.getQuery('state'))
                $('[data-type="state"]').val(Global.getQuery('state'));
            var $datePickers = $(".datepicker");
            var datepickerConf = {
                onSelect: function () {
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

        }
        , prepareSave: function () {
            data = null;
            return data;
        }
    });
    return MediaView2;
});