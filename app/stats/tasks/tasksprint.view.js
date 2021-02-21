define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'tasks.model', 'users.manage.model', 'toastr', 'toolbar', 'statusbar', 'pdatepicker'
], function ($, _, Backbone, Template, Config, Global, TasksModel, UsersManageModel, toastr, Toolbar, Statusbar, pDatepicker) {
    var StatsTasksPrintView = Backbone.View.extend({
        toolbar: []
        , statusbar: []
        , usersCache: []
        , flags: {}
        , events: {}
        , loadUsersList: function (callback) {
            var self = this;
            $("body").prepend('<div class="spinner"><img src="/assets/img/loading-spinner-blue.gif" /></div>');
            if ($('select[name="ToUserId"] option').length > 1)
                return false;
            new UsersManageModel({}).fetch({
                success: function (items) {
                    var items = items.toJSON();

                    self.usersCache = [];
                    $.each(items, function () {
                        if (this.State) {
                            var user = {
                                id: this.Id,
                                name: this.Name !== '' ? this.Family + '، ' + this.Name : this.Family,
                                groups: []
                            };
                            if (typeof this.Access !== 'undefined' && this.Access.length) {
                                for (var i = 0; i < this.Access.length; i++) {
                                    if (this.Access[i].Key === 'groups') {
                                        user.groups.push(this.Access[i].Value);
                                    }
                                }
                            }
                            $("[name=ToUserId]").append('<option value="' + this.Id + '" data-groups="' + user.groups.join(',') + '">' + user.name + '</option>');
                            self.usersCache.push(user);
                        }
                    });
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            });
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('stats/tasks', 'tasksprint');
            var $container = $(Config.positions.wrapper);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.afterRender();
                });
            });
        }
        , getParams: function () {
            return {
                MasterId: Global.getVar('MasterId'),
                JobId: Global.getVar('JobId'),
                ToUserId: Global.getVar('ToUserId'),
                ToGroupId: Global.getVar('ToGroupId'),
                Status: Global.getVar('Status'),
                GroupByMedia: Global.getVar('GroupByMedia'),
                CreatedStartDate: Global.getVar('CreatedStartDate'),
                CreatedEndDate: Global.getVar('CreatedEndDate'),
                recommendedBroadcastDate: Global.getVar('recommendedBroadcastDate'),
                recommendedBroadcastEndDate: Global.getVar('recommendedBroadcastEndDate'),
                mediastate: Global.getVar('mediastate')
            };
        }
        , loadItems: function () {
            var self = this;
            var modelParams = this.getParams();
            var params = {path: '/report', query: $.param(modelParams)};
            var model = new TasksModel(params);
            model.fetch({
                success: function (data) {
                    var items = self.prepareItems(data.toJSON(), params);
                    var template = Template.template.load('stats/tasks', 'task-items.partial');
                    var $container = $('#items');
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            $("body").find('.spinner').remove();
                            var duration = self.processSum(items);
                            $('#total-count [data-type="duration"]').html(duration);
                            $('#total-count [data-type="count"]').html(items.length);
                        });
                    });
                }
            });
        }
        , afterRender: function () {
            var self = this;
            this.loadUsersList(function () {
                self.loadItems();
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
            return Global.objectListToArray(items);
        }
        , prepareContent: function () {
            // this.renderToolbar();
        }
        , processSum: function (items) {
            var duration = 0;
            $.each(items, function () {
                duration += this.Media.Duration;
            });
            return Global.createTime2(duration);
        }
    });
    return StatsTasksPrintView;
});
