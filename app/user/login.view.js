define([
    'jquery',
    'underscore',
    'backbone',
    'template',
    'config'
//    'text!templates/todos.html'
], function ($, _, Backbone, Template, Config) {

    var LoginView = Backbone.View.extend({
        data: {}
        , render: function () {
            var template = Template.template.load('user', 'login');
            template.done(function (a) {
                var html = $(a).html();
                var handlebarsTemplate = Template.handlebars.compile(html);
                var output = handlebarsTemplate(this.data);
                $(Config.positions.wrapper).html(output);
            });
            return this;
        }

    });

    return LoginView;

});
