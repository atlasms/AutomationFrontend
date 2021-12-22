define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'user', 'users.manage.model', 'toastr', 'toolbar', 'statusbar', 'bootbox', 'bootstrap/modal', 'bootstrap-table'
], function ($, _, Backbone, Template, Config, Global, User, UsersManageModel, toastr, Toolbar, Statusbar, bootbox) {
    var UsersManageView = Backbone.View.extend({
//        el: $(Config.positions.wrapper)
        modal_register: '#register-modal',
        resetPasswordModal: '#reset-password-modal'
        , toolbar: [
//            {'button': {cssClass: 'btn btn-success', text: 'جستجو', type: 'submit', task: 'load_users'}}
//            , {'input': {cssClass: 'form-control', placeholder: 'جستجو', type: 'text', name: 'q', value: "", text: "جستجو", addon: true, icon: 'fa fa-search'}}
            { 'button': { cssClass: 'btn btn-primary', text: 'کاربر جدید', type: 'button', task: 'add-user', icon: 'fa fa-plus' } }
            , { 'button': { cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh-view', icon: 'fa fa-refresh' } }
        ]
        , flags: {}
        , events: {
            'click [data-task=add-user]': 'loadRegisterForm'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task=reset-password]': 'resetPassword'
            , 'submit #user-register': 'register'
            , 'click [data-task=deactivate]': 'deactivate'
            , 'click [data-task=activate]': 'activate'
            , 'submit #change-pass-form': 'updatePassword'
        }
        , activate: function (e) {
            this.changeState(e, 1);
        }
        , deactivate: function (e) {
            this.changeState(e, 0);
        }
        , changeState: function (e, state) {
            var $link = $(e.target).is('.btn') ? $(e.target) : $(e.target).parents('.btn:first');
            var id = $link.parents('tr:first').attr('data-id');
            new UsersManageModel({ id: 'active/' + id }).save(null, {
                data: JSON.stringify({ key: 'State', Value: state })
                , contentType: 'application/json'
                , success: function (d) {
                    toastr['success']('با موفقیت انجام شد.', 'تغییر وضعیت کاربر', Config.settings.toastr);
                    if (state === 1) {
                        $link.removeClass('red-stripe').addClass('green-stripe').attr('data-task', 'deactivate')
                            .html('<i class="fa fa-unlock"></i> فعال');
                    } else {
                        $link.removeClass('green-stripe').addClass('red-stripe').attr('data-task', 'activate')
                            .html('<i class="fa fa-ban"></i> غیرفعال');
                    }
                }
            });
        }
        , resetPassword: function (e) {
            e.preventDefault();
            var self = this;
            var userId = $(e.target).parents('tr:first').attr('data-id');
            $(this.resetPasswordModal).find('[name="user-id"]').val(userId);
            $(this.resetPasswordModal).modal('show');
            /*
            var $button = $(e.currentTarget);
            var id = $button.parents("tr:first").attr('data-id');
            bootbox.confirm({
                message: "رمز عبور کاربر به 123456 تغییر می‌کند. آیا مطمئن هستید؟"
                , buttons: {
                    confirm: {className: 'btn-success'}
                    , cancel: {className: 'btn-danger'}
                }
                , callback: function (results) {
                    if (results) {
                        new UsersManageModel({id: 'resetpassword/' + id}).save(null, {
                            data: JSON.stringify({key: 'Password', Value: 123456})
                            , contentType: 'application/json'
                            , success: function (d) {
                                toastr['success']('با موفقیت انجام شد.', 'تغییر رمز عبور', Config.settings.toastr);
                            }
                            , error: function (z, x, c) {
                                console.log(z, x, c);
                            }
                        });
                    }
                }
            });
            */
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
        , updatePassword: function (e) {
            e.preventDefault();
            var self = this;
            var msg = { error: false, message: '' };
            var $form = $(e.target);
            var data = $form.serializeObject();
            if (data.Password !== data.Verify) {
                msg = { error: true, message: 'عبارات وارد شده با هم یکسان نیستند' };
                this.showUpdatePasswordMessage(msg);
                return false;
            }
            new User({ path: '/checkpassword' }).save(null, {
                data: JSON.stringify({pwd: data.Password}),
                contentType: 'application/json',
                success: function (res) {
                    var response = res.toJSON();
                    delete response.path;
                    delete response.query;
                    // TODO
                    if (response.Value == 'False') {
                        msg = { error: true, message: 'لطفاً در انتخاب رمز عبور جدید به موارد بالا دقت کنید.' };
                        self.showUpdatePasswordMessage(msg);
                        return false;
                    } else {
                        new UsersManageModel({ id: 'resetpassword/' + $('[name="user-id"]').val() }).save(null, {
                            data: JSON.stringify({ key: 'Password', Value: data.Password })
                            , contentType: 'application/json'
                            , headers: {
                                'Authorization': response.Token
                            }
                            , success: function (d) {
                                toastr['success']('عملیات با موفقیت انجام شد.', 'تغییر رمز عبور', Config.settings.toastr);
                                $(self.resetPasswordModal).modal('hide');
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
        , loadRegisterForm: function (e) {
            e.preventDefault();
            var self = this;
//            var params = {};
            var template = Template.template.load('user', 'user.register.partial');
            var $modal = $(self.modal_register);
            template.done(function (params) {
                var handlebarsTemplate = Template.handlebars.compile(params);
                var output = handlebarsTemplate({});
                $modal.find(".modal-body").html(output).promise().done(function () {
                    $modal.modal('show');
                });
            });
        }
        , register: function (e) {
            e.preventDefault();
            var self = this;
            var data = $(e.currentTarget).serializeObject();
            if (!this.validateRegisterForm($(e.currentTarget), data))
                return;
            var params = { path: '/register' };
            var $modal = $(self.modal_register);
            new UsersManageModel(params).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , success: function (d) {
                    toastr['success']('کاربر جدید با موفقیت ایجاد شد.', 'ایجاد کاربر', Config.settings.toastr);
                    $modal.modal('hide');
                    self.reLoad();
                }
                , error: function (z, x, c) {
                    console.log(z, x, c);
                }
            });
            return false;
        }
        , validateRegisterForm: function ($form, data) {
//            return data;
            var error = false;
            $form.find('.form-control').each(function () {
                if ($(this).prop('required') && ($(this).val() === "" || !$(this).val()))
                    error = { msg: 'اطلاعات فیلدهای اجباری باید وارد شود!', type: 'warning' };
                if (typeof $(this).attr('data-validation') !== "undefined") {
                    switch ($(this).attr('data-validation')) {
                        case 'confirm-pass':
                            var val = $(this).val();
                            $('[data-validation=confirm-pass]').each(function () {
                                if ($(this).val() !== val) {
                                    error = { msg: 'رمزهای عبور با هم یکسان نیستند.', type: 'warning' };
                                }
                            });
                            break;
                    }
                }
            });
            if (error) {
                toastr[error.type](error.msg, 'خطا', Config.settings.toastr);
                return false;
            }
            return true;
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            console.info('Loading items');
            var params = {};
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , render: function (params) {
            var self = this;
            var params = {};
            var model = new UsersManageModel(params);
            var template = Template.template.load('users/manage', 'manage');
            var $container = $(Config.positions.main);
            model.fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            self.afterRender();
                        });
                    });
                }
            });
        }
        , afterRender: function () {
            $("#users-manage-table").bootstrapTable(Config.settings.bootstrapTable);
        }
        , renderToolbar: function () {
            var self = this;
//            if (self.flags.toolbarRendered)
//                return;
            var elements = self.toolbar;
            var toolbar = new Toolbar();
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
//            self.flags.toolbarRendered = true;
            this.renderStatusbar();
        }
        , prepareItems: function (items, params) {
            if (typeof items.query !== "undefined")
                delete items.query;
            if (typeof params !== "undefined") {
                for (var prop in params) {
                    delete items[prop];
                }
            }
            return items;
        }
        , prepareContent: function () {
            this.renderToolbar();
        }
        , prepareSave: function () {
            data = null;
            return data;
        }
        , renderStatusbar: function () {
            var elements = this.statusbar;
            var statusbar = new Statusbar();
            $.each(elements, function () {
                statusbar.addItem(this);
            });
            statusbar.render();
        }
    });
    return UsersManageView;
});
