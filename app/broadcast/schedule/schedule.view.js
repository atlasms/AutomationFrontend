define(['jquery', 'underscore', 'backbone', 'template', 'config', 'moment-with-locales', 'broadcast.schedule.model', 'mask'
], function ($, _, Backbone, Template, Config, moment, ScheduleModel, Mask) {
    var ScheduleView = Backbone.View.extend({
        el: $(Config.positions.main)
        , model: 'ScheduleModel'
        , events: {
            'submit': 'submit'
            , 'keyup input.time': 'processTime'
        }
        , processTime: function (options) {
            var $element = $(options.target);
            if (!moment($element.val(), 'HH:mm:SS', true).isValid())
                $element.parent().addClass("has-error");
            else
                $element.parent().removeClass("has-error");
        }
        , render: function (content) {
            var template = Template.template.load('broadcast/schedule', 'schedule');
            var $container = this.$el;
            template.done(function (data) {
                var html = $(data).wrap('<p/>').parent().html();
                var handlebarsTemplate = Template.handlebars.compile(html);
                var output = handlebarsTemplate(this.data);
                $container.html(output).promise().done(function () {
                    var $timePickers = $(".time");
                    $.each($timePickers, function () {
                        $(this).mask('H0:M0:S0', {
                            translation: {'H': {pattern: /[0-2]/}, 'M': {pattern: /[0-5]/}, 'S': {pattern: /[0-5]/}}
                            , placeholder: '00:00:00'
                        });
                    });
                });
            });
        }
        , prepareContent: function () {
            var model = new ScheduleModel();
            model.initialize();
        }
    });
    return ScheduleView;
});