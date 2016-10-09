define(['jquery', 'underscore', 'backbone', 'template', 'config', 'moment-with-locales', 'broadcast.schedule.model'
], function ($, _, Backbone, Template, Config, moment, ScheduleModel) {
    var ScheduleView = Backbone.View.extend({
        el: $(Config.positions.main)
        , model: 'ScheduleModel'
        , events: {
            'submit': 'submit'
            , 'keyup input.time': 'processTime'
        }
//        , timeRegex: /(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/g
        , processTime: function (options) {
            var $element = $(options.target);
//            console.log(this.timeRegex.test($element.val()))
            if (!moment($element.val(), $element.attr("data-pattern"), true).isValid())
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
                $container.html(output);
            });
//            requirejs(['mask'], function(mask) {
//                console.log(typeof mask); 
//            });
        }
        , prepareContent: function () {
            var model = new ScheduleModel();
            model.initialize();
        }
    });
    return ScheduleView;
});