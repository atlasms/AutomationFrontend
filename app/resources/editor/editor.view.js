define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.media.model', 'newsroom.model', 'toastr', 'toolbar', 'statusbar', 'timeline.helper', 'ingestHelper', 'jquery-ui', 'pdatepicker', 'tree.helper', 'flowplayer.helper', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, Global, MediaModel, NewsroomModel, toastr, Toolbar, Statusbar, Timeline, IngestHelper, ui, pDatepicker, Tree, FlowPlayer) {
    var MediaEditorView = Backbone.View.extend({
        playerInstance: null
        , player: null
        , $modal: "#metadata-form-modal"
        , $metadataPlace: "#metadata-place"
        , model: 'MediaModel'
        , defaultListLimit: Config.defalutMediaListLimit
        , toolbar: [
//            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
//            {'button': {cssClass: 'btn blue-sharp', text: 'ذخیره جدید', type: 'button', task: 'save-as', icon: 'fa fa-copy'}}
            {'button': {cssClass: 'btn red-thunderbird', text: 'تولید ویدیو', type: 'button', task: 'export', icon: 'fa fa-share'}}
            , {'button': {cssClass: 'btn green-jungle', text: 'جدید', type: 'button', task: 'new', icon: 'fa fa-plus'}}
            , {'button': {cssClass: 'btn btn-primary', text: 'ذخیره', type: 'submit', task: 'save', icon: 'fa fa-save'}}
            , {'button': {cssClass: 'btn purple', text: 'انتخاب مدیا', type: 'button', task: 'open-media-modal', icon: 'fa fa-download'}}
        ]
        , statusbar: [
            {type: 'total-duration', text: 'مجموع زمان', cssClass: 'badge badge-info'}
        ]
        , cache: {}
        , flags: {}
        , id: null
        , events: {
            'click [data-task="save"]': 'submit'
            , 'click [data-task="new"]': 'newProject'
            , 'click [data-task="export"]': 'exportProject'
//            , 'click [data-task=refresh-view]': 'reLoad'
//            , 'click [data-task=add]': 'openAddForm'
//            , 'click [data-task=refresh]': 'reLoad'
//            , 'click #storagefiles tbody tr': 'selectRow'
//            , 'click [data-seek]': 'seekPlayer'
//            , 'click [data-task="add-clip"]': 'addClip'
            , 'click [data-task="open-media-modal"]': 'openMediaModal'
            , 'click [data-task="load-media"]': 'loadMedia'
            , 'submit #new-item-form': 'createWorkspaceItem'
//            , 'click [data-task="delete-shot"]': 'deleteShot'
//            , 'click .shotlist-table tbody tr': 'loadShot'
//            , 'click [data-task="load-list"]': 'loadItemlist'
//            , 'submit .itemlist-filter': 'loadItemlist'
            , 'click #itemlist tbody tr': 'loadVideo'
            , 'focus .has-error input': function (e) {
                $(e.target).parents(".has-error:first").removeClass('has-error');
            }
        }
        , defaultListLimit: Config.defalutMediaListLimit
        , timeline: {}
        , newProject: function (e) {
            e.preventDefault();
            !Backbone.History.started && Backbone.history.start({pushState: true});
            new Backbone.Router().navigate('resources/editor', {trigger: true});
        }
        , openMediaModal: function (e) {
            $("#media-modal").modal('toggle');
        }
        , exportProject: function (e) {
            e.preventDefault();
            if (!this.getId()) {
                toastr.warning('ابتدا پروژه را ذخبره نمایید', 'خطا در تولید ویدیو', Config.settings.toastr);
                return false;
            }
            var shots = this.timeline.exportShots();
            if (!shots.length) {
                toastr.warning('پروژه خالی است!', 'خطا در تولید ویدیو', Config.settings.toastr);
                return false;
            }
            var data = {
                File1: ''
                , File2: this.getId() + '.mp4'
                , Cmd: 'ExportTimeline'
                , CmdGroup: '0'
                , Params: JSON.stringify(this.timeline.exportTimeline())
            };
            new MediaModel({overrideUrl: Config.api.hsm}).save(null, {
                data: JSON.stringify([data])
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'تولید ویدیو', Config.settings.toastr);
                }
            });
        }
        , getMediaParams: function (skipQueries) {
            var self = this;
            var mode = $("[data-type=change-mode]").val();
            var state = Global.getQuery('state') ? Global.getQuery('state') : $("[name=state]").val();
            var catid = '';
            if (typeof skipQueries !== 'undefined' && skipQueries)
                state = $("[name=state]").val();
            if (mode === 'tree')
                catid = typeof self.cache.currentCategory !== "undefined" ? self.cache.currentCategory : $('#tree li[aria-selected="true"]').attr("id");
            var params = {
                q: $.trim($("[name=q]").val()),
                type: $("[name=type]").val(),
                offset: 0,
                count: self.defaultListLimit,
                categoryId: catid,
                state: state,
                startdate: Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00',
                enddate: Global.jalaliToGregorian($("[name=enddate]").val()) + 'T23:59:59'
            };
            return params;
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
//                this.initSortable(true);
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
        , createWorkspaceItem: function (e) {
            typeof e !== "undefined" && e.preventDefault();
            var self = this;
            var data = $("#new-item-form").serializeObject();
            data.cmd = 'create';
            data.sourceTable = 'workspace';
            data.destTable = 'workspace';
            var createNewsParams = {overrideUrl: 'nws'};
            new NewsroomModel(createNewsParams).save(null, {
                data: JSON.stringify([data])
                , contentType: 'application/json'
                , processData: false
                , success: function (newsItem) {
                    toastr.success('با موفقیت انجام شد', 'خبر جدید', Config.settings.toastr);
                    $("#new-item-modal").modal('hide');
                    var id = self.prepareItems(newsItem.toJSON(), createNewsParams)[0].id;
                    var data = {externalId: id, create: 1, type: 2};
                    var params = {overrideUrl: Config.api.shotlist + '/check'};
                    new NewsroomModel(params).fetch({
                        data: data
                        , success: function (item) {
                            items = self.prepareItems(item.toJSON(), params);
                            var shotlistId = Object.keys(items)[0];
                            self.id = shotlistId;
                            self.submit(undefined, shotlistId, true);
                        }
                    });
                }
            });
            return false;
        }
        , submit: function (e, id, reload) {
            typeof e !== "undefined" && e.preventDefault();
            var self = this;
            var id = (typeof id !== "undefined" && id) ? id : this.getId();
            if (id && id !== "editor") {
                // Timeline exists
                var data = this.timeline.exportTimeline();
                new MediaModel({overrideUrl: Config.api.shotlist, id: id}).save({key: 'timeline', value: JSON.stringify(data)}, {
                    patch: true
                    , error: function (e, data) {
                        toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                    }
                    , success: function (model, response) {
                        toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات', Config.settings.toastr);
                        if (typeof reload !== "undefined" && reload === true) {
                            window.setTimeout(function () {
                                !Backbone.History.started && Backbone.history.start({pushState: true});
                                new Backbone.Router().navigate('resources/editor/' + self.id, {trigger: true});
                            }, 500);
                        }
                    }
                });
            } else {
                // Timeline doesn't exists
                $("#new-item-modal").modal();
            }
        }
        , seekPlayer: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            this.player.seek($el.attr('data-seek'), this.playerInstance);
        }
        , openAddForm: function (e) {
            $("#media-filename").val('shotlist');
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
        , getId: function () {
            return self.id ? self.id : Backbone.history.getFragment().split("/").pop().split("?")[0];
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
        , loadMedia: function (e, extend) {
            if (typeof e !== "undefined")
                e.preventDefault();
            var params = this.getMediaParams();
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.loadMediaItems(params);
            return false;
        }
        , loadMediaItems: function (params) {
            var self = this;
            var params = (typeof params !== "undefined") ? params : self.getParams();
            var data = $.param(params);
            var model = new MediaModel(params);
            model.fetch({
                data: data
                , success: function (items) {
                    items = items.toJSON();
                    var template = Template.template.load('resources/media', 'media.items-condensed.partial');
                    var $container = $("#itemlist");
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
//                            self.afterRender(items, params);
                        });
                    });
                }
            });
        }
        , loadTimeline: function (id) {
            var self = this;
            var id = (typeof id === "undefined" || !id) ? id : this.getId();
            this.getTimeline(id, null, function (data) {
                self.timeline.loadTimeline(data.Data);
                self.loadExternalObjectInfo(data.ExternalObject, data.Type);
            });
        }
        , loadExternalObjectInfo: function (items, type) {
            var self = this;
            var tmpl = (type === 2) ? ['newsroom/workspace', 'workspace-clean.partial'] : ['resources/media', 'media.items-clean.partial'];
            var template = Template.template.load(tmpl[0], tmpl[1]);
            if (type === 2)
                items = [items];
            var $container = $('#item-info');
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({items: items});
                $container.html(output).promise().done(function () {
//                    self.afterRender();
                });
            });

        }
        , getTimeline: function (id, params, callback) {
            if (typeof id === "undefined")
                return false;
            var self = this;
            var params = (typeof params !== "undefined" && params) ? params : {overrideUrl: Config.api.shotlist, id: id};
            var model = new MediaModel(params);
            model.fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    typeof callback === 'function' && callback(items);
//                    var timelineData = items.Data;
//                    self.timeline.loadTimeline(timelineData);
                }
            });
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('resources/editor', 'editor');
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
        , offsetTime: function (datetime, offset) {
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
        , loadVideo: function (e) {
            if ($(e.target.parentElement).is("a") || $(e.target).is("a"))
                return true;
            e.preventDefault();
            var self = this;
//            $("#itemlist").find("tbody tr").removeClass('active');
//            $(e.target).parents("tr:first").addClass('active');
//            var url = self.getMedia($(e.target).parents("tr:first").find("img").attr('src'));
//            var url = "http://localhost:8008/assets/data/sample.mp4";
            var duration = $(e.target).parents("tr:first").data('duration');

            //TODO
            this.timeline.addMedia({
                id: $(e.target).parents("tr:first").attr('data-id')
                , duration: Global.processTime(duration)
                , title: $(e.target).parents("tr:first").find('.title').text()
                , img: $(e.target).parents("tr:first").find("img").attr('src')
                , video: self.getMedia($(e.target).parents("tr:first").find("img").attr('src'))
            });
        }
        , loadShotlist: function () {
            // Load Shot-list
            var $container = $("#shotlist");
            if (!$container.is(":empty"))
                return;
            var template = Template.template.load('resources/ingest', 'ingest.shotlist.partial');
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
//                    IngestHelper.mask('time');
                });
            });
        }
        , showProjectId: function(id) {
            $("#page-info").find('strong').html(id);
            $("#page-info").show(1);
        }
        , afterRender: function () {
            var self = this;
            self.attachDatepickers();

            // TODO: Test
            this.timeline = new Timeline('#timeline', {singleMode: false, repository: true, buttons: false, sidebar: true, titles: true});
            this.timeline.render();

            if (this.getId() && this.getId() !== "editor") {
                this.loadTimeline(this.getId());
                this.showProjectId(this.getId())
            }

            $("#tree").length && new Tree($("#tree"), Config.api.tree, this).render();
            $("#toolbar button[type=submit]").removeClass('hidden').addClass('in');
//            if (typeof this.flags.helperLoaded === "undefined") {
//                IngestHelper.init();
//                this.flags.helperLoaded = true;
//            } else
//                IngestHelper.init(true);
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
            toolbar.render(undefined, '<div id="page-info" class="alert alert-danger" style="display: none;"><h4><span>شناسه پروژه</span>&nbsp;&nbsp;<strong></strong></h4></div>');
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
            data[0].Shotlist = this.timeline.exportShots(undefined);
            $.each(data[0].Shotlist, function () {
                this.duration = this.shotDuration;
                delete this.shotDuration;
                delete this.mediaDuration;
            });
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
//            self.loadItemlist();
        }
    });
    return MediaEditorView;
});
