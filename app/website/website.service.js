define(['jquery', 'underscore', 'backbone', 'template', 'config', 'website.model'
], function ($, _, Backbone, Template, Config, WebsiteModel) {
    var CategoryHelper = {
        idx: 0
        , listTree: []
        , listHtmlOptions: ''
    };
    var WebsiteService = {
        serviceUrl: 'https://services.iktv.ir/pl/',
        getUserItems: function (callback) {
            var params = {path: 'contents.svc/box/-100'};
            new WebsiteModel(params).fetch({
                success: function (data) {
                    var content = WebsiteService.prepareItems(data, params);
                    if (typeof callback === 'function') {
                        callback(content);
                    }
                }
            });
        },
        getInboxItems: function (callback) {
            var params = {path: 'contentsflow.svc/inbox/0'};
            new WebsiteModel(params).fetch({
                success: function (data) {
                    var content = WebsiteService.prepareItems(data, params);
                    if (typeof callback === 'function') {
                        callback(content);
                    }
                }
            });
        },
        getSentItems: function (callback) {
            var params = {path: 'contentsflow.svc/sent'};
            new WebsiteModel(params).fetch({
                success: function (data) {
                    var content = WebsiteService.prepareItems(data, params);
                    if (typeof callback === 'function') {
                        callback(content);
                    }
                }
            });
        },
        getItem: function (id, callback) {
            var params = {path: 'contents.svc/' + id};
            new WebsiteModel(params).fetch({
                success: function (data) {
                    var content = WebsiteService.prepareItems(data, params);
                    if (typeof callback === 'function') {
                        callback(content);
                    }
                }
            });
        },
        getItems: function (catid, published, ordering, callback) {
            catid = typeof catid !== 'undefined' ? catid : 0;
            published = typeof published !== 'undefined' ? published : '-1';
            ordering = typeof ordering !== 'undefined' ? ordering : 'List';
            var params = {path: 'contents.svc/list/' + catid + '/?Ordering=' + ordering + '&published=' + published};
            new WebsiteModel(params).fetch({
                success: function (data) {
                    var content = WebsiteService.prepareItems(data, params);
                    if (typeof callback === 'function') {
                        callback(content);
                    }
                }
            });
        },
        getCategories: function (callback) {
            if (CategoryHelper.listTree.length) {
                if (typeof callback === 'function') {
                    callback(CategoryHelper.listTree);
                }
            } else {
                var params = {path: 'categories.svc/'};
                new WebsiteModel(params).fetch({
                    success: function (data) {
                        var content = WebsiteService.prepareItems(data, params);
                        for (var i = 0; i < data.length; i++) {
                            data[i].children = [];
                            data[i].depth = 0;
                        }
                        WebsiteService.buildCatergoriesTree(content);
                        WebsiteService.registerCategories(CategoryHelper.listTree);
                        if (typeof callback === 'function') {
                            callback(CategoryHelper.listHtmlOptions);
                        }
                    }
                });
            }
        },
        buildCatergoriesTree: function (tree, item) {
            while (CategoryHelper.idx < tree.length) {
                if (String(tree[CategoryHelper.idx].Parent_Id) === "0") {
                    var itm = tree[CategoryHelper.idx];
                    CategoryHelper.listTree.push(itm);
                    CategoryHelper.idx++;
                    while (CategoryHelper.idx < tree.length && tree[CategoryHelper.idx].Parent_Id === itm.Id) {
                        WebsiteService.buildCatergoriesTree(tree, itm);
                    }
                } else {
                    var itm = tree[CategoryHelper.idx];
                    item.children.push(itm);
                    CategoryHelper.idx++;
                    while (CategoryHelper.idx < tree.length && tree[CategoryHelper.idx].Parent_Id === itm.Id) {
                        WebsiteService.buildCatergoriesTree(tree, itm);
                    }
                }
            }
        },
        registerCategories: function (categories) {
            CategoryHelper.listHtmlOptions = '';
            for (var i = 0; i < CategoryHelper.listTree.length; i++) {
                if (CategoryHelper.listTree[i].children.length === 0) {
                    CategoryHelper.listHtmlOptions += "<optgroup label='" + CategoryHelper.listTree[i].Title + "'>";
                    CategoryHelper.listHtmlOptions += "<option value='" + CategoryHelper.listTree[i].Id + "'>" + CategoryHelper.listTree[i].Title + "</option>";
                    CategoryHelper.listHtmlOptions += "</optgroup>";
                } else {
                    CategoryHelper.listHtmlOptions += "<optgroup label='" + CategoryHelper.listTree[i].Title + "'>";
                    CategoryHelper.listHtmlOptions += "<option value='" + CategoryHelper.listTree[i].Id + "'>" + CategoryHelper.listTree[i].Title + "</option>";
                    for (var j = 0; j < CategoryHelper.listTree[i].children.length; j++)
                        CategoryHelper.listHtmlOptions += "<option value='" + CategoryHelper.listTree[i].children[j].Id + "'>" + CategoryHelper.listTree[i].children[j].Title + "</option>";
                    CategoryHelper.listHtmlOptions += "</optgroup>";
                }
            }
        },
        prepareItems: function (items, params) {
            items = items.toJSON();
            if (typeof items.query !== "undefined")
                delete items.query;
            if (typeof params !== "undefined") {
                for (var prop in params) {
                    delete items[prop];
                }
            }
            return items;
        }
    };
    return WebsiteService;
});
