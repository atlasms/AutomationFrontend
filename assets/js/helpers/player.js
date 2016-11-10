define(['jquery', 'underscore', 'backbone', 'config', 'global', 'template', 'jwplayer'], function ($, _, Backbone, Config, Global, Template, jwplayer) {
    window.Player = function ($el, options, callback) {
        this.defaults = {
            abouttext: Config.title
            , aboutlink: Config.siteUrl
            , width: "100%"
            , stretching: 'uniform'
            , controls: false
            , aspectratio: '16:9'
            , steps: 5 // Secnods used in forward and backwards seeking
//            , autostart: true
//            , primary: 'flash'
        };
        this.$el = (typeof $el !== "undefined") ? $el : null;
        this.options = $.extend({}, this.defaults, options);
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
                        if ($this.callback) {
                            $this.callback(instance, 'initElements');
                        }
                        $this.setEvents();
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
            return instance = (typeof instance !== "undefined") ? instance : this.instance;
        }
        , randomIntFromInterval: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        , remove: function(instance) {
            instance = this.getInstance(instance);
            instance.remove();
        }
        , seek: function (position, instance) {
            instance = this.getInstance(instance);
            instance.seek((position * this.duration) / 100);
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
        , setEvents: function (instance) {
            instance = this.getInstance(instance);
            var $this = this;
            // we don't have a duration yet, so start playing
            if (this.duration === 0 && this.isPlaying === false)
                instance.play();
            instance.onTime(function () {
                $this.duration = instance.getDuration();
                $this.position = $this.instance.getPosition();
                if ($this.callback) {
                    $this.callback(instance, 'setDuration', $this.duration);
                    $this.callback(instance, 'setPosition', $this.position);
                    window.setTimeout(function () {
                        // in percents
                        $this.callback(instance, 'setSeekbar', ($this.position * 100) / $this.duration);
                    }, 50);
                }
            });
            instance.onPlay(function () {
                $this.isPlaying = true;
                // For the sake of first time!
                $('[data-type="controls"][data-task="play-pause"]').attr('data-state', 'pause');
            });
            instance.onPause(function () {
                $this.isPlaying = false;
            });
            instance.onComplete(function () {
                $this.callback && window.setTimeout(function () {
                    $('[data-type="controls"][data-task="play-pause"]').attr('data-state', 'play');
                    $this.callback(instance, 'setSeekbar', 0);
                }, 50);
            });
        }
        , play: function (instance, $key) {
            instance = this.getInstance();
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