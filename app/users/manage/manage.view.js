define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'users.manage.model', 'toastr', 'toolbar', 'statusbar', 'bootbox', 'bootstrap/modal', 'bootstrap-table'
], function ($, _, Backbone, Template, Config, Global, UsersManageModel, toastr, Toolbar, Statusbar, bootbox) {
    var UsersManageView = Backbone.View.extend({
//        el: $(Config.positions.wrapper)
        modal_register: '#register-modal'
        , toolbar: [
//            {'button': {cssClass: 'btn btn-success', text: 'جستجو', type: 'submit', task: 'load_users'}}
//            , {'input': {cssClass: 'form-control', placeholder: 'جستجو', type: 'text', name: 'q', value: "", text: "جستجو", addon: true, icon: 'fa fa-search'}}
            {'button': {cssClass: 'btn btn-primary', text: 'کاربر جدید', type: 'button', task: 'add-user', icon: 'fa fa-plus'}}
            , {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh-view', icon: 'fa fa-refresh'}}
        ]
        , flags: {}
        , events: {
            'click [data-task=add-user]': 'loadRegisterForm'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task=reset-password]': 'resetPassword'
            , 'submit #user-register': 'register'
        }
        , resetPassword: function (e) {
            e.preventDefault();
            var self = this;
            var $button = $(e.currentTarget);
            var id = $button.parents("tr:first").attr('data-id');
            bootbox.confirm({
                message: "رمز عبور کاربر "
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
                                toastr['success']('با موفقیت انجام شد.', 'تغییر رمز عبور', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                            }
                            , error: function (z, x, c) {
                                console.log(z, x, c);
                            }
                        });
                    }
                }
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
            var data = $(e.currentTarget).serializeObject();
            if (!this.validateRegisterForm($(e.currentTarget), data))
                return;
            var params = {path: '/register'};
            new UsersManageModel(params).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , success: function (d) {
                    toastr['success']('کاربر جدید با موفقیت ایجاد شد.', 'ایجاد کاربر', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
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
                    error = {msg: 'اطلاعات فیلدهای اجباری باید وارد شود!', type: 'warning'};
                if (typeof $(this).attr('data-validation') !== "undefined") {
                    switch ($(this).attr('data-validation')) {
                        case 'confirm-pass':
                            var val = $(this).val();
                            $('[data-validation=confirm-pass]').each(function () {
                                if ($(this).val() !== val) {
                                    error = {msg: 'رمزهای عبور با هم یکسان نیستند.', type: 'warning'};
                                }
                            });
                            break;
                    }
                }
            });
            if (error) {
                toastr[error.type](error.msg, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
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