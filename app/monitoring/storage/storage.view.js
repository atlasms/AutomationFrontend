define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.categories.model', 'handlebars', 'toolbar', 'toastr', 'pdatepicker', 'bootstrap-table', 'bootstrap/modal', 'bootstrap/tooltip'
], function ($, _, Backbone, Template, Config, Global, CategoriesModel, Handlebars, Toolbar, toastr) {
    var MonitoringStorageView = Backbone.View.extend({
        $modal: "#schedule-log-modal"
        , toolbar: [
            { 'button': { cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh-view', icon: 'fa fa-refresh' } },
            { 'button': { cssClass: 'btn btn-default', text: 'باز کردن / بستن همه', type: 'button', task: 'collapse-all', icon: 'fa fa-fullscreen' } }
        ]
        , events: {
            'click [data-task=filter_rows]': 'filter'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'click #storage-table tr': 'toggleChildren'
            , 'click [data-task="collapse-all"]': 'collapseAll'
        }
        , flags: {
            allOpen: false
        }
        , idx: 0
        , reLoad: function () {
            this.load();
        }
        , toggleChildren: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var $row = $(e.target).is('tr') ? $(e.target) : $(e.target).parents('tr:first');
            if ($row.next().is('.children-row')) {
                if ($row.next().is(':visible')) {
                    $row.next().stop().slideUp();
                } else {
                    $row.next().stop().slideDown();
                }
            }
        }
        , collapseAll: function (e) {
            e.preventDefault();
            if (!this.flags.allOpen) {
                $('#storage-table .children-row').slideDown();
                this.flags.allOpen = true;
            } else {
                $('#storage-table .children-row').slideUp();
                this.flags.allOpen = false;
            }
        }
        , load: function (extend) {
            var params = {};
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , registerHelper: function () {
            Handlebars.registerPartial('recursiveHelper', '<table class="table table-condensed table-bordered {{#if this.0.children}}has-children{{/if}}">\n' +
                '                    <thead>\n' +
                '                    <tr>\n' +
                '                        <th class="col-xs-2">نام برنامه</th>\n' +
                '                        <th class="col-xs-1">حجم</th>\n' +
                '                        <th class="col-xs-1">تعداد مدیا</th>\n' +
                '                        <th class="col-xs-1">جمع مدت</th>\n' +
                '                        <th class="col-xs-2">آخرین اینجست</th>\n' +
                '                        <th class="col-xs-1">استفاده کنداکتور</th>\n' +
                '                        <th class="col-xs-2">آخرین پخش</th>\n' +
                '                        <th class="col-xs-2">مدت نگهداری</th>\n' +
                '                    </tr>\n' +
                '                    </thead>\n' +
                '                    <tbody>\n' +
                '                    {{#each []}}\n' +
                '                        <tr>\n' +
                '                            <td>{{CategoryTitle}}</td>\n' +
                '                            <td style="direction: ltr; text-align: left;"><strong>{{CategoryOnlineFilesSizeReadble}}</strong></td>\n' +
                '                            <td class="text-center">{{CategoryMediasCount}}</td>\n' +
                '                            <td class="text-center">{{time2 CategoryMediasDuration}}</td>\n' +
                '                            <td>{{extractTime CategoryLastMediaIngest}} {{extractDate CategoryLastMediaIngest}}</td>\n' +
                '                            <td class="text-center">{{CategoryConductorCount}}</td>\n' +
                '                            <td>{{extractTime CategoryLastConductorUse}} {{extractDate CategoryLastConductorUse}}</td>\n' +
                '                            <td>' +
                '                               <select>\n' +
                '                               {{#select KeepDuration}}\n' +
                '                                <option value="-1">دائم</option>\n' +
                '                                <option value="10">10 روز</option>\n' +
                '                                <option value="14">دو هفته</option>\n' +
                '                                <option value="21">سه هفته</option>\n' +
                '                                <option value="30">یک ماه</option>\n' +
                '                                <option value="60">دو ماه</option>\n' +
                '                                <option value="90">سه ماه</option>\n' +
                '                                <option value="180">شش ماه</option>\n' +
                '                                <option value="360">یک سال</option>\n' +
                '                               {{/select}}' +
                '                               </select>' +
                '                           </td>\n' +
                '                        </tr>\n' +
                '                        {{#if children}}\n' +
                '                            <tr class="children-row">\n' +
                '                                <td colspan="100%">\n' +
                '                                    {{>recursiveHelper children}}\n' +
                '                                </td>\n' +
                '                            </tr>\n' +
                '                        {{/if}}\n' +
                '                    {{/each}}\n' +
                '                    </tbody>\n' +
                '                </table>'
            );
            /*

                        {{#select KeepDuration}}
                    <option value="-1">دائم</option>
                            <option value="10">10 روز</option>
                        <option value="14">دو هفته</option>
                        <option value="21">سه هفته</option>
                        <option value="30">یک ماه</option>
                        <option value="60">دو ماه</option>
                        <option value="90">سه ماه</option>
                        <option value="180">شش ماه</option>
                        <option value="360">یک سال</option>
                        {{/select}}
            */
        }
        , render: function (givenParams) {
            this.renderToolbar();
            var self = this;
            var params = $.extend({}, givenParams, { overrideUrl: Config.api.tree, path: '/size' });
            var model = new CategoriesModel(params);
            var template = Template.template.load('monitoring/storage', 'storage');
            var $container = $(Config.positions.main);
            model.fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), params);
                    var itemsArray = Global.objectListToArray(items);
                    var treeItems = Global.unFlattenTreeData(itemsArray);
                    self.registerHelper();
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(treeItems);
                        $container.html(output).promise().done(function () {
                            self.afterRender();
                        });
                    });
                }
            });
        }
        , afterRender: function () {
            $('[data-toggle="tooltip"]').tooltip();
            $('.children-row').each(function () {
                $parent = $(this).prev().is('tr') ? $(this).prev() : null;
                if ($parent && $parent.length) {
                    $parent.addClass('collapsible');
                }
            });
        }
        , renderToolbar: function () {
            var elements = this.toolbar;
            var toolbar = new Toolbar();
            $.each(elements, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
        }
        , prepareItems: function (items, params) {
            var $this = this;
            if (typeof items.query !== "undefined")
                delete items.query;
            if (typeof params !== "undefined") {
                for (var prop in params) {
                    delete items[prop];
                }
            }
            return items;
        }
    });
    return MonitoringStorageView;
});
