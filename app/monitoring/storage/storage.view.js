define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'resources.categories.model', 'handlebars', 'toolbar', 'toastr', 'pdatepicker', 'bootstrap-table', 'bootstrap/modal', 'bootstrap/tooltip'
], function ($, _, Backbone, Template, Config, Global, CategoriesModel, Handlebars, Toolbar, toastr) {
    var MonitoringStorageView = Backbone.View.extend({
        $modal: "#schedule-log-modal"
        , toolbar: [
            { 'button': { cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh-view', icon: 'fa fa-refresh' } }
        ]
        , events: {
            'click [data-task=filter_rows]': 'filter'
            , 'click [data-task=refresh-view]': 'reLoad'
        }
        , flags: {}
        , idx: 0
        , reLoad: function () {
            this.load();
        }
        , load: function (extend) {
            var params = {};
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        // , unflatten: function (items) {
        //     return items.reduce(this.insert, {
        //         res: [],
        //         map: {}
        //     }).res;
        // }
        // , insert: function (obj, item) {
        //     var parent = item.CategoryPid;
        //     var map = obj.map;
        //     map[item.CategoryId] = item;
        //
        //     console.log(parent, item);
        //     if (parent === null) {
        //         obj.res.push(item);
        //     } else {
        //         var parentItem = map[parent];
        //
        //         if (parentItem.hasOwnProperty("Children"))
        //             parentItem.Children.push(item);
        //         else parentItem.Children = [item];
        //     }
        //
        //     return obj;
        // }
        , registerHelper: function() {
            Handlebars.registerHelper('recursiveHelper', function(context, options) {
                return options.fn('<table class="table table-condensed table-bordered table-striped">\n' +
                    '                    <thead>\n' +
                    '                    <tr>\n' +
                    '                        <th class="col-xs-2">نام برنامه</th>\n' +
                    '                        <th class="col-xs-2">حجم</th>\n' +
                    '                        <th class="col-xs-2">تعداد مدیا</th>\n' +
                    '                        <th class="col-xs-2">جمع مدت</th>\n' +
                    '                        <th class="col-xs-2">استفاده کنداکتور</th>\n' +
                    '                        <th class="col-xs-2">آخرین پخش</th>\n' +
                    '                    </tr>\n' +
                    '                    </thead>\n' +
                    '                    <tbody>\n' +
                    '                    {{#each []}}\n' +
                    '                        <tr>\n' +
                    '                            <td>{{CategoryTitle}}</td>\n' +
                    '                            <td><strong style="direction: ltr; text-align: left;">{{CategoryOnlineFilesSizeReadble}}</strong></td>\n' +
                    '                            <td>{{CategoryMediasCount}}</td>\n' +
                    '                            <td>{{time2 CategoryMediasDuration}}</td>\n' +
                    '                            <td>{{CategoryConductorCount}}</td>\n' +
                    '                            <td>{{extractTime CategoryLastMediaIngest}} {{extractDate CategoryLastMediaIngest}}</td>\n' +
                    '                        </tr>\n' +
                    '                        {{#if children}}\n' +
                    '                            <tr>\n' +
                    '                                <td colspan="100%">\n' +
                    '                                    {{{recursiveHelper children}}}\n' +
                    '                                </td>\n' +
                    '                            </tr>\n' +
                    '                        {{/if}}\n' +
                    '                    {{/each}}\n' +
                    '                    </tbody>\n' +
                    '                </table>')
            });
        }
        , render: function (givenParams) {
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
