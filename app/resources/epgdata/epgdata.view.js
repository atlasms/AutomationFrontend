define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.ingest.model', 'toastr', 'toolbar', 'statusbar', 'ingestHelper', 'jquery-ui', 'pdatepicker', 'tree.helper', 'flowplayer.helper', 'timeline.helper', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, Global, IngestModel, toastr, Toolbar, Statusbar, IngestHelper, ui, pDatepicker, Tree, FlowPlayer, Timeline) {
    var EPGDataView = Backbone.View.extend({
        playerInstance: null
        , player: null
        , $modal: "#metadata-form-modal"
        , $metadataPlace: "#metadata-place"
        , model: 'IngestModel'
        , defaultListLimit: Config.defalutMediaListLimit
        , toolbar: [
            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
            , {'button': {cssClass: 'btn blue-sharp', text: 'ثبت اطلاعات ', type: 'button', task: 'add'}}
        ]
        , statusbar: [
            {type: 'total-duration', text: 'مجموع زمان', cssClass: 'badge badge-info'}
        ]
        , timeline: {}
        , flags: {}
        , events: {
            'click [type=submit]': 'submit'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task=add]': 'openAddForm'
            , 'click [data-task=refresh]': 'loadStorageFiles'
            , 'click #storagefiles tbody tr': 'selectRow'
            , 'click [data-seek]': 'seekPlayer'
//            , 'click [data-task="add-clip"]': 'addClip'
//            , 'click [data-task="delete-shot"]': 'deleteShot'
//            , 'click .shotlist-table tbody tr': 'loadShot'
            , 'click [data-task="load-list"]': 'loadItemlist'
            , 'click #itemlist tbody tr': 'loadVideo'
            , 'focus .has-error input': function (e) {
                $(e.target).parents(".has-error:first").removeClass('has-error');
            }
        }
        , submit: function (e) {
            e.preventDefault();
            var self = this;
            var helper = new IngestHelper.validate();
            if (!helper.beforeSave())
                return;
            var data = this.prepareSave();
            new IngestModel({overrideUrl: Config.api.media}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات برنامه', Config.settings.toastr);
                    $(self.$modal).find("form").trigger('reset');
                    $(self.$modal).modal('hide');
                    $("#storagefiles tr.active").addClass('disabled').removeClass('active success');
                }
            });
        }
        , openAddForm: function (e) {
// TEMP 
            var path = '{tv}\\360p\\{date}\\*.ts';
            var date = Global.jalaliToGregorian($('.itemlist-filter [name="date"]').val()).replace(/\-/g, '\\');
            $("#media-filename").val(path.replace(/{tv}/g, $('.itemlist-filter [name="channel"]').val()).replace(/{date}/, date));
            $(this.$modal).modal('toggle');
        }
        , selectRow: function (e) {
            var $el = $(e.target);
            var $row = $el.parents("tr:first");
            if ($row.hasClass("disabled"))
                return false;

            var params = $row.data('params');
            params = typeof params === "object" ? params : JSON.parse(params);
            params.start = this.offsetTime(params.start, -300);
            params.end = this.offsetTime(params.end, 300);
            var url = 'http://172.16.16.69/archive/360p.m3u8?' + $.param(params);



//            $el.parents("tbody").find("tr").removeClass('active success');
//            $row.addClass('active success');
//            $row.find("[data-prop]").each(function () {
//                if ($('input[name="' + $(this).attr('data-prop') + '"]').length)
//                    $('input[name="' + $(this).attr('data-prop') + '"]').val($.trim($(this).text()));
//            });
//            $('button[data-task=add]').removeClass('disabled');
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
            var template = Template.template.load('resources/epgdata', 'epgdata');
            var $container = $(Config.positions.main);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate(Config);
                $container.html(output).promise().done(function () {
                    self.afterRender();
                });
            });
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
            e.preventDefault();
            var self = this;
            var $item = $(e.target).parents("tr:first");
            $("#itemlist").find("tbody tr").removeClass('active');
            $item.addClass('active');
            var params = $item.data('params');
            params = typeof params === "object" ? params : JSON.parse(params);
            params.start = self.offsetTime(params.start);
            params.end = self.offsetTime(params.end);
            var url = 'http://172.16.16.69/archive/360p.m3u8?' + $.param(params);
            var duration = $item.data('duration');
            var media = {
                url: url
//                url: '/assets/data/sample.mp4'
                , duration: Global.processTime(duration)
                , title: ''
                , img: ''
                , id: $item.data('id')
            };
//            console.log(media);
            self.timeline.loadMedia(media);
            self.loadItemShots(media.id, function (d) {
                self.timeline.mapThenAddShots(d, true);
            });
        }
        , loadItemShots: function(id, callback) {
            var self = this;
            var params = {overrideUrl: Config.api.shotlist, query: 'type=1&externalid=' + id};
            new IngestModel(params).fetch({
               success: function(d) {
                   if (typeof callback === "function")
                       callback(self.prepareItems(d.toJSON(), params));
               } 
            });
        }
        , renderPlayer: function (url, duration) {
            var self = this;
            if (self.playerInstance)
                self.player.remove();
            $('#player-container').empty();
            var playerConfig = {
                clip: {
                    sources: [
                        {type: "application/x-mpegurl", src: url}
                    ]
                }
                , template: {seekbar: {range: true}, controls: false}
                , duration: duration
            };
            var player = new Player('#player-container', playerConfig);
            player.render();
            self.player = player;
            self.playerInstance = player.instance;

            self.loadShotlist();
        }
        , loadItemlist: function (e) {
            typeof e !== "undefined" && e.preventDefault();
            var self = this;
            var params = $(".itemlist-filter").serializeObject();
            params.date = params.date.replace(/\-/g, '/');
            var template = Template.template.load('resources/ingest', 'ingest.ottitems.partial');
            var $container = $("#itemlist");
            var modelParams = {overrideUrl: 'share/ott/epgitems', offset: 0, count: self.defaultListLimit};
            new IngestModel(modelParams).fetch({
                data: $.param($.extend(true, {}, params, {offset: 0, count: self.defaultListLimit}))
                , success: function (items) {
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
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
            });
        }
        , afterRender: function () {
            var self = this;
//            return false;
            self.attachDatepickers();
            // TODO: Test
            this.timeline = new Timeline('#timeline', {
                repository: false, metadata: true, buttons: false, sidebar: true, ordering: false, sortable: false, type: 1
            });
            this.timeline.render();
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
            var itemStart = Global.processTime($("#itemlist tbody tr.active .start").text());
            var data = [];
            if ($list.length) {
                $list.each(function () {
                    data.push({
                        start: Global.processTime($(this).find("td").eq(0).text()) + itemStart
                        , end: Global.processTime($(this).find("td").eq(1).text()) + itemStart
                    });
                });
            }
            return data;
        }
        , prepareSave: function () {
            var data = [{}];
            console.log(this.getShotlistData());
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
//            this.handleStatusbar($("#shotlist table tbody"));
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
    return EPGDataView;
});
