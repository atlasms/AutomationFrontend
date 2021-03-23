define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'resources.media.model', 'resources.mediaitem.model', 'users.manage.model', 'toastr', 'toolbar', 'pdatepicker', 'tasks.model', 'user.helper', 'resources.categories.model', 'shared.model'
], function ($, _, Backbone, Template, Config, Global, moment, MediaModel, MediaitemModel, UsersManageModel, toastr, Toolbar, pDatepicker, TasksModel, UserHelper, CategoriesModel, SharedModel) {
    var MediaitemPrintView = Backbone.View.extend({
        currentData: {}
        , subjects: []
        , tags: []
        , toolbar: []
        , statusbar: []
        , flags: {}
        , usersCache: []
        , events: {}
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
                    if (user.groups.indexOf(group) !== -1)
                        $select.append('<option value="' + user.id + '" data-groups="' + user.groups.join(',') + '">' + user.name + '</option>');
                } else {
                    $select.append('<option value="' + user.id + '" data-groups="' + user.groups.join(',') + '">' + user.name + '</option>');
                }
            });
        }

        , getTags: function (callback) {
            var self = this;
            if (this.tags.length) {
                this.enableTagsEdit(this.tags);
            } else {
                new SharedModel().fetch({
                    success: function (tags) {
                        tags = tags.toJSON();
                        self.enableTagsEdit(tags);
                        if (typeof callback === "function")
                            callback(tags);
                    }
                });
            }
        }
        , getSubjects: function (callback) {
            var self = this;
            if (this.subjects.length) {
                this.enableSubjectsEdit(this.subjects);
            } else {
                new SharedModel({ overrideUrl: 'share/subjects' }).fetch({
                    success: function (subjects) {
                        subjects = subjects.toJSON();
                        self.enableSubjectsEdit(subjects);
                        if (typeof callback === "function")
                            callback(subjects);
                    }
                });
            }
        }
        , handleData: function (key, value, type) {
            if (typeof type === "undefined")
                return value;
            switch (type) {
                case 'date':
                    return Global.jalaliToGregorian(value) + 'T00:00:00';
                case 'date-time':
                    return Global.jalaliToGregorian(value.split(' ')[0]) + 'T' + value.split(' ')[1];
                case 'multiple':
                    var items = $("[name=" + key + "]").val();
                    if (typeof items === "object")
                        return items.join(',');
                    else
                        return value;
                case 'checkbox':
                    var items = [];
                    $("[name=" + key + "]:checkbox:checked").each(function (i) {
                        items[i] = $(this).val();
                    });
                    if (typeof items === "object")
                        return items.join(',');
                    else
                        return value;
            }
            return value;
        }
        , loadSidebarComments: function (params, callback) {
            var self = this;
            new MediaModel(params).fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    callback(items);
                }
            });
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            var params = {};
            params.q = $("[name=q]").val();
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , getId: function () {
            return Backbone.history.getFragment().split("/").pop().split("?")[0];
        }
        , getParentId: function () {
            var pid = $("tr[data-pid]").data('pid');
            return pid !== 'undefined' && pid ? pid : null;
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('resources/mediaitem', 'mediaitem-print');
            var $container = $(Config.positions.wrapper);
            var id = self.getId();
            var params = { id: +id };
            var model = new MediaitemModel(params);
            var item = {
                media: null,
                persons: null,
                comments: null,
                alerts: [],
                versions: null,
                user: UserHelper.getUser(),
                _created: Global.createDate() + 'T' + Global.createTime()
            };
            var commentsParams = { query: 'externalid=' + this.getId() + '&kind=1', overrideUrl: Config.api.comments };
            self.loadSidebarComments(commentsParams, function (comments) {
                item.comments = comments;
                self.getMediaPersons(function (persons) {
                    item.persons = persons;
                    model.fetch({
                        success: function (items) {
                            items = self.prepareItems(items.toJSON(), params);
                            items = (Object.keys(items).length === 1) ? items[0] : items;
                            if (!Global.checkMediaFilesAvailability(items.Files)) {
                                item.alerts.push('همه فایل‌های این مدیا آن‌لاین نیست');
                            }
                            if (~~items.State !== 1) {
                                item.alerts.push('این مدیا تایید شده نیست!');
                            }
                            item.media = items;
                            self.currentData = items;
                            template.done(function (data) {
                                var handlebarsTemplate = Template.handlebars.compile(data);
                                var output = handlebarsTemplate(item);
                                $container.html(output).promise().done(function () {
                                    self.afterRender(items, params);
                                });
                            });
                        }
                    });
                })
            })
        }
        , getMediaPersons: function (callback) {
            var self = this;
            var params = { overrideUrl: 'metadata/person', query: 'type=1&externalId=' + this.getId() };
            var model = new SharedModel(params);
            model.fetch({
                success: function (persons) {
                    persons = self.prepareItems(persons.toJSON(), params);
                    callback(persons);
                }
            })
        }
        , getMedia: function (imageSrc) {
            return imageSrc.replace('.jpg', '_lq.mp4');
        }
        , afterRender: function (item, params) {
            // this.loadSidebarComments({query: 'externalid=' + this.getId() + '&kind=1', overrideUrl: Config.api.comments})
        }
        , prepareItems: function (items, params, disableConvert) {
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
            if (typeof disableConvert !== 'undefined' && disableConvert) {
                return items;
            }
            var output = [];
            for (var key in Object.keys(items)) {
                output.push(items[key]);
            }
            return output;
        }
        , prepareContent: function () {
        }
        , prepareSave: function () {
            data = null;
            return data;
        }
        , attachDatepickers: function () {
            var self = this;
            var $datePickers = $(".datepicker");
            $.each($datePickers, function () {
                var $this = $(this);
                if ($this.data('datepicker') == undefined) {
                    $this.pDatepicker($.extend({}, CONFIG.settings.datepicker, {
                        onSelect: function () {
                        }
                    }));
                }
            });
            var $dateTimePickers = $(".datetimepicker");
            $.each($dateTimePickers, function () {
                var $this = $(this);
                var reset = ($.trim($this.val()) == "") ? true : false;
                if ($this.data('datepicker') == undefined) {
                    var dateTimePickerSettings = {
                        format: 'YYYY-MM-DD HH:mm:ss'
                        , timePicker: { enabled: true }
                    };
                    $this.pDatepicker($.extend({}, CONFIG.settings.datepicker, dateTimePickerSettings, {
                        onSelect: function () {
                        }
                    }));
                }
                if (reset)
                    $this.val($this.attr('data-default'));
            });
        }
        , mediaUsageFilter: function (e, type) {
            e.preventDefault();
            var self = this;
            var type = $('[data-task="change-mediausage-mode"]').val();
            var range = (type === "daterange") ? {
                start: Global.jalaliToGregorian($(".table-tools .datepicker[name=startdate]").val())
                , end: Global.jalaliToGregorian($(".table-tools .datepicker[name=enddate]").val())
            } : null;
            var params = {
                overrideUrl: Config.api.schedule + '/' + (range ? 'mediausecountbydate' : 'mediausecount') + '?id=' + self.getId() + (range ? '&startdate=' + range.start + 'T00:00:00&enddate=' + range.end + 'T23:59:59' : '')
            };
            var template = Template.template.load('resources/mediaitem', 'broadcast.partial');
            new MediaitemModel(params).fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    var d = {
                        items: items
                        , params: range
                    };
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(d);
                        $("#tab-schedule").html(output).promise().done(function () {
                            self.attachDatepickers();
                        });
                    });
                }
            });
        }
    });
    return MediaitemPrintView;
});
