define(['jquery', 'underscore', 'backbone', 'template', 'config', 'user', 'global', 'toolbar', 'toastr', 'resources.ingest.model', 'bootstrap/tab'
], function ($, _, Backbone, Template, Config, UserModel, Global, Toolbar, toastr, IngestModel) {

    var UserACLView = Backbone.View.extend({
        data: {}
        , toolbar: [
            {'button': {cssClass: 'btn green-jungle pull-right', text: 'ذخیره', type: 'submit', task: 'save'}}
        ]
        , events: {
            'click [data-task="save"]': 'submit'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'change input[type=checkbox]': 'handleParentCheckboxes'
        }
        , el: $(Config.positions.wrapper)
        , submit: function (e) {
            e.preventDefault();
            var data = this.prepareSave();
            new UserModel({overrideUrl: Config.api.acl, id: this.getId()}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function (d) {
                    toastr.success('با موفقیت انجام شد', 'ذخیره دسترسی‌ها', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
            });
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            console.info('Loading data');
            var params = {};
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , handleParentCheckboxes: function (e) {
            var checkbox = e.target;
            if ($(checkbox).parents("li:first").parents("li").length)
                if (checkbox.checked)
                    $(checkbox).parents("li:first").parents("li").find(" > .checkbox input[type=checkbox]").prop('checked', true);
            if ($(checkbox).parents("li:first").find("ul"))
                if (!checkbox.checked)
                    $(checkbox).parents("li:first").find("input[type=checkbox]").prop('checked', false);
        }
        , render: function (parameters) {
            var template = Template.template.load('user/acl', 'acl');
            var $container = $(Config.positions.main);
            var self = this;
//            var params = {overrideUrl: Config.api.acl, id: this.getId()};
            var params = {overrideUrl: Config.api.acl};
            var model = new UserModel(params);
            var data = {menu: {}, permissions: {}, directories: {}, lantv: {}};
            // User ACL
            model.fetch({
                success: function (d) {
                    data.permissions = self.prepareItems(d.toJSON(), params);
                    data.menu = Global.Cache.getMenu();
                    var folderParams = {overrideUrl: Config.api.ingest + '/directories'};
                    var model = new IngestModel(folderParams);
                    // User Directories
                    model.fetch({
                        success: function (f) {
                            data.directories = self.prepareItems(f.toJSON(), folderParams);
                            var lantvParams = {overrideUrl: Config.api.lantv + 'list'};
                            var model = new UserModel(lantvParams);
                            // User LanTVs
                            model.fetch({
                                success: function (l) {
                                    data.lantv = self.prepareItems(l.toJSON(), lantvParams);
                                    // Render template
                                    template.done(function (tmpl) {
                                        var handlebarsTemplate = Template.handlebars.compile(tmpl);
                                        var output = handlebarsTemplate(data);
                                        $container.html(output).promise().done(function () {
                                            self.afterRender();
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
        , getId: function () {
            return Backbone.history.getFragment().split("/").pop().split("?")[0];
        }
        , afterRender: function () {
            // Load user permissions
            var self = this;
            var params = {overrideUrl: Config.api.acl, id: this.getId()};
            var model = new UserModel(params);
            model.fetch({
                success: function (d) {
                    var permissions = self.prepareItems(d.toJSON(), params);
                    $.each(permissions, function () {
                        $('ul[data-type=' + this.Key + '] input[type=checkbox][value=' + this.Value + ']').prop('checked', true);
                    });
                }
            });
        }
        , prepareItems: function (items, params) {
            if (typeof items.query !== "undefined")
                delete items.query;
            if (typeof params !== "undefined") {
                for (var prop in params) {
                    delete items[prop];
                }
            }
            $.each(items, function () {
                if (typeof this.Data === "string" && this.Data !== "")
                    this.Data = JSON.parse(this.Data);
            });
            return items;
        }
        , renderToolbar: function () {
            var self = this;
//            if (self.flags.toolbarRendered)
//                return;
            var elements = self.toolbar;
            if (elements.length) {
                var toolbar = new Toolbar();
                $.each(elements, function () {
                    var method = Object.getOwnPropertyNames(this);
                    toolbar[method](this[method]);
                });
                toolbar.render();
//                self.flags.toolbarRendered = true;
            }
        }
        , prepareContent: function () {
            this.renderToolbar();
        }
        , prepareSave: function () {
            var data = [];
            $('ul[data-type]').each(function () {
                $(this).find('input[type=checkbox]').each(function () {
                    if (this.checked)
                        data.push({Key: $(this).parents("ul[data-type]").attr('data-type'), Value: $(this).val()});
                });
            });
            return data;
        }
    });
    return UserACLView;
});
