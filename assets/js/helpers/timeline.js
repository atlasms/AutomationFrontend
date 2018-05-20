define(['jquery', 'underscore', 'backbone', 'config', 'jquery-ui', 'global', 'template', 'flowplayer.helper', 'shared.model', 'select2'
], function ($, _, Backbone, Config, ui, Global, Template, FlowPlayer, SharedModel, select2) {
    window.Timeline = function ($el, options, timeline, callback) {
        this.defaults = {
            repository: true
            , tags: false
            , buttons: true
        };
        this.$el = (typeof $el !== "undefined") ? $el : null;
        this.options = $.extend(true, {}, this.defaults, options);
        this.callback = (typeof callback !== "undefined" && callback !== null) ? callback : null;
        this.timeline = (typeof timeline !== "undefined" && timeline !== null) ? timeline : {items: [], shots: []};
        this.timeline['options'] = this.options;
        this.instance = null;

        // cache
        this.mediaList = [];
        this.currentMedia = {};
        this.tags = [];

        playerInstance = null;
        player = null;
    };

    _.extend(Timeline.prototype, {
        render: function () {
            var self = this;
            var template = Template.template.load('shared', 'timeline');
            // Render timeline plugin
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output;
                if (self.options.tags) {
                    self._loadTags(function (tags) {
                        output = handlebarsTemplate($.extend({}, self.timeline, {tags: tags}));
                        $(self.$el).html(output);
                        self._afterRender();
                    });
                } else {
                    output = handlebarsTemplate(self.timeline);
                    $(self.$el).html(output);
                    self._afterRender();
                }

            });
        }
        , _afterRender: function () {
            // load shots
            // load media(s)
            // Add event listeners
            this._registerEvents();
            // Initialize Sortables
            this.initSortable();
            this.renderPlayer(null, 0);
            if (this.options.tags)
                $('select[data-type="tags"]').select2({dir: "rtl", multiple: true, tags: false, placeholder: 'کلیدواژه‌ها'});
        }
        , _loadTags: function (callback) {
            var self = this;
            new SharedModel().fetch({
                success: function (items) {
                    self.tags = items.toJSON();
                    if (typeof callback === "function")
                        callback(self.tags);
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
                , template: {seekbar: {range: true}, controls: false}
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
            items = self.checkDuplicateMedia(items);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate(items);
                $container[method](output).promise().done(function () {

                });
            });
        }
        , checkDuplicateMedia: function (items) {
            var self = this;
            for (var i in items) {
                if (typeof self.mediaList[items[i]['id']] !== "undefined")
                    delete items[i];
                else
                    self.mediaList[items[i]['id']] = items[i];
            }
            return items;

        }
        , loadMedia: function (media) {
            // Load media to player
            var self = this;
            if (self.playerInstance)
                self.player.remove();
            $('#player-container').empty();
            var playerConfig = {
                clip: {
                    sources: [
                        {src: media.url, type: 'video/mp4'}
                    ]
                }
                , template: {seekbar: {range: true}, controls: false}
                , duration: media.duration
            };
            var player = new Player('#player-container', playerConfig);
            player.render();
            self.currentMedia = media;
            self.player = player;
            self.playerInstance = player.instance;
        }
        , _getMediaDetails: function () {
            // Get media description
        }
        , addShot: function (e) {
            // Add shot to shotlist
            e.preventDefault();
            var self = this;
            var $form = $("#shotlist form");
            var shotData = $form.serializeObject();
            if (shotData.start && shotData.end && Global.processTime(shotData.start) < Global.processTime(shotData.end)) {
                shotData['shotDuration'] = Global.processTime(shotData.end) - Global.processTime(shotData.start);
                if (this.options.tags) {
                    tags = $('[data-type="tags"]').val();
                    shotData['tags'] = [];
                    for (var t in tags)
                        shotData['tags'].push({id: tags[t], title: $('[data-type="tags"]').find('option[value=' + tags[t] + ']').text()});
                }
                var item = $.extend({}, self.currentMedia, shotData);
                var template = Template.template.load('shared', 'shotlist-item.partial');
                var $container = $("#shotlist table tbody");
                template.done(function (data) {
                    var handlebarsTemplate = Template.handlebars.compile(data);
                    var output = handlebarsTemplate(item);
                    $container.append(output).promise().done(function () {
                        self.initSortable(true);
                    });
                });
            }
        }
        , playShot: function (e) {
            // Get media file and play it showing the cuts
            e.preventDefault();
            var self = this;
            var $shot = $(e.target).is("tr") ? $(e.target) : $(e.target).parents('tr:first');
            var url = this._getMedia($shot.find("img").attr('src'));
            var duration = Global.processTime($shot.data('media-duration'));
            var start = Global.processTime($shot.find('[data-type="start"]').text());
            var end = Global.processTime($shot.find('[data-type="end"]').text());
            this.renderPlayer(url, duration, function (instance) {
                var params = [start, end];
                console.log(self.player, params, instance, self.playerInstance);
                self.player.setRange(params, undefined, true);
            });
        }
        , exportShots: function (e) {
            e.preventDefault();
            var $shots = $("#shotlist table tbody tr");
            var data = [];
            $shots.each(function () {
                data.push({
                    id: $(this).attr('data-id')
                    , start: Global.processTime($(this).find('[data-type="start"]').text())
                    , end: Global.processTime($(this).find('[data-type="end"]').text())
                    , duration: Global.processTime($(this).data('duration'))
                    , mediaDuration: Global.processTime($(this).data('media-duration'))
                    , img: $(this).find('img').attr('src')
                });
            });
            return data;
        }
        , deleteShot: function (e) {
            e.preventDefault();
            $shot = $(e.target).parents("tr:first");
            $shot.slideUp('fast', function () {
                $shot.remove();
            });
            this.initSortable(true);
        }
        , loadTimeline: function () {
            // Load Timeline from outside
            // Initialize Sortables - refresh
        }
        , exportTimeline: function (e) {
            e.preventDefault();
            var self = this;
            var $media = $("#timeline-repository tbody tr");
            var items = [];
            $media.each(function () {
                items.push({
                    id: $(this).attr('data-id')
                    , duration: Global.processTime($(this).attr('data-duration'))
                    , title: $(this).find('.title').text()
                    , img: $(this).find("img").attr('src')
                    , video: self._getMedia($(this).find("img").attr('src'))
                });
            });
            return {items: items, shots: self.exportShots(e)};
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
        , _getMedia: function (imageSrc) {
            return imageSrc.replace('.jpg', '_lq.mp4');
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
            $(document).off('click', '#timeline-repository tbody tr');
            $(document).on('click', '#timeline-repository tbody tr', function (e) {
                $('#timeline-repository tbody tr').removeClass('active');
                var $row = $(this).is("tr") ? $(this) : $(this).parents("tr:first");
                $row.addClass('active');
                self.loadMedia({
                    url: $row.data('url')
                    , duration: Global.processTime($row.data('duration'))
                    , title: $row.find('.title').text()
                    , img: $row.find('img').attr('src')
                    , id: $row.data('id')
                });
            });
            $(document).off('click', '[data-task="add-clip"]');
            $(document).on('click', '[data-task="add-clip"]', function (e) {
                self.addShot(e);
            });
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
            $(document).off('click', '#shotlist table tr');
            $(document).on('click', '#shotlist table tr', function (e) {
                e.stopPropagation();
                self.playShot(e);
            });
        }
    });

    return Timeline;
});