define(['jquery', 'underscore', 'backbone', 'config', 'jquery-ui', 'global', 'template', 'flowplayer.helper', 'shared.model', 'select2', 'toastr'
], function ($, _, Backbone, Config, ui, Global, Template, FlowPlayer, SharedModel, select2, toastr) {
    window.MediaItemTimeline = function ($el, options, timeline, callback) {
        this.defaults = {
            repository: true
            , metadata: false
            , buttons: true
            , ordering: true
            , sortable: true
            , autoLoad: false
            , sidebar: false
            , singleMode: true
            , type: 0
            , titles: false
            , localMode: false
            , callbacks: {
                playShot: null,
            }
        };
        this.$el = (typeof $el !== 'undefined') ? $el : null;
        this.options = $.extend(true, {}, this.defaults, options);
        this.callback = (typeof callback !== 'undefined' && callback !== null) ? callback : null;
        this.timeline = (typeof timeline !== 'undefined' && timeline !== null) ? timeline : [];
        this.timeline['options'] = this.options;
        this.instance = null;

        // cache
        this.mediaList = [];
        this.currentMedia = {};
        this.metadata = {tags: [], persons: [], subjects: []};

        this.shotModel = {
            Type: '', // 0: Media, 1: EPG
            Start: '', End: '', Duration: '', ExternalId: '', Data: '', Tags: '', Persons: '', Subjects: ''
        };

        playerInstance = null;
        player = null;
    };

    _.extend(MediaItemTimeline.prototype, {
        render: function (timeline) {
            if (this.options.autoLoad && typeof timeline === "undefined") {
                this.loadTimeline();
                return false;
            }
            var timeline = typeof timeline !== "undefined" ? timeline : this.timeline;
            var self = this;
            var template = Template.template.load('shared', 'mediaitem-timeline');
            // Render timeline plugin
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output;
                if (self.options.metadata) {
                    self._loadMetadata(function (params) {
                        output = handlebarsTemplate($.extend({}, timeline, params));
                        $(self.$el).html(output);
                        self._afterRender(timeline);
                    });
                } else {
                    output = handlebarsTemplate(timeline);
                    $(self.$el).html(output);
                    self._afterRender(timeline);
                }
            });
        }
        , renderPlayer: function (url, duration, callback) {
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
                , template: {seekbar: {range: true}, controls: {keys: true}}
                , duration: duration
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
        , addMedia: function (data, clean) {
            // Add media to timeline repository
            var self = this;
            var items = (data.constructor !== Array) ? [data] : data;
            var method = (typeof clean !== "undefined" && clean === true) ? 'html' : 'append';
            var template = Template.template.load('resources/media', 'media.item-condensed.partial');
            var $container = $("#timeline-repository tbody");
            // items = self.checkDuplicateMedia(items);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate(items);
                $container[method](output).promise().done(function () {

                });
            });
        }
        , clearForm: function () {
            $('[name="start"], [name="end"]').val('');
            $('[data-type="metadata"]').find('option:selected').prop('selected', false);
            $('[data-type="metadata"]').trigger('change');
        }
        , clearShots: function () {
            $("#shotlist-table tr").remove();
        }
        , loadMedia: function (media) {
            // Load media to player
            var self = this;
            if (self.playerInstance)
                self.player.remove();
            $('#player-container').empty();
            var type = 'video/mp4';
            var playerConfig = {
                clip: {
                    sources: [
                        {src: media.url, type: type}
                    ]
                }
                , template: {seekbar: {range: true}, controls: false}
                , duration: media.duration
            };
            // console.log(playerConfig);
            var player = new Player('#player-container', playerConfig);
            player.render();
            self.currentMedia = media;
            self.player = player;
            self.playerInstance = player.instance;

            // this.clearForm();
        }
        , _perpareInitialShots: function (shots) {
            console.log(this);
            console.log(JSON.stringify(this.currentMedia));
            var self = this;
            var output = [];
            for (var key in shots) {
                var item = $.extend({}, shots[key], {
                    start: ~~shots[key].Start,
                    end: ~~shots[key].End,
                    shotDuration: shots[key].Duration,
                    mediaDuration: self.currentMedia.Duration,
                    img: self.currentMedia.img,
                    externalId: shots[key].ExternalId,
                });
                console.log(item);
                output.push(item);
            }
            return output;
        }
        , addShot: function (e, shots, initial) {
            // Add shot to shotlist
            typeof e !== "undefined" && e && e.preventDefault();
            var self = this;
            var initial = typeof initial !== "undefined" ? initial : false;
            var item = typeof shots !== "undefined" ? shots : this._getShotData();
            if (typeof item === "undefined" || !item) {
                toastr.error('اطلاعات صحیح نیست!', 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                return false;
            }
            if (typeof item.shots !== "undefined" && item.shots.constructor === Array) {
                if (item.shots.length > 1 && initial) {
                    item.shots = this._perpareInitialShots(item.shots);
                }
                var template = Template.template.load('shared', 'shotlist-media-item.partial');
                var $container = $("#shotlist-table tbody");
                if ($.trim($container.html()) === '') {
                    initial = true;
                }
                template.done(function (data) {
                    var handlebarsTemplate = Template.handlebars.compile(data);
                    var output = handlebarsTemplate(item);
                    if (initial) {
                        self.clearShots();
                    }
                    $container.append(output).promise().done(function () {
                        if (self.options.singleMode && !initial) {
                            if (!self.options.localMode) {
                                self.saveShot(item, $container.find('> tr:last'));
                            }
                        }
                        if (self.options.sortable) {
                            self.initSortable(true);
                        }
                        window.setTimeout(function () {
                            // $("#shotlist-table tbody tr:last").trigger('click');
                            $("#shotlist-table tbody tr:last")[0].click();
                        }, 500);
                        self.updateTotalDuration();
                    });
                });
            }
        }
        , saveShot: function (data, $shot) {
            var item = this._prepareShotData(data.shots[0]);
            new SharedModel({overrideUrl: 'shotlist'}).save(null, {
                data: JSON.stringify(item)
                , contentType: 'application/json'
                , processData: false
                , success: function (d) {
                    $shot.attr('data-id', d.toJSON()[0].Id);
                    toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
            });
        }
        , playShot: function (e) {
            // Get media file and play it showing the cuts
            e.preventDefault();
            var self = this;
            var $shot = $(e.target).is("tr") ? $(e.target) : $(e.target).parents('tr:first');
            var mediaDuration = Global.processTime($shot.data('media-duration'));
            var duration = Global.processTime($shot.data('duration'));
            var start = Global.processTime($shot.find('[data-type="start"]').text());
            var end = Global.processTime($shot.find('[data-type="end"]').text());
            var metadata = this._getShotMetadata($shot);
            this._getMedia($shot, ~~$shot.data('type'), function (url) {
                self.renderPlayer(url, mediaDuration, function (instance) {
                    self.player.setRange([start, end], undefined, true);
                    if (self.options.metadata) {
                        self.setMetadata(metadata);
                    }
                    var shotParams = {
                        itemId: $shot.data('external-id'),
                        duration: duration,
                        mediaDuration: mediaDuration,
                        start: start,
                        end: end,
                        tags: metadata.tags,
                        persons: metadata.persons,
                        subjects: metadata.subjects,
                        title: metadata.title
                    };
                    if (typeof self.options.callbacks.playShot === 'function') {
                        self.options.callbacks.playShot(shotParams);
                    }
                    var event = new CustomEvent('shotPlayed', {detail: shotParams});
                    document.dispatchEvent(event);
                });
            });
        }
        , setMetadata: function (metadata) {
            this.clearForm();
            var field = metadata.type.charAt(0).toUpperCase() + metadata.type.slice(1);
            $.each(metadata[metadata.type], function () {
                $('[name="' + field + '"] option[value="' + this + '"]').prop('selected', true);
            });
            $('[name="' + field + '"]').trigger('change');
            $('[name="metadataType"][value="' + metadata.type + '"]').trigger('click');
        }
        , exportShots: function (e) {
            typeof e !== 'undefined' && e.preventDefault();
            var $shots = $('#shotlist-table tbody tr');
            var self = this;
            var data = [];
            $shots.each(function () {
                var $shot = $(this);
                var item = {
                    externalId: $shot.attr('data-external-id')
                    , start: Global.processTime($shot.find('[data-type="start"]').text())
                    , end: Global.processTime($shot.find('[data-type="end"]').text())
                    , img: $shot.find('img').attr('src')
                    , title: $shot.find('.title').text()

                    , shotDuration: Global.processTime($(this).data('duration'))
                    , mediaDuration: Global.processTime($(this).data('media-duration'))
                };
                var metadata = self._getShotMetadata($shot);
                data.push(self._prepareShotData($.extend({}, item, metadata)));
            });
            return data;
        }
        , deleteShot: function (e) {
            e.preventDefault();
            var self = this;
            $shot = $(e.target).parents('tr:first');
            $shot.slideUp('fast', function () {
                $shot.remove().promise().done(function () {
                    if (self.options.sortable)
                        self.initSortable(true);
                    self.updateTotalDuration();
                });
            });
        }
        , updateTotalDuration: function () {
            if ($('#status-items .total-duration').length) {
                var total = 0;
                $('#shotlist-table tr').each(function () {
                    total += Global.processTime($(this).data('duration'));
                });
                $('#status-items .total-duration').find('.badge').html(Global.createTime2(total));
            }
        }
        , loadTimeline: function (data) {
//            if (!this.options.autoLoad)
//                return false;
            // Load Timeline from service api, etc.
            // TODO: Demo!
            // var data = (typeof data !== 'undefined') ? data : demoData;
            var timeline = JSON.parse(data.replace(/[\u0000-\u0019]+/g, ''));
            // timeline.items.forEach(function (item) {
            //     item.video = item.img.replace('.jpg', '_lq.mp4');
            // });
            timeline['options'] = this.options;
            this.render(timeline);
        }
        , exportTimeline: function (e) {
            typeof e !== 'undefined' && e.preventDefault();
            var self = this;
            var $media = $('#timeline-repository tbody tr');
            // var items = [];
            // $media.each(function () {
            //     items.push({
            //         id: $(this).attr('data-id')
            //         , duration: Global.processTime($(this).attr('data-duration'))
            //         , title: $(this).find('.title').text()
            //         , img: $(this).find('img').attr('src')
            //         , video: self._getMedia($(this).find('img').attr('src'))
            //     });
            // });
            return {shots: self.exportShots(e)};
        }
        , initSortable: function (refresh) {
            var refresh = (typeof refresh !== 'undefined') ? refresh : false;
            try {
                $('#shotlist-table tbody').sortable('refresh');
            } catch (e) {
                $('#shotlist-table tbody').sortable({
                    items: 'tr'
                    , cancel: 'a, button'
                    , axis: 'y'
                    , forcePlaceholderSize: true
                    , placeholder: '.sort-placeholder'
                    , containment: 'parent'
                });
            }
        }
        , play: function (e) {
            e.preventDefault();
        }

        , _reorderShots: function (e) {
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
        , _getMedia: function ($shot, type, callback) {
            switch (type) {
                case 0:
                    if (typeof callback === 'function')
                        callback($shot.find('img').attr('src').replace('.jpg', '_lq.mp4'));
                    break;
                case 1:
                    new SharedModel({overrideUrl: Config.api.shotlist, id: $shot.data('id')}).fetch({
                        success: function (data) {
                            if (typeof callback === 'function')
                                callback(Global.getEPGMedia(data.toJSON().ExternalObject));
//                                callback('/assets/data/sample.mp4');
                        }
                    });
                    break;
            }
        }
        , _prepareItems: function (items, params) {
            if (typeof items.query !== 'undefined')
                delete items.query;
            if (typeof params !== 'undefined') {
                for (var prop in params) {
                    delete items[prop];
                }
            }
            return items;
        }
        , _registerEvents: function () {
            var self = this;
            $(document).off('click', '[data-task="export-shots"]');
            $(document).on('click', '[data-task="export-shots"]', function (e) {
                var shots = self.exportShots(e);
                // TODO
                console.log(shots, JSON.stringify(shots));
            });
            $(document).off('click', '[data-task="export-timeline"]');
            $(document).on('click', '[data-task="export-timeline"]', function (e) {
                var timeline = self.exportTimeline(e);
                // TODO
                console.log(timeline, JSON.stringify(timeline));
            });
            // $(document).off('click', '[data-task="add-clip"]');
            // $(document).on('click', '[data-task="add-clip"]', function (e) {
            //     self.addShot(e);
            // });
            $(document).off('click', '[data-task="reorder"]');
            $(document).on('click', '[data-task="reorder"]', function (e) {
                e.stopPropagation();
                self._reorderShots(e);
            });
            $(document).off('click', '[data-task="delete-shot"]');
            $(document).on('click', '[data-task="delete-shot"]', function (e) {
                e.stopPropagation();
                self.deleteShot(e);
            });
            $(document).off('click', '#shotlist-table tbody tr');
            $(document).on('click', '#shotlist-table tbody tr', function (e) {
                e.stopPropagation();
                var $rows = $('#shotlist-table tbody tr');
                var $currentRow = $(e.target).is('tr') ? $(e.target) : $(e.target).parents('tr:first');
                $rows.removeClass('active');
                $currentRow.addClass('active');
                self.playShot(e);
            });
            $(document).off('change', 'input[name="type"]');
            $(document).on('change', 'input[name="metadataType"]', function (e) {
                $('[data-type="metadata"]').prop('disabled', true);
                $('[data-type="metadata"][name="' + $(this).val().charAt(0).toUpperCase() + $(this).val().slice(1) + '"]').prop("disabled", false);
            });
        }
        , _getShotMetadata: function ($shot) {
            var metadata = {tags: [], persons: [], subjects: [], title: ''};
            var types = ['tags', 'persons', 'subjects'];
            for (var i in types) {
                var data = [];
                var attr = $shot.attr('data-' + types[i]);
                if (typeof attr !== 'undefined' && attr && attr !== '') {
                    if (attr.indexOf(',') !== -1) {
                        data = attr.split(',');
                    } else {
                        data = [attr];
                    }
                }
                metadata[types[i]] = data;
            }
            metadata.title = $shot.attr('data-title');
            return metadata;
        }
        , _prepareShotData: function (shot) {
            var data = $.extend({}, this.shotModel);
            data.Start = shot.start;
            data.End = shot.end;
            data.Duration = shot.shotDuration;
            data.Type = this.options.type;
            data.Title = shot.title;
            data.ExternalId = shot.externalId;
            data.Tags = [];
            data.Persons = [];
            data.Subjects = [];
            if (typeof shot.tags !== "undefined" && shot.tags.length) {
                for (var t in shot.tags) {
                    data.Tags.push({id: ~~shot.tags[t]});
                }
            }
            if (typeof shot.persons !== "undefined" && shot.persons.length) {
                for (var p in shot.persons) {
                    data.Persons.push({id: ~~shot.persons[p]});
                }
            }
            if (typeof shot.subjects !== "undefined" && shot.subjects.length) {
                for (var s in shot.subjects) {
                    data.Subjects.push({id: ~~shot.subjects[s]});
                }
            }
            return data;
        }
        , _resolveMetadata: function (data) {
            switch (data.metadataType) {
                case 'tags':
                    if (!$('[name="Tags"]').val().length)
                        return null;
                    var tags = $('[name="Tags"]').val();
                    data['Tags'] = [];
                    for (var t in tags)
                        data['Tags'].push({id: tags[t], title: $('[name="Tags"]').find('option[value=' + tags[t] + ']').text()});
                    break;
                case 'persons':
                    if (!$('[name="Persons"]').val().length)
                        return null;
                    var persons = $('[name="Persons"]').val();
                    data['Persons'] = [];
                    for (var p in persons)
                        data['Persons'].push({id: persons[p], title: $('[name="Persons"]').find('option[value=' + persons[p] + ']').text()});
                    break;
                case 'subjects':
                    if (!$('[name="Subjects"]').val().length)
                        return null;
                    var subjects = $('[name="Subjects"]').val();
                    data['Subjects'] = [];
                    for (var s in subjects)
                        data['Subjects'].push({id: subjects[s], title: $('[name="Subjects"]').find('option[value=' + subjects[s] + ']').text()});
                    break;
            }
            return data;
        }
        , _getShotData: function () {
            var self = this;
            var $form = $(".shotlist-form");
            var shotData = $form.serializeObject();
            if (shotData.start && shotData.end && Global.processTime(shotData.start) < Global.processTime(shotData.end)) {
                shotData['shotDuration'] = Global.processTime(shotData.end) - Global.processTime(shotData.start);
                shotData['start'] = Global.processTime(shotData.start);
                shotData['end'] = Global.processTime(shotData.end);
                // Handling metadata
                if (this.options.metadata) {
                    shotData = self._resolveMetadata(shotData);
                    if (!shotData) {
                        toastr.error('اطلاعات صحیح نیست!', 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                        return false;
                    }
                }
                var item = $.extend({}, self.currentMedia, shotData);
                // Refactoring
                item['externalId'] = item.id;
                item['id'] = '';
                item['mediaDuration'] = item.duration;
                delete item.duration;
                return {shots: [item], options: self.options};
            }
            return null;
        }
        , _getMediaDetails: function () {
            // Get media description
        }
        , _afterRender: function (timeline) {
            // load shots
            if (timeline.media) {
                this.loadMedia(timeline.media);
            }
            if (timeline.shots.length)
                this.addShot(null, timeline, true);
            // // load media(s)
            // if (timeline.items.length)
            //     this.addMedia(timeline.items);
            // Add event listeners
            this._registerEvents();
            // Initialize Sortables
            if (this.options.sortable)
                this.initSortable();
            this.renderPlayer(null, 0);
            if (this.options.metadata)
                $('select[data-type="metadata"]').select2({dir: "rtl", multiple: true, tags: false});
        }
        , _loadMetadata: function (callback) {
            var self = this;
            new SharedModel().fetch({
                success: function (tags) {
                    self.metadata.tags = tags.toJSON();
                    new SharedModel({overrideUrl: 'share/persons'}).fetch({
                        success: function (persons) {
                            self.metadata.persons = self._prepareItems(persons.toJSON(), {overrideUrl: 'share/persons'});
                            new SharedModel({overrideUrl: 'share/subjects'}).fetch({
                                success: function (subjects) {
                                    self.metadata.subjects = self._prepareItems(subjects.toJSON(), {overrideUrl: 'share/subjects'});
                                    if (typeof callback === "function")
                                        callback(self.metadata);
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    return MediaItemTimeline;
});
