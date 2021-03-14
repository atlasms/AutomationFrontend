define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.ingest.model', 'resources.metadata.model', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'ingestHelper', 'tree.helper', 'bootbox', 'select2', 'shared.model', 'bootstrap/modal'
], function ($, _, Backbone, Template, Config, Global, IngestModel, MetadataModel, toastr, Toolbar, Statusbar, pDatepicker, IngestHelper, Tree, bootbox, select2, SharedModel) {
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
            , 'click [name=select-all]': 'selectStorageFiles'
            , 'click #storagefiles tbody tr': 'selectRow'
            , 'focus .has-error input': function (e) {
                $(e.target).parents(".has-error:first").removeClass('has-error');
            }
            , 'submit #person-search-form': 'searchPersons'
            , 'click [data-task="search-persons"]': 'searchPersons'
            , 'click [data-task="select-person"]': 'selectPerson'
            , 'click [data-task="delete-person"]': 'deletePerson'
        }
        , submit: function (e) {
            e.preventDefault();
            var self = this;
            // var helper = new IngestHelper.validate();
            // if (!helper.beforeSave())
            //     return;
            $fields = $('#metadata-form-modal').find('input, textarea');
            var error = false;
            $fields.each(function () {
                var $field = $(this);
                if ($field.is('[required]') && (typeof $field.val() === 'undefined' || !$field.val())) {
                    error = true;
                    toastr.warning('اطلاعات فیلد ' + $field.attr('placeholder') + ' وارد نشده است.', 'حطا', Config.settings.toastr);
                }
            });
            if (error) {
                return false;
            }
            var data = this.prepareSave();
            var cachedItems = self.items;
            var ingestedItems = [];
            for (var i = 0; i < cachedItems.items.length; i++) {
                ingestedItems.push($.extend({}, data[0], {FileName: cachedItems.items[i]['FileName'], Duration: cachedItems.items[i]['Duration']}, {Type: 3}));
            }
            data = ingestedItems;
            if (!data.length)
                return false;
            if ($('#persons-table tbody tr').length < 2) {
                toastr.warning('تعداد عوامل کافی نیست', 'ذخیره اطلاعات برنامه', Config.settings.toastr);
                return false;
            }
            if ($('[name="Tags"]').val().length < 1) {
                toastr.warning('کلیدواژه وارد نشده.', 'ذخیره اطلاعات برنامه', Config.settings.toastr);
                return false;
            }
            if ($('[name="Subjects"]').val().length < 1) {
                toastr.warning('محور وارد نشده.', 'ذخیره اطلاعات برنامه', Config.settings.toastr);
                return false;
            }

            var ingestSaveParams = {overrideUrl: Config.api.media};
            new IngestModel(ingestSaveParams).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function (d) {
                    var items = self.prepareItems(d.toJSON(), ingestSaveParams);
                    // var end = Object.keys(items).length - 1;
                    for (var idx in items) {
                        self.submitPersons(items[idx].Id, function () {
                            // var idxx = ~~idx;
                            if (($(self.$modal).data('bs.modal') || {}).isShown) {
                                toastr.success('با موفقیت انجام شد', 'ذخیره اطلاعات برنامه', Config.settings.toastr);
                                $(self.$modal).find("form").trigger('reset');
                                $(self.$modal).modal('hide');
                                $("#storagefiles tr.active").addClass('disabled').removeClass('active success');
                            }
                            // if (idxx === ~~end) {
                            //
                            // }
                        });
                    }
                }, error: function (e, data) {
                    toastr.error(e, 'خطا', Config.settings.toastr);
                }
            });
        }
        , openAddForm: function (e) {
            // $(this.$modal).modal('toggle');
            $(this.$modal).on('shown.bs.modal', function () {
                window.setTimeout(function () {
                    $("select.select2").each(function () {
                        if ($(this).hasClass("select2-hidden-accessible"))
                            $(this).select2('destroy');
                        $(this).select2({dir: "rtl", multiple: true, tags: false, width: '100%', placeholder: $(this).parent().parent().find('label').text(), dropdownParent: $(this).parents('.modal-body')});
                    });
                }, 500);
            });
            $(this.$modal).modal('show');
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
            var template = Template.template.load('resources/batchingest', 'batchingest');
            var $container = $(Config.positions.main);
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                self.getTags(function (params) {
                    var output = handlebarsTemplate(params);
                    $container.html(output).promise().done(function () {
                        self.afterRender();
                    });
                });

                // var output = handlebarsTemplate({});
                // $container.html(output).promise().done(function () {
                //     self.afterRender();
                // });
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
                    for (var key in items) {
                        items[key].FileName = items[key].FileName.replace('\\\\192.168.1.5\\ingest$\\', '');
                    }
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(items);
                        $container.html(output).promise().done(function () {
                            $container.stop().fadeIn();
                            $(".sharp").addClass("hide");
                            $(".select-all").removeClass("hide");
                        });
                    });
                }
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
            });
        }
        , selectStorageFiles: function (e) {
//            e.preventDefault();
            var self = this;
            if ($(e.target).prop('checked'))
                $("#storagefiles tr[data-filename]").addClass('active success') && $('button[data-task=add]').removeClass('disabled');
            else
                $("#storagefiles tr[data-filename]").removeClass('active success') && $('button[data-task=add]').addClass('disabled');
            window.setTimeout(function () {
                self.handleSelectedRows($("#storagefiles tr.active"));
            }, 200);
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
                    // data[0][$input.attr("name")] = (/^\d+$/.test($input.val()) || ($input.attr("data-validation") === 'digit')) ? +$input.val() : $input.val();
                    // if (typeof $input.attr('data-before-save') !== "undefined") {
                    switch ($input.attr("name")) {
                        default:
                            data[0][$input.attr("name")] = (/^\d+$/.test($input.val()) || ($input.attr("data-validation") === 'digit')) ? +$input.val() : $input.val();
                            break;
                        case 'Tags':
                        case 'Subjects':
                        case 'Persons':
                            var metadata = [];
                            $.each($input.val(), function () {
                                metadata.push({id: ~~this});
                            });
                            data[0][$input.attr("name")] = metadata;
                            break;
                    }
                    // if (typeof $input.attr('data-before-save') !== "undefined") {
                    switch ($input.attr('data-before-save')) {
                        case 'prepend-date':
                            data[0][$input.attr("name")] = Global.jalaliToGregorian($(this).parent().find("label").text()) + 'T' + $input.val();
                            break;
                        case 'timestamp':
                            data[0][$input.attr("name")] = Global.processTime($input.val());
                            break;
                    }
                    // }
                    // }
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
                            self.loadPersonsList(pathId);
                        });
                    });
                }
            });
        }

        , getTags: function (callback) {
            var params = {tags: [], subjects: [], persons: []};
            new SharedModel().fetch({
                success: function (tags) {
                    params.tags = tags.toJSON();
                    new SharedModel({overrideUrl: 'share/persons'}).fetch({
                        success: function (persons) {
                            params.persons = persons.toJSON();
                            new SharedModel({overrideUrl: 'share/subjects'}).fetch({
                                success: function (subjects) {
                                    params.subjects = subjects.toJSON();
                                    if (typeof callback === "function")
                                        callback(params);
                                }
                            });
                        }
                    });
                }
            });
        }
        , loadPersonsList: function (categoryId) {
            if (typeof categoryId === 'undefined' || categoryId <= 0)
                return false;
            var self = this;
            var params = {overrideUrl: Config.api.mediapersons + '/?type=2&externalid=' + categoryId};
            var model = new IngestModel(params);
            var $container = $('#persons-group');
            $container.empty();
            model.fetch({
                success: function (data) {
                    var items = self.prepareItems(data.toJSON(), params);
                    var template = Template.template.load('resources/mediaitem', 'persons.partial');
                    template.done(function (tmplData) {
                        var handlebarsTemplate = Template.handlebars.compile(tmplData);
                        var output = handlebarsTemplate({items: items, cols: false, placeholder: true});
                        $container.html(output).promise().done(function () {
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
            new IngestModel(params).fetch({
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
            $clonedRow.attr('data-id', params.id);
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
        , submitPersons: function (id, callback) {
            // typeof e !== 'undefined' && e.preventDefault();
            var self = this;
            var items = [];
            $('#persons-table tbody tr').each(function () {
                // items.push({id: $(this).attr('data-id'), name: '', family: '', type: ''});
                items.push(~~$(this).attr('data-id'));
            });
            new IngestModel({overrideUrl: Config.api.mediapersons + '?type=1&externalid=' + id}).save(null, {
                data: JSON.stringify(items)
                , contentType: 'application/json'
                , processData: false
                , error: function (e, data) {
                    toastr.error(data.responseJSON.Message, 'خطا', Config.settings.toastr);
                }
                , success: function (model, response) {
                    if (typeof callback === 'function')
                        callback();
                    // toastr.success('با موفقیت انجام شد', 'ثبت اطلاعات عوامل', Config.settings.toastr);
//                    self.loadComments({query: 'externalid=' + data[0].externalid + '&kind=1', overrideUrl: Config.api.comments});
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
