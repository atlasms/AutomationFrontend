define(['jquery', 'underscore', 'backbone', 'config', 'template', 'global', 'tasks.model', "user.helper"
], function ($, _, Backbone, Config, Template, Global, TasksModel, UserHelper) {
    var Tasks = Backbone.View.extend({
        initialize: function () {
            var self = this;
            self.checkTasks();
            this.interval = window.setInterval(function () {
                if (typeof UserHelper.getUser() !== "undefined" && typeof UserHelper.getUser().Id !== "undefined")
                    self.checkTasks();
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
        , checkTasks: function () {
            var self = this;
            var params = {path: '/mytask', query: 'status=0'};
            var $container = $(".tasks-list");
            var template = Template.template.load('shared', 'tasks.partial');
            new TasksModel(params).fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    items = $.map(items, function (value) {
                        return [value];
                    }).slice(0, Config.notificationsCount);
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
                        if (~~this.Status === 1)
                            i++;
                    });
                    if ($("#header_tasks_bar").find(".badge").text() !== i)
                        $("#header_tasks_bar").find(".badge").text(i);
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
    return Tasks;
});


