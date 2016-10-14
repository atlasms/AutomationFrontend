define(['jquery', 'underscore', 'backbone', 'template', 'config', 'user'
], function ($, _, Backbone, Template, Config, User) {

    var LoginView = Backbone.View.extend({
        data: {}
        , events: {
            'submit': 'login'
        }
        , el: $(Config.positions.wrapper)
        , model: 'UserModel'
        , render: function () {
            STORAGE.clear();
            var template = Template.template.load('user', 'login');
            template.done(function (data) {
                var html = $(data).wrap('<p/>').parent().html();
                var handlebarsTemplate = Template.handlebars.compile(html);
                var output = handlebarsTemplate(this.data);
                $(Config.positions.wrapper).html(output);
            });
            return this;
        }
        , login: function (options) {
            var user = new User();
            var form = this.$el.find("form:first").serializeObject();
            user.login(form);
            return false;
        }
    });

    return LoginView;

});
