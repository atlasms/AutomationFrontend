define(['jquery', 'underscore', 'backbone', 'template', 'config', 'moment-with-locales', 'broadcast.schedule.model', 'mask', 'toolbar', 'pdatepicker'
], function ($, _, Backbone, Template, Config, moment, ScheduleModel, Mask, Toolbar, pDatepicker) {
    var ScheduleView = Backbone.View.extend({
        el: $(Config.positions.main)
        , model: 'ScheduleModel'
        , toolbar: [
              {'button': {cssClass: 'btn btn-success', text: 'جدید', type: 'button'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'enddate'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'startdate'}}
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
                            self.afterRender();
                        });
                    });
                }
            });
            self.renderToolbar();
        }
        , afterRender: function () {
            var $timePickers = $(".time");
            var $datePickers = $(".datepicker");
            $.each($timePickers, function () {
                $(this).mask('H0:M0:S0', {
                    placeholder: '00:00:00', translation: {'H': {pattern: /[0-2]/}, 'M': {pattern: /[0-5]/}, 'S': {pattern: /[0-5]/}}
                });
            });
            $.each($datePickers, function() {
                $(this).pDatepicker({
                    format: 'YYYY-MM-DD HH:mm:ss'
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