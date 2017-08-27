define(['jquery', 'underscore', 'backbone', 'template', 'config', 'user', 'global'
], function ($, _, Backbone, Template, Config, User, Global) {

    var LoginView = Backbone.View.extend({
        data: {}
        , events: {
            'submit .login-form': 'login'
        }
        , el: $(Config.positions.wrapper)
        , render: function () {
            STORAGE.clear();
            typeof $_GET.redirect !== "undefined" && console.log($_GET);
            var template = Template.template.load('user', 'login');
            template.done(function (data) {
                var html = $(data).wrap('<p/>').parent().html();
                var handlebarsTemplate = Template.handlebars.compile(html);
                var output = handlebarsTemplate(Config);
                $(Config.positions.wrapper).html(output);
                typeof Config.overrideClass !== "undefined" && $("body").addClass(Config.overrideClass);
            });
            return this;
        }
        , login: function (e) {
            e.preventDefault();
            var key = STORAGEKEY;
            var form = $(".login-content").find("form:first").serializeObject();
            var userModel = new User({path: '/login'});
            console.log(userModel);
            userModel.save(null, {
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
                , error: function () {
                    $(".login-form .alert").slideDown();
                }
            });
            return false;
        }
    });
    return LoginView;
});
