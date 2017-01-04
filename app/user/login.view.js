define(['jquery', 'underscore', 'backbone', 'template', 'config', 'user'
], function ($, _, Backbone, Template, Config, User) {

    var LoginView = Backbone.View.extend({
        data: {}
        , events: {
            'click [data-task=login]': 'login'
        }
        , el: $(Config.positions.wrapper)
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
            var key = STORAGEKEY;
            var form = this.$el.find("form:first").serializeObject();
            new User({path: '/login'}).save(null, {
                data: JSON.stringify(form)
                , contentType: 'application/json'
                , success: function (d) {
                    var d = d.toJSON();
                    delete d['path'];

                    var userData = {
                        username: form.username
                        , token: d.Token
                        , data: d
                    };
                    STORAGE.setItem(key, JSON.stringify(userData));
                    // Redirect to home/dashboard
                    location.href = '/';
                    return false;
                }
            });
            return false;
        }
    });
    return LoginView;
});
