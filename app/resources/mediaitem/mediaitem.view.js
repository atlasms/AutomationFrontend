define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', "app.view", 'moment-with-locales', 'resources.mediaitem.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper', 'player.helper', 'resources.ingest.model', 'bootbox', 'bootstrap/tab', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, Global, AppView, moment, MediaitemModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, Tree, player, IngestModel, bootbox) {
    bootbox.setLocale('fa');
    var MediaitemView = Backbone.View.extend({
        el: $(Config.positions.wrapper)
        , model: 'MediaitemModel'
        , modal: '#storage-modal'
        , toolbar: [
            {'button': {cssClass: 'btn green-jungle pull-right', text: 'ذخیره', type: 'submit', task: 'save'}}
        ]
        , statusbar: []
        , flags: {}
        , events: {
            'click [type=submit]': 'submit'
            , 'click [data-task=load]': 'load'
            , 'click [data-task=change-video]': 'changeVideo'
            , 'click #storagefiles tbody tr': 'setVideo'
        }
        , setVideo: function (e) {
            e.preventDefault();
            var self = this;
            bootbox.confirm({
                message: "آیتم فعلی حذف و آیتم جدید با ویدیوی انتخاب شده جایگزین خواهد شد. آیا مطمئن هستید؟<br />نکته: پس از جابجایی موفقیت‌آمیز به آیتم جدید هدایت خواهید شد."
                , buttons: {
                    confirm: {className: 'btn-success'}
                    , cancel: {className: 'btn-danger'}
                }
                , callback: function (results) {
                    if (results) {
                        var $item = $(e.relatedTarget);
                        var params = {
                            FileName: $item.attr('data-filename')
                        };
                        new IngestModel({overrideUrl: Config.api.metadata, id: self.getId()}).save({
                            FileName: $item.attr('data-filename')
                        }, {
                            error: function (e, data) {
                                toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                            }
                            , success: function (d) {
                                var id = d.toJSON()[0]["Id"];
                                if (+id == id) {
                                    toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات برنامه', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                                    $(self.modal).find("form").trigger('reset');
                                    $(self.modal).modal('hide');
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
            var params = {};
            var template = Template.template.load('resources/ingest', 'storagefiles.partial');
            var $modal = $(self.modal);
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
        , getId: function () {
            return Backbone.history.getFragment().split("/").pop().split("?")[0];
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('resources/mediaitem', 'mediaitem');
            var $container = $(Config.positions.main);
            var id = self.getId();
            var app = new AppView();
            if (+id != id) {
                app.load(404);
                return false;
            }
            var params = {path: +id};
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
            self.renderToolbar();
        }
        , getMedia: function (imageSrc) {
            return imageSrc.replace('.jpg', '_lq.mp4');
        }
        , afterRender: function (item, params) {
            var self = this;
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
            if (self.flags.toolbarRendered)
                return;
            var elements = self.toolbar;
            var toolbar = new Toolbar();
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
            self.flags.toolbarRendered = true;
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
    return MediaitemView;
});