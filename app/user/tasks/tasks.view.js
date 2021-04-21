define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'tasks.model', 'users.manage.model', 'resources.media-options.helper', 'resources.mediaitem.model', 'toastr', 'toolbar', 'select2', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, Global, TasksModel, UsersManageModel, MediaOptionsHelper, MediaitemModel, toastr, Toolbar, select2) {
    var TasksView = Backbone.View.extend({
        toolbar: [
            // {'button': {cssClass: 'btn default pull-left', text: 'صندوق دریافتی‌ها', type: 'button', task: 'received', icon: 'fa fa-download'}},
            // {'button': {cssClass: 'btn default pull-left', text: 'ارسالی‌ها', type: 'button', task: 'sent', icon: 'fa fa-upload'}},
            {'button': {cssClass: 'btn btn-success', type: 'submit', task: 'filter', text: 'جستجو', icon: 'fa fa-search'}},
            {'button': {cssClass: 'btn purple-medium pull-right', text: 'ارجاع', type: 'button', task: 'assign-batch', icon: 'fa fa-share', style: 'margin-left: 10px;'}},
            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh-view', icon: 'fa fa-refresh'}},
            {
                'select': {
                    name: 'sort', options: [
                        {value: 'broadcast-date', text: 'تاریخ پخش', default: true},
                        {value: 'created', text: 'زمان ارسال'}
                    ], addon: true, icon: 'fa fa-sort', text: 'ترتیب'
                }
            },
            {
                'select': {
                    name: 'FromUserId', options: [
                        {value: 0, text: 'همه'}
                    ], addon: true, icon: 'fa fa-user', text: 'فرستنده'
                }
            },
            {
                'select': {
                    name: 'mode', options: [
                        {value: 'mytask', text: 'دریافتی‌ها', default: true},
                        {value: 'sent', text: 'ارسالی‌ها'}
                    ], addon: true, icon: 'fa fa-inbox', text: ''
                }
            },
            {
                'input': {
                    cssClass: 'form-control datepicker', placeholder: 'تاریخ پخش تا', type: 'text', name: 'edate', addon: true, icon: 'fa fa-calendar',
                    value: Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD')), style: 'max-width: 100px;', text: 'تا'
                }
            },
            {
                'input': {
                    cssClass: 'form-control datepicker', placeholder: 'تاریخ پخش از', type: 'text', name: 'date', addon: true, icon: 'fa fa-calendar',
                    value: Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD')), style: 'max-width: 100px;', text: 'تاریخ پخش از'
                }
            },
            {
                'select': {
                    name: 'filter-type', options: [
                        {value: 'all', text: 'همه'},
                        {value: 'date', text: 'بر اساس تاریخ پخش'}
                    ], addon: true, icon: 'fa fa-list'
                }
            },
        ]
        , flags: {}
        , items: []
        , filters: {
            status: 'mytask',
            date: '',
            // date: Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD')),
            // type: 'date'
        }
        , defaultParams: {
            masterid: 0,
            touserid: 0,
            togroupid: 0,
            jobid: 0
        }
        , currentState: 'received'
        , currentAssigningItem: null
        , events: {
            'click .inbox-sidebar [data-type]': 'filterItems'
            , 'click .inbox-content table tr td:not(:last-child):not(:first-child)': 'loadTask'
            , 'click [data-task="refresh-view"]': 'reLoad'
            , 'click [data-task="assign-batch"]': 'openAssignBatchModal'
            , 'click [data-task="assign"]': 'openAssignModal'
            , 'click [data-task="assign-item"]': 'assign'
            , 'change [name="ToGroupId"]': 'updateUserList'
            , 'click [data-task="follow-up"]': 'followUp'
            , 'click [data-task="load-media"]': 'loadMedia'
            , 'change [data-type="change-state"]': 'changeStatus'
            , 'click .media-options a': 'updateMediaParams'
            // , 'click .media-options': function (e) {
            //     e.stopPropagation();
            // }
            , 'click [data-type="change-state"]': function (e) {
                e.stopPropagation();
            }
            , 'click tr[data-id] td:first-child': function (e) {
                e.stopPropagation();
                // if ($(e.target).is('input')) {
                //     return true;
                // }
                // var $tr = $(e.target).is('tr') ? $(e.target) : $(e.target).parents('tr:first');
                // $tr.find('input')[0].checked = !$tr.find('input')[0].checked;
            }

            // , 'change [data-type="mode"]': 'load'
            , 'change #toolbar select': 'filter'
            , 'click [data-task="filter"]': 'filter'
            , 'click [data-task="sent"]': 'filter'
            , 'click [data-task="received"]': 'filter'
            , 'click #task-details a.note': function (e) {
                $('#details-modal').modal('hide');
            }
        }
        , updateMediaParams: function (e) {
            // e.stopPropagation();
            e.preventDefault();
            var self = this;
            var $li = $(e.target).parents('li:first');
            var params = {
                task: $li.data('task'),
                value: $li.data('value'),
                id: $(e.target).parents('tr:first').data('media-id')
            };
            var modelParams = {overrideUrl: Config.api.media + '/files', id: params.id};

            if (Config.mainStatesExceptions.indexOf(~~params.value) !== -1) {
                this.setMediaParam(params);
                return;
            }

            new MediaitemModel(modelParams).fetch({
                success: function (items) {
                    var files = Global.objectListToArray(self.prepareItems(items.toJSON(), modelParams));
                    var check = Global.checkMediaFilesAvailability(files);
                    if (check) {
                        self.setMediaParam(params);
                    } else {
                        toastr.error('پیش از اتمام کانورت مدیا امکان تغییر وضعیت وجود ندارد.', 'خطا', Config.settings.toastr);
                    }
                }
            });
        }
        , setMediaParam: function (params) {
            var self = this;
            MediaOptionsHelper.update(params, function (response) {
                if (response.error !== false) {
                    toastr.error(response.error, 'خطا', Config.settings.toastr);
                } else {
                    toastr.success('عملیات با موفقیت انجام شد', 'تغییر وضعیت', Config.settings.toastr);
                    self.reLoad();
                }
            });
        }
        , changeStatus: function (e, givenParams, reload) {
            var self = this;
            var $target = null;
            if (typeof e === 'object') {
                e.stopPropagation();
                e.preventDefault();
                $target = $(e.target);
            }
            var id = typeof givenParams !== 'undefined' && givenParams.id ? givenParams.id : $target.parents('tr:first').attr('data-id');
            var status = 'status=' + (typeof givenParams !== 'undefined' && givenParams.status ? givenParams.status : $target.val());
            if (id.indexOf('$$') !== -1) {
                var ids = id.split('$$');
                for (var el in ids) {
                    this.changeTaskItemState({id: ids[el], query: status}, false);
                }
                setTimeout(function () {
                    self.reLoad();
                }, 500)
            } else {
                this.changeTaskItemState({id: id, query: status}, true);
            }
        }
        , changeTaskItemState: function (params, reload) {
            var self = this;
            new TasksModel(params).save(null, {
                patch: true,
                success: function (res) {
                    toastr['success']('با موفقیت انجام شد.', 'تغییر وضعیت', Config.settings.toastr);
                    if (typeof reload !== 'undefined' && reload) {
                        self.reLoad();
                    }
                }
            })
        }

        , assign: function (e) {
            e.preventDefault();
            var data = $('#assign-modal form:first').serializeObject();
            if (data.ToUserId !== '0') {
                data.ToGroupId = null;
            } else {
                data.ToUserId = null;
            }
            delete data['to-type'];
            if (data.MasterId.indexOf('$$') !== -1) {
                var temp = data.MasterId.split('$$');
                for (var i = 0; i < temp.length; i++) {
                    data.MasterId = temp[i];
                    this.submitAssign(data, i === (temp.length - 1));
                }
            } else {
                this.submitAssign(data, true);
            }
        }
        , submitAssign: function (data, changeStatus) {
            var self = this;
            new TasksModel({}).save(null, {
                data: JSON.stringify(data),
                contentType: 'application/json',
                processData: false,
                success: function (res) {
                    toastr['success']('مدیا با موفقیت ارجاع شد.', 'ارجاع مدیا', Config.settings.toastr);
                    $('#assign-modal').modal('hide');
                    if (typeof changeStatus !== 'undefined' && changeStatus) {
                        self.changeStatus(undefined, {id: self.currentAssigningItem, status: 3}, true);
                    }
                }
            });
        }
        , openAssignBatchModal: function (e) {
            e.preventDefault();
            var selectedItems = [];
            var currentAssigningItems = [];
            $('#task-items tr').each(function () {
                if ($(this).find('.assign-checkbox input[type="checkbox"]').is(':checked')) {
                    selectedItems.push($(this).attr('data-media-id'));
                    currentAssigningItems.push($(this).attr('data-id'))
                }
            });
            if (!selectedItems.length) {
                toastr['error']('هیچ موردی انتخاب نشده است.', 'ارجاع مدیا', Config.settings.toastr);
                return false;
            }
            $('[name="MasterId"]').val(selectedItems.join('$$'));
            this.currentAssigningItem = currentAssigningItems.join('$$');
            $('#assign-modal').modal('toggle');
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
                            $("[name=FromUserId]").append('<option value="' + this.Id + '" data-groups="' + user.groups.join(',') + '">' + user.name + '</option>');
                            self.usersCache.push(user);
                        }
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
        , loadTask: function (e) {
            e.preventDefault();
            var self = this;
            var id = $(e.target).parents('tr:first').attr('data-id');
            var data = null;
            Object.keys(this.items).forEach(function (key) {
                if (self.items[key].Id === ~~id) {
                    data = self.items[key];
                }
            });
            if (data) {
                var template = Template.template.load('user/tasks', 'task-details.partial');
                template.done(function (tmpl) {
                    var handlebarsTemplate = Template.handlebars.compile(tmpl);
                    var output = handlebarsTemplate(data);
                    $('#task-details').html(output).promise().done(function () {
                        $('#details-modal').modal('toggle');
                    });
                });
            }
        }
        , toggleReceiptType: function (e) {
            var $this = $(e.currentTarget);
            $(".mail-to").find("select").prop('disabled', true);
            $('select[name=' + $this.attr("data-activate") + ']').removeAttr('disabled');
        }
        , reLoad: function () {
            this.render();
        }
        , filter: function (e, callback) {
            if (typeof e === 'object') {
                e.preventDefault();
            }
            var filters = this.getFilters();
            var modelParams = {
                status: filters.status,
                count: 1000,
                recommendedBroadcastDate: filters.date,
                recommendedBroadcastEndDate: filters.edate,
                ToUserId: filters.ToUserId,
                FromUserId: filters.FromUserId
            };
            this.load({query: $.param(modelParams)});
            $('[name="FromUserId"]').parent().find('.input-group-addon').html(
                $('[name="mode"]').val() === 'sent' ? '<i class="fa fa-user"></i> گیرنده' : '<i class="fa fa-user"></i> فرستنده'
            );
        }
        , load: function (params) {
            var self = this;
            var params = $.extend({}, this.getLoadParams(), params);
            new TasksModel(params).fetch({
                success: function (data) {
                    var items = self.prepareItems(data.toJSON(), params);
                    self.items = items;
                    self.showItems();
                }
            });
        }
        , showItems: function () {
            var self = this;
            var template = Template.template.load('user/tasks', 'task-items.partial');
            var $container = $('#task-items');
            template.done(function (tmpl) {
                var handlebarsTemplate = Template.handlebars.compile(tmpl);
                var output = handlebarsTemplate(self.items);
                $container.html(output)
            });
        }
        , getFilters: function () {
            return {
                status: ~~$('[name="status"]').val(),
                date: $('[name="filter-type"]').val() === 'date' ? Global.jalaliToGregorian($('[name="date"]').val()) : null,
                edate: $('[name="filter-type"]').val() === 'date' ? Global.jalaliToGregorian($('[name="edate"]').val()) : null,
                ToUserId: $('[data-type="mode"]').val() === 'sent' ? $('[name="FromUserId"]').val() : 0,
                FromUserId: $('[data-type="mode"]').val() === 'sent' ? 0 : $('[name="FromUserId"]').val()
                // date: $('[name="filter-type"]').val() === 'date' ? $('[name="date"]').val() : null,
            };
        }
        , getLoadParams: function () {
            var mode = $('[data-type="mode"]').val();
            var filters = this.getFilters();
            var modelParams = {
                status: filters.status,
                count: 1000,
                recommendedBroadcastDate: filters.date,
                recommendedBroadcastEndDate: filters.date,
                ToUserId: filters.ToUserId,
                FromUserId: filters.FromUserId
            };
            return {
                // path: '/' + mode + '?status=0'
                path: '/' + mode,
                query: $.param(modelParams)
            };
        }
        , render: function () {
            var self = this;
            var template = Template.template.load('user/tasks', 'tasks');
            var $container = $(Config.positions.main);
            template.done(function (tmpl) {
                var handlebarsTemplate = Template.handlebars.compile(tmpl);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.load();
                    self.afterRender();
                });
            });
            // this.load();
            return true;
        }
        , afterRender: function () {
            this.loadUsersList();
            // this.attachDatepickers();
        }
        , attachDatepickers: function () {
            // var self = this;
            var $datePickers = $(".datepicker");
            $.each($datePickers, function () {
                var $this = $(this);
                // if ($this.data('datepicker') == undefined) {
                $this.pDatepicker($.extend({}, CONFIG.settings.datepicker, {
                    // onSelect: function () {
                    //     // self.filter(undefined, $('[data-task="status"]').val());
                    // }
                }));
                // }
            });
        }
        , renderToolbar: function () {
            var self = this;
            var toolbar = new Toolbar();

            var definedStates = toolbar.getDefinedToolbar(223, 'status', [{Value: '0', Key: 'همه'}]);
            definedStates[0].select.text = 'وضعیت';
            definedStates[0].select.options[1].default = true;

            var elements = $.merge($.merge([], self.toolbar), definedStates);
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
            self.flags.toolbarRendered = true;
            setTimeout(function () {
                self.attachDatepickers();
            }, 0);
        }
        , prepareItems: function (items, params) {
            if (typeof items.query !== "undefined")
                delete items.query;
            if (typeof params !== "undefined") {
                for (var prop in params) {
                    delete items[prop];
                }
            }
            var itemsList = Object.keys(items).map(function (k) {
                items[k].date = (typeof items[k].Media !== 'undefined'
                    && typeof items[k].Media.RecommendedBroadcastDate !== 'undefined'
                    && items[k].Media.RecommendedBroadcastDate
                    && new Date(items[k].Media.RecommendedBroadcastDate).getFullYear() >= 2020)
                    ? items[k].Media.RecommendedBroadcastDate.split('T')[0]
                    : '1900-01-01';
                return items[k];
            });
            itemsList.sort(function (a, b) {
                if ($('[data-type="sort"]').val() === 'broadcast-date') {
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                }
                if ($('[data-type="sort"]').val() === 'created') {
                    return new Date(b.CreatedDate).getTime() - new Date(a.CreatedDate).getTime();
                }
            });
            return itemsList;
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
