define(['jquery', 'underscore', 'backbone', 'config', 'template', 'global', 'inbox.model'
], function ($, _, Backbone, Config, Template, Global, InboxModel) {
    var Notifications = Backbone.View.extend({
        initialize: function () {
            var self = this;
            self.checkNotifications();
            this.interval = window.setInterval(function () {
                self.checkNotifications();
            }, 20000);
        }
        , checkNotifications: function () {
            var self = this;
            var params = {query: 'externalid=0&kind=3&provider=inbox'};
            var $container = $(".notifications-list");
            var template = Template.template.load('shared', 'notification.partial');
            new InboxModel(params).fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        if ($container.html() !== output) {
                            $container.html(output).promise().done(function () {
                                // Do something after partial module changed or updated
                            });
                        }
                    });
                    if ($("#header_notification_bar").find(".badge").text() !== items.length)
                        $("#header_notification_bar").find(".badge").text(_.size(items));
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
            return items;
        }

    });
    return Notifications;
});


