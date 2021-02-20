define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'resources.media.model', 'resources.mediaitem.model', 'users.manage.model', 'toastr', 'toolbar', 'pdatepicker', 'tasks.model', 'resources.metadata.model', 'resources.categories.model', 'shared.model'
], function ($, _, Backbone, Template, Config, Global, moment, MediaModel, MediaitemModel, UsersManageModel, toastr, Toolbar, pDatepicker, TasksModel, MetadataModel, CategoriesModel, SharedModel) {
    var MediaitemPrintView = Backbone.View.extend({
//        el: $(Config.positions.wrapper)
        model: 'MediaitemModel'
        , currentData: {}
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
        , openItem: function (e) {
            var $el = $(e.currentTarget);
            var id = $el.attr("data-id");
            window.open('/resources/mediaitem/' + id);
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
                        // if ($("table").find(".scroller").length)
                        //     $("table").find(".scroller").slimScroll({
                        //         height: $("table").find(".scroller").height()
                        //         , start: 'bottom'
                        //     });

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

                        var reviewsCount = 0;
                        for (var i in items) {
                            if (items[i].Owner !== 1) {
                                reviewsCount++;
                            }
                        }
                        var $navLink = $('.chats-portlet .nav-tabs [href="#chats"]');
                        if ($navLink.find('span').length) {
                            $navLink.find('span').text(reviewsCount.toString());
                        } else {
                            $navLink.append('<span class="badge badge-danger">' + reviewsCount.toString() + '</span>');
                        }
                        $("#chats").html(output).promise().done(function () {
                            // $('ul.chats li:last')[0].scrollIntoView();
                            $('ul.chats').parent()[0].scrollTop = $('ul.chats li:last').offset().top;
                        });
                        // After render
                        // if ($("#chats").find(".scroller").length)
                        //     $("#chats").find(".scroller").slimScroll({
                        //         height: $("#chats").find(".scroller").height()
                        //         , start: 'bottom'
                        //     });
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
            $('#filters').empty();
            $('.filters-cache').appendTo('#filters');
            // $('.filters-cache').unwrap();
            if (location.hash && $('li[data-service="' + location.hash.replace('#', '') + '"]').length) {
                // $('li[data-service="' + location.hash.replace('#', '') + '"]').find("a").trigger("click");
                $("html, body").animate({'scrollTop': $('li[data-service="' + location.hash.replace('#', '') + '"]').parents(".portlet").offset().top - 50}, 500);
            } else {
                // self.loadTab();
                $('.item-forms .nav-tabs li').each(function () {
                    self.loadTab(undefined, true, $(this));
                });
            }
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
