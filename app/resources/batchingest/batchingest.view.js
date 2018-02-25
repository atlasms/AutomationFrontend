define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.ingest.model', 'resources.metadata.model', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'ingestHelper', 'tree.helper', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, Global, IngestModel, MetadataModel, toastr, Toolbar, Statusbar, pDatepicker, IngestHelper, Tree) {
    var BatchIngestView = Backbone.View.extend({
        $modal: "#metadata-form-modal"
        , $metadataPlace: "#metadata-place"
        , model: 'IngestModel'
        , items: {}
        , toolbar: [
            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
            , {'button': {cssClass: 'btn blue-sharp disabled', text: 'ثبت اطلاعات ', type: 'button', task: 'add'}}
        ]
        , defaultListLimit: Config.defalutMediaListLimit
        , statusbar: []
        , flags: {}
        , events: {
            'click [type=submit]': 'submit'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task=add]': 'openAddForm'
            , 'click [data-task=refresh]': 'loadStorageFiles'
            , 'click #storagefiles tbody tr': 'selectRow'
            , 'focus .has-error input': function (e) {
                $(e.target).parents(".has-error:first").removeClass('has-error');
            }
        }
        , submit: function (e) {
            e.preventDefault();
            var self = this;
            var helper = new IngestHelper.validate();
            if (!helper.beforeSave())
                return;
            var data = this.prepareSave();
            if (data[0].SiteTitle.length < 9) {
                toastr.warning('عنوان وب‌سایت کوتاه است', 'ذخیره اطلاعات برنامه', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                return false;
            }
            var cachedItems = self.items;
            var ingestedItems = [];
            for (var i = 0; i < cachedItems.items.length; i++) {
                ingestedItems.push($.extend({}, data[0], {FileName: cachedItems.items[i]['FileName'], Duration: cachedItems.items[i]['Duration']}, {Type: 3}));
            }
            data = ingestedItems;
            if (!data.length)
                return false;

            new IngestModel({overrideUrl: Config.api.media}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function (d) {
                    data = data[0];
                    delete data.Description;
                    delete data.Duration;
                    delete data.EpisodeNumber;
                    delete data.FileName;
                    delete data.Shotlist;
                    delete data.Title;
                    var items = self.prepareItems(d.toJSON(), {});
                    data.MasterId = items[0].Id;
                    data.Type = 1;
                    for (var field in data)
                        data.field = $.trim(data.field);
                    new MetadataModel().save(null, {
                        data: JSON.stringify(data)
                        , contentType: 'application/json'
                        , processData: false
                        , success: function (dd) {
                            toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات برنامه', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                            $(self.$modal).find("form").trigger('reset');
                            $(self.$modal).modal('hide');
                            $("#storagefiles tr.active").addClass('disabled').removeClass('active success');
                        }
                    });
                }
            });
        }
        , openAddForm: function (e) {
            $(this.$modal).modal('toggle');
        }
        , selectRow: function (e) {
            var $el = $(e.target);
            var $row = $el.parents("tr:first");
            if ($row.hasClass("disabled"))
                return false;
            $row.toggleClass('active success');
            var $rows = $row.parent().find("> tr.active");
            this.handleSelectedRows($rows);
            if ($rows.find('tr.active'))
                $('button[data-task=add]').removeClass('disabled');
        }
        , handleSelectedRows: function ($rows) {
            var self = this;
            self.items = {};
            if ($rows.length === 0)
                return false;
            if ($rows.length === 1) {
                var $row = $rows;
                $row.find("[data-prop]").each(function () {
                    if ($('input[name="' + $(this).attr('data-prop') + '"]').length)
                        $('input[name="' + $(this).attr('data-prop') + '"]').val($.trim($(this).text()));
                });
                self.items = {
                    items: [{Duration: $row.data('duration'), FileName: $row.data('filename')}]
                    , duration: $row.data("duration")
                };
            } else {
                $('input[name="FileName"]').val('-BATCH-');
                var params = {duration: 0, items: []};
                $rows.each(function () {
                    params.duration += $(this).data('duration');
                    params.items.push({
                        Duration: $(this).data('duration')
                        , FileName: $(this).data('filename')
                    });
                });
                $('input[name="Duration"]').val(Global.createTime2(params.duration));
                self.items = params;
            }
            return self.items;
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            console.info('Loading items');
            var params = {};
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , render: function (params) {
            var self = this;
            var template = Template.template.load('resources/ingest', 'ingest');
            var $container = $(Config.positions.main);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                $container.html(output).promise().done(function () {
                    self.afterRender();
                });
            });
        }
        , loadStorageFiles: function (e) {
            typeof e !== "undefined" && e.preventDefault();
            var template = Template.template.load('resources/ingest', 'storagefiles.partial');
            var $container = $("#storagefiles-place");
            var params = {path: '/files'};
            var model = new IngestModel(params);
            var self = this;
            $container.fadeOut();
            model.fetch({
                data: $.param(params)
                , success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            $container.stop().fadeIn();
                        });
                    });
                }
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                }
            });
        }
        , afterRender: function () {
            this.loadStorageFiles();
            $("#tree").length && new Tree($("#tree"), Config.api.tree, this).render();
            $("#toolbar button[type=submit]").removeClass('hidden').addClass('in');
            if (typeof this.flags.helperLoaded === "undefined") {
                IngestHelper.init();
                this.flags.helperLoaded = true;
            } else
                IngestHelper.init(true);
            this.renderStatusbar();
        }
        , renderToolbar: function () {
            var self = this;
            var elements = self.toolbar;
            var toolbar = new Toolbar();
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
            return items;
        }
        , prepareContent: function () {
            this.renderToolbar();
        }
        , prepareSave: function () {
            var data = [{}];
            data[0].Shotlist = [];
            $(this.$modal).find("input, textarea, select").each(function () {
                var $input = $(this);
                if (typeof $input.attr("name") !== "undefined") {
                    data[0][$input.attr("name")] = (/^\d+$/.test($input.val()) || ($input.attr("data-validation") === 'digit')) ? +$input.val() : $input.val();
                    if (typeof $input.attr('data-before-save') !== "undefined") {
                        switch ($input.attr('data-before-save')) {
                            case 'prepend-date':
                                data[0][$input.attr("name")] = Global.jalaliToGregorian($(this).parent().find("label").text()) + 'T' + $input.val();
                                break;
                            case 'timestamp':
                                data[0][$input.attr("name")] = Global.processTime($input.val());
                                break;
                        }
                    }
                }
            });
            return data;
        }
        , handleTreeCalls: function (routes, path) {
            var self = this;
            var pathId = routes.pop().toString();
            var params = {overrideUrl: Config.api.media};
            $("[data-type=path]").length && $("[data-type=path]").val(path.toString());
            $("[data-type=path-id]").length && $("[data-type=path-id]").val(pathId.toString());

            var template = Template.template.load('resources/ingest', 'metadata.partial');
            var $container = $(self.$metadataPlace);
            var model = new IngestModel(params);
            model.fetch({
                data: $.param({categoryId: pathId, count: self.defaultListLimit, offset: 0})
                , success: function (data) {
                    items = data.toJSON();
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            $('[data-type="total-count"]').html(items.count);
                        });
                    });
                }
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
    });
    return BatchIngestView;
});