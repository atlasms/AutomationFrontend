define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.media.model', 'toastr', 'toolbar', 'statusbar', 'ingestHelper', 'jquery-ui', 'pdatepicker', 'tree.helper', 'flowplayer.helper', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, Global, MediaModel, toastr, Toolbar, Statusbar, IngestHelper, ui, pDatepicker, Tree, FlowPlayer) {
    var ShotlistView = Backbone.View.extend({
        playerInstance: null
        , player: null
        , $modal: "#metadata-form-modal"
        , $metadataPlace: "#metadata-place"
        , model: 'MediaModel'
        , toolbar: [
            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
            , {'button': {cssClass: 'btn blue-sharp', text: 'ثبت اطلاعات ', type: 'button', task: 'add'}}
        ]
        , statusbar: [
            {type: 'total-duration', text: 'مجموع زمان', cssClass: 'badge badge-info'}
        ]
        , flags: {}
        , events: {
            'click [type=submit]': 'submit'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task=add]': 'openAddForm'
            , 'click [data-task=refresh]': 'reLoad'
            , 'click #storagefiles tbody tr': 'selectRow'
            , 'click [data-seek]': 'seekPlayer'
            , 'click [data-task="add-clip"]': 'addClip'
            , 'click [data-task="delete-shot"]': 'deleteShot'
            , 'click .shotlist-table tbody tr': 'loadShot'
            , 'click [data-task="load-list"]': 'loadItemlist'
            , 'submit .itemlist-filter': 'loadItemlist'
            , 'click #itemlist tbody tr': 'loadVideo'
            , 'focus .has-error input': function (e) {
                $(e.target).parents(".has-error:first").removeClass('has-error');
            }
        }
        , loadShot: function (e) {
            var $row = $(e.target).parents("tr:first");
            var params = [
                Global.processTime($row.find("td").eq(0).text())
                        , Global.processTime($row.find("td").eq(1).text())
            ];
            this.player.setRange(params, this.playerInstance, true);
        }
        , addClip: function (e) {
            e.preventDefault();
            var $form = $("#shotlist form");
            var data = $form.serializeObject();
            var tmpl = '<tr data-media={mediaid}><td>{start}</td><td>{end}</td><td>{duration}</td><td><button class="btn btn-default btn-xs" data-task="delete-shot"><i class="fa fa-trash"></i></button></td></tr>';
            if (data.start && data.end && Global.processTime(data.start) < Global.processTime(data.end)) {
                var duration = Global.createTime(Global.processTime(data.end) - Global.processTime(data.start));
                var mediaId = $("#itemlist tr.active").data("id");
                $form.next("table").find("tbody").append(tmpl.replace(/{start}/, data.start).replace(/{end}/, data.end).replace(/{duration}/, duration).replace(/{mediaid}/, mediaId));
                this.initSortable(true);
                this.handleDurations($form.next("table").find("tbody"));
            }
        }
        , handleDurations: function (items) {
            items = items.find("tr");
            var time = 0;
            items.each(function () {
                time += Global.processTime($(this).find("td").eq(2).text());
            });
            time = Global.createTime(time);
            this.handleStatusbar(time);
            $('input[data-type="duration"]').val(time);
        }
        , deleteShot: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var $row = $(e.target).parents("tr:first");
            var $table = $row.parents('tbody');
            $row.remove();
            this.handleDurations($table);
        }
        , submit: function (e) {
            e.preventDefault();
            var self = this;
            var helper = new IngestHelper.validate();
            if (!helper.beforeSave())
                return;
            var data = this.prepareSave();
            new MediaModel().save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات برنامه', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    $(self.$modal).find("form").trigger('reset');
                    $(self.$modal).modal('hide');
                    $("#storagefiles tr.active").addClass('disabled').removeClass('active success');
                }
                , error: function() {
                    toastr.error('انجام نشد', 'ذخیره اطلاعات برنامه', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
            });
        }
        , seekPlayer: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            this.player.seek($el.attr('data-seek'), this.playerInstance);
        }
        , openAddForm: function (e) {
            $("#media-filename").val('trim');
            $(this.$modal).modal('toggle');
        }
        , selectRow: function (e) {
            var $el = $(e.target);
            var $row = $el.parents("tr:first");
            if ($row.hasClass("disabled"))
                return false;
            $el.parents("tbody").find("tr").removeClass('active success');
            $row.addClass('active success');
            $row.find("[data-prop]").each(function () {
                if ($('input[name="' + $(this).attr('data-prop') + '"]').length)
                    $('input[name="' + $(this).attr('data-prop') + '"]').val($.trim($(this).text()));
            });
            $('button[data-task=add]').removeClass('disabled');
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
            var template = Template.template.load('resources/shotlist', 'shotlist');
            var $container = $(Config.positions.main);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.afterRender();
                });
            });
        }
        , getMedia: function (imageSrc) {
            return imageSrc.replace('.jpg', '_lq.mp4');
        }
        , offsetTime: function(datetime, offset) {
            if (typeof datetime === "undefined")
                return null;
            var dt = datetime.split(' ');
            if (typeof offset !== "undefined") {
                var date = new Date(dt[0].split('-')[0], (+dt[0].split('-')[1] - 1), dt[0].split('-')[2], dt[1].split(':')[0], dt[1].split(':')[1], dt[1].split(':')[2]);
                date.setTime(date.getTime() + (offset * 1000));
                datetime = date.getFullYear() + '-' + Global.zeroFill(date.getMonth() + 1) + '-' + Global.zeroFill(date.getDate());
                datetime += ' ' + Global.zeroFill(date.getHours()) + ':' + Global.zeroFill(date.getMinutes()) + ':' + Global.zeroFill(date.getSeconds());
            }
            return datetime.replace(/\:/g, '/').replace(/\-/g, '/').replace(' ', '/').slice(0, -3);
        }
        , loadVideo: function(e) {
            if ($(e.target.parentElement).is("a") || $(e.target).is("a"))
                return true;
            e.preventDefault();
            var self = this;
            $("#itemlist").find("tbody tr").removeClass('active');
            $(e.target).parents("tr:first").addClass('active');
            var url = self.getMedia($(e.target).parents("tr:first").find("img").attr('src'));
//            var url = "http://localhost:8008/assets/data/sample.mp4";
            var duration = $(e.target).parents("tr:first").data('duration');
            self.renderPlayer(url, Global.processTime(duration));
        }
        , renderPlayer: function(url, duration) {
            var self = this;
            if (self.playerInstance)
                self.player.remove();
            $('#player-container').empty();
            var playerConfig = {
                clip: {
                    sources: [
                        {src: url, type: 'video/mp4'}
                    ]
                }
                , template: { seekbar: {range: true} , controls: false }
                , duration: duration
            };
            var player = new Player('#player-container', playerConfig);
            player.render();
            self.player = player;
            self.playerInstance = player.instance;
            
            self.loadShotlist();
        }
        , loadShotlist: function() {
            // Load Shot-list
            var $container = $("#shotlist");
            if (!$container.is(":empty"))
                return;
            var template = Template.template.load('resources/ingest', 'ingest.shotlist.partial');
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function() {
                    IngestHelper.mask('time');
                });
            });
        }
        , loadItemlist: function (e) {
            typeof e !== "undefined" && e.preventDefault();
            var self = this;
            var params = $(".itemlist-filter").serializeObject();
            var template = Template.template.load('resources/media', 'media.items-condensed.partial');
            var $container = $("#itemlist");
            var modelParams = {};
            new MediaModel(modelParams).fetch({
                data: $.param(params)
                , success: function(items) {
                    items = self.prepareItems(items.toJSON(), $.extend(true, {}, modelParams, params));
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
//                            $container.stop().fadeIn();
                        });
                    });
                }
            });
        }
        , loadStorageFiles: function (e) {
            typeof e !== "undefined" && e.preventDefault();
            var template = Template.template.load('resources/ingest', 'storagefiles.partial');
            var $container = $("#storagefiles-place");
            var params = {path: '/files'};
            var model = new IngestModel(params);
            var self = this;
            $container.fadeOut();
            model.fetch({
                data: $.param(params)
                , success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            $container.stop().fadeIn();
                        });
                    });
                }
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
            });
        }
        , afterRender: function () {
            var self = this;
            self.attachDatepickers();
            $("#tree").length && new Tree($("#tree"), Config.api.tree, this).render();
            $("#toolbar button[type=submit]").removeClass('hidden').addClass('in');
            if (typeof this.flags.helperLoaded === "undefined") {
                IngestHelper.init();
                this.flags.helperLoaded = true;
            } else
                IngestHelper.init(true);
            this.renderStatusbar();
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
        , getShotlistData: function () {
            var $list = $("#shotlist tbody tr");
//            var itemStart = Global.processTime($("#itemlist tbody tr.active .start").text());
            var data = [];
            if ($list.length) {
                $list.each(function () {
                    data.push({
                        start: Global.processTime($(this).find("td").eq(0).text())
                        , end: Global.processTime($(this).find("td").eq(1).text())
                        , id: $(this).attr('data-media')
                    });
                });
            }
            return data;
        }
        , prepareSave: function () {
            var data = [{}];
//            console.log(this.getShotlistData());
            data[0].Shotlist = this.getShotlistData();
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
        , handleTreeCalls: function (routes, path) {
            var self = this;
            var pathId = routes.pop().toString();
            var params = {overrideUrl: Config.api.media};
            $("[data-type=path]").length && $("[data-type=path]").val(path.toString());
            $("[data-type=path-id]").length && $("[data-type=path-id]").val(pathId.toString());
            /*
             var template = Template.template.load('resources/ingest', 'metadata.partial');
             var $container = $(self.$metadataPlace);
             var model = new IngestModel(params);
             model.fetch({
             data: $.param({categoryId: pathId})
             , success: function (data) {
             items = self.prepareItems(data.toJSON(), params);
             template.done(function (data) {
             var handlebarsTemplate = Template.handlebars.compile(data);
             var output = handlebarsTemplate(items);
             $container.html(output).promise().done(function () {
             //                            self.afterRender();
             });
             });
             }
             });
             */
        }
        , renderStatusbar: function () {
            var elements = this.statusbar;
            var statusbar = new Statusbar();
            $.each(elements, function () {
                statusbar.addItem(this);
            });
            statusbar.render();
        }
        , handleStatusbar: function (time) {
            $(Config.positions.status).find('.total-duration').find("span").text(time);
        }
        , initSortable: function (refresh) {
            var refresh = (typeof refresh !== "undefined") ? refresh : false;
            try {
                $("#shotlist table tbody").sortable('refresh');
            } catch (e) {
                $("#shotlist table tbody").sortable({
                    items: "tr"
                    , cancel: 'a, button'
                    , axis: 'y'
                    , forcePlaceholderSize: true
                    , placeholder: ".sort-placeholder"
                    , containment: "parent"
                });
            }
        }
        , attachDatepickers: function () {
            var self = this;
            var $datePickers = $(".datepicker");
            $.each($datePickers, function () {
                var $this = $(this);
                if ($this.data('datepicker') == undefined) {
                    $this.pDatepicker($.extend({}, CONFIG.settings.datepicker, {
                        onSelect: function () {
                            $datePickers.blur();
                        }
                    }));
                }
            });
            self.loadItemlist();
        }
    });
    return ShotlistView;
});