define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'inbox.model', 'toastr', 'toolbar', 'user.helper', 'user', 'users.manage.model', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, Global, InboxModel, toastr, Toolbar, UserHelper, UserModel, UsersManageModel) {
    var ProfileView = Backbone.View.extend({
//        el: $(Config.positions.wrapper)
        modal_details: '#notifications-detail-modal'
        , toolbar: []
        , flags: {}
        , events: {
            'click [data-task="refresh"]': 'reLoad'
            , 'click [data-task="change-password"]': 'showChangePassModal'
            , 'click [data-task="save-password"]': 'changePassword'
        }
        , changePassword: function (e) {
            var self = this;
            var data = $("#change-pass-form").serializeObject();
            if (data.Password !== data.Verify || !data.Password) {
                toastr['warning']('لطفاً اطلاعات وارد شده را بررسی کنید.', 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                return false;
            }
            new UserModel({path: '/checkpassword', query: 'pwd=' + data.Password}).fetch({
                success: function (res) {
                    var response = res.toJSON();
                    delete response.path;
                    delete response.query;
                    if (response.Value == 'False') {
                        toastr['warning']('لطفاً در انتخاب رمز عبور جدید به موارد بالا دقت کنید.', 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                        return false;
                    } else {
                        new UsersManageModel({id: 'resetpassword/' + self.getId()}).save(null, {
                            data: JSON.stringify({key: 'Password', Value: data.Password})
                            , contentType: 'application/json'
                            , success: function (d) {
                                toastr['success']('عملیات با موفقیت انجام شد.', 'تغییر رمز عبور', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                                self.afterLogin(self.userData);
                            }
                        });
                    }
                }
            });
            e.preventDefault();
        }
        , showChangePassModal: function () {
            $("#change-pass-modal").modal('show');
        }
        , getId: function () {
            return UserHelper.getUser().Id;
        }
        , reLoad: function (e) {
            if (typeof e !== "undefined")
                e.preventDefault();
            this.load();
            return false;
        }
        , load: function (e, extend) {
            this.render();
        }
        , render: function () {
            var self = this;
            var template = Template.template.load('user/profile', 'profile');
            var id = this.getId();
            var $container = $("#main");
            var params = {id: id};
            var model = new UserModel(params);
            model.fetch({
                success: function (d) {
                    var details = self.prepareItems(d.toJSON(), params);
                    template.done(function (tmpl) {
                        var handlebarsTemplate = Template.handlebars.compile(tmpl);
                        var output = handlebarsTemplate(details);
                        $container.html(output).promise().done(function () {
//                            self.afterRender();
                        });
                    });
                }
            });

        }
        , afterRender: function () {
        }
        , renderToolbar: function () {
            var self = this;
            var elements = self.toolbar;
            var toolbar = new Toolbar();
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
            self.flags.toolbarRendered = true;
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
    });
    return ProfileView;
});
