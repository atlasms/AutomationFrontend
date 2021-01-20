define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'tasks.model', 'users.manage.model', 'toastr', 'toolbar', 'statusbar', 'pdatepicker'
], function ($, _, Backbone, Template, Config, Global, TasksModel, UsersManageModel, toastr, Toolbar, Statusbar, pDatepicker) {
    var StatsTasksView = Backbone.View.extend({
        toolbar: [
            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
            , {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'show'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'enddate', addon: true, icon: 'fa fa-calendar'}} //persianDate().format('YYYY-MM-DD')
            , {
                'input': {
                    cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'startdate', addon: true, icon: 'fa fa-calendar',
                    value: Global.jalaliToGregorian(persianDate(SERVERDATE).subtract('days', 30).format('YYYY-MM-DD'))
                }
            }
            , {
                'select': {
                    cssClass: 'form-control', name: 'ToUserId', options: [], addon: true, icon: 'fa fa-user', text: 'کاربر'
                }
            }
        ]
        , statusbar: []
        , usersCache: []
        , flags: {}
        , events: {
            'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task=show]': 'load'
            , 'click [data-task=refresh]': 'reLoad'
        }
        , reLoad: function () {
            this.render();
        }
        , load: function (e, extend) {
            this.loadItems();
        }
        , loadUsersList: function () {
            var self = this;
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
                }
            });
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('stats/tasks', 'tasks');
            var $container = $(Config.positions.main);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.afterRender();
                });
            });
        }
        , loadItems: function () {
            var self = this;
            var modelParams = {
                MasterId: 0,
                JobId: 0,
                ToUserId: $('[name="ToUserId"]').val(),
                ToGroupId: 0,
                Status: $('[name="Status"]').val(),
                CreatedStartDate: Global.jalaliToGregorian($('[name="startdate"]').val()),
                CreatedEndDate: Global.jalaliToGregorian($('[name="enddate"]').val()),
                recommendedBroadcastDate: '',
                recommendedBroadcastEndDate: ''
            };
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
                            var duration = self.processSum(items);
                            $('#total-count [data-type="duration"]').html(duration);
                            $('#total-count [data-type="count"]').html(items.length);
                        });
                    });
                }
            });
        }
        , afterRender: function () {
//            this.loadItems();
            this.loadUsersList();
            this.attachDatepickers();
            this.renderStatusbar();
        }
        , attachDatepickers: function () {
            var self = this;
            var $datePickers = $(".datepicker");
            $.each($datePickers, function () {
                var $this = $(this);
                if ($this.data('datepicker') == undefined) {
                    $this.pDatepicker($.extend({}, CONFIG.settings.datepicker, {
                        onSelect: function () {
//                            self.render();
                        }
                    }));
                    // setTimeout(function() {
                    //     self.loadItems();
                    // }, 500);
                }
            });
        }
        , renderToolbar: function () {
            var self = this;
            var elements = self.toolbar;
            var toolbar = new Toolbar();
//            var definedItems = toolbar.getDefinedToolbar(71, 'type');
            var definedStates = toolbar.getDefinedToolbar(223, 'Status', [{Value: '0', Key: 'همه'}]);
            definedStates[0].select.text = 'وضعیت';
            definedStates[0].select.options[3].default = true;

            // var elements = $.merge([], self.toolbar);
            var elements = $.merge($.merge([], self.toolbar), definedStates);
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
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
            this.renderToolbar();
        }
        , updateStats: function ($rows) {
            var stats = {duration: 0, count: 0, totalbroadcast: 0, totalrepeats: 0};
            $rows.each(function () {
                if ($(this).is(":visible")) {
                    stats.count++;
                    stats.duration += $(this).data('duration');
                    $(this).find(".idx").html(stats.count);

                    if ($(this).find(".broadcast-count").text() > 0) {
                        stats.totalbroadcast += ($(this).data('duration'));
                    }
                }
            });
            $("[data-type=duration]").html(Global.createTime(stats.duration));
            $("[data-type=count]").html(stats.count);
            $("[data-type=totalbroadcast]").html(Global.createTime(stats.totalbroadcast));
        }
        , processSum: function (items) {
            var duration = 0;
            $.each(items, function () {
                duration += this.Media.Duration;
            });
            return Global.createTime2(duration);
        }
        // , loadItems: function () {
        //     var self = this;
        //     var params = {
        //         path: 'report'
        //     };
        //     var template = Template.template.load('stats/tasks', 'items.partial');
        //     var $container = $('#items');
        //     var model = new TasksModel(params);
        //     model.fetch({
        //         success: function (data) {
        //             items = self.processSum(self.prepareItems(data.toJSON(), params));
        //             template.done(function (data) {
        //                 var handlebarsTemplate = Template.handlebars.compile(data);
        //                 var output = handlebarsTemplate(items);
        //                 $container.html(output).promise().done(function () {
        //                     self.updatePrintButton();
        //                 });
        //             });
        //         }
        //     });
        // }
        , updatePrintButton: function () {
            var $printButton = $(".print-btn");
            var dates = '/stats/scheduleprint?CategoryId=' + $('[name=CategoryId]').val() + '&startdate=' + Global.jalaliToGregorian($("[name=startdate]").val()) + 'T00:00:00' + '&enddate=' + Global.jalaliToGregorian($("[name=enddate]").val()) + 'T23:59:59';
            if ($printButton.attr('href').indexOf('startdate') === -1)
                $printButton.attr('href', $printButton.attr('href') + dates);
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
    return StatsTasksView;
});
