define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'inbox.model', 'toastr', 'toolbar', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, Global, InboxModel, toastr, Toolbar) {
    var NotificationsView = Backbone.View.extend({
//        el: $(Config.positions.wrapper)
        modal_details: '#notifications-detail-modal'
        , toolbar: []
        , flags: {}
        , events: {
            'click .notifications tr': 'loadDetails'
            , 'click [data-task="refresh"]': 'reLoad'
        }
        , loadDetails: function (e) {
            e.preventDefault();
            var self = this;
            var params = {id: $(e.currentTarget).attr("data-messageid")};
            var model = new InboxModel(params);
//            var template = Template.template.load('shared', 'notification.partial');
            var $container = $(this.modal_details);
            model.fetch({
                success: function (items) {
                    items = items.toJSON();
                    $(e.currentTarget).removeClass("unread").addClass("read");
//                    template.done(function (data) {
//                        var handlebarsTemplate = Template.handlebars.compile(data);
//                        var output = handlebarsTemplate(items);
//                        $container.find('.modal-body').html(output).promise().done(function () {
//                            $container.modal();
//                        });
//                    });
                }
            });
            return false;
        }
        , reLoad: function (e) {
            if (typeof e !== "undefined")
                e.preventDefault();
            this.load();
            return false;
        }
        , load: function (e, extend) {
            var params = {query: 'externalid=0&kind=3&provider=inbox'};
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('user/notifications', 'notifications');
            var $container = $(Config.positions.main);
            var params = {query: 'externalid=0&kind=3&provider=inbox'};
            new InboxModel(params).fetch({
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
    return NotificationsView;
});