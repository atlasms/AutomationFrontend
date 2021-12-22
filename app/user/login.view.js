define(['jquery', 'underscore', 'backbone', 'template', 'config', 'user', 'users.manage.model', 'toastr', 'global', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, User, UsersManageModel, toastr, Global) {

    var LoginView = Backbone.View.extend({
        data: {}
        , events: {
            'submit .login-form': 'login',
            'submit #change-password-form': 'updatePassword',
            'input [type="password"]': 'validatePassword'
        }
        , el: $(Config.positions.wrapper)
        , userData: {}
        , render: function () {
            typeof STORAGE !== "unedfined" && STORAGE && STORAGE.clear();
            typeof $_GET.redirect !== "undefined" && console.log($_GET);
            var theme = (typeof Config.loginMode === "undefined" || Config.loginMode === 'default') ? 'login' : Config.loginMode;
            var template = Template.template.load('user', theme);
            template.done(function (html) {
                var handlebarsTemplate = Template.handlebars.compile(html);
                var output = handlebarsTemplate(Config);
                $(Config.positions.wrapper).html(output);
                typeof Config.overrideClass !== "undefined" && $("body").addClass(Config.overrideClass);
            });
            return this;
        }
        , validatePassword: function (e) {
            var lastEnteredCharacter = $(e.target).val().split('').pop();
            if (Global.checkForPersianCharacters(lastEnteredCharacter) || Global.checkForPersianCharacters($(e.target).val())) {
                if ($('#change-password-modal').is('visible')) {
                    if (!$('#change-password-modal .alert-error').is(':visible')) {
                        $("#change-password-modal .alert-error").slideDown();
                    }
                } else {
                    if (!$(".login-form .alert-warning").is(':visible')) {
                        $(".login-form .alert-warning").slideDown();
                    }
                }
            } else {
                $(".login-form .alert-warning").slideUp();
                $("#change-password-modal .alert-error").slideUp();
            }
        }
        , login: function (e) {
            e.preventDefault();
            var self = this;
            var form = $(".login-content").find("form:first").serializeObject();
            var userModel = new User({path: '/login'});
            userModel.save(null, {
                data: JSON.stringify(form)
                , contentType: 'application/json'
                , success: function (d) {
                    d = d.toJSON();
                    delete d['path'];

                    var userData = {
                        username: form.username
                        , token: d.Token
                        , data: d
                    };
                    self.userData = userData;
                    if (typeof d.ForceChangePassword !== 'undefined' && d.ForceChangePassword) {
                        var template = Template.template.load('user', 'change-password.partial');
                        var $container = $('#change-password-placeholder');
                        template.done(function (data) {
                            var handlebarsTemplate = Template.handlebars.compile(data);
                            var output = handlebarsTemplate(d);
                            $container.html(output).promise().done(function () {
                                // self.afterRender();
                                $('#change-password-modal').modal('show');
                            });
                        });
                        return false;
                    }
                    self.afterLogin(userData);
                    // STORAGE.setItem(key, JSON.stringify(userData));
                    // Redirect to home/dashboard
                    // location.href = '/';
                    return false;
                }
                , error: function () {
                    $(".login-form .alert-danger").slideDown();
                }
            });
            return false;
        }
        , afterLogin: function (userData) {
            var key = STORAGEKEY;
            STORAGE.setItem(key, JSON.stringify(userData));
            // !Backbone.History.started && Backbone.history.start({pushState: true});
            // new Backbone.Router().navigate('/', {trigger: true});
            location.href = '/';
        }
        , updatePassword: function (e) {
            e.preventDefault();
            var self = this;
            var msg = {error: false, message: ''};
            var $form = $(e.target);
            var data = $form.serializeObject();
            if (data.Password !== data.ConfirmPassword) {
                msg = {error: true, message: 'عبارات وارد شده با هم یکسان نیستند'};
                this.showUpdatePasswordMessage(msg);
                return false;
            }
            new User({path: '/checkpassword'}).save(null, {
                data: JSON.stringify({pwd: data.Password}),
                contentType: 'application/json',
                success: function (res) {
                    var response = res.toJSON();
                    delete response.path;
                    delete response.query;
                    // TODO
                    if (response.Value == 'False') {
                        msg = {error: true, message: 'لطفاً در انتخاب رمز عبور جدید به موارد بالا دقت کنید.'};
                        self.showUpdatePasswordMessage(msg);
                        return false;
                    } else {
                        new UsersManageModel({id: 'resetpassword/' + self.userData.data.Id}).save(null, {
                            data: JSON.stringify({key: 'Password', Value: data.Password})
                            , contentType: 'application/json'
                            , headers: {
                                'Authorization': self.userData.token
                            }
                            , success: function (d) {
                                toastr['success']('عملیات با موفقیت انجام شد.', 'تغییر رمز عبور', Config.settings.toastr);
                                self.afterLogin(self.userData);
                            }
                        });
                    }
                }
            });
        }
        , showUpdatePasswordMessage: function (message) {
            var $container = $('#update-message');
            $container.addClass(message.error ? 'alert-danger' : 'alert-success');
            $container.text(message.message);
            $container.slideDown('fast', function () {
                setTimeout(function () {
                    $container.slideUp('fast');
                }, 10000)
            });
        }
    });
    return LoginView;
});
