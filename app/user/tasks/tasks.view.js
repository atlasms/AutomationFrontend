define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'tasks.model', 'users.manage.model', 'toastr', 'toolbar', 'select2', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, Global, TasksModel, UsersManageModel, toastr, Toolbar, select2) {
    var TasksView = Backbone.View.extend({
        toolbar: [
            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh-view', icon: 'fa fa-refresh'}},
            {'button': {cssClass: 'btn default pull-left', text: 'صندوق دریافتی‌ها', type: 'button', task: 'received', icon: 'fa fa-download'}},
            {'button': {cssClass: 'btn default pull-left', text: 'ارسالی‌ها', type: 'button', task: 'sent', icon: 'fa fa-upload'}}
        ]
        , flags: {}
        , cachedItems: []
        , currentAssigningItem: null
        , events: {
            'click .inbox-sidebar [data-type]': 'filterItems'
            , 'click .inbox-content table tr': 'loadTask'
            , 'click [data-task="refresh-view"]': 'reLoad'
            , 'click [data-task="sent"]': 'redirectToSent'
            , 'click [data-task="received"]': 'redirectToReceived'
            , 'change [data-task="filter-status"]': 'filter'
            , 'click [data-task="follow-up"]': 'followUp'

            , 'click [data-task="assign"]': 'openAssignModal'
            , 'click [data-task="assign-item"]': 'assign'
            , 'change [name="ToGroupId"]': 'updateUserList'

            , 'click .enable-recommended-checkbox input[type="checkbox"]': 'enableRecommendedDate'
            // , 'click [name="to-type"]': 'changeSendRecipient'

            , 'click [data-task="load-media"]': 'loadMedia'
            , 'change [data-type="change-state"]': 'changeStatus'
            , 'click [data-type="change-state"]': function (e) {
                e.stopPropagation();
            }
        }
        , changeStatus: function (e, givenParams, reload) {
            var $target = null;
            if (typeof e === 'object') {
                e.stopPropagation();
                e.preventDefault();
                $target = $(e.target);
            }
            var self = this;
            var params = {
                id: typeof givenParams !== 'undefined' && givenParams.id ? givenParams.id : $target.parents('tr:first').attr('data-id'),
                query: 'status=' + (typeof givenParams !== 'undefined' && givenParams.status ? givenParams.status : $target.val())
            };
            new TasksModel(params).save(null, {
                patch: true,
                success: function (res) {
                    toastr['success']('با موفقیت انجام شد.', 'تغییر وضعیت', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    if (typeof reload !== 'undefined' && reload) {
                        self.reLoad();
                    }
                }
            })
        }

        , assign: function (e) {
            e.preventDefault();
            var self = this;
            var data = $('#assign-modal form:first').serializeObject();
            if (data.ToUserId !== '0') {
                data.ToGroupId = null;
            } else {
                data.ToUserId = null;
            }
            delete data['to-type'];
            new TasksModel({}).save(null, {
                data: JSON.stringify(data),
                contentType: 'application/json',
                processData: false,
                success: function (res) {
                    toastr['success']('مدیا با موفقیت ارجاع شد.', 'ارجاع مدیا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    $('#assign-modal').modal('hide');
                    self.changeStatus(undefined, {id: self.currentAssigningItem, status: 3}, true);
                }
            });
        }
        , openAssignModal: function (e) {
            e.stopPropagation();
            e.preventDefault();
            var $row = $(e.target).parents('tr:first');
            this.currentAssigningItem = $row.attr('data-id');
            $('[name="MasterId"]').val($row.attr('data-media-id'));
            $('#assign-modal').modal('toggle');
        }
        , changeSendRecipient: function (e) {
            var $this = $(e.target);
            // $this.parents('dl:first').find('select').prop('disabled', 'disabled');
            // $('[name="' + $this.attr('data-toggle') + '"]').prop('disabled', false);
        }
        , loadUsersList: function () {
            var self = this;
            if ($("select[name=ToUserId] option").length > 1)
                return false;
            new UsersManageModel({}).fetch({
                success: function (items) {
                    var items = items.toJSON();

                    self.usersCache = [];
                    $.each(items, function () {
                        var user = {id: this.Id, name: this.Family + '، ' + this.Name, groups: []};
                        if (typeof this.Access !== 'undefined' && this.Access.length) {
                            for (var i = 0; i < this.Access.length; i++) {
                                if (this.Access[i].Key === 'groups') {
                                    user.groups.push(this.Access[i].Value);
                                }
                            }
                        }
                        $("[name=ToUserId]").append('<option value="' + this.Id + '" data-groups="' + user.groups.join(',') + '">' + this.Family + '، ' + this.Name + '</option>');
                        self.usersCache.push(user);
                    });
                }
            });
        }
        , updateUserList: function (e) {
            var value = $(e.target).val();
            this.generateUserOptions(value);
        }
        , generateUserOptions: function (group) {
            group = typeof group !== 'undefined' && group ? group : 0;
            console.log(group);
            var $select = $("[name=ToUserId]");
            $select.empty();
            if (group !== 0)
                $select.append('<option value="0">همه‌ی اعضای گروه</option>');
            this.usersCache.forEach(function (user) {
                if (group !== 0) {
                    if (user.groups.indexOf(group) !== -1) {
                        $select.append('<option value="' + user.id + '" data-groups="' + user.groups.join(',') + '">' + user.name + '</option>');
                    }
                } else {
                    $select.append('<option value="' + user.id + '" data-groups="' + user.groups.join(',') + '">' + user.name + '</option>');
                }
            });
        }

        , loadMedia: function (e) {
            e.stopPropagation();
            e.preventDefault();
            var mediaId = $(e.target).parents('tr:first').attr('data-media-id');
            var win = window.open('/resources/mediaitem/' + mediaId, Config.mediaLinkTarget);
            win && win.focus();
        }
        , filter: function (e, forcedState) {
            var status = typeof forcedState !== 'undefined' && forcedState ? forcedState : ~~$(e.target).val();
            var $rows = $('.inbox-body table:first tbody tr');
            var filterByDate = $('.enable-recommended-checkbox input[type="checkbox"]')[0].checked;
            var dateFilterValue = $('#filter-date').val();
            if (status === 0) {
                $rows.show(0);
            } else {
                $rows.hide(0);
                $rows.each(function () {
                    if (filterByDate) {
                        if ($(this).is('[data-status="' + status + '"]') && $(this).is('[data-date="' + dateFilterValue + '"]')) {
                            $(this).show();
                        }
                    } else {
                        if ($(this).is('[data-status="' + status + '"]')) {
                            $(this).show();
                        }
                    }
                });
            }
        }
        , enableRecommendedDate: function (e) {
            var self = this;
            var $input = $('#filter-date');
            setTimeout(function () {
                if (e.target.checked) {
                    $input.prop('disabled', false);
                } else {
                    $input.prop('disabled', 'disabled');
                }
                self.filter(undefined, $('[data-task="filter-status"]').val());
            }, 100);
        }
        , redirectToSent: function (e) {
            e.preventDefault();
            new Backbone.Router().navigate('/user/tasks/sent', {trigger: true});
        }
        , redirectToReceived: function (e) {
            e.preventDefault();
            new Backbone.Router().navigate('/user/tasks', {trigger: true});
        }
        , defaultParams: {
            masterid: 0,
            touserid: 0,
            togroupid: 0,
            jobid: 0
        }
        , loadTask: function (e) {
            e.preventDefault();
            var self = this;
            var id = $(e.target).parents('tr:first').attr('data-id');
            var data = null;
            Object.keys(this.cachedItems).forEach(function (key) {
                console.log(self.cachedItems[key]);
                if (self.cachedItems[key].Id === ~~id) {
                    data = self.cachedItems[key];
                }
            });
            if (data) {
                var template = Template.template.load('user/tasks', 'task-details.partial');
                template.done(function (tmpl) {
                    var handlebarsTemplate = Template.handlebars.compile(tmpl);
                    var output = handlebarsTemplate(data);
                    $('#task-details').html(output).promise().done(function () {
                        $('#details-modal').modal('toggle')
                    });
                });
            }
        }
        , filterItems: function (e) {
            e.preventDefault();
            var $li = $(e.target).parents('li:first');
            var type = $(e.target).is('a') ? $(e.target).attr('data-type') : $li.find('a:first').attr('data-type');
            var $rows = $('.inbox-body table:first tbody tr');
            $li.parents('ul:first').find('li.active').removeClass('active');
            $li.addClass('active');
            switch (type) {
                case 'me':
                    $rows.each(function () {
                        if (!$(this).hasClass('to-user'))
                            $(this).hide();
                        else
                            $(this).show();
                    });
                    break;
                case 'groups':
                    $rows.each(function () {
                        if ($(this).hasClass('to-user'))
                            $(this).hide();
                        else
                            $(this).show();
                    });
                    break;
                default:
                    $rows.show();
                    break;
            }
        }
        , toggleReceiptType: function (e) {
//            e.preventDefault();
            var self = this;
            var $this = $(e.currentTarget);
            $(".mail-to").find("select").prop('disabled', true);
            $('select[name=' + $this.attr("data-activate") + ']').removeAttr('disabled');
        }
        , reLoad: function () {
            this.render();
        }
        , getPageType: function () {
            return (Backbone.history.getFragment().split("/").pop().split("?")[0].indexOf('sent') !== -1) ? 'sent' : 'received';
        }
        , render: function () {
            var type = this.getPageType();
            switch (type) {
                case 'sent':
                    this.loadSentItems();
                    $('[data-task="sent"]').removeClass('default').addClass('blue');
                    break;
                case 'received':
                    $('[data-task="received"]').removeClass('default').addClass('blue');
                    this.loadReceivedItems();
                    break;
            }
            return true;
        }
        , loadSentItems: function () {
            var self = this;
            var template = Template.template.load('user/tasks', 'tasks.sent');
            var $container = $(Config.positions.main);
            var params = {path: '/sent?status=0'};
            new TasksModel(params).fetch({
                success: function (data) {
                    var items = self.prepareItems(data.toJSON(), {path: '/sent'});
                    self.cachedItems = items;
                    template.done(function (tmpl) {
                        var handlebarsTemplate = Template.handlebars.compile(tmpl);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            self.afterRender();
                        });
                    });
                }
            });
        }
        , loadReceivedItems: function (callback) {
            var self = this;
            var template = Template.template.load('user/tasks', 'tasks');
            var $container = $(Config.positions.main);
            var params = {path: '/mytask?status=0'};
            new TasksModel(params).fetch({
                success: function (data) {
                    var items = self.prepareItems(data.toJSON(), {path: '/mytask'});
                    self.cachedItems = items;
                    template.done(function (tmpl) {
                        var handlebarsTemplate = Template.handlebars.compile(tmpl);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            self.afterRender();

                            $('[data-task="filter-status"]').val('1');
                            self.filter(undefined, 1);
                        });
                    });
                }
            });
        }
        , afterRender: function () {
            this.loadUsersList();
            this.attachDatepickers();
        }
        , attachDatepickers: function () {
            var self = this;
            var $datePickers = $(".datepicker");
            $.each($datePickers, function () {
                var $this = $(this);
                if ($this.data('datepicker') == undefined) {
                    $this.pDatepicker($.extend({}, CONFIG.settings.datepicker, {
                        onSelect: function () {
                            self.filter(undefined, $('[data-task="filter-status"]').val());
                        }
                    }));
                }
            });
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
    return TasksView;
});
