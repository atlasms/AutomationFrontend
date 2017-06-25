define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.ingest.model', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper', 'bootstrap/modal', 'cropper'
], function ($, _, Backbone, Template, Config, Global, IngestModel, toastr, Toolbar, Statusbar, pDatepicker, Tree) {
    var PhotosView = Backbone.View.extend({
        $modal: "#crop-modal"
        , $metadataPlace: "#metadata-place"
        , model: 'IngestModel'
        , toolbar: [
            {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
            , {'button': {cssClass: 'btn blue-sharp disabled', text: 'ثبت اطلاعات ', type: 'submit', task: 'add'}}
        ]
        , statusbar: []
        , flags: {}
        , events: {
            'click [type=submit]': 'submit'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click [data-task=refresh]': 'loadStorageFiles'
            , 'click [data-task=open-cropper]': 'openCropper'
            , 'click [data-task=crop-image]': 'setCoordinates'
            , 'click #storagefiles .checkbox': 'handleCheckboxes'
            , 'focus .has-error input': function (e) {
                $(e.target).parents(".has-error:first").removeClass('has-error');
            }
        }
        , handleCheckboxes: function (e) {
            var $checkboxes = $("#storagefiles [type=checkbox]");
            var $parent = $(e.target).parents("tr:first");
            var selectedFound = false;
            if ($(e.target).is(":checked")) {
                !$parent.hasClass('active') && $parent.addClass('active');
                !$parent.next().hasClass('active') && $parent.next().addClass('active');
            } else {
                $parent.removeClass('active');
                $parent.next().removeClass('active');
            }
            $checkboxes.each(function () {
                if (this.checked === true)
                    selectedFound = true;
            });
            if (selectedFound)
                $("[data-task=add]").removeClass('disabled');
            else
                $("[data-task=add]").addClass('disabled');
        }
        , setCoordinates: function (e) {
            var $cropForm = $(e.target).parents("form.crop-info");
            var $row = $("#storagefiles").find("tbody tr").eq(+$cropForm.find('[data-type="row-idx"]').val());
            $cropForm.find("input, textarea, select").each(function () {
                var $input = $(this);
                $row.find("[name=" + $input.attr('name') + "]").val($input.val());
            });
            toastr.info('اطلاعات برش تصویر ثبت شد.', 'برش تصویر', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
            $(this.$modal).modal('hide');
        }
        , openCropper: function (e) {
            var self = this;
            var $row = $(e.target).parents("tr:first");
            var img = $row.data('url');
            $("#cropper").empty().append('<img src="' + img + '" />').promise().done(function () {
                $(self.$modal).on('shown.bs.modal', function () {
                    $(self.$modal).find("[data-type=row-idx]").val($row.index());
                    $("#cropper img:first").cropper(Config.settings.cropper);
                });
                $(self.$modal).modal({backdrop: 'static'});
            });
        }
        , submit: function (e) {
            e.preventDefault();
            var self = this;
            if ($(e.target).hasClass('disabled'))
                return false;
            if (!$("[name=MetaCategoryId]").val())
                $("#path").removeClass('alert-info').addClass('alert-danger');
            var data = this.prepareSave();
            if (data.length < 1)
                return false;
            new IngestModel({overrideUrl: Config.api.media}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function () {
                    toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    $("#storagefiles tr.active [type=checkbox]").prop('disabled', true).parents("tr:first").removeClass('active').addClass('disabled');
//                    self.loadStorageFiles();
                }
            });
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
            var template = Template.template.load('resources/photos', 'photos');
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
            var template = Template.template.load('resources/photos', 'storagephotos.partial');
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
                            $('[type="submit"]').addClass('disabled');
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
            var data = [];
            var i = 0;
            $("#storagefiles").find("tbody tr.active").each(function () {
                var $row = $(this);
                if (!$row.find("input, textarea, select").length)
                    return true;
                data[i] = {};
                $row.find("input, textarea, select").each(function () {
                    var $input = $(this);
                    if (typeof $input.attr("name") !== "undefined") {
                        var value = typeof $input.val() === "undefined" || $input.val() === "" ? null : $input.val();
                        data[i][$input.attr("name")] = value;
                    }
                });
                i++;
            });
            return data;
        }
        , handleTreeCalls: function (routes, path) {
            var self = this;
            var pathId = routes.pop().toString();
            var params = {overrideUrl: Config.api.media};
            $("#path").removeClass('alert-danger').addClass('alert-info');
            $("[data-type=path]").length && $("[data-type=path]").text(path.toString());
            $("[data-type=path-id]").length && $("[data-type=path-id]").val(pathId.toString());

            var template = Template.template.load('resources/photos', 'metadata.partial');
            var $container = $(self.$metadataPlace);
            var model = new IngestModel(params);
            model.fetch({
                data: $.param({categoryId: pathId})
                , success: function (data) {
                    items = self.prepareItems(data.toJSON(), params);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
//                            self.afterRender();
                        });
                    });
                }
//                , error: function (e, data) {
//                    toastr.error(data.responseJSON.Message, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
//                }
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
    return PhotosView;
});