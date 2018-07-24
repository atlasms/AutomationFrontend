define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.media.model', 'toastr', 'toolbar', 'statusbar', 'tree.helper', 'jquery-ui', 'bootpag'
], function ($, _, Backbone, Template, Config, Global, MediaModel, toastr, Toolbar, Statusbar, Tree, ui) {
    var BroadcastPhotosView = Backbone.View.extend({
        $modal: "#metadata-form-modal"
        , $itemsPlace: "#items-place"
        , model: 'EconomyModel'
        , toolbar: [
//            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
            {'button': {cssClass: 'btn btn-info', text: 'کپی آیتم‌ها', type: 'button', task: 'toggle-duplicate-form', icon: 'fa fa-copy'}}
            , {'button': {cssClass: 'btn green-jungle', text: 'ذخیره', type: 'button', task: 'submit'}}
        ]
        , statusbar: [
            {type: 'total-count', text: 'تعداد آیتم‌ها ', cssClass: 'badge badge-info'}
        ]
        , defaultListLimit: Config.defalutMediaListLimit
        , defalutPhotosListLimit: 100
        , defaultPhotosListOffset: 0
        , flags: {}
        , cache: {
            currentCategory: ''
        }
        , events: {
            'click [data-task="submit"]': 'submit'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task=show]': 'load'
            , 'click [data-task=refresh]': 'reLoad'
            , 'change [data-type="items-type-select"]': 'reloadPhotos'
            , 'click #itemlist table tbody tr': 'addItem'
            , 'click [data-task="reorder"]': 'reorderRows'
            , 'click [data-task="delete"]': 'deleteRow'
            , 'click [data-task="toggle-duplicate-form"]': 'toggleDuplicateForm'
            , 'click [data-type="load-items"]': 'filterItems'
            , 'click [data-task="copy"]': 'copy'
            , 'click [data-type="reload-photos"]': 'reloadPhotos'
        }
        , submit: function (e) {
            e.preventDefault();
            var self = this;
            var data = [];
            var $items = $("#photo-items table tbody tr");
            if (!$items.length) {
                toastr.warning('لیست خالی قابل ذخیره نیست!', 'ذخیره اطلاعات', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                return false;
            }
            var params = this.getPhotosParams();
            $items.each(function (i) {
                data.push({
                    MediaId: $(this).data('id')
                    , SectionId: params.sectionId
                    , Sort: i + 1
                    , DateTime: params.date
                    , ShowMedia: $(this).find('[name="ShowMedia"]:first')[0].checked ? 1 : 0
                    , TitleKind: $(this).find('[name=TitleKind]:first').val()
                });
            });
            params.overrideUrl = Config.api.broadcastphotos;
            new MediaModel(params).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function (d) {
                    toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
            });
        }
        , copy: function (e) {
            e.preventDefault();
            var data = $("#duplicate-items").serializeObject();
            data.SourceDate = Global.jalaliToGregorian(data.SourceDate) + 'T00:00:00';
            data.DestDate = Global.jalaliToGregorian(data.DestDate) + 'T00:00:00';
            new MediaModel({overrideUrl: Config.api.broadcastphotos + '/copy'}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function (d) {
                    toastr.success('با موفقیت انجام شد', 'کپی', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
            });

        }
        , reLoad: function () {
            this.load();
        }
        , filterItems: function () {
            this.loadItems();
        }
        , reloadPhotos: function () {
            this.loadPhotos();
        }
        , load: function (e, extend) {
            console.info('Loading items');
            var params = {};
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('broadcast/photos', 'photos');
            var $container = $(Config.positions.main);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({initialDate: Global.jalaliToGregorian(persianDate(SERVERDATE).subtract('month', 1).format('YYYY-MM-DD'))});
                $container.html(output).promise().done(function () {
                    self.afterRender();
                });
            });
            self.renderStatusbar();
        }
        , afterRender: function () {
            var self = this;
            $("#tree").length && new Tree($("#tree"), Config.api.tree, this).render();
            this.attachDatepickers(function () {
                self.loadPhotos(undefined, function () {
                    self.initSortable();
                    self.updateStatusbar();
                });
            });
        }
        , initPhotosPaginator: function () {
            var self = this;
            $(".photos-paginator").bootpag({
                total: Math.ceil($("#photo-items tbody tr").length / self.defalutPhotosListLimit),
                page: (self.defaultPhotosListOffset / self.defalutPhotosListLimit) + 1,
                maxVisible: self.defalutPhotosListLimit,
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
            }).off("page").on("page", function (event, num) {
                self.handlePhotosPagination((num - 1) * self.defalutPhotosListLimit);
//                requestParams.offset = (num - 1) * requestParams.count;
//                self.loadItems(requestParams);
            });
            self.handlePhotosPagination();
        }
        , initSortable: function (refresh) {
            var refresh = (typeof refresh !== "undefined") ? refresh : false;
            try {
                $("#photo-items tbody").sortable('refresh');
            } catch (e) {
                $("#photo-items tbody").sortable({
                    items: "tr"
                    , cancel: 'a, button, input, textarea, select'
                    , axis: 'y'
                    , forcePlaceholderSize: true
                    , placeholder: ".sort-placeholder"
                    , containment: "parent"
                });
            }
        }
        , attachDatepickers: function (callback) {
            var self = this;
            var $datePickers = $(".datepicker");
            var datepickerConf = {
                onSelect: function () {
//                    self.load();
                    $datePickers.blur();
                    if ($(this.inputElem).parents('#workspace').length)
                        self.reloadPhotos();
//                        console.log(this.inputElem);
                }
            };
            $.each($datePickers, function () {
                $(this).pDatepicker($.extend({}, CONFIG.settings.datepicker, datepickerConf));
            });
            if (typeof callback === 'function') {
                window.setTimeout(function () {
                    callback();
                }, 500);
            }
        }
        , reorderRows: function (e) {
            e.preventDefault();
            var $this = $(e.target).is('.btn') ? $(e.target) : $(e.target).parents('.btn:first');
            var $row = $this.parents('tr:first');
            var direction = $this.data('value');
            if (direction === 'up') {
                if ($row.prev().is('tr')) {
                    $row.insertBefore($row.prev());
                }
            } else {
                if ($row.next().is('tr')) {
                    $row.insertAfter($row.next());
                }
            }
        }
        , deleteRow: function (e) {
            e.preventDefault();
            var $row = $(e.target).is("tr") ? $(e.target) : $(e.target).parents("tr:first");
            $row.remove();
            this.updateStatusbar();
        }
        , renderToolbar: function () {
            var self = this;
            var elements = self.toolbar;
            var toolbar = new Toolbar();
            var elements = $.merge([], self.toolbar);
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
        }
        , updateStatusbar: function () {
            var count = $("#photo-items tbody tr").length;
            $('[data-type="photos-count"]').text(count);
            $("#status-items .total-count span").html(count);
        }
        , renderStatusbar: function () {
            var elements = this.statusbar;
            var statusbar = new Statusbar();
            $.each(elements, function () {
                statusbar.addItem(this);
            });
            statusbar.render();
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
            }).off("page").on("page", function (event, num) {
                requestParams.offset = (num - 1) * requestParams.count;
                self.loadItems(requestParams);
            });
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
        , addItem: function (e) {
            var self = this;
            var $item = $(e.target).is("tr") ? $(e.target) : $(e.target).parents("tr:first");
            $item.parent().find(".success").removeClass('success');
            $item.addClass('success');
            var items = [{
                    MediaId: $item.data('id')
                    , ShowMedia: 1
                    , Media: {
                        Thumbnail: $item.find('img').attr('src')
                        , Title: $item.find('.title').text()
                        , Description: $item.find('small').text()
                    }

                }];
            var template = Template.template.load('broadcast/photos', 'photos.partial');
            var $container = $("#photo-items table tbody");
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate(items);
                $container.append(output).promise().done(function () {
                    self.initSortable(true);
//                    self.initPhotosPaginator();
                    self.updateStatusbar();
                });
            });

        }
        , getParams: function (skipQueries) {
            var self = this;
            var catid = typeof self.cache.currentCategory !== "undefined" ? self.cache.currentCategory : $('#tree li[aria-selected="true"]').attr("id");
            var params = {
                q: $('[name="q"]').val(),
                type: $('[name="Type"]').val(),
                offset: 0,
                count: self.defaultListLimit,
                CategoryId: catid,
                state: 1,
                startdate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00',
                enddate: Global.jalaliToGregorian($("[name=enddate]").val()) + 'T23:59:59'
            };
            return params;
        }
        , loadItems: function (params) {
            var self = this;
            var params = (typeof params !== "undefined") ? params : self.getParams();
            var data = $.param(params);
            var model = new MediaModel(params);
            model.fetch({
                data: data
                , success: function (items) {
                    items = items.toJSON();
                    var template = Template.template.load('broadcast/photos', 'media.items-condensed.partial');
                    var $container = $("#itemlist");
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
//                            self.afterRender(items, params);
                            $('[data-type="total-count"]').text(items.count);
                            self.updateStatusbar();
                            self.renderPagination(items, params);
                        });
                    });
                }
            });
        }
        , getPhotosParams: function () {
            return {
                sectionId: $('[data-type="items-type-select"]').val()
                , date: Global.jalaliToGregorian($('[data-type="items-datepicker"]').val()) + 'T00:00:00'
            };
        }
        , loadPhotos: function (params, callback) {
            var self = this;
            var params = (typeof params !== "undefined") ? params : self.getPhotosParams();
            // Load Photos
            $('.total-count span').text(0);
            $('.portlet-title [data-type="photos-count"]').text(0);
            var data = $.param(params);
            params.overrideUrl = Config.api.broadcastphotos;
            var model = new MediaModel(params);
            model.fetch({
                data: data
                , success: function (items) {
                    var items = self.prepareItems(items.toJSON(), params);
                    var template = Template.template.load('broadcast/photos', 'photos.partial');
                    var $container = $("#photo-items table tbody");
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            self.updateStatusbar();
                            self.initPhotosPaginator();
                            if (typeof callback === 'function')
                                callback();
//                            self.afterRender(items, params);
                        });
                    });
                }
            });
        }
        , handlePhotosPagination: function (offset, count) {
            var count = typeof count !== "undefined" ? count : this.defalutPhotosListLimit;
            var offset = typeof offset !== "undefined" ? offset : this.defaultPhotosListOffset;
            var $items = $("#photo-items tbody tr").slice(offset, count + offset);
            $("#photo-items tbody tr").hide(function () {
                $items.show(1);
            });
        }
        , handleTreeCalls: function (routes, path) {
//            console.log('tree call');
            this.cache.currentCategory = routes.pop().toString();
            $('.portlet-title small').text(' [' + path.join(' ') + ']');
            this.loadItems();
        }
        , toggleDuplicateForm: function (e) {
            e.preventDefault();
            $(".duplicate-items").toggleClass('hidden');
        }
    });
    return BroadcastPhotosView;
});