define(['jquery', 'underscore', 'backbone', 'template', 'config', 'moment-with-locales', 'broadcast.schedule.model', 'mask', 'toolbar'
], function ($, _, Backbone, Template, Config, moment, ScheduleModel, Mask, Toolbar) {
    var ScheduleView = Backbone.View.extend({
        el: $(Config.positions.main)
        , model: 'ScheduleModel'
        , toolbar: [
            {'button': {cssClass: 'btn btn-success', text: 'جدید', type: 'button'}}
            , {'button': {cssClass: 'btn btn-info', text: 'salam salam', type: 'button'}}
        ]
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
            var model = new ScheduleModel();
            var self = this;
            model.fetch({
                success: function (items) {
                    var items = items.toJSON();
                    delete items.query;
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            self.renderToolbar();
                            self.afterRender();
                        });
                    });
                }
            });
        }
        , afterRender: function () {
            var $timePickers = $(".time");
            $.each($timePickers, function () {
                $(this).mask('H0:M0:S0', {
                    placeholder: '00:00:00', translation: {'H': {pattern: /[0-2]/}, 'M': {pattern: /[0-5]/}, 'S': {pattern: /[0-5]/}}
                });
            });
        }
        , renderToolbar: function () {
            var elements = this.toolbar;
            var toolbar = new Toolbar();
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
                toolbar.render();
            });
        }
        , prepareContent: function () {
            var model = new ScheduleModel();
            model.initialize();
        }
    });
    return ScheduleView;
});