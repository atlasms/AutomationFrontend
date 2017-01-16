define(['jquery', 'underscore', 'backbone', 'config', 'template', 'global', 'inbox.model'
], function ($, _, Backbone, Config, Template, Global, InboxModel) {
    var Notifications = Backbone.View.extend({
        initialize: function () {
            var self = this;
            self.checkNotifications();
            this.interval = window.setInterval(function () {
                self.checkNotifications();
            }, Config.notificationsInterval);
            $(document).on('click', ".notifications-list li a.seen-status", function (e) {
                e.preventDefault();
                var $this = $(this);
                if ($this.parent().hasClass("unread")) {
                    new InboxModel({id: $this.parents("li:first").attr("data-messageid")}).fetch({
                        success: function () {
                            $this.parents("li:first").removeClass("unread").addClass("read");
                        }
                    });
                }
                return false;
            });
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
                    var i = 0;
                    $.each(items, function () {
                        if (!this.SeenDate)
                            i++;
                    });
                    if ($("#header_notification_bar").find(".badge").text() !== i)
                        $("#header_notification_bar").find(".badge").text(i);
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


