define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.media.model', 'resources.mediaitem.model', 'shared.model', 'toastr', 'toolbar', 'statusbar', 'jquery-ui', 'pdatepicker', 'tree.helper', 'bootbox', 'flowplayer.helper', 'moment-with-locales', 'bootstrap/modal', 'select2', 'pdate'
], function ($, _, Backbone, Template, Config, Global, MediaModel, MediaItemModel, SharedModel, toastr, Toolbar, Statusbar, ui, pDatepicker, Tree, bootbox, FlowPlayer, moment) {
    moment.locale('en');
    var ShotlistView = Backbone.View.extend({
        playerInstance: null
        , player: null
        , shotlistTemplate: null
        , currentMedia: null
        , $modal: "#metadata-form-modal"
        , $metadataPlace: "#metadata-place"
        , model: 'MediaModel'
        , defaultListLimit: Config.defalutMediaListLimit
        , toolbar: [
            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
            // , {'button': {cssClass: 'btn btn-success', text: 'ذخیره شات‌لیست ', type: 'button', task: 'submit', icon: 'fa fa-save'}}
            , {'button': {cssClass: 'btn blue-sharp', text: 'انتخاب مدیا ', type: 'button', task: 'search', icon: 'fa fa-search'}}
        ]
        , statusbar: [
            // {type: 'total-duration', text: 'مجموع زمان', cssClass: 'badge badge-info'}
        ]
        , flags: {}
        , cache: {}
        , cachedBasicData: {}
        , events: {
            // 'click [data-task="submit"]': 'submit'
            'click [data-task="submit-shot"]': 'updateShot'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task=refresh]': 'reLoad'
            // , 'click [data-task=add]': 'openAddForm'
            , 'click [data-task="search"]': 'toggleSearchModal'
            // , 'click #storagefiles tbody tr': 'selectRow'
            , 'click [data-seek]': 'seekPlayer'
            , 'click [data-task="add-clip"]': 'addClip'
            , 'click [data-task="delete-shot"]': 'deleteShot'
            , 'click [data-task="load-list"]': 'loadItemlist'
            , 'submit .itemlist-filter': 'loadItemlist'
            , 'click #itemlist tbody tr': 'loadVideo'
            , 'click #shotlist-table tbody tr': 'loadShot'

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

        // shotlist methods
        , removeShotMetadataForm: function () {
            $('#shot-metadata').empty();
        }
        , showShotMetadataForm: function ($row) {
            // Load shot's metadata form
            var metadata = this.prepareShotMetadata($row);
            var self = this;
            var template = Template.template.load('resources/shotlist', 'shot-metadata.partial');
            var $container = $('#shot-metadata');
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var templateData = $.extend({}, self.cachedBasicData, {metadata: metadata});
                var output = handlebarsTemplate(templateData);
                $container.html(output).promise().done(function () {
                    self.loadPersonsList(null, metadata.Persons);
                    self.handleSelect2Inputs();
                });
            });
        }
        , prepareShotMetadata: function ($row) {
            if (typeof $row === 'undefined' || !$row) {
                return {};
            }
            // generate shot metadata object to use in form
            var start = Global.processTime($row.find('[data-type="start"]').text());
            var end = Global.processTime($row.find('[data-type="end"]').text());
            var json = typeof $row.attr('data-json') !== 'undefined' ? JSON.parse($row.attr('data-json')) : {};
            var data = {
                Start: start,
                End: end,
                Duration: end - start,
                Title: $row.find('.title').text(),
                Description: $row.attr('data-description'),
                ExternalId: ~~$row.attr('data-external-id'),
                Type: ~~$row.attr('data-type'),
                Id: ~~$row.attr('data-id'),
                Persons: [],
                Tags: [],
                Subjects: [],
                VideoType: typeof json.VideoType !== 'undefined' ? json.VideoType : null,
                EF1: typeof json.EF1 !== 'undefined' ? json.EF1 : null,
                EF2: typeof json.EF2 !== 'undefined' ? json.EF2 : null,
                EF3: typeof json.EF3 !== 'undefined' ? json.EF3 : null,
                EF4: typeof json.EF4 !== 'undefined' ? json.EF4 : null,
            };
            var metadataTypes = ['tags', 'subjects', 'persons'];
            for (var i in metadataTypes) {
                var values = [];
                var attr = $row.attr('data-' + metadataTypes[i]);
                if (typeof attr !== 'undefined' && attr && attr !== '') {
                    if (attr.indexOf(',') !== -1) {
                        values = attr.split(',');
                    } else {
                        values = [attr];
                    }
                }
                data[metadataTypes[i].capitalize()] = values;
            }
            return data;
        }
        , getShotMetadataFormValues: function () {
            var formData = $('.metadata-form').serializeObject();
            formData.Start = Global.processTime(formData.Start);
            formData.End = Global.processTime(formData.End);
            formData.Duration = Global.processTime(formData.Duration);
            formData.VideoType = ~~formData.VideoType;
            var metadataTypes = ['Tags', 'Subjects'];
            for (var i in metadataTypes) {
                var values = [];
                var meta = $('[name="' + metadataTypes[i] + '"]').val();
                if (typeof meta === 'string') {
                    values.push({id: meta});
                } else {
                    for (var g in meta) {
                        values.push({id: meta[g]});
                    }
                }
                formData[metadataTypes[i]] = values;
            }
            // Persons
            var $persons = $('#persons-table tbody tr');
            var persons = [];
            if ($persons.length) {
                $persons.each(function () {
                    persons.push({
                        id: $(this).attr('data-id'),
                        type: $(this).find('[data-type="type"] select').val(),
                        name: $(this).find('[data-type="name"]').text(),
                        family: $(this).find('[data-type="family"]').text()
                    });
                });
                formData.Persons = persons;
            }
            return formData;
        }
        , updateShot: function (e) {
            e.preventDefault();
            var self = this;
            var data = this.getShotMetadataFormValues();
            // Send PUT
            new MediaModel({overrideUrl: Config.api.shotlist, id: data.Id}).save(data, {
                success: function (model, response) {
                    toastr.success('عملیات با موفقیت انجام شد', 'به‌روزرسانی اطلاعات شات', Config.settings.toastr);
                    self.loadShotlist(self.currentMedia);
                    self.removeShotMetadataForm();
                }
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
            });
        }
        , loadShot: function (e) {
            var $row = $(e.target).is('tr') ? $(e.target) : $(e.target).parents("tr:first");
            var params = [
                Global.processTime($row.find('[data-type="start"]').text())
                , Global.processTime($row.find('[data-type="end"]').text())
            ];
            this.handleActiveRow($row);
            this.player.setRange(params, this.playerInstance, true);
            this.showShotMetadataForm($row);
        }
        , handleActiveRow: function($row) {
            $('#shotlist-table tbody tr').removeClass('active');
            $row.addClass('active');
        }
        , addClip: function (e) {
            var self = this;
            e.preventDefault();
            var data = [this.getInitialShotDataForSubmit()];
            new MediaModel({overrideUrl: Config.api.shotlist}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'ذخیره شات', Config.settings.toastr);
                    self.loadShotlist(self.currentMedia);
                    // reload shots
                }
                , error: function () {
                    toastr.error('با خطا مواجه شد', 'ذخیره شات', Config.settings.toastr);
                }
            });
        }
        , deleteShot: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var $row = $(e.target).parents("tr:first");
            var $table = $row.parents('tbody');
            bootbox.confirm({
                message: "مورد انتخابی حذف خواهد شد، مطمئن هستید؟"
                , buttons: {
                    confirm: {className: 'btn-success'}
                    , cancel: {className: 'btn-danger'}
                }
                , callback: function (results) {
                    if (results) {
                        var modelParams = {query: 'type=2&externalid=' + media.Id.toString(), overrideUrl: Config.api.shotlist};
                        new MediaItemModel(modelParams).destroy({
                            success: function () {
                                $row.remove();
                                this.handleDurations($table);
                            }
                        });
                    }
                }
            });
        }
        , getInitialShotDataForSubmit: function () {
            var data = $('.shotlist-form').serializeObject();
            if (data.Start && data.End && Global.processTime(data.Start) < Global.processTime(data.End)) {
                data.Start = Global.processTime(data.Start);
                data.End = Global.processTime(data.End);
                data.Duration = data.End - data.Start;
                data.ExternalId = this.getId();
                data.Type = 2;
                return data;
            }
        }
        , loadShotlist: function (media) {
            var self = this;
            var $container = $('#shotlist-container');
            if (this.shotlistTemplate) {
                this.getShotlistOfMedia(media, function (shots) {
                    media.ShotList = shots;
                    var output = self.shotlistTemplate(media);
                    $container.html(output);
                });
            } else {
                var template = Template.template.load('resources/shotlist', 'shotlist-items.partial');
                template.done(function (data) {
                    var handlebarsTemplate = self.shotlistTemplate = Template.handlebars.compile(data);
                    self.getShotlistOfMedia(media, function (shots) {
                        media.ShotList = shots;
                        var output = handlebarsTemplate(media);
                        $container.html(output);
                    });
                });
            }
        }
        , getShotlistOfMedia: function (media, callback) {
            var self = this;
            var modelParams = {query: 'type=2&externalid=' + media.Id.toString(), overrideUrl: Config.api.shotlist};
            new MediaItemModel(modelParams).fetch({
                success: function (data) {
                    var shots = self.prepareItems(data.toJSON(), modelParams);
                    var output = [];
                    for (var prop of Object.keys(shots)) {
                        output.push(shots[prop]);
                    }
                    if (typeof callback === 'function') {
                        callback(output)
                    }
                }
            });
        }

        // view methods
        , load: function (e, extend) {
            this.render();
        }
        , render: function () {
            var self = this;
            this.getBasicData(true, function () {
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
                        }
                    });
                });
            });
        }
        , reLoad: function () {
            this.load();
        }
        , afterRender: function () {
            this.removeShotMetadataForm();
            this.attachDatepickers();
            this.handleSelect2Inputs();
            $("#tree").length && new Tree($("#tree"), Config.api.tree, this).render();
            $("#toolbar button[type=submit]").removeClass('hidden').addClass('in');
            this.renderStatusbar();
        }

        // helper methods
        , seekPlayer: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            this.player.seek($el.attr('data-seek'), this.playerInstance);
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
            var data = this.timeline.exportShots(undefined);
            $.each(data, function () {
                // this.duration = this.shotDuration;
                delete this.shotDuration;
                delete this.mediaDuration;
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

        // media related methods
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
                    ? moment(SERVERDATE).format('YYYY-MM-DD') + 'T23:59:59'
                    : Global.jalaliToGregorian($("[name=media-search-enddate]").val()) + 'T23:59:59'
            };
            return params;
        }
        , getMedia: function (imageSrc) {
            return imageSrc.replace('.jpg', '_lq.mp4');
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
                        self.currentMedia = item;
                        $('#media-container').html(output).promise().done(function () {
                            self.renderPlayer(item);
                            self.loadShotlist(item);
                            self.removeShotMetadataForm();
                            self.showShotMetadataForm(null);
                        });
                    });
                }
            })
        }
        , renderPlayer: function (item) {
            var self = this;
            if (self.playerInstance)
                self.player.remove();
            $('#player-container').empty();
            var playerConfig = {
                clip: {
                    sources: [
                        {src: item.Thumbnail.replace('.jpg', '_lq.mp4'), type: 'video/mp4'}
                    ]
                }
                , template: {seekbar: {range: true}, controls: {keys: true}}
                , duration: item.Duration
            };
            var player = new Player('#player-container', playerConfig);
            self.player = player;
            self.playerInstance = player.instance;

            player.render(function (data) {
                if (typeof callback === "function") {
                    callback(data);
                }
            });
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
        , toggleSearchModal: function (e) {
            $('#media-modal').modal('toggle');
        }

        // Basic shared data
        , getBasicData: function (cache, callback) {
            var self = this;
            var params = {tags: [], subjects: [], persons: []};
            var modelParams = {overrideUrl: ''};
            new SharedModel().fetch({
                success: function (tags) {
                    params.tags = Global.objectListToArray(self.prepareItems(tags.toJSON(), modelParams));
                    new SharedModel({overrideUrl: 'share/persons'}).fetch({
                        success: function (persons) {
                            params.persons = Global.objectListToArray(self.prepareItems(persons.toJSON(), modelParams));
                            new SharedModel({overrideUrl: 'share/subjects'}).fetch({
                                success: function (subjects) {
                                    params.subjects = Global.objectListToArray(self.prepareItems(subjects.toJSON(), modelParams));
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
        , loadPersonsList: function (categoryId, selectedPersons) {
            var self = this;
            if (typeof selectedPersons !== 'undefined') {
                // if (typeof selectedPersons !== 'undefined' && selectedPersons.filter(Boolean).length) {
                var items = this.createPersonsListFromExistingIds(selectedPersons);
                this.renderPersonsForm(items);
            } else {
                if (typeof categoryId === 'undefined' || categoryId <= 0) {
                    categoryId = this.cache.mediaItem.MetaCategoryId;
                }
                var params = {overrideUrl: Config.api.mediapersons + '/?type=2&externalid=' + categoryId};
                var model = new SharedModel(params);
                model.fetch({
                    success: function (data) {
                        var items = self.prepareItems(data.toJSON(), params);
                        self.renderPersonsForm(items);
                    }
                });
            }
        }
        , renderPersonsForm: function (items, callback) {
            var $container = $('#persons-group');
            $container.empty();
            var template = Template.template.load('resources/mediaitem', 'persons.partial');
            template.done(function (tmplData) {
                var handlebarsTemplate = Template.handlebars.compile(tmplData);
                var output = handlebarsTemplate({items: items, cols: false, placeholder: true});
                $container.html(output).promise().done(function () {
                    if (typeof callback === 'function')
                        callback();
                });
            });
        }
        , createPersonsListFromExistingIds: function (items) {
            var list = [];
            for (var item of items) {
                if (item.length) {
                    $.each(this.cachedBasicData.persons, function () {
                        if (~~~this.id === ~~~item) {
                            list.push(this);
                        }
                    })
                }
            }
            return list;
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
