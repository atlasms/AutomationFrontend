define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'inbox.model', 'resources.review.model', 'users.manage.model', 'toastr', 'toolbar', 'select2', 'wysihtml5', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, Global, InboxModel, ReviewModel, UsersManageModel, toastr, Toolbar, select2, wysihtml5) {
    var InboxView = Backbone.View.extend({
//        el: $(Config.positions.wrapper)
        modal_register: '#register-modal'
        , toolbar: []
        , flags: {}
        , events: {
            'click .inbox-nav li a': 'loadTab'
            , 'click [href="#compose"]': 'loadCompose'
            , 'click .mail-to .inbox-cc': 'handleCCInput'
            , 'submit form.inbox-compose': 'sendMessage'
            , 'click .view-message': 'viewMessage'
            , 'click input[data-activate]': 'toggleReceiptType'
        }
        , toggleReceiptType: function (e) {
//            e.preventDefault();
            var self = this;
            var $this = $(e.currentTarget);
            $(".mail-to").find("select").prop('disabled', true);
            $('select[name=' + $this.attr("data-activate") + ']').removeAttr('disabled');
        }
        , viewMessage: function (e) {
            e.preventDefault();
            var self = this;
            var params = {id: $(e.currentTarget).parents("tr:first").attr('data-messageid')};
            var model = new InboxModel(params);
            var template = Template.template.load('user/messages', 'message.partial');
            var $container = $(".inbox-content");
            model.fetch({
                success: function (items) {
                    items = items.toJSON();
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            // Do something after partial module changed or updated
                        });
                    });
                }
            });
            return false;
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
            var template = Template.template.load('user/messages', 'inbox');
            var $container = $(Config.positions.main);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.afterRender();
                });
            });
        }
        , loadCompose: function (e) {
            var self = this;
            $(".inbox-nav li").removeClass('active');
            var template = Template.template.load('user/messages', 'compose.partial');
            var $container = $(".inbox-content");
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    if ($('.inbox-wysihtml5').length)
                        self.initWysihtml5();
                    if ($("[name=ToUserId]").length)
                        self.loadUsersList();
                });
            });
        }
        , loadUsersList: function () {
            new UsersManageModel({}).fetch({
                success: function (items) {
                    var items = items.toJSON();
                    $.each(items, function () {
//                        $("[name=ToUserId]").select2('data', {id: this.Id, text: this.Name});
                        $("[name=ToUserId]").append('<option value="' + this.Id + '">' + this.Name + ' ' + this.Family + '</option>');
                    });
//                    $(".select2").select2({
//                        rtl: true
//                    });
                }
            });
        }
        , getFormData: function() {
            var $form = $("form.inbox-compose");
            var data = $form.serializeObject();
            data.ToType = data["to-type"];
            data.ToUserId = (typeof data.ToGroupId !== "undefined") ? data.ToGroupId : data.ToUserId;
            delete data.ToGroupId;
            delete data.cc;
            delete data["to-type"];
            return [data];
        }
        , sendMessage: function (e) {
            e.preventDefault();
            var data = this.getFormData();
//            console.log(data); return false;
            new ReviewModel({overrideUrl: Config.api.comments}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function (model, response) {
                    toastr.success('پیام با موفقیت ارسال شد.', 'ارسال پیام', Config.settings.toastr);
                    // TODO: reload comments
                }
            });
            return false;
        }
        , initWysihtml5: function () {
            $('.inbox-wysihtml5').wysihtml5({
                "stylesheets": ["/assets/css/vendor/wysiwyg-color.css"]
                , ignore: ":hidden:not(textarea)"
            });
        }
        , handleCCInput: function () {
            var the = $('.inbox-compose .mail-to .inbox-cc');
            var input = $('.inbox-compose .input-cc');
            the.hide();
            input.show();
            $('.close', input).click(function () {
                input.hide();
                the.show();
            });
        }
        , loadTab: function (e, force) {
            var self = this;
            if (typeof e !== "undefined") {
                var $li = $(e.currentTarget).parent();
                $(".inbox-nav li").removeClass('active');
                $li.addClass('active');
            } else
                var $li = $(".inbox-nav li.active");
            var params = {query: 'externalid=0&kind=2&provider=' + $li.attr('data-type')};
            var model = new InboxModel(params);
            var template = Template.template.load('user/messages', 'messages.partial');
            var $container = $(".inbox-content");
            model.fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            // Do something after partial module changed or updated
                        });
                    });
                }
            });
        }
        , afterRender: function () {
            this.handleHash();
//            $(".select2").select2();
        }
        , handleHash: function () {
            var self = this;
            if (location.hash) {
                if (location.hash && $('li[data-type="' + location.hash.replace('#', '') + '"]').length)
                    $('li[data-type="' + location.hash.replace('#', '') + '"] a:first').click();
                if (location.hash && location.hash.replace('#', '') === 'compose')
                    self.loadCompose();
            } else
                $('a[href="#inbox"]').get(0).click();
            return false;
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
    return InboxView;
});
