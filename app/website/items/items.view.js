define(['jquery', 'underscore', 'backbone', 'template', 'config', 'user', 'toolbar', 'website.service', 'bootstrap-table'
], function ($, _, Backbone, Template, Config, User, Toolbar, WebsiteService) {
    var WebsiteDashboardView = Backbone.View.extend({
        data: {}
        , events: {
            'click [data-task="refresh"]': 'reload'
        }
        , toolbar: [
            {'button': {cssClass: 'btn btn-success', text: '', type: 'button', task: 'refresh', alt: 'جستجو', icon: 'fa fa-search'}}
            , {
                'select': {
                    cssClass: 'form-control', name: 'change-state', options: [
                        {value: '-1', text: 'همه'},
                        {value: '1', text: 'منتشر شده'},
                        {value: '0', text: 'منتشر نشده'}
                    ], addon: true, icon: 'fa fa-filter'
                }
            }
            , {
                'select': {
                    cssClass: 'form-control', name: 'change-category', options: [
                        {value: '0', text: 'همه'}
                    ], addon: true, icon: 'fa fa-sitemap', text: 'دسته‌بندی'
                }
            }
            , {'button': {cssClass: 'btn purple-studio pull-right', text: '', type: 'button', task: 'refresh', icon: 'fa fa-refresh'}}
        ]
        , render: function () {
            WebsiteService.getCategories();

            this.renderToolbar();
            this.loadItems();
            return this;
        }
        , loadItems: function () {
            var self = this;
            var template = Template.template.load('website/items', 'items');
            var params = this.getParams();
            console.log(params);
            WebsiteService.getItems(params.catid, params.published, params.ordering, function (item) {
                template.done(function (data) {
                    var handlebarsTemplate = Template.handlebars.compile(data);
                    var output = handlebarsTemplate(item);
                    $(Config.positions.main).html(output).promise().done(function () {
                        self.afterRender();
                    });
                });
            });
        }
        , reload: function (e) {
            e.preventDefault();
            this.loadItems();
        }
        , getParams: function () {
            return {
                catid: $('[name="change-category"]').val(),
                published: $('[name="change-state"]').val(),
                ordering: 'List'
            }
        }
        , afterRender: function () {
            $('table#items').bootstrapTable(Config.settings.bootstrapTable);
        }
        , renderToolbar: function () {
            var self = this;
            var toolbar = new Toolbar();
            WebsiteService.getCategories(function (optionsHtml) {
                for (var item of self.toolbar) {
                    if (typeof item['select'] !== 'undefined') {
                        if (item['select']['name'] === 'change-category') {
                            item['select']['optionsHtml'] = '<option value="0">همه</option>' + optionsHtml;
                        }
                    }
                }
                $.each(self.toolbar, function () {
                    var method = Object.getOwnPropertyNames(this);
                    toolbar[method](this[method]);
                });
                toolbar.render();
            });
        }
    });

    return WebsiteDashboardView;

});
