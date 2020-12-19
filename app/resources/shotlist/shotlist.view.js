define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.media.model', 'resources.mediaitem.model', 'shared.model', 'toastr', 'toolbar', 'statusbar', 'mediaitem-timeline.helper', 'ingestHelper', 'jquery-ui', 'pdatepicker', 'tree.helper', 'flowplayer.helper', 'bootstrap/modal', 'select2'
], function ($, _, Backbone, Template, Config, Global, MediaModel, MediaItemModel, SharedModel, toastr, Toolbar, Statusbar, Timeline, IngestHelper, ui, pDatepicker, Tree, FlowPlayer) {
    var ShotlistView = Backbone.View.extend({
        playerInstance: null
        , player: null
        , $modal: "#metadata-form-modal"
        , $metadataPlace: "#metadata-place"
        , model: 'MediaModel'
        , defaultListLimit: Config.defalutMediaListLimit
        , toolbar: [
            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
            , {'button': {cssClass: 'btn blue-sharp', text: 'جستجوی مدیا ', type: 'button', task: 'search', icon: 'fa fa-search'}}
        ]
        , statusbar: [
            {type: 'total-duration', text: 'مجموع زمان', cssClass: 'badge badge-info'}
        ]
        , flags: {}
        , cache: {}
        , cachedBasicData: {}
        , events: {
            'click [type=submit]': 'submit'
            , 'click [data-task=refresh-view]': 'reLoad'
            // , 'click [data-task=add]': 'openAddForm'
            , 'click [data-task="search"]': 'toggleSearchModal'
            , 'click [data-task=refresh]': 'reLoad'
            , 'click #storagefiles tbody tr': 'selectRow'
            , 'click [data-seek]': 'seekPlayer'
//            , 'click [data-task="add-clip"]': 'addClip'
//            , 'click [data-task="delete-shot"]': 'deleteShot'
//            , 'click .shotlist-table tbody tr': 'loadShot'
            , 'click [data-task="load-list"]': 'loadItemlist'
            , 'submit .itemlist-filter': 'loadItemlist'
            , 'click #itemlist tbody tr': 'loadVideo'

            , 'keyup #media-broadcast-date-search': 'searchInMediaList'
            , 'click .item-link': function (e) {
                e.stopPropagation();
            }
            , 'click [data-task="load-media"]': 'loadMediaItems'
            , 'click #media-modal table tbody tr': 'setMedia'
            , 'click .mini-item [data-task="toggle-collapse"]': 'collapseMediaItem'

            , 'focus .has-error input': function (e) {
                $(e.target).parents(".has-error:first").removeClass('has-error');
            }

            , 'submit #person-search-form': 'searchPersons'
            , 'click [data-task="search-persons"]': 'searchPersons'
            , 'click [data-task="select-person"]': 'selectPerson'
            , 'click [data-task="delete-person"]': 'deletePerson'
            // , 'click [data-task="submit-persons"]': 'submitPersons'
        }
        , timeline: {}
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
            data[0]['Data'] = JSON.stringify(this.timeline.exportTimeline());
            data[0]['Cmd'] = 'concat';
            new MediaModel().save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات برنامه', Config.settings.toastr);
                    $(self.$modal).find("form").trigger('reset');
                    $(self.$modal).modal('hide');
                    $("#storagefiles tr.active").addClass('disabled').removeClass('active success');
                }
                , error: function () {
                    toastr.error('انجام نشد', 'ذخیره اطلاعات برنامه', Config.settings.toastr);
                }
            });
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
        , toggleSearchModal: function (e) {
            $('#media-modal').modal('toggle');
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
            this.render();
        }
        , render: function (id) {
            var self = this;
            var template = Template.template.load('resources/shotlist', 'shotlist');
            var $container = $(Config.positions.main);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.afterRender();
                    var itemId = self.getId();
                    if (itemId) {
                        self.setMedia(null, itemId);
                        // TODO: Load shots
                    }
                });
            });

            // TODO: Test
            this.timeline = new Timeline('#timeline', {
                singleMode: true,
                repository: false,
                sidebar: true,
                buttons: false,
                localMode: true/*,
                callbacks: {
                    playShot: self.onShotOpened
                }*/
            });
            this.timeline.render();
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
            var modelParams = {offset: 0, count: self.defaultListLimit};
            new MediaModel(modelParams).fetch({
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
            this.attachDatepickers();
            this.handleSelect2Inputs();
            $("#tree").length && new Tree($("#tree"), Config.api.tree, this).render();
            $("#toolbar button[type=submit]").removeClass('hidden').addClass('in');
            this.getBasicData(true, function () {
                self.addShotlistEventListeners();
            });
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
        , handleTreeCalls: function (routes, path) {
            var self = this;
            var pathId = routes.pop().toString();
            var params = {overrideUrl: Config.api.media};
            $("[data-type=path]").length && $("[data-type=path]").val(path.toString());
            $("[data-type=path-id]").length && $("[data-type=path-id]").val(pathId.toString());
            this.cache.pathId = pathId.toString();
            this.cache.path = path.toString();
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
        }
        , handleSelect2Inputs: function () {
            $("select.select2").each(function () {
                var $select = $(this);
                if ($select.hasClass("select2-hidden-accessible"))
                    $select.select2('destroy');
                $select.select2({dir: "rtl", multiple: true, tags: false, width: '100%', dropdownParent: $('body')});
            });
        }

        , onShotOpened: function (metadata) {
            // Load shot's metadata form
            var self = this;
            var template = Template.template.load('resources/shotlist', 'shot-metadata.partial');
            var $container = $('#shot-metadata');
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var templateData = $.extend({}, self.cachedBasicData, {metadata: metadata});
                var output = handlebarsTemplate(templateData);
                $container.html(output).promise().done(function () {
                    self.loadPersonsList();
                    self.handleSelect2Inputs();
                });
            });
        }

        , getId: function () {
            var lastUrlPart = Backbone.history.getFragment().split("/").pop().split("?")[0];
            if (~~lastUrlPart > 0) {
                return lastUrlPart;
            }
            return null;
        }
        , getMediaParams: function () {
            var self = this;
            var mode = $("[data-type=change-mode]").val();
            var state = $("[name=state]").val();
            var catid = '';
            if (mode === 'tree') {
                catid = typeof self.cache.currentCategory !== "undefined" ? self.cache.currentCategory : $('#tree li[aria-selected="true"]').attr("id");
            }
            var params = {
                q: $.trim($("[name=q]").val()),
                type: $("[name=type]").val(),
                offset: 0,
                count: self.defaultListLimit,
                categoryId: catid,
                state: state,
                startdate: $("[name=media-search-startdate]").is('[disabled]')
                    ? '1970-01-01T00:00:00'
                    : Global.jalaliToGregorian($("[name=media-search-startdate]").val()) + 'T00:00:00',
                enddate: $("[name=media-search-enddate]").is('[disabled]')
                    ? Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD')) + 'T23:59:59'
                    : Global.jalaliToGregorian($("[name=media-search-enddate]").val()) + 'T23:59:59'
            };
            return params;
        }
        , loadMediaItems: function (e) {
            e.preventDefault();
            var params = (typeof params !== "undefined") ? params : this.getMediaParams();
            new MediaModel(params).fetch({
                data: $.param(params)
                , success: function (items) {
                    items = items.toJSON();
                    var template = Template.template.load('broadcast/schedule', 'media.items.partial');
                    var $container = $("#itemlist");
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output);
                    });
                }
            });
        }
        , loadMediaItem: function (id) {
            var self = this;
            new MediaItemModel({id: id}).fetch({
                success: function (data) {
                    var item = self.prepareItems(data.toJSON(), {id: id})[0];
                    var template = Template.template.load('resources/shotlist', 'mediaitem.partial');
                    self.cache.mediaItem = item;
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(item);
                        $('#item-details').html(output).promise().done(function () {
                            setTimeout(function () {
                                self.timeline.loadMedia({
                                    url: self.getMedia(item.Thumbnail)
                                    , duration: item.Duration
                                    , title: item.Title
                                    , img: item.Thumbnail
                                    , id: item.Id
                                });
                            }, 500);
                        });
                    });
                }
            })
        }
        , setMedia: function (e, id) {
            if (typeof id !== 'undefined') {
                this.loadMediaItem(id);
            } else {
                var $row = $(e.target).is('tr') ? $(e.target) : $(e.target).parents('tr:first');
                var id = $row.data('id');
                new Backbone.Router().navigate('/resources/shotlist/' + id, {trigger: false});
                this.loadMediaItem(id);
                this.toggleSearchModal();
            }
        }
        , collapseMediaItem: function (e) {
            e.preventDefault();
            $('.mini-item').toggleClass('collapsed')
        }

        , getBasicData: function (cache, callback) {
            var self = this;
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
                                    if (typeof cache !== "undefined" && cache) {
                                        self.cachedBasicData = params;
                                    }
                                    if (typeof callback === 'function') {
                                        callback();
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
        , addShotlistEventListeners: function () {
            var self = this;
            // $(document).on('shotSaved', function (e) {
            //
            //     // console.log(e.detail);
            // });
            $(document).on('shotPlayed', function (e) {
                self.onShotOpened(e.detail);
            });
        }
        , loadPersonsList: function (categoryId) {
            if (typeof categoryId === 'undefined' || categoryId <= 0) {
                categoryId = this.cache.mediaItem.MetaCategoryId;
            }
            var self = this;
            var params = {overrideUrl: Config.api.mediapersons + '/?type=2&externalid=' + categoryId};
            var model = new SharedModel(params);
            var $container = $('#persons-group');
            $container.empty();
            model.fetch({
                success: function (data) {
                    var items = self.prepareItems(data.toJSON(), params);
                    var template = Template.template.load('resources/mediaitem', 'persons.partial');
                    template.done(function (tmplData) {
                        var handlebarsTemplate = Template.handlebars.compile(tmplData);
                        var output = handlebarsTemplate({items: items, cols: false, placeholder: true});
                        $container.html(output).promise().done(function () {
                        });
                    });
                }
            });
        }
        , searchPersons: function (e) {
            e.preventDefault();
            var self = this;
            var data = $.param({q: $('#person-q').val(), type: $('[data-type="person-type"]').val()});
            var params = {overrideUrl: Config.api.persons};
            new SharedModel(params).fetch({
                data: data
                , success: function (items) {
                    var items = self.prepareItems(items.toJSON(), params);
                    var template = Template.template.load('resources/persons', 'person-results.partial');
                    var $container = $('#person-search-results');
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output);
                    });
                }
            });
        }
        , getPersonResultItemParams: function ($row) {
            return params = {
                id: $row.data('id')
                , name: $row.find('[data-type="name"]').text()
                , family: $row.find('[data-type="family"]').text()
                , type: $row.find('select').val()
            }
        }
        , selectPerson: function (e) {
            e.preventDefault();
            var params = this.getPersonResultItemParams($(e.target).parents('tr:first'));
            var foundDuplicate = false;
            $('#persons-table tbody tr').each(function () {
                if (~~$(this).attr('data-id') == ~~params.id)
                    foundDuplicate = true;
                if ($(this).hasClass('placeholder') && ~~$(this).attr('data-type') === ~~params.type)
                    $(this).hide();
            });
            if (foundDuplicate)
                return false;
            $clonedRow = $('#persons-table tfoot tr:first').clone();
            $clonedRow.attr('data-id', params.id);
            $clonedRow.find('[data-type="id"]').text(params.id);
            $clonedRow.find('[data-type="name"]').text(params.name);
            $clonedRow.find('[data-type="family"]').text(params.family);
            $clonedRow.find('select').val(params.type);
            $('#persons-table tbody').append($clonedRow);
        }
        , deletePerson: function (e) {
            e.preventDefault();
            var $row = $(e.target).parents('tr:first');
            bootbox.confirm({
                message: "مورد انتخابی حذف خواهد شد، مطمئن هستید؟"
                , buttons: {
                    confirm: {className: 'btn-success'}
                    , cancel: {className: 'btn-danger'}
                }
                , callback: function (results) {
                    if (results) {
                        $row.remove();
                    }
                }
            });
        }
        , submitPersons: function (id, callback) {
            // typeof e !== 'undefined' && e.preventDefault();
            var self = this;
            var items = [];
            $('#persons-table tbody tr').not('.placeholder').each(function () {
                // items.push({id: $(this).attr('data-id'), name: '', family: '', type: ''});
                items.push(~~$(this).attr('data-id'));
            });
            new SharedModel({overrideUrl: Config.api.mediapersons + '?type=1&externalid=' + id}).save(null, {
                data: JSON.stringify(items)
                , contentType: 'application/json'
                , processData: false
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
                , success: function (model, response) {
                    if (typeof callback === 'function')
                        callback();
                    toastr.success('با موفقیت انجام شد', 'ثبت اطلاعات عوامل', Config.settings.toastr);
//                    self.loadComments({query: 'externalid=' + data[0].externalid + '&kind=1', overrideUrl: Config.api.comments});
                }
            });
        }
    });
    return ShotlistView;
});
