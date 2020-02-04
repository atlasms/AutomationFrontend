define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.media2.model', 'resources.media-options.helper', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper', 'select2', 'shared.model', 'users.manage.model', 'bootstrap-table', 'bootpag', 'rangeslider'
], function ($, _, Backbone, Template, Config, Global, Media2Model, MediaOptionsHelper, Mask, toastr, Toolbar, Statusbar, pDatepicker, Tree, select2, SharedModel, UsersManageModel) {
    var MediaView2 = Backbone.View.extend({
//        el: $(Config.positions.wrapper),
        model: 'Media2Model'
        , toolbar: [
            {'filters': {}}
            , {'button': {cssClass: 'btn btn-default pull-left', text: 'فیلترها', type: 'button', task: 'toggle-sidebar', icon: 'fa fa-filter'}}
            , {'button': {cssClass: 'btn btn-success pull-left', text: 'جستجو', type: 'button', task: 'refresh', icon: 'fa fa-search'}}
            , {'button': {cssClass: 'btn btn-default pull-right', text: '', type: 'button', task: 'print', icon: 'fa fa-print', style: 'margin-left: 10px;'}}
            , {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
        ]
        , statusbar: []
        , defaultListLimit: Config.defalutMediaListLimit
        , flags: {}
        , cache: {
            currentCategory: ''
        }
        , currentPageUrl: ''
        , filters: []
        , fields: {
            q: ''
            , type: 0
            , offset: 0
            , count: Config.defalutMediaListLimit
            , categoryId: ''
            , state: 1
            , episode: ''
            // , startdate: Global.jalaliToGregorian(persianDate(SERVERDATE).subtract('month', 1).format('YYYY-MM-DD')) + 'T00:00:00'
            , startdate: '1970-01-01T00:00:00'
            , enddate: Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD')) + 'T23:59:59'
            , subjects: ''
            , tags: ''
            , persons: ''
            , users: ''
            , duration: '0;180'
            // , broadcastCount: '0;999'
            // , broadcastStartdate: Global.jalaliToGregorian(persianDate(SERVERDATE).subtract('year', 1).format('YYYY-MM-DD')) + 'T00:00:00'
            , broadcastStartdate: '1970-01-01T00:00:00'
            , broadcastEnddate: Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD')) + 'T23:59:59'
            , structure: ''
            , metaSubject: ''
            , classification: ''
            , MetaDataProductionGroup: ''
            , ordering: 'MediaCreated desc'
        }
        , treeInstance: {}
        , events: {
            'click [data-task=load_metadata]': 'load'
            , 'click #metadata-page tbody tr': 'selectRow'
            , 'click [data-task=print]': 'print'
            , 'click [data-task=refresh]': 'reLoad'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click .media-options a': 'UpdateMediaParams'
            , 'mouseenter tbody tr': 'loadWebp'
            , 'mouseleave tbody tr': 'unloadWebp'
            , 'click [data-task="toggle-sidebar"]': 'toggleSidebar'
            , 'click #filters .label a': 'removeFilter'
            , 'popstate window': 'handleUrlChange'
            , 'click th.sortable': 'handleOrdering'
            , 'click .toggle-tree-modal': function (e) {
                e.preventDefault();
                $('#tree-modal').modal('show');
            }
            , 'click .toggle-pane': function (e) {
                $(e.target).parents('.pane').first().toggleClass('collapsed');
            }

            // , 'change select.form-control': 'reLoad'
        }
        , handleOrdering: function (e) {
            e.preventDefault();
            var $th = $(e.target).is('th') ? $(e.target) : $(e.target).parents('th:first');
            var $headers = $th.parents('tr:first');
            if (!$th.hasClass('active')) {
                $headers.find('.sortable.active').removeClass('active');
                $th.addClass('active');
            }
            if ($th.hasClass('desc')) {
                $th.removeClass('desc').addClass('asc');
            } else {
                $th.removeClass('asc').addClass('desc');
            }
            var fieldTitle = $th.data('field');
            var value = 'Media' + fieldTitle[0].toUpperCase() + fieldTitle.slice(1) + ' ' + ($th.hasClass('desc') ? 'desc' : 'asc');
            $('[data-type="ordering"]').val(value);
            this.reLoad();
        }
        , print: function (e) {
            e.preventDefault();
            var win = window.open('/resources/media2print/' + this.currentPageUrl, '_blank');
            win.focus();
        }
        , toggleSidebar: function (e) {
            e.preventDefault();
            if ($('#media-sidebar').hasClass('hide')) {
                $('#media-sidebar').removeClass('hide');
                $('#media-mainbody').attr('class', 'col-xs-9 col-lg-10');
            } else {
                $('#media-sidebar').addClass('hide');
                $('#media-mainbody').attr('class', 'col-xs-12');
            }
        }
        , loadWebp: function (e) {
            var $row = $(e.target).is('tr') ? $(e.target) : $(e.target).parents('tr:first');
            var $img = $row.find('img[data-webp]');
            $img.parent().css({'position': 'relative'});
            if ($row.find('.proxy-thumb').length) {
                if ($row.find('.proxy-thumb').not('.has-error').length) {
                    $img.attr('src', $img.attr('data-webp'));
                    if ($row.hasClass('video'))
                        $row.removeClass('video').addClass('video1');
                }
            } else {
                $row.append('<img class="proxy-thumb" src="' + $img.attr('data-webp') + '" style="width: 0; height: 0; padding: 0; margin: 0; visibility: hidden; display: block;" />');
                $img.parent().append($("<div><dt/><dd/></div>").attr("class", "webp-progress"));
                $(".webp-progress").width((50 + Math.random() * 30) + "%");
                $('.proxy-thumb').on('load', function () {
                    $(this).css({'display': 'none'});
                    $img.attr('src', $img.attr('data-webp'));
                    if ($row.hasClass('video'))
                        $row.removeClass('video').addClass('video1');
                    $(this).parent().find(".webp-progress").width("101%").delay(200).fadeOut(400, function () {
                        $(this).remove();
                    });
                }).on('error', function () {
                    if ($row.hasClass('video1'))
                        $row.removeClass('video1').addClass('video');
                    $(this).addClass('has-error');
                    $(this).css({'display': 'none'});
                    $(this).parent().find(".webp-progress").remove();
                    if ($img.attr('src') !== $img.attr('data-orig'))
                        $img.attr('src', $img.attr('data-orig'));
                });
            }
        }
        , unloadWebp: function (e) {
            var $row = $(e.target).is('tr') ? $(e.target) : $(e.target).parents('tr:first');
            var $img = $row.find('img[data-orig]');
            if ($row.find('.webp-progress').length) {
                $row.find('.webp-progress').remove();
                $row.find('.proxy-thumb').remove();
            }
            if ($img.length)
                $img.attr('src', $img.attr('data-orig'));
            if (!$row.hasClass('video') && $row.hasClass('video1'))
                $row.removeClass('video1').addClass('video');
        }
        , registerWebpUrl: function () {
            var $rows = $('#itemlist table tbody tr');
            $rows.each(function () {
                var $img = $(this).find('img');
                var webpUrl = $img.attr('src').replace('.jpg', '.webp');
                $img.attr('data-orig') === undefined && $img.attr('data-orig', $img.attr('src'));
                $img.attr('data-webp', webpUrl);
            });
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
            var params = {};
            if (typeof this.flags['init'] === 'undefined' || !this.flags['init']) {
                params = this.getParams(true);
                // this.handleFiltersList();
                this.flags['init'] = true;
            } else {
                params = this.getParams();
            }

            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.loadItems(params);
            return false;
        }

        , handleUrlChange: function (e) {
            this.reLoad(e);
        }
        , handleFilterLabels: function (fields) {
            var self = this;
            var $filters = $('#filters');
            var labels = '';
            $.each(fields, function (key, value) {
                if (((self.fields[key] !== '' && self.fields[key] !== 0) || self.fields[key] != value) && self.checkActive(key)) {
                    var $relatedEl = $('[data-type="' + key + '"]');
                    var title = typeof $relatedEl.attr('placeholder') !== 'undefined' ? $relatedEl.attr('placeholder') : $relatedEl.parents('.pane').find('.ribbon').text();
                    // console.log(title, key, self.fields[key], value);
                    switch (key) {
                        case 'duration':
                        case 'broadcastCount':
                            value = value.replace(';', ' تا ');
                            break;
                        case 'startdate':
                        case 'enddate':
                        case 'broadcastStartdate':
                        case 'broadcastEnddate':
                            value = Global.gregorianToJalali(value.split('T')[0]);
                            break;
                    }
                    if ($relatedEl.is('select[multiple]') && value.indexOf(',') !== -1) {
                        values = value.split(',');
                        for (var i = 0; i < values.length; i++) {
                            labels += '<span class="label label-danger" data-key="' + key + '"data-value="' + values[i] + '">' + title + ': <span>' + self.resolveLabel($relatedEl, values[i]) + '</span><a href="#">&times;</a></span>';
                        }
                    } else
                        labels += '<span class="label label-danger" data-key="' + key + '" data-value="' + value + '">' + title + ': <span>' + ($relatedEl.is('select') ? self.resolveLabel($relatedEl, value) : value) + '</span><a href="#">&times;</a></span>';
                }
                $filters.html(labels)
            });
        }
        , removeFilter: function (e) {
            e.preventDefault();
            var self = this;
            var $filter = $(e.target).is('.label') ? $(e.target) : $(e.target).parents('.label:first');
            var $input = $('[data-type="' + $filter.data('key') + '"]');
            console.log($filter.data('key'), $filter.data('value'));
            if ($filter.data('key') === 'count')
                return;
            if ($input.is('select[multiple]')) {
                $input.find('option[value="' + $filter.data('value') + '"]').prop('selected', false);
                $input.trigger('change');
                self.reLoad();
                return;
            }
            var $checkbox = $input.parents('.pane').find('.checkbox input');
            if ($checkbox.length) {
                if ($checkbox.is(':visible')) {
                    $checkbox.prop('checked', false);
                } else {
                    $input.val('');
                }
                self.reLoad();
                return;
            }
        }
        , checkActive: function (field) {
            return $('[data-type="' + field + '"]').parents('.pane').find('.checkbox input')[0].checked;
        }
        , resolveLabel: function ($element, value) {
            return $element.find('option[value="' + value + '"]').text();
        }
        , getParams: function (setInputValues) {
            var self = this;
            var setInputValues = typeof setInputValues !== 'undefined' ? setInputValues : false;
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
                        if (field === 'startdate' || field === 'broadcastStartdate')
                                fields[field] = Global.jalaliToGregorian(value) + 'T00:00:00';
                            else
                                fields[field] = Global.jalaliToGregorian(value) + 'T23:59:59';
                        } else {
                            fields[field] = value;
                        }
                    }
                }
            }
            if ($('[data-type="categoryId"]').parents('.pane:first').find('.checkbox input[type="checkbox"]').get(0).checked) {
                fields.categoryId = this.treeInstance.get_checked().join(',');
            } else {
                fields.categoryId = '';
            }

            // if query is enabled
            if (setInputValues) {
                for (var field in fields) {
                    var qvalue = Global.getVar(field);
                    if (qvalue) {
                        fields[field] = qvalue.indexOf('$$') !== -1 ? qvalue.split('$$')[0] : qvalue;
                    }
                }
                this.setInputValues();
            }

            this.checkFilters(fields);

            this.handleFilterLabels(fields);

            // DEV
            $('pre.alert-danger').html(JSON.stringify(fields, null, 2));
            this.currentPageUrl = '?' + $.param(fields);
            $('.alert-success').html('<a target="_blank" href="' + this.currentPageUrl + '">' + this.currentPageUrl + '</a>');

            return fields;
        }
        , setInputValues: function () {
            var fields = $.extend({}, this.fields);

            // read fields values
            for (var field in fields) {
                var $element = $('[name="' + field + '"]');
                var content = Global.getVar(field);

                if (content === null)
                    continue;

                if ($element.is('select[multiple]')) {
                    $.each(content.split(","), function (i, e) {
                        $element.find("option[value='" + e + "']").prop("selected", true);
                    });
                } else if (field.indexOf('date') !== -1) {
                    $element.val(Global.gregorianToJalali(content.split('T')[0]));
                } else {
                    $element.val(content);
                }
            }
            $('#media-filters').trigger('change');
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
                if ($(this).attr('name') === 'broadcastStartdate') {
                    $(this).val(Global.jalaliToGregorian(persianDate(SERVERDATE).subtract('year', 1).format('YYYY-MM-DD')));
                }
                if ($(this).attr('name') === 'broadcastEnddate') {
                    $(this).val(Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD')));
                }
                $(this).pDatepicker($.extend({}, CONFIG.settings.datepicker, datepickerConf));
            });
        }
        , render: function (params) {
            if (this.getStorageUrl() && typeof location.href.split('?')[1] === 'undefined') {
                location.href = location.href.split('?')[0] + this.getStorageUrl();
                // window.history.pushState({},"", this.getStorageUrl());
            }
            this.renderToolbar();
            var self = this;
            var template = Template.template.load('resources/media', 'media2');
            var $container = $(Config.positions.main);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.loadTree();
                    self.loadBasicData();
                    self.handleDatepickers();
                    self.handleRangeSliders();
                });
            });
        }

        , handleRangeSliders: function () {
            $("#duration").ionRangeSlider({type: "double", grid: true, min: 0, max: 180, from: 0, to: 180, prefix: ""})
            $("#broadcastCount").ionRangeSlider({type: "double", grid: true, min: 0, max: 999, from: 0, to: 999, prefix: ""})
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
                    var instance = $tree.jstree(true);
                    self.treeInstance = instance;
                    /* if open_all() is used, self.load() of it's event listener should be used. */
                    // instance.open_all();
                    self.load();
                });
                $tree.bind("open_all.jstree", function (e, data) {
                    $tree.jstree(true).uncheck_all();
                    $tree.jstree(true).deselect_all();
                    var params = self.getParams();
                    $.each(params.categoryId.split(','), function () {
                        var node = data.instance.get_node($('#' + this));
                        $tree.jstree(true).check_node(node);
                    });
                    // self.load();
                });
                self.tree = new Tree($("#tree"), Config.api.tree, null, {hasCheckboxes: true});
                self.tree.render();
            }
        }
        , loadBasicData: function () {
            var self = this;
            var params = {tags: [], subjects: [], persons: [], users: []};
            self.loadTags(function (tags) {
                params.tags = tags;
                self.loadSubjects(function (subjects) {
                    params.subjects = subjects;
                    self.loadPersons(function (persons) {
                        params.persons = persons;
                        self.loadUsers(function (users) {
                            params.users = users;

                            // load data
                            self.renderBasicData(params);
                        });
                    });
                });
            });
        }
        , loadSubjects: function (callback) {
            var self = this;
            var queryParams = {overrideUrl: 'share/subjects'};
            new SharedModel(queryParams).fetch({
                success: function (subjects) {
                    subjects = self.prepareItems(subjects.toJSON(), queryParams);
                    if (typeof callback === "function")
                        callback(subjects);
                }
            });
        }
        , loadTags: function (callback) {
            var self = this;
            var queryParams = {};
            new SharedModel(queryParams).fetch({
                success: function (tags) {
                    tags = self.prepareItems(tags.toJSON(), queryParams);
                    if (typeof callback === 'function')
                        callback(tags);
                }
            });
        }
        , loadPersons: function (callback) {
            var self = this;
            var queryParams = {type: 0, q: '', overrideUrl: 'share/persons'};
            new SharedModel(queryParams).fetch({
                success: function (persons) {
                    persons = self.resolvePersonTypes(self.prepareItems(persons.toJSON(), queryParams));
                    if (typeof callback === 'function')
                        callback(persons);
                }
            });
        }
        , loadUsers: function (callback) {
            new UsersManageModel({}).fetch({
                success: function (users) {
                    users = users.toJSON();
                    var userList = [];
                    $.each(users, function (i, user) {
                        userList.push({id: user.Id, title: user.Family + ' ' + user.Name});
                    });
                    if (typeof callback === 'function')
                        callback(userList);
                }
            });
        }
        , resolvePersonTypes: function (persons) {
            var personsList = [];
            var personTypeList = {};
            var personTypes = Global.getDefinitions(135);
            personTypes.forEach(function (item) {
                personTypeList[item.value] = item.text;
            });
            $.each(persons, function (i, person) {
                personsList.push({id: person.id, title: person.family + ' ' + person.name + ' (' + personTypeList[person.type] + ')'});
            });
            return personsList;
        }
        , renderBasicData: function (params) {
            var self = this;
            var queryParams = self.getParams(true);
            Object.keys(params).forEach(function (type) {
                var $container = $('[data-type="' + type + '"]');
                for (var i in params[type]) {
                    $('[data-type="' + type + '"]').append('<option value="' + params[type][i]['id'] + '">' + params[type][i]['title'] + '</option>');
                }
                if (queryParams[type]) {
                    var selectedOptions = queryParams[type].split(',');
                    selectedOptions.forEach(function (s) {
                        $container.find('[value="' + s + '"]').prop("selected", true);
                    });
                    $container.trigger('change').trigger('change.select2');
                }
            });
        }
        , loadItems: function (params) {
            var self = this;
            var params = (typeof params !== "undefined") ? params : self.getParams();
            // set date from url query
            var data = $.param(params);
            var model = new Media2Model(params);
            model.fetch({
                data: data
                , success: function (items) {
                    items = items.toJSON();
                    var template = Template.template.load('resources/media', 'media2.items.partial');
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
            window.history.pushState({}, "", this.currentPageUrl);
            window.setTimeout(function () {
                $("select.select2").each(function () {
                    if ($(this).hasClass("select2-hidden-accessible"))
                        $(this).select2('destroy');
                    $(this).select2({dir: "rtl", multiple: true, tags: true, placeholder: $(this).parent().find('span').text(), dropdownParent: $(this).parents('form:first')});
                });
            }, 500);

            var params = this.getParams();
            if (typeof params.ordering !== 'undefined' && params.ordering !== '') {
                var ord = params.ordering.split(' ');
                $('th.sorable').each(function () {
                    if ($(this).hasClass('active'))
                        $(this).removeClass('active');
                });
                $('th.sortable[data-field="' + ord[0].replace('Media', '') + '"]').addClass('active').addClass(ord[1]);
            }

            $('[data-type="total-count"]').html(items.count);
            $('[data-type="total-duration"]').html(Global.createTime2(items.duration));
            this.renderPagination(items, requestParams);
            this.renderStatusbar();
            this.registerWebpUrl();
            this.setStorageUrl(this.currentPageUrl);
        }
        , setStorageUrl: function (url) {
            STORAGE.setItem('mediaUrl', url);
        }
        , getStorageUrl: function () {
            return STORAGE.getItem('mediaUrl');
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