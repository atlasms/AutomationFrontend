define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.media.model', 'toastr', 'toolbar', 'pdatepicker', 'reviewHelper', 'player.helper', 'statusbar', 'bootbox', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, Global, MediaModel, toastr, Toolbar, pDatepicker, ReviewHelper, Player, Statusbar, bootbox) {
    var ReviewView = Backbone.View.extend({
        playerInstance: null
        , player: null
        , model: 'MediaModel'
        , toolbar: [
            {'button': {cssClass: 'btn green-jungle pull-right hidden submit fade', text: 'قبول', type: 'button', task: '1', access: '4'}} // accept
            , {'button': {cssClass: 'btn red pull-right hidden submit fade', text: 'رد', type: 'button', task: '2', access: '4'}} // reject
            , {'button': {cssClass: 'btn btn-success', text: 'نمایش', type: 'button', task: 'load_review'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'enddate', value: Global.jalaliToGregorian(persianDate(SERVERDATE).format('YYYY-MM-DD')), addon: true, icon: 'fa fa-calendar'}}
            , {'input': {cssClass: 'form-control datepicker', placeholder: '', type: 'text', name: 'startdate', value: Global.jalaliToGregorian(persianDate(SERVERDATE).subtract('days', 7).format('YYYY-MM-DD')), addon: true, icon: 'fa fa-calendar'}}
        ]
        , statusbar: []
        , flags: {}
        , events: {
            'click .submit': 'submit'
            , 'click [data-task=load_review]': 'load'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'submit .chat-form': 'insertComment'
            , 'click #review-table tbody tr td': 'collapseRow'
            , 'click [data-seek]': 'seekPlayer'
            , 'click #review-table tbody tr td a': function (e) {
                e.stopPropagation();
            }
        }
        , seekPlayer: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            this.player.seek($el.attr('data-seek'), this.playerInstance);
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
            $("#toolbar .submit").removeClass('hidden').addClass('in');
            $el.parents("tbody").find("tr").removeClass('active');
            $row.addClass('active');
            var id = $row.attr('data-id');
            if ($(document).find(".preview-pane").length) {
                self.player.remove();
                $(".preview-pane").remove();
            }
            // Loading review partial template
            var template = Template.template.load('resources/review', 'review.partial');
            var params = {query: 'externalid=' + id + '&kind=1', overrideUrl: Config.api.comments};
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $row.after('<tr class="preview-pane"><td colspan="100%">' + output + '</td></tr>').promise().done(function () {
                    if ($row.data('type') === 0) {
                        var player = new Player('#player-container', {
                            duration: media.duration
                            , file: media.video
                            , playlist: [{
                                    image: media.thumbnail
                                    , sources: [
                                        {file: media.video, label: 'LQ', default: true}
                                        , {file: media.video.replace('_lq', '_hq'), label: 'HQ'}
                                    ]
                                }]
                        });
                        player.render();
                        self.player = player;
                        self.playerInstance = player.instance;
                    } else {
                        $('#player-container').empty().append('<figure><img src="' + media.thumbnail.replace('_lq', '_hq') + '" /></figure>');
                    }
                    self.loadComments(params);
                });
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
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
                , success: function (model, response) {
                    toastr.success('success', 'saved', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
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
                                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                                }
                                , success: function (model, response) {
                                    toastr.success('عملیات با موفقیت انجام شد', 'بازبینی', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                                    self.reLoad();
                                }
                            });
                        }
                    }
                });
            } else {
                new MediaModel({id: $("tr.active").attr('data-id')}).save({
                    key: 'State'
                    , value: $(e.currentTarget).attr('data-task')
                }, {
                    patch: true
                    , error: function (e, data) {
                        toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    }
                    , success: function (model, response) {
                        toastr.success('عملیات با موفقیت انجام شد', 'بازبینی', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                        self.reLoad();
                    }
                });
            }
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            console.info('Loading items');
            $("#toolbar .submit").addClass('hidden').removeClass('in');
            var params = this.getToolbarParams();
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
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    if ($("#review-table tbody tr").length)
                        $("#review-table tbody").empty();
                }
            });
        }
        , afterRender: function () {
            this.renderStatusbar();
            ReviewHelper.mask("time");
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
            $(document).on('change', "#toolbar select", function () {
                self.load();
            });
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