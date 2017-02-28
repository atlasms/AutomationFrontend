define(['jquery', 'underscore', 'backbone', 'config', 'jquery-ui', 'global', 'template', 'jwplayer'], function ($, _, Backbone, Config, ui, Global, Template, jwplayer) {
    window.Player = function ($el, options, callback) {
        window.jwplayer = jwplayer;
        jwplayer.key = "FpSeV03GyHGC79+qOqe8bhrJJqPFYSWXcNh/Yg==";
        this.defaults = {
            abouttext: Config.title
            , aboutlink: Config.siteUrl
            , width: "100%"
            , stretching: 'uniform'
            , controls: true
            , aspectratio: '16:9'
            , steps: 5 // Secnods used in forward and backwards seeking
            , autostart: false
//            , primary: 'flash'
            , analytics: {
                enabled: false,
                cookies: false
            }
            , template: {
                controlbar: 'auto' // [auto, fixed]
                , seekbar: {
                    current: true
                    , seeker: true
                    , duration: true
                }
                , controls: {
                    speed: true
                    , volume: true
                    , keys: true
                }
            }
        };
        this.$el = (typeof $el !== "undefined") ? $el : null;
        this.options = $.extend({}, this.defaults, options);
        if (this.options.playlist.length > 0) // Using playlist, thus adding VTT
            this.options.playlist[0].tracks = [{file: options.file.replace('_lq.mp4', '.vtt'), kind: "thumbnails"}];
        this.callback = (typeof callback !== "undefined") ? callback : null;

        this.instance = null;
        this.duration = 0;
        this.isPlaying = false;
        this.position = 0;
    };

    _.extend(Player.prototype, {
        render: function () {
            var $this = this;
            var container = this.getContainer(this.$el);
            if (!container)
                return false;

            var template = Template.template.load('shared', 'player');
            var $container = $('#' + container);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate($this.options);
                $container.html(output).promise().done(function () {
                    var instance = $this.instance = jwplayer('player').setup($this.options);
                    $this.instance.onReady(function () {
                        $this.setEvents();
                        $this.setUI($this, instance);
                    });
                });
            });
            return this;
        }
        , getContainer: function ($el) {
            if (!$el) {
                console.warn('No player container specified');
                return false;
            }
            if ($("#" + $el.replace("#", '')).legnth)
                return $el.replace("#", '');
            else {
                if ($($el).length) {
                    if (typeof $($el).attr("id") !== "undefined")
                        return $($el).attr("id");
                    else {
                        var tempId = 'player_' + this.randomIntFromInterval(1, 2048);
                        $($el).attr("id", tempId);
                        return tempId;
                    }
                } else {
                    console.warn('Faced problem while handling player container');
                    return false;
                }
            }
        }
        , getInstance: function (instance) {
            return instance = (typeof instance !== "undefined" && instance !== null) ? instance : this.instance;
        }
        , randomIntFromInterval: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        , remove: function (instance) {
            instance = this.getInstance(instance);
            instance.remove();
        }
        , seek: function (position, instance) {
            instance = this.getInstance(instance);
//            instance.seek((position * this.duration) / 100);
            instance.seek(position);
        }
        , setVolume: function (value, instance) {
            instance = this.getInstance(instance);
            instance.setVolume(value);
            return value;
        }
        , getPosition: function (instance) {
            instance = this.getInstance(instance);
            var playPosition = instance.getPosition();
            return playPosition;
        }
        , setUI: function ($this, instance) {
            if ($this.options.template.controlbar === "fixed")
                $('.jw-controlbar.jw-background-color.jw-reset:first').css({'display': 'block'});
            if ($this.options.template.controls.volume) {
                $("#volume .inner").slider({
                    value: $this.instance.getVolume()
                    , change: function (e, ui) {
                        instance.setVolume(ui.value);
                    }
                });
                $this.instance.onVolume(function () {
                    var volume = $this.instance.getVolume();
                    $("#volume .inner").slider('option', 'value', volume);
                });
            }
            if ($this.options.template.controls.speed) {
                $(document).on('click', "ul.speed li", function () {
                    if ($(this).hasClass('active'))
                        return;
                    $(this).parent().find('li').removeClass('active');
                    var speed = $(this).attr('data-value');
                    document.getElementsByTagName('video')[0].playbackRate = speed;
                    $(this).addClass('active');
                });
            }
            if ($this.options.template.seekbar.seeker) {
                $("#seekbar .seeker .inner:first").slider({
                    value: 0
                    , max: typeof $this.options.duration !== "undefined" ? $this.options.duration : $this.duration
                    , slide: function (e, ui) {
                        $this.seek(ui.value);
                    }
                });
            }
            if ($this.options.template.controls.keys) {
                $('a[data-type="controls"]').on('click', function (e) {
                    e.preventDefault();
                    var task = $(this).attr('data-task');
                    switch (task) {
                        case 'play-pause':
                            $this.play(null, $('[data-type="controls"][data-task="play-pause"]'));
                            break;
                        case 'forwards':
                            $this.forwards();
                            break;
                        case 'backwards':
                            $this.backwards();
                            break;
                        case 'clip-start':
                            $('[data-type="clip-start"]').length && $('[data-type="clip-start"]').val(Global.createTime($this.position));
                            break;
                        case 'clip-end':
                            $('[data-type="clip-end"]').length && $('[data-type="clip-end"]').val(Global.createTime($this.position));
                            break;
                    }
                });
            }
        }
        , setEvents: function (instance) {
            instance = this.getInstance(instance);
            var $this = this;
            // we don't have a duration yet, so start playing
//            if (this.duration === 0 && this.isPlaying === false)
//                instance.play();
            instance.onTime(function () {
                $this.duration = instance.getDuration();
                $this.position = $this.instance.getPosition();
                // Template handling
                $this.options.template.seekbar.duration && $("#seekbar .duration").text(Global.createTime($this.duration));
                $this.options.template.seekbar.current && $("#seekbar .current").text(Global.createTime($this.position));
                if ($this.options.template.seekbar.seeker) {
//                    window.setTimeout(function () {
                    // in percents
//                        $("#seekbar .seeker").find(".inner:first").slider('option', 'value', ($this.position * 100) / $this.duration);
                    $("#seekbar .seeker").find(".inner:first").slider('option', 'value', $this.position);
//                    }, 50);
                }
            });
            instance.onPlay(function () {
                $this.isPlaying = true;
                // For the sake of first time!
                $('[data-type="controls"][data-task="play-pause"]').attr('data-state', 'pause');
            });
            instance.onPause(function () {
                $this.isPlaying = false;
                $('[data-type="controls"][data-task="play-pause"]').attr('data-state', 'play');
            });
            instance.onComplete(function () {
                window.setTimeout(function () {
                    $('[data-type="controls"][data-task="play-pause"]').attr('data-state', 'play');
                    $("ul.speed li").removeClass('active');
                    $("ul.speed").find('li[data-value="1"]').addClass('active');
                    $("#seekbar .seeker .inner:first").slider('option', 'value', 0);
                }, 50);
            });
        }
        , play: function (instance, $key) {
            instance = this.getInstance(instance);
            instance.play();
            var $this = this;
            if (typeof $key !== "undefined") {
                window.setTimeout(function () {
                    if (!$this.isPlaying)
                        $key.attr('data-state', 'play');
                    else
                        $key.attr('data-state', 'pause');
                }, 50);
            }
        }
        , forwards: function (instance) {
            instance = this.getInstance(instance);
            var position = instance.getPosition();
            instance.seek(position + this.options.steps);
        }
        , backwards: function (instance) {
            instance = this.getInstance(instance);
            var position = instance.getPosition();
            instance.seek(position - this.options.steps);
        }
    });

    return Player;
});