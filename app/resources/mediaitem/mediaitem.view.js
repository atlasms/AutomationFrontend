define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'resources.media.model', 'resources.mediaitem.model', 'users.manage.model', 'mask', 'toastr', 'hotkeys', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper', 'player.helper', 'resources.ingest.model', 'resources.review.model', 'tasks.model', 'resources.metadata.model', 'resources.categories.model', 'bootbox', 'bootstrap/tab', 'bootstrap/modal', 'bootstrap/popover', 'editable.helper', 'resources.media-options.helper', 'shared.model', 'select2'
], function ($, _, Backbone, Template, Config, Global, moment, MediaModel, MediaitemModel, UsersManageModel, Mask, toastr, Hotkeys, Toolbar, Statusbar, pDatepicker, Tree, player, IngestModel, ReviewModel, TasksModel, MetadataModel, CategoriesModel, bootbox, $tab, $modal, $popover, Editable, MediaOptionsHelper, SharedModel, select2) {
    bootbox.setLocale('fa');
    var keysMap = Config.shortcuts.review;
    var MediaitemView = Backbone.View.extend({
//        el: $(Config.positions.wrapper)
        model: 'MediaitemModel'
        , defaultListLimit: Config.defalutMediaListLimit
        , playerInstance: {}
        , player: null
        , currentData: {}
        , modal_storage: '#storage-modal'
        , modal_tree: '#tree-modal'
        , treeInstance: {}
        , subjects: []
        , tags: []
        , toolbar: [
            // {'button': {cssClass: 'btn green-jungle pull-right', text: 'ذخیره', type: 'submit', task: 'save'}},
            {'button': {cssClass: 'btn purple-medium pull-right', text: 'ارجاع', type: 'submit', icon: 'fa fa-share', task: 'open-assign-modal'}}
        ]
        , statusbar: []
        , flags: {}
        , usersCache: []
        , events: {
//            'click [type=submit]': 'submit'
            'click [data-task=load]': 'load'
            , 'click [data-task="refresh-view"]': 'reLoad'
            , 'click [data-task=change-video]': 'changeVideo'
            , 'click #storagefiles tbody tr': 'setVideo'
            , 'click [data-task=change-category]': 'changeCatgory'
            , 'click [data-task=select-folder]': 'setCategory'
            , 'click [data-task=return-item]': 'returnItem'
            , 'click [data-seek]': 'seekPlayer'
            , 'submit .chat-form': 'insertComment'
            , 'click .open-item': 'openItem'
            , 'click .item-forms .nav-tabs.tabs-left li a': 'loadTab'
            , 'submit .categories-metadata-form': 'saveMetadata'
            , 'click [data-task="send-telegram"]': 'sendTelegram'
            , 'click [data-task="publish-website"]': 'publishWebsite'
            , 'change [data-task="change-mediausage-mode"]': 'mediaUsageChangeMode'
            , 'click [data-task="apply-mediausage-filters"]': 'mediaUsageFilter'
            , 'click .media-options a': 'UpdateMediaParams'
            , 'submit #person-search-form': 'searchPersons'
            , 'click [data-task="search-persons"]': 'searchPersons'
            , 'click [data-task="select-person"]': 'selectPerson'
            , 'click [data-task="delete-person"]': 'deletePerson'
            , 'click [data-task="submit-persons"]': 'submitPersons'
            , 'click [data-task="edit-subjects"]': 'editSubjects'
            , 'click [data-task="edit-broadcast-date"]': 'editBroadcastDate'
            , 'click [data-task="edit-allowed-broadcast-count"]': 'editAllowedBroadcastCount'
            , 'click [data-task="edit-tags"]': 'editTags'
            , 'click [data-task="save-subjects"]': 'saveSubjects'
            , 'click [data-task="save-broadcast-date"]': 'saveBroadcastDate'
            , 'click [data-task="save-allowed-broadcast-count"]': 'saveAllowedBroadcastCount'
            , 'click [data-task="save-tags"]': 'saveTags'
            , 'click [href="#chats-history"]': 'loadHistory'
            , 'click #chats-history tr[data-id]': 'loadHistoryItem'

            , 'click [data-task="open-assign-modal"]': 'openAssignModal'
            , 'click [data-task="assign-item"]': 'assign'
            , 'click [name="to-type"]': 'changeSendRecipient'
            , 'change [name="ToGroupId"]': 'updateUserList'
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
            new TasksModel({}).save(null, {
                data: JSON.stringify(data),
                contentType: 'application/json',
                processData: false,
                success: function (res) {
                    toastr['success']('مدیا با موفقیت ارجاع شد.', 'ارجاع مدیا', Config.settings.toastr);
                    $('#assign-modal').modal('hide');
                }
            });
        }
        , openAssignModal: function (e) {
            e.preventDefault();
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

        , hotkeys: function () {
            $.hotkeys.options.filterInputAcceptingElements = false;
            $.hotkeys.options.filterTextInputs = false;
            for (var key of Object.keys(keysMap)) {
                this.initShortCutKey(key);
            }
        }
        , initShortCutKey: function (type) {
            var self = this;
            $(document).on('keydown', null, keysMap[type].key, function (e) {
                switch (type) {
                    case 'markStart':
                        $('[data-task="clip-start"]').trigger('click');
                        break;
                    case 'markEnd':
                        $('[data-task="clip-end"]').trigger('click');
                        $('#chats [name="Body"]').trigger('focus');
                        $('html, body').animate({
                            scrollTop: $('#chats').offset().top
                        }, 600);
                        break;
                    case 'togglePlayback':
                        if ($(e.target).is('input') || $(e.target).is('textarea') || $(e.target).is('select')) {
                            return true;
                        }
                        self.player.play();
                        break;
                    case 'stop':
                        self.player.stop();
                        break;
                    case 'speedUp':
                        if ($('.speed').find('li.active').next().is('li')) {
                            $('.speed').find('li.active').next().trigger('click');
                        }
                        break;
                    case 'speedDown':
                        if ($('.speed').find('li.active').prev().is('li')) {
                            $('.speed').find('li.active').prev().trigger('click');
                        }
                        break;
                    case 'showPersons':
                        if ($.trim($('#tab-persons').html()) !== '') {
                            if ($('#persons-overlay').length) {
                                $('#persons-table').prependTo('#persons-container');
                                $('#persons-overlay').remove();
                            } else {
                                $('#persons-table').wrap('<div id="persons-overlay"></div>');
                                $('#persons-overlay').prepend('<h3>عوامل</h3>');
                                $('#persons-overlay').appendTo('.basic-details');
                            }
                        }
                        break;
                }
                e.preventDefault();
                return false;
            });
        }

        , saveTags: function () {
            var id = this.getId();
            var self = this;
            var data = {tags: [], subjects: []};
            $('[name="Tags"]').find('option:selected').each(function () {
                data.tags.push({id: ~~$(this).attr('value')});
            });
            new MediaitemModel({overrideUrl: 'shotlist/metadata', id: id}).save(null, {
                data: JSON.stringify(data),
                contentType: 'application/json',
                processData: false,
                success: function (res) {
                    toastr['success']('کلیدواژه‌ها با موفقیت تغییر کرد.', '', Config.settings.toastr);
                    self.reLoad();
                }
            });
        }
        , editTags: function (e) {
            this.getTags();
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
        , editAllowedBroadcastCount: function () {
            var $form = $('form.allowed-broadcast-count-form');
            $form.toggleClass('hide');
        }
        , saveAllowedBroadcastCount: function () {
            var self = this;
            var id = this.getId();
            var $form = $('form.allowed-broadcast-count-form');
            var params = {
                key: 'AllowedBroadcastCount',
                value: +$form.find('input[data-type="allowed-broadcast-count"]').val()
            };
            this.handleEditables(id, params, function () {
                toastr['success']('تعداد مجاز پخش با موفقیت تغییر کرد.', '', Config.settings.toastr);
                self.reLoad();
            });
        }
        , saveSubjects: function () {
            var id = this.getId();
            var self = this;
            var data = {tags: [], subjects: []};
            $('[name="Subjects"]').find('option:selected').each(function () {
                data.subjects.push({id: ~~$(this).attr('value')});
            });
            new MediaitemModel({overrideUrl: 'shotlist/metadata', id: id}).save(null, {
                data: JSON.stringify(data),
                contentType: 'application/json',
                processData: false,
                success: function (res) {
                    toastr['success']('محورها با موفقیت تغییر کرد.', '', Config.settings.toastr);
                    self.reLoad();
                }
            });
        }
        , saveBroadcastDate: function () {
            var self = this;
            var id = this.getId();
            var $form = $('form.broadcast-date-form');
            var $datePicker = $form.find(".datepicker");
            var params = {
                key: 'RecommendedBroadcastDate',
                value: Global.jalaliToGregorian($datePicker.val()) + 'T00:00:00'
            };
            this.handleEditables(id, params, function () {
                toastr['success']('تاریخ پخش با موفقیت تغییر کرد.', '', Config.settings.toastr);
                self.reLoad();
            });
        }
        , enableTagsEdit: function (tags) {
            if (!this.tags.length) {
                this.tags = tags;
            }
            var self = this;
            var $select = $('select[data-type="tags"]');
            $select.empty();
            $.each(tags, function () {
                $select.append('<option value="' + this.id + '">' + this.title + '</option>');
            });
            $.each(this.currentData.ShotList[0].Tags, function () {
                $select.find('[value="' + this.id + '"]').attr('selected', 'selected');
            });
            setTimeout(function () {
                $select.parents('form:first').removeClass('hide');
                self.handleSelect2Inputs($select);
            }, 250);
        }
        , editSubjects: function (e) {
            this.getSubjects();
        }
        , editBroadcastDate: function (e) {
            e.preventDefault();
            var $form = $('form.broadcast-date-form');
            var $datePicker = $form.find(".datepicker");
            $form.toggleClass('hide');
            if ($datePicker.data('datepicker') == undefined) {
                $datePicker.pDatepicker(CONFIG.settings.datepicker);
            }
        }
        , getSubjects: function (callback) {
            var self = this;
            if (this.subjects.length) {
                this.enableSubjectsEdit(this.subjects);
            } else {
                new SharedModel({overrideUrl: 'share/subjects'}).fetch({
                    success: function (subjects) {
                        subjects = subjects.toJSON();
                        self.enableSubjectsEdit(subjects);
                        if (typeof callback === "function")
                            callback(subjects);
                    }
                });
            }
        }
        , enableSubjectsEdit: function (subjects) {
            if (!this.subjects.length) {
                this.subjects = subjects;
            }
            var self = this;
            var $select = $('select[data-type="subjects"]');
            $select.empty();
            $.each(subjects, function () {
                $select.append('<option value="' + this.id + '">' + this.title + '</option>');
            });
            $.each(this.currentData.ShotList[0].Subjects, function () {
                $select.find('[value="' + this.id + '"]').attr('selected', 'selected');
            });
            setTimeout(function () {
                $select.parents('form:first').removeClass('hide');
                self.handleSelect2Inputs($select);
            }, 250);
        }
        , handleSelect2Inputs: function ($select) {
            // $("select.select2").each(function () {
            if ($select.hasClass("select2-hidden-accessible"))
                $select.select2('destroy');
            $select.select2({dir: "rtl", multiple: true, tags: false, width: '100%', dropdownParent: $('body')});
            // });
        }
        , UpdateMediaParams: function (e) {
            e.preventDefault();
            var self = this;
            // var id = this.getId();
            var $li = $(e.target).parents('li:first');
            var params = {task: $li.data('task'), value: $li.data('value'), id: this.getId()};
            MediaOptionsHelper.update(params, function (response) {
                if (response.error !== false)
                    toastr.error(response.error, 'خطا', Config.settings.toastr);
                else {
                    toastr.success('عملیات با موفقیت انجام شد', 'تغییر وضعیت', Config.settings.toastr);
                    self.reLoad();
                }
            });
        }
        , sendTelegram: function (e) {
            e.preventDefault();
            var self = this;
            var data = {
                MediaId: self.getId()
                , Params: null
                , DestApp: 'telegram'
                , Cmd: 'publish'
            };
            new MediaitemModel({overrideUrl: Config.api.social}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
                , success: function (model, response) {
                    toastr.success('با موفقیت انجام شد', 'ارسال به تلگرام', Config.settings.toastr);
//                    self.loadComments({query: 'externalid=' + data[0].externalid + '&kind=1', overrideUrl: Config.api.comments});
                }
            });
        }
        , publishWebsite: function (e) {
            e.preventDefault();
            var self = this;
            var data = {
                MediaId: self.getId()
                , Params: null
                , DestApp: 'website'
                , Cmd: 'publish'
            };
            new MediaitemModel({overrideUrl: Config.api.social}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
                , success: function (model, response) {
                    toastr.success('با موفقیت انجام شد', 'انتشار روی وب‌سایت', Config.settings.toastr);
                }
            });
        }
        , saveMetadata: function (e) {
            e.preventDefault();
            var self = this;
            var data = $(e.target).serializeObject();
            var $form = $(".categories-metadata-form");
            for (var key in data) {
                var type = $("[name=" + key + "]").attr('data-validation');
                data[key] = self.handleData(key, data[key], type);
            }
            new MetadataModel().save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات برنامه', Config.settings.toastr);
                }
            });
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
        , seekPlayer: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            this.player.seek($el.attr('data-seek'), this.playerInstance);
            $('html, body').animate({
                scrollTop: 0
            }, 600);
        }
        , openItem: function (e) {
            var $el = $(e.currentTarget);
            var id = $el.attr("data-id");
            window.open('/resources/mediaitem/' + id);
        }
        , returnItem: function (e) {
            var $el = $(e.currentTarget);
            var id = $el.attr('data-id');
            this.handleEditables(id, {
                key: 'State'
                , value: 0
            }, this.returnItemCallback);
        }
        , returnItemCallback: function () {
            window.setTimeout(function () {
                Backbone.history.loadUrl();
            }, 500);
            return false;
        }
        , insertComment: function (e) {
            var self = this;
            var $form = $(e.currentTarget);
            var data = [];
            data.push($form.serializeObject());
            data[0].externalid = this.getId();
            data[0].Data = JSON.stringify({
                start: $form.find('[data-type="clip-start"]').val()
                , end: $form.find('[data-type="clip-end"]').val()
            });
            new ReviewModel({overrideUrl: Config.api.comments}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
                , success: function (model, response) {
                    toastr.success('success', 'saved', Config.settings.toastr);
                    self.loadComments({query: 'externalid=' + data[0].externalid + '&kind=1', overrideUrl: Config.api.comments});
                    self.loadSidebarComments({query: 'externalid=' + data[0].externalid + '&kind=1', overrideUrl: Config.api.comments});
                }
            });
            e.preventDefault();
            return false;
        }
        , loadComments: function (params) {
            var self = this;
            new ReviewModel(params).fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    var template = Template.template.load('resources/review', 'comments.partial');
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $("#comments-container").html(output);
                        // After render
                        if ($("table").find(".scroller").length)
                            $("table").find(".scroller").slimScroll({
                                height: $("table").find(".scroller").height()
                                , start: 'bottom'
                            });
                        if ($("input.time").length)
                            $("input.time").mask('H0:M0:S0', {
                                placeholder: '00:00:00', translation: {'H': {pattern: /[0-2]/}, 'M': {pattern: /[0-5]/}, 'S': {pattern: /[0-5]/}}
                            });
                    });
                }
            });
        }
        , loadSidebarComments: function (params) {
            var self = this;
            new MediaModel(params).fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    var template = Template.template.load('resources/review', 'comments-with-history.partial');
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $("#chats").html(output);
                        // After render
                        if ($("#chats").find(".scroller").length)
                            $("#chats").find(".scroller").slimScroll({
                                height: $("#chats").find(".scroller").height()
                                , start: 'bottom'
                            });
                        if ($("input.time").length)
                            $("input.time").mask('H0:M0:S0', {
                                placeholder: '00:00:00', translation: {'H': {pattern: /[0-2]/}, 'M': {pattern: /[0-5]/}, 'S': {pattern: /[0-5]/}}
                            });
                    });
                }
            });
        }
        , loadHistoryItem: function (e) {
            e.preventDefault();
            var $tr = $(e.target).is('tr') ? $(e.target) : $(e.target).parents('tr[data-id]:first');
            // if (Config.mediaLinkTarget === '_blank') {
            var win = window.open('/resources/mediaitem/' + $tr.attr('data-id') + '#review', '_blank');
            win && win.focus();
            // } else {
            //     !Backbone.History.started && Backbone.history.start({pushState: true});
            //     new Backbone.Router().navigate('/resources/mediaitem/' + $tr.attr('data-id') + '#review', {trigger: true});
            // }
        }
        , loadHistory: function (e) {
            var self = this;
            var $target = $(e.target);
            if ($('#chats-history').is(':empty')) {
                var params = {
                    path: 'comments/' + self.getId()
                    , overrideUrl: Config.api.mediaversions
                };
                var model = new MediaModel(params);
                model.fetch({
                    success: function (data) {
                        var items = self.prepareItems(data.toJSON(), params);
                        items = Object.keys(items).map(function (k) {
                            return items[k];
                        });
                        items = items.reverse();
                        var template = Template.template.load('resources/review', 'comments-history.partial');
                        template.done(function (data) {
                            var handlebarsTemplate = Template.handlebars.compile(data);
                            var output = handlebarsTemplate(items);
                            $('#chats-history').html(output);
                        });
                    }
                });
            }
        }
        , setVideo: function (e) {
            e.preventDefault();
            var self = this;
            var $item = $(e.currentTarget);
            bootbox.confirm({
                message: "آیتم فعلی حذف و آیتم جدید با ویدیوی انتخاب شده جایگزین خواهد شد. آیا مطمئن هستید؟<br />نکته: پس از جابجایی موفقیت‌آمیز به آیتم جدید هدایت خواهید شد."
                , buttons: {
                    confirm: {className: 'btn-success'}
                    , cancel: {className: 'btn-danger'}
                }
                , callback: function (results) {
                    if (results) {
                        new IngestModel({id: self.getId(), overrideUrl: Config.api.media}).save({
                            FileName: $item.attr('data-filename'),
                            Duration: $item.attr('data-duration')
                        }, {
                            error: function (e, data) {
                                toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                            }
                            , success: function (d) {
                                var id = d.toJSON()[0]["Id"];
                                if (+id == id) {
                                    toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات برنامه', Config.settings.toastr);
                                    $(self.modal_storage).find("form").trigger('reset');
                                    $(self.modal_storage).modal('hide');
                                    !Backbone.History.started && Backbone.history.start({pushState: true});
                                    new Backbone.Router().navigate('resources/mediaitem/' + id, {trigger: true});
                                }
                            }
                        });
                    }
                }
            });
        }
        , changeVideo: function (e) {
            e.preventDefault();
            var self = this;
            var params = {path: '/files'};
            var template = Template.template.load('resources/ingest', 'storagefiles.partial');
            var $modal = $(self.modal_storage);
            var model = new IngestModel(params);
            model.fetch({
                data: params
                , success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    for (var key in items) {
                        items[key].FileName = items[key].FileName.replace('\\\\192.168.1.5\\ingest$\\', '');
                    }
                    template.done(function (params) {
                        var handlebarsTemplate = Template.handlebars.compile(params);
                        var output = handlebarsTemplate(items);
                        $modal.find(".modal-content").html(output).promise().done(function () {
                            $modal.modal('show');
                        });
                    });
                }
            });
        }
        , changeCatgory: function (e) {
            e.preventDefault();
            var self = this;
            var id = $(e.currentTarget).attr('data-id');

            var style = $("#mediaitem-page").find("style");
            if (style.length)
                style.empty().text('[aria-labelledby="' + id + '_anchor"] a { background: lightgreen !important }');
            else
                $("#mediaitem-page").prepend('<style>[aria-labelledby="' + id + '_anchor"] a { background: lightgreen !important }</style>');

            var params = {path: '/getparents/' + $(e.currentTarget).attr('data-id')};
            var $modal = $(self.modal_tree);
            var model = new CategoriesModel(params);
            model.fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    var path = $.map(items, function (value, index) {
                        return [value];
                    }).reverse();
                    STORAGE.setItem("tree", '{"state":{"core":{"open":' + JSON.stringify(path) + ',"scroll":{"left":0,"top":0},"selected":["' + id + '"]}},"ttl":false,"sec":' + +new Date() + '}');
                    $modal.modal('show');
                    if ($("#tree").length) {
                        self.treeInstance = new Tree($("#tree"), Config.api.tree, self, {contextmenu: false});
                        self.treeInstance.render();
                    }
                }
            });
        }
        , setCategory: function (e) {
            e.preventDefault();
            var self = this;
            bootbox.confirm({
                message: "برنامه تعویض خواهد شد. آیا مطمئن هستید؟"
                , buttons: {confirm: {className: 'btn-success'}, cancel: {className: 'btn-danger'}}
                , callback: function (results) {
                    if (results) {
                        self.handleEditables(self.getId(), {
                            key: 'MetaCategoryId'
                            , value: self.treeInstance.selected.id
                        }, self.updateCategory);
                    }
                }
            });
        }
        , updateCategory: function (id, params, that) {
            var self = that;
            $(self.modal_tree).modal('hide');
            var $item = $('[data-type="category"]');
            $item.text(self.treeInstance.selected.text);
            $item.parent().is('a') && $item.parent().attr('href', '/resources/media/?startdate=1970-01-01&catid=' + params.value);
            $item.next().attr('data-id', params.value);
        }
        , submit: function () {
            var $this = this;
            if (!helper.beforeSave())
                return;
            var data = this.prepareSave();
            new MediaitemModel().save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'ذخیره کنداکتور', Config.settings.toastr);
                    $this.reLoad();
                }
            });
        }
        , initEditables: function () {
            var self = this;
            var editable = new Editable({service: Config.api.url + Config.api.media}, self);
            editable.init();
        }
        , handleEditables: function (id, params, callback) {
            var self = this;
            new MediaitemModel({id: id}).save(params, {
                patch: true
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
                , success: function (model, response) {
                    toastr.success('عملیات با موفقیت انجام شد', 'تغییر اطلاعات', Config.settings.toastr);
                    self.loadTab(null, true);
                    // reset editable field
                    if (typeof callback !== "undefined")
                        callback(id, params, self);
                }
            });
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            console.info('Loading items');
            var params = {};
            params.q = $("[name=q]").val();
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , loadTab: function (e, force) {
            var self = this;
            if (typeof e !== "undefined" && e !== null) {
                e.preventDefault();
                var el = $(e.currentTarget).parent();
            } else
                var el = $(".item-forms .nav-tabs li.active");
            if (typeof force !== "undefined" && force !== true)
                return;
            var tmpl, model, data;
            var $container = $(el.find("a").attr('href'));
            var service = el.attr('data-service');
            switch (service) {
                default:
                    return false;
                    break;
                case 'review':
                    var params = {
                        query: 'externalid=' + self.getId() + '&kind=1'
                        , overrideUrl: Config.api.comments
                    };
                    tmpl = ['resources/review', 'review.partial'];
                    model = 'sequential-comments';
                    break;
                case 'workflow':
                    var params = {query: 'masterid=' + self.getId() + '&touserid=0&togroupid=0&jobid=0&status=0'};
                    tmpl = ['user/tasks', 'workflow.partial'];
                    model = new TasksModel(params);
                    break;
                case 'versions':
                    var params = {
                        id: self.getId()
                        , overrideUrl: Config.api.mediaversions
                    };
                    tmpl = ['resources/mediaitem', 'versions.partial'];
                    model = new MediaitemModel(params);
                    break;
                case 'broadcast':
                    var params = {
                        overrideUrl: Config.api.schedule + '/mediausecount?id=' + self.getId()
                    };
                    tmpl = ['resources/mediaitem', 'broadcast.partial'];
                    model = new MediaitemModel(params);
                    break;
                case 'persons':
                    var params = {
                        overrideUrl: Config.api.mediapersons + '/?type=1&externalid=' + self.getId()
                    };
                    tmpl = ['resources/mediaitem', 'persons.partial'];
                    model = new MediaitemModel(params);
                    break;
                case 'metadata':
                    var catid = $('[data-task="change-category"]').attr('data-id');
                    var masterId = self.getId();
                    var params = {query: 'MasterId=' + masterId, type: 1};
                    tmpl = ['resources/mediaitem', 'mediaitem.metadata.partial'];
                    model = new MetadataModel(params);
                    break;
                case 'rush':
                    var params = {
                        id: $("tr[data-type]").data('type') === 3 ? $("tr[data-pid]").data('pid') : self.getId()
                        , overrideUrl: Config.api.versionsbypid
                    };
                    tmpl = ['resources/mediaitem', 'versions.partial'];
                    model = new MediaitemModel(params);
                    break;
            }
            if (tmpl && model) {
                var template = Template.template.load(tmpl[0], tmpl[1]);
                if (typeof model !== "string" || model.indexOf('sequential') === -1) {
                    model.fetch({
                        success: function (items) {
                            items = self.prepareItems(items.toJSON(), params);
                            template.done(function (data) {
                                if (service === "metadata") {
                                    var mediaItemsParams = {query: $.param({categoryId: catid, offset: 0, count: self.defaultListLimit})};
                                    var itemsModel = new MediaModel(mediaItemsParams);
                                    itemsModel.fetch({
                                        success: function (mediaItems) {
                                            mediaItems = self.prepareItems(mediaItems.toJSON(), mediaItemsParams);
                                            items.media = mediaItems;
                                            var handlebarsTemplate = Template.handlebars.compile(data);
                                            var output = handlebarsTemplate(items);
                                            $container.html(output).promise().done(function () {
                                                // After metadata form loaded
                                                self.attachDatepickers();
                                                var overrideConfig = {search: true, showPaginationSwitch: false, pageSize: 20};
                                                $(".categories-metadata-form table").bootstrapTable($.extend({}, Config.settings.bootstrapTable, overrideConfig));
                                            });
                                        }
                                    });
                                } else {
                                    var handlebarsTemplate = Template.handlebars.compile(data);
                                    if (service === "broadcast")
                                        items = {items: items, params: {}};
                                    if (service === 'persons')
                                        items = {items: items, cols: true, placeholder: false};
                                    var output = handlebarsTemplate(items);
                                    $container.html(output).promise().done(function () {
                                        if ($container.find(".scroller").length)
                                            $container.find(".scroller").slimScroll({
                                                height: $container.find(".scroller").height()
                                                , start: 'bottom'
                                            });
                                        if ($("input.time").length)
                                            $("input.time").mask('H0:M0:S0', {
                                                placeholder: '00:00:00', translation: {'H': {pattern: /[0-2]/}, 'M': {pattern: /[0-5]/}, 'S': {pattern: /[0-5]/}}
                                            });
                                    });
                                }
                            });
                        }
                    });
                } else {
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate({item: true});
                        $container.html(output).promise().done(function () {
                            if (model.split('-')[1] === "comments")
                                self.loadComments(params);
                            self.loadSidebarComments(params);
                        });
                    });
                }
            }
        }
        , getId: function () {
            return Backbone.history.getFragment().split("/").pop().split("?")[0];
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('resources/mediaitem', 'mediaitem');
            var $container = $(Config.positions.main);
            var id = self.getId();
            var params = {id: +id};
            var model = new MediaitemModel(params);
            model.fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    items = (Object.keys(items).length === 1) ? items[0] : items;
                    self.currentData = items;
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            self.afterRender(items, params);
                        });
                    });
                }
            });
        }
        , getMedia: function (imageSrc) {
            return imageSrc.replace('.jpg', '_lq.mp4');
        }
        , afterRender: function (item, params) {
            var self = this;
            if (location.hash && $('li[data-service="' + location.hash.replace('#', '') + '"]').length) {
                $('li[data-service="' + location.hash.replace('#', '') + '"]').find("a").trigger("click");
                $("html, body").animate({'scrollTop': $('li[data-service="' + location.hash.replace('#', '') + '"]').parents(".portlet").offset().top - 50}, 500);
            } else
                self.loadTab();
            self.initEditables();
            var media = {
                thumbnail: item.Thumbnail
                , video: self.getMedia(item.Thumbnail)
                , duration: item.Duration
            };
            var playerConfig = {
                file: media.video
                , duration: media.duration
                , playlist: [{
                    image: media.thumbnail
                    , sources: [
                        {file: media.video, label: 'LQ', default: true}
                    ]
                }]
            };
            if (typeof Config.HDPlayback === 'undefined' || Config.HDPlayback) {
                playerConfig.playlist[0].sources.push({file: media.video.replace('_lq', '_hq'), label: 'HQ'});
            }
            var player = new Player('#player-container', playerConfig);
            player.render();
            this.player = player;
            this.playerInstance = player.instance;
            this.hotkeys();
            this.loadUsersList();
            this.loadSidebarComments({query: 'externalid=' + this.getId() + '&kind=1', overrideUrl: Config.api.comments})
        }
        , renderToolbar: function () {
            var self = this;
//            if (self.flags.toolbarRendered)
//                return;
            var elements = self.toolbar;
            if (elements.length) {
                var toolbar = new Toolbar();
                $.each(elements, function () {
                    var method = Object.getOwnPropertyNames(this);
                    toolbar[method](this[method]);
                });
                toolbar.render();
//                self.flags.toolbarRendered = true;
            }
        }
        , prepareItems: function (items, params) {
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
            return items;
        }
        , prepareContent: function () {
            this.renderToolbar();
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
                        , timePicker: {enabled: true}
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
        , mediaUsageChangeMode: function (e) {
            var self = this;
            var val = $(e.target).val();
            switch (val) {
                case 'all':
                    $(".table-tools .datepicker").prop('disabled', true);
                    break;
                case 'daterange':
                    $(".table-tools .datepicker").prop("disabled", false);
                    self.attachDatepickers();
                    break;
            }
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
        , searchPersons: function (e) {
            e.preventDefault();
            var self = this;
            var data = $.param({q: $('#person-q').val(), type: $('[data-type="person-type"]').val()});
            var params = {overrideUrl: Config.api.persons};
            new MediaitemModel(params).fetch({
                data: data
                , success: function (items) {
                    var items = self.prepareItems(items.toJSON(), params);
                    var template = Template.template.load('resources/persons', 'person-results.partial');
                    var $container = $('#person-search-results');
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output);
                    });
                }
            });
        }
        , getPersonResultItemParams: function ($row) {
            return params = {
                id: $row.data('id')
                , name: $row.find('[data-type="name"]').text()
                , family: $row.find('[data-type="family"]').text()
                , type: $row.find('select').val()
            }
        }
        , selectPerson: function (e) {
            e.preventDefault();
            var params = this.getPersonResultItemParams($(e.target).parents('tr:first'));
            var foundDuplicate = false;
            $('#persons-table tbody tr').each(function () {
                if (~~$(this).attr('data-id') == ~~params.id)
                    foundDuplicate = true;
            });
            if (foundDuplicate)
                return false;
            $clonedRow = $('#persons-table tfoot tr:first').clone();
            $clonedRow.attr('data-id', params.id)
            $clonedRow.find('[data-type="id"]').text(params.id);
            $clonedRow.find('[data-type="name"]').text(params.name);
            $clonedRow.find('[data-type="family"]').text(params.family);
            $clonedRow.find('select').val(params.type);
            $('#persons-table tbody').append($clonedRow);
        }
        , deletePerson: function (e) {
            e.preventDefault();
            var $row = $(e.target).parents('tr:first');
            bootbox.confirm({
                message: "مورد انتخابی حذف خواهد شد، مطمئن هستید؟"
                , buttons: {
                    confirm: {className: 'btn-success'}
                    , cancel: {className: 'btn-danger'}
                }
                , callback: function (results) {
                    if (results) {
                        $row.remove();
                    }
                }
            });
        }
        , submitPersons: function (e) {
            e.preventDefault();
            var self = this;
            var items = [];
            $('#persons-table tbody tr').each(function () {
                // items.push({id: $(this).attr('data-id'), name: '', family: '', type: ''});
                items.push(~~$(this).attr('data-id'));
            });
            new MediaitemModel({overrideUrl: Config.api.mediapersons + '?type=1&externalid=' + self.getId()}).save(null, {
                data: JSON.stringify(items)
                , contentType: 'application/json'
                , processData: false
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
                , success: function (model, response) {
                    toastr.success('با موفقیت انجام شد', 'ثبت اطلاعات عوامل', Config.settings.toastr);
//                    self.loadComments({query: 'externalid=' + data[0].externalid + '&kind=1', overrideUrl: Config.api.comments});
                }
            });
        }
    });
    return MediaitemView;
});
