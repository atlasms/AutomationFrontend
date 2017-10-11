define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'resources.media.model', 'resources.mediaitem.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper', 'player.helper', 'resources.ingest.model', 'resources.review.model', 'resources.metadata.model', 'resources.categories.model', 'tree.helper', 'bootbox', 'bootstrap/tab', 'bootstrap/modal', 'bootstrap/popover', 'editable.helper'
], function ($, _, Backbone, Template, Config, Global, moment, MediaModel, MediaitemModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, Tree, player, IngestModel, ReviewModel, MetadataModel, CategoriesModel, Tree, bootbox, $tab, $modal, $popover, Editable) {
    bootbox.setLocale('fa');
    var MediaitemView = Backbone.View.extend({
//        el: $(Config.positions.wrapper)
        model: 'MediaitemModel'
        , playerInstance: {}
        , player: null
        , modal_storage: '#storage-modal'
        , modal_tree: '#tree-modal'
        , treeInstance: {}
        , toolbar: [
            {'button': {cssClass: 'btn green-jungle pull-right', text: 'ذخیره', type: 'submit', task: 'save'}}
        ]
        , statusbar: []
        , flags: {}
        , events: {
//            'click [type=submit]': 'submit'
            'click [data-task=load]': 'load'
            , 'click [data-task=change-video]': 'changeVideo'
            , 'click #storagefiles tbody tr': 'setVideo'
            , 'click [data-task=change-category]': 'changeCatgory'
            , 'click [data-task=select-folder]': 'setCategory'
            , 'click [data-task=return-item]': 'returnItem'
            , 'click [data-seek]': 'seekPlayer'
            , 'submit .chat-form': 'insertComment'
            , 'click .open-item': 'openItem'
            , 'click .item-forms .nav-tabs.tabs-left li a': 'loadTab'
            , 'submit .categories-metadata-form': 'saveMetadata'
            , 'click [data-task="send-telegram"]': 'sendTelegram'
            , 'click [data-task="publish-website"]': 'publishWebsite'
        }
        , sendTelegram: function (e) {
            e.preventDefault();
            var self = this;
            var data = {
                MediaId: self.getId()
                , Params: null
                , DestApp: 'telegram'
                , Cmd: 'publish'
            };
            new MediaitemModel({overrideUrl: Config.api.social}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
                , success: function (model, response) {
                    toastr.success('با موفقیت انجام شد', 'ارسال به تلگرام', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
//                    self.loadComments({query: 'externalid=' + data[0].externalid + '&kind=1', overrideUrl: Config.api.comments});
                }
            });
        }
        , publishWebsite: function(e) {
            e.preventDefault();
            var self = this;
            var data = {
                MediaId: self.getId()
                , Params: null
                , DestApp: 'website'
                , Cmd: 'publish'
            };
            new MediaitemModel({overrideUrl: Config.api.social}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
                , success: function (model, response) {
                    toastr.success('با موفقیت انجام شد', 'انتشار روی وب‌سایت', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
            });
        }
        , saveMetadata: function (e) {
            e.preventDefault();
            var self = this;
            var data = $(e.target).serializeObject();
            var $form = $(".categories-metadata-form");
            for (var key in data) {
                var type = $("[name=" + key + "]").attr('data-validation');
                data[key] = self.handleData(key, data[key], type);
            }
            new MetadataModel().save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات برنامه', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
            });
        }
        , handleData: function (key, value, type) {
            if (typeof type === "undefined")
                return value;
            switch (type) {
                case 'date':
                    return Global.jalaliToGregorian(value) + 'T00:00:00';
                case 'date-time':
                    return Global.jalaliToGregorian(value.split(' ')[0]) + 'T' + value.split(' ')[1];
                case 'multiple':
                    var items = $("[name=" + key + "]").val();
                    if (typeof items === "object")
                        return items.join(',');
                    else
                        return value;
                case 'checkbox':
                    var items = [];
                    $("[name=" + key + "]:checkbox:checked").each(function (i) {
                        items[i] = $(this).val();
                    });
                    if (typeof items === "object")
                        return items.join(',');
                    else
                        return value;
            }
            return value;
        }
        , seekPlayer: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            this.player.seek($el.attr('data-seek'), this.playerInstance);
        }
        , openItem: function (e) {
            var $el = $(e.currentTarget);
            var id = $el.attr("data-id");
            window.open('/resources/mediaitem/' + id);
        }
        , returnItem: function (e) {
            var $el = $(e.currentTarget);
            var id = $el.attr('data-id');
            this.handleEditables(id, {
                key: 'State'
                , value: 0
            }, this.returnItemCallback);
        }
        , returnItemCallback: function () {
            window.setTimeout(function () {
                Backbone.history.loadUrl();
            }, 500);
            return false;
        }
        , insertComment: function (e) {
            var self = this;
            var $form = $(e.currentTarget);
            var data = [];
            data.push($form.serializeObject());
            data[0].externalid = this.getId();
            data[0].Data = JSON.stringify({
                start: $form.find('[data-type="clip-start"]').val()
                , end: $form.find('[data-type="clip-end"]').val()
            });
            new ReviewModel({overrideUrl: Config.api.comments}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
                , success: function (model, response) {
                    toastr.success('success', 'saved', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    self.loadComments({query: 'externalid=' + data[0].externalid + '&kind=1', overrideUrl: Config.api.comments});
                }
            });
            e.preventDefault();
            return false;
        }
        , loadComments: function (params) {
            var self = this;
            new ReviewModel(params).fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    var template = Template.template.load('resources/review', 'comments.partial');
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $("#comments-container").html(output);
                        // After render
                        if ($("table").find(".scroller").length)
                            $("table").find(".scroller").slimScroll({
                                height: $("table").find(".scroller").height()
                                , start: 'bottom'
                            });
                        if ($("input.time").length)
                            $("input.time").mask('H0:M0:S0', {
                                placeholder: '00:00:00', translation: {'H': {pattern: /[0-2]/}, 'M': {pattern: /[0-5]/}, 'S': {pattern: /[0-5]/}}
                            });
                    });
                }
            });
        }
        , setVideo: function (e) {
            e.preventDefault();
            var self = this;
            var $item = $(e.currentTarget);
            bootbox.confirm({
                message: "آیتم فعلی حذف و آیتم جدید با ویدیوی انتخاب شده جایگزین خواهد شد. آیا مطمئن هستید؟<br />نکته: پس از جابجایی موفقیت‌آمیز به آیتم جدید هدایت خواهید شد."
                , buttons: {
                    confirm: {className: 'btn-success'}
                    , cancel: {className: 'btn-danger'}
                }
                , callback: function (results) {
                    if (results) {
                        new IngestModel({id: self.getId(), overrideUrl: Config.api.media}).save({FileName: $item.attr('data-filename'), Duration: $item.attr('data-duration')}, {
                            error: function (e, data) {
                                toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                            }
                            , success: function (d) {
                                var id = d.toJSON()[0]["Id"];
                                if (+id == id) {
                                    toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات برنامه', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                                    $(self.modal_storage).find("form").trigger('reset');
                                    $(self.modal_storage).modal('hide');
                                    !Backbone.History.started && Backbone.history.start({pushState: true});
                                    new Backbone.Router().navigate('resources/mediaitem/' + id, {trigger: true});
                                }
                            }
                        });
                    }
                }
            });
        }
        , changeVideo: function (e) {
            e.preventDefault();
            var self = this;
            var params = {path: '/files'};
            var template = Template.template.load('resources/ingest', 'storagefiles.partial');
            var $modal = $(self.modal_storage);
            var model = new IngestModel(params);
            model.fetch({
                data: params
                , success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    template.done(function (params) {
                        var handlebarsTemplate = Template.handlebars.compile(params);
                        var output = handlebarsTemplate(items);
                        $modal.find(".modal-content").html(output).promise().done(function () {
                            $modal.modal('show');
                        });
                    });
                }
            });
        }
        , changeCatgory: function (e) {
            e.preventDefault();
            var self = this;
            var id = $(e.currentTarget).attr('data-id');

            var style = $("#mediaitem-page").find("style");
            if (style.length)
                style.empty().text('[aria-labelledby="' + id + '_anchor"] a { background: lightgreen !important }');
            else
                $("#mediaitem-page").prepend('<style>[aria-labelledby="' + id + '_anchor"] a { background: lightgreen !important }</style>');

            var params = {path: '/getparents/' + $(e.currentTarget).attr('data-id')};
            var $modal = $(self.modal_tree);
            var model = new CategoriesModel(params);
            model.fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    var path = $.map(items, function (value, index) {
                        return [value];
                    }).reverse();
                    STORAGE.setItem("tree", '{"state":{"core":{"open":' + JSON.stringify(path) + ',"scroll":{"left":0,"top":0},"selected":["' + id + '"]}},"ttl":false,"sec":' + +new Date() + '}');
                    $modal.modal('show');
                    if ($("#tree").length) {
                        self.treeInstance = new Tree($("#tree"), Config.api.tree, self, {contextmenu: false});
                        self.treeInstance.render();
                    }
                }
            });
        }
        , setCategory: function (e) {
            e.preventDefault();
            var self = this;
            bootbox.confirm({
                message: "برنامه تعویض خواهد شد. آیا مطمئن هستید؟"
                , buttons: {confirm: {className: 'btn-success'}, cancel: {className: 'btn-danger'}}
                , callback: function (results) {
                    if (results) {
                        self.handleEditables(self.getId(), {
                            key: 'MetaCategoryId'
                            , value: self.treeInstance.selected.id
                        }, self.updateCategory);
                    }
                }
            });
        }
        , updateCategory: function (id, params, that) {
            var self = that;
            $(self.modal_tree).modal('hide');
            var $item = $('[data-type="category"]');
            $item.text(self.treeInstance.selected.text);
            $item.next().attr('data-id', params.value);
        }
        , submit: function () {
            var $this = this;
            if (!helper.beforeSave())
                return;
            var data = this.prepareSave();
            new MediaitemModel().save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'ذخیره کنداکتور', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    $this.reLoad();
                }
            });
        }
        , initEditables: function () {
            var self = this;
            var editable = new Editable({service: Config.api.url + Config.api.media}, self);
            editable.init();
        }
        , handleEditables: function (id, params, callback) {
            var self = this;
            new MediaitemModel({id: id}).save(params, {
                patch: true
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
                , success: function (model, response) {
                    toastr.success('عملیات با موفقیت انجام شد', 'تغییر اطلاعات', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    self.loadTab(null, true);
                    // reset editable field
                    if (typeof callback !== "undefined")
                        callback(id, params, self);
                }
            });
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            console.info('Loading items');
            var params = {};
            params.q = $("[name=q]").val();
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , loadTab: function (e, force) {
            var self = this;
            if (typeof e !== "undefined" && e !== null) {
                e.preventDefault();
                var el = $(e.currentTarget).parent();
            } else
                var el = $(".item-forms .nav-tabs li.active");
            if (typeof force !== "undefined" && force !== true)
//            if ((typeof force !== "undefined" && force !== true) && (!$(el.find("a").attr('href')).length || $(el.find("a").attr('href')).html() !== ""))
                return;
            var tmpl, model, data;
            var $container = $(el.find("a").attr('href'));
            var service = el.attr('data-service');
            switch (service) {
                default:
                    return false;
                    break;
                case 'review':
                    var params = {
                        query: 'externalid=' + self.getId() + '&kind=1'
                        , overrideUrl: Config.api.comments
                    };
                    tmpl = ['resources/review', 'review.partial'];
                    model = 'sequential-comments';
                    break;
                case 'versions':
                    var params = {
                        id: self.getId()
                        , overrideUrl: Config.api.mediaversions
                    };
                    tmpl = ['resources/mediaitem', 'versions.partial'];
                    model = new MediaitemModel(params);
                    break;
                case 'broadcast':
                    var params = {
                        overrideUrl: Config.api.schedule + '/mediausecount?id=' + self.getId()
                    };
                    tmpl = ['resources/mediaitem', 'broadcast.partial'];
                    model = new MediaitemModel(params);
                    break;
                case 'metadata':
                    var catid = $('[data-task="change-category"]').attr('data-id');
                    var masterId = self.getId();
                    var params = {query: 'MasterId=' + masterId, type: 1};
                    tmpl = ['resources/categories', 'category.metadata.partial'];
                    model = new MetadataModel(params);
                    break;
            }
            if (tmpl && model) {
                var template = Template.template.load(tmpl[0], tmpl[1]);
                if (typeof model !== "string" || model.indexOf('sequential') === -1) {
                    model.fetch({
                        success: function (items) {
                            items = self.prepareItems(items.toJSON(), params);
                            template.done(function (data) {
                                if (service === "metadata") {
                                    var mediaItemsParams = {query: 'categoryId=' + catid};
                                    var itemsModel = new MediaModel(mediaItemsParams);
                                    itemsModel.fetch({
                                        success: function (mediaItems) {
                                            mediaItems = self.prepareItems(mediaItems.toJSON(), mediaItemsParams);
                                            items.media = mediaItems;
                                            var handlebarsTemplate = Template.handlebars.compile(data);
                                            var output = handlebarsTemplate(items);
                                            $container.html(output).promise().done(function () {
                                                // After metadata form loaded
                                                self.attachDatepickers();
                                                var overrideConfig = {search: true, showPaginationSwitch: false, pageSize: 20};
                                                $(".categories-metadata-form table").bootstrapTable($.extend({}, Config.settings.bootstrapTable, overrideConfig));
                                            });
                                        }
                                    });
                                } else {
                                    var handlebarsTemplate = Template.handlebars.compile(data);
                                    var output = handlebarsTemplate(items);
                                    $container.html(output).promise().done(function () {
                                        if ($container.find(".scroller").length)
                                            $container.find(".scroller").slimScroll({
                                                height: $container.find(".scroller").height()
                                                , start: 'bottom'
                                            });
                                        if ($("input.time").length)
                                            $("input.time").mask('H0:M0:S0', {
                                                placeholder: '00:00:00', translation: {'H': {pattern: /[0-2]/}, 'M': {pattern: /[0-5]/}, 'S': {pattern: /[0-5]/}}
                                            });
                                    });
                                }
                            });
                        }
                    });
                } else {
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate({});
                        $container.html(output).promise().done(function () {
                            if (model.split('-')[1] === "comments")
                                self.loadComments(params);
                        });
                    });
                }
            }
        }
        , getId: function () {
            return Backbone.history.getFragment().split("/").pop().split("?")[0];
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('resources/mediaitem', 'mediaitem');
            var $container = $(Config.positions.main);
            var id = self.getId();
            // TODO
//            var app = new AppView();
//            if (+id != id) {
//                app.load(404);
//                return false;
//            }
            var params = {id: +id};
            var model = new MediaitemModel(params);
            model.fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    items = (Object.keys(items).length === 1) ? items[0] : items;
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
        , getMedia: function (imageSrc) {
            return imageSrc.replace('.jpg', '_lq.mp4');
        }
        , afterRender: function (item, params) {
            var self = this;
            if (location.hash && $('li[data-service="' + location.hash.replace('#', '') + '"]').length) {
                $('li[data-service="' + location.hash.replace('#', '') + '"]').find("a").trigger("click");
                $("html, body").animate({'scrollTop': $('li[data-service="' + location.hash.replace('#', '') + '"]').parents(".portlet").offset().top - 50}, 500);
            } else
                self.loadTab();
            self.initEditables();
            var media = {
                thumbnail: item.Thumbnail
                , video: self.getMedia(item.Thumbnail)
                , duration: item.Duration
            };
            var player = new Player('#player-container', {
                file: media.video
                , duration: media.duration
                , playlist: [{
                        image: media.thumbnail
                        , sources: [
                            {file: media.video, label: 'LQ', default: true}
                            , {file: media.video.replace('_lq', '_hq'), label: 'HQ'}
                        ]
                    }]
            });
            player.render();
            self.player = player;
            self.playerInstance = player.instance;
        }
        , renderToolbar: function () {
            var self = this;
//            if (self.flags.toolbarRendered)
//                return;
            var elements = self.toolbar;
            if (elements.length) {
                var toolbar = new Toolbar();
                $.each(elements, function () {
                    var method = Object.getOwnPropertyNames(this);
                    toolbar[method](this[method]);
                });
                toolbar.render();
//                self.flags.toolbarRendered = true;
            }
        }
        , prepareItems: function (items, params) {
            if (typeof items.query !== "undefined")
                delete items.query;
            if (typeof params !== "undefined") {
                for (var prop in params) {
                    delete items[prop];
                }
            }
            $.each(items, function () {
                if (typeof this.Data === "string" && this.Data !== "")
                    this.Data = JSON.parse(this.Data);
            });
            return items;
        }
        , prepareContent: function () {
            this.renderToolbar();
        }
        , prepareSave: function () {
            data = null;
            return data;
        }
        , attachDatepickers: function () {
            var self = this;
            var $datePickers = $(".datepicker");
            $.each($datePickers, function () {
                var $this = $(this);
                if ($this.data('datepicker') == undefined) {
                    $this.pDatepicker($.extend({}, CONFIG.settings.datepicker, {
                        onSelect: function () {}
                    }));
                }
            });
            var $dateTimePickers = $(".datetimepicker");
            $.each($dateTimePickers, function () {
                var $this = $(this);
                var reset = ($.trim($this.val()) == "") ? true : false;
                if ($this.data('datepicker') == undefined) {
                    var dateTimePickerSettings = {
                        format: 'YYYY-MM-DD HH:mm:ss'
                        , timePicker: {enabled: true}
                    };
                    $this.pDatepicker($.extend({}, CONFIG.settings.datepicker, dateTimePickerSettings, {
                        onSelect: function () {}
                    }));
                }
                if (reset)
                    $this.val($this.attr('data-default'));
            });
        }
    });
    return MediaitemView;
});