define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.media.model', 'toastr', 'toolbar', 'pdatepicker', 'reviewHelper', 'player.helper', 'statusbar', 'bootbox', 'bootstrap/tab', 'easy-pie-chart'
], function ($, _, Backbone, Template, Config, Global, MediaModel, toastr, Toolbar, pDatepicker, ReviewHelper, Player, Statusbar, bootbox, tab) {
    var ReviewView = Backbone.View.extend({
        playerInstance: null
        , player: null
        , model: 'MediaModel'
        , toolbar: [
            {'button': {cssClass: 'btn green-jungle pull-right hidden submit fade', text: 'تایید گروه', type: 'button', task: '6', access: 134217728}} // accept
            , {'button': {cssClass: 'btn green-jungle pull-right hidden submit fade', text: 'تایید پخش', type: 'button', task: '1', access: 4}} // accept
            , {'button': {cssClass: 'btn red pull-right hidden submit fade', text: 'رد', type: 'button', task: '2', access: 134217728}} // reject
            , {'button': {cssClass: 'btn red pull-right hidden submit fade', text: 'رد', type: 'button', task: '2', access: 4}} // reject
            , {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'load_review'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'enddate', value: Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD')), addon: true, icon: 'fa fa-calendar'}}
            , {
                'input': {
                    cssClass: 'form-control datepicker',
                    placeholder: '',
                    type: 'text',
                    name: 'startdate',
                    value: Global.jalaliToGregorian(persianDate(SERVERDATE).subtract('days', 7).format('YYYY-MM-DD')),
                    addon: true,
                    icon: 'fa fa-calendar'
                }
            }
        ]
        , statusbar: []
        , flags: {}
        , events: {
            'click .submit': 'submit'
            , 'change #toolbar select': 'load'
            , 'click [data-task=load_review]': 'load'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'submit .chat-form': 'insertComment'
            , 'click [data-task="change-comment-state"]': 'changeCommentState'
            , 'click #review-table tbody tr td': 'collapseRow'
            , 'click [data-seek]': 'seekPlayer'
            , 'click [href="#chats-history"]': 'loadHistory'
            , 'click #chats-history tr[data-id]': 'loadHistoryItem'
            , 'click #review-table tbody tr td a:not([role])': function (e) {
                e.stopPropagation();
            }
        }
        , seekPlayer: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            this.player.seek($el.attr('data-seek'), this.playerInstance);
        }
        , loadHistoryItem: function (e) {
            e.preventDefault();
            var $tr = $(e.target).is('tr') ? $(e.target) : $(e.target).parents('tr[data-id]:first');
            if (Config.mediaLinkTarget === '_blank') {
                var win = window.open('/resources/mediaitem/' + $tr.attr('data-id') + '#versions', '_blank');
                win && win.focus();
            } else {
                !Backbone.History.started && Backbone.history.start({pushState: true});
                new Backbone.Router().navigate('/resources/mediaitem/' + $tr.attr('data-id') + '#versions', {trigger: true});
            }
        }
        , loadHistory: function (e) {
            var self = this;
            var $target = $(e.target);
            if ($('#chats-history').is(':empty')) {
                var params = {
                    path: 'comments/' + $target.parents('tr.preview-pane:first').prev().attr('data-id')
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
        , collapseRow: function (e) {
            var self = this;
            var $el = $(e.target);
            var $row = ($(e.target).is("tr")) ? $(e.target) : $(e.target).parents("tr:first");
            var media = {
                thumbnail: $row.attr('data-thumbnail')
                , video: $row.attr('data-media')
                , duration: $row.attr('data-duration')
            };
            if ($row.hasClass('active') || $row.hasClass('preview-pane') || $row.parents(".preview-pane").length || typeof media.video === "undefined")
                return;
            $("#toolbar .submit").not('[disabled]').removeClass('hidden').addClass('in');
            $el.parents("tbody").find("tr").removeClass('active');
            $row.addClass('active');
            var id = $row.attr('data-id');
            if ($(document).find(".preview-pane").length) {
                self.player.remove();
                $(".preview-pane").remove();
            }
            // Loading review partial template
            var template = Template.template.load('resources/review', 'review-tabs.partial');
            var params = {query: 'externalid=' + id + '&kind=1', overrideUrl: Config.api.comments};
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $row.after('<tr class="preview-pane"><td colspan="100%">' + output + '</td></tr>').promise().done(function () {
                    if ($row.data('type') === 0) {
                        var playerConfig = {
                            duration: media.duration
                            , file: media.video
                            , playlist: [{
                                image: media.thumbnail
                                , sources: [
                                    {file: media.video, label: 'LQ', default: true}
                                ]
                            }]
                        };
                        if (typeof Config.HDPlayback === 'unedfined' || Config.HDPlayback) {
                            playerConfig.playlist[0].sources.push({file: media.video.replace('_lq', '_hq'), label: 'HQ'});
                        }
                        var player = new Player('#player-container', playerConfig);
                        player.render();
                        self.player = player;
                        self.playerInstance = player.instance;
                    } else {
                        $('#player-container').empty().append('<figure><img src="' + media.thumbnail.replace('_lq', '_hq') + '" /></figure>');
                    }
                    $("#media-desc").append('<p>' + $row.find('small').html() + '</p>');
                    self.loadComments(params);
                });
            });
        }
        , changeCommentState: function (e) {
            var self = this;
            var $button = $(e.target).is('button') ? $(e.target) : $(e.target).parents('button:first');
            var commentId = $button.parents('li:first').attr('data-id');
            var externalid = $form.parents(".preview-pane").prev().attr('data-id');
            new ReviewModel({overrideUrl: Config.api.comments, id: commentId}).save({Key: 'state', Value: 1}, {
                patch: true
                , success: function (model, response) {
                    toastr.success('عملیات با موفقیت انجام شد', 'انتشار نظر', Config.settings.toastr);
                    self.loadComments({query: 'externalid=' + externalid + '&kind=1', overrideUrl: Config.api.comments});
                    self.loadSidebarComments({query: 'externalid=' + externalid + '&kind=1', overrideUrl: Config.api.comments});
                }
            });
        }
        , insertComment: function (e) {
            e.preventDefault();
            var self = this;
            var $form = $(e.currentTarget);
            var data = [];
            data.push($form.serializeObject());
            data[0].externalid = $form.parents(".preview-pane").prev().attr('data-id');
            data[0].Data = JSON.stringify({
                start: $form.find('[data-type="clip-start"]').val()
                , end: $form.find('[data-type="clip-end"]').val()
            });
            new MediaModel({overrideUrl: Config.api.comments}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
                , success: function (model, response) {
                    toastr.success('success', 'saved', Config.settings.toastr);
                    // TODO: reload comments
                    var params = {query: 'externalid=' + data[0].externalid + '&kind=1', overrideUrl: Config.api.comments};
                    self.loadComments(params);
                }
            });
            return false;
        }
        , loadComments: function (params) {
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
        , submit: function (e) {
            e.preventDefault();
            var self = this;
            if ($(e.currentTarget).attr('data-task') == 2) {
                bootbox.confirm({
                    message: "آیتم انتخاب شده رد شود؟"
                    , buttons: {
                        confirm: {className: 'btn-success'}
                        , cancel: {className: 'btn-danger'}
                    }
                    , callback: function (results) {
                        if (results) {
                            new MediaModel({id: $("tr.active").attr('data-id')}).save({
                                key: 'State'
                                , value: $(e.currentTarget).attr('data-task')
                            }, {
                                patch: true
                                , error: function (e, data) {
                                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                                }
                                , success: function (model, response) {
                                    toastr.success('عملیات با موفقیت انجام شد', 'بازبینی', Config.settings.toastr);
                                    self.reLoad();
                                }
                            });
                        }
                    }
                });
            } else {

                var params = {
                    key: 'State'
                    , value: $(e.currentTarget).attr('data-task')
                    , id: $("tr.active").attr('data-id')
                };

                var modelParams = {overrideUrl: Config.api.media + '/files', id: params.id};
                new MediaModel(modelParams).fetch({
                    success: function (items) {
                        var files = Global.objectListToArray(self.prepareItems(items.toJSON(), modelParams));
                        var check = Global.checkMediaFilesAvailability(files);
                        if (check) {
                            self.setMediaParam(params);
                        } else {
                            toastr.error('پیش از اتمام کانورت مدیا امکان تغییر وضعیت وجود ندارد.', 'خطا', Config.settings.toastr);
                        }
                        return;
                    }
                });


            }
        }
        , setMediaParam: function (params) {
            var self = this;
            new MediaModel({id: params.id}).save(params, {
                patch: true
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
                , success: function (model, response) {
                    toastr.success('عملیات تغییر وضعیت با موفقیت انجام شد', 'بازبینی', Config.settings.toastr);
                    self.reLoad();
                }
            });
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            console.info('Loading items');
            $("#toolbar .submit").addClass('hidden').removeClass('in');
            var params = this.getToolbarParams();
            if (!params.state || params.state === '') {
                params.state = -1;
            }
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , getToolbarParams: function () {
            var params = {
                state: $("#toolbar [name=state]").val()
                , type: $("#toolbar [name=type]").val()
                , startdate: Global.jalaliToGregorian($("#toolbar [name=startdate]").val()) + 'T00:00:00'
                , enddate: Global.jalaliToGregorian($("#toolbar [name=enddate]").val()) + 'T23:59:59'
            };
            return params;
        }
        , render: function (params) {
            /*$(document).on('click', '[data-toggle="tab"]', function (e) {
                alert();
                e.preventDefault();
                $($(this).attr('href')).tab('show');
            });*/
            if (typeof params === "undefined")
                var params = this.getToolbarParams();
            var template = Template.template.load('resources/review', 'review');
            var $container = $(Config.positions.main);
            var model = new MediaModel(params);
            var self = this;
            model.fetch({
                data: (typeof params !== "undefined") ? $.param(params) : null
                , success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            self.afterRender();
                        });
                    });

                }
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                    if ($("#review-table tbody tr").length)
                        $("#review-table tbody").empty();
                }
            });
        }
        , afterRender: function () {
            this.renderStatusbar();
            ReviewHelper.mask("time");

            window.setTimeout(function () {
                var $charts = $('.chart');
                $charts.each(function () {
                    $(this).easyPieChart({
                        size: 48,
                        scaleColor: false,
                        lineWidth: 2,
                        animate: {
                            duration: 1000,
                            enabled: true
                        },
                        onStep: function (from, to, percent) {
                            $(this.el).find('.percent').text(Math.round(percent));
                        }
                    });
                });
            }, 500);
        }
        , renderToolbar: function () {
            var self = this;
            var toolbar = new Toolbar();
            var stateSelect = toolbar.getDefinedToolbar(2, 'state');
            var typeSelect = toolbar.getDefinedToolbar(47, 'type');
            var elements = $.merge($.merge($.merge([], self.toolbar), stateSelect), typeSelect);
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
            $('[data-type="state"]').val('0');
            var $datePickers = $(".datepicker");
            var datepickerConf = {
                onSelect: function () {
                    self.load();
                    $datePickers.blur();
                }
            };
            $.each($datePickers, function () {
                // TODO: Set default value to datepicker
                $(this).pDatepicker($.extend({}, CONFIG.settings.datepicker, datepickerConf));
            });
        }
        , renderStatusbar: function () {
            var elements = this.statusbar;
            var statusbar = new Statusbar();
            $.each(elements, function () {
                statusbar.addItem(this);
            });
            statusbar.render();
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
    });
    return ReviewView;
});
