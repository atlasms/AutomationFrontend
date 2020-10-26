define(['jquery', 'underscore', 'backbone', 'template', 'config', 'user', 'global', 'toolbar', 'toastr', 'resources.ingest.model', 'tree.helper', 'bootstrap/tab'
], function ($, _, Backbone, Template, Config, UserModel, Global, Toolbar, toastr, IngestModel, Tree) {
    var UserACLView = Backbone.View.extend({
        data: {}
        , tree: {}
        , newsTree: {}
        , toolbar: [
            {'button': {cssClass: 'btn green-jungle pull-right', text: 'ذخیره', type: 'submit', task: 'save'}}
        ]
        , events: {
            'click [data-task="save"]': 'submit'
            , 'click [data-task=refresh-view]': 'reLoad'
            , 'change input[type=checkbox]': 'handleParentCheckboxes'
        }
        , el: $(Config.positions.wrapper)
        , submit: function (e) {
            e.preventDefault();
            var data = this.prepareSave();
            new UserModel({overrideUrl: Config.api.acl, id: this.getId()}).save(null, {
                data: JSON.stringify(data)
                , contentType: 'application/json'
                , processData: false
                , success: function (d) {
                    toastr.success('با موفقیت انجام شد', 'ذخیره دسترسی‌ها', Config.settings.toastr);
                }
            });
        }
        , reLoad: function () {
            this.load();
        }
        , load: function (e, extend) {
            console.info('Loading data');
            var params = {};
            params = (typeof extend === "object") ? $.extend({}, params, extend) : params;
            this.render(params);
        }
        , handleParentCheckboxes: function (e) {
            var checkbox = e.target;
            if ($(checkbox).parents("li:first").parents("li").length)
                if (checkbox.checked)
                    $(checkbox).parents("li:first").parents("li").find(" > .checkbox input[type=checkbox]").prop('checked', true);
            if ($(checkbox).parents("li:first").find("ul"))
                if (!checkbox.checked)
                    $(checkbox).parents("li:first").find("input[type=checkbox]").prop('checked', false);
        }
        , render: function (parameters) {
            var template = Template.template.load('user/acl', 'acl');
            var $container = $(Config.positions.main);
            var self = this;
//            var params = {overrideUrl: Config.api.acl, id: this.getId()};
            var params = {overrideUrl: Config.api.acl};
            var model = new UserModel(params);
            var data = {menu: {}, permissions: {}, directories: {}, lantv: {}};
            // User ACL
            model.fetch({
                success: function (d) {
                    data.permissions = self.prepareItems(d.toJSON(), params);
                    data.menu = Global.Cache.getMenu();
                    var folderParams = {overrideUrl: Config.api.ingest + '/directories'};
                    var model = new IngestModel(folderParams);
                    // User Directories
                    model.fetch({
                        success: function (f) {
                            data.directories = self.prepareItems(f.toJSON(), folderParams);
                            var lantvParams = {overrideUrl: Config.api.lantv + 'list'};
                            var model = new UserModel(lantvParams);
                            // User LanTVs
                            model.fetch({
                                success: function (l) {
                                    data.lantv = self.prepareItems(l.toJSON(), lantvParams);
                                    // Render template
                                    template.done(function (tmpl) {
                                        var handlebarsTemplate = Template.handlebars.compile(tmpl);
                                        var output = handlebarsTemplate(data);
                                        $container.html(output).promise().done(function () {
                                            self.afterRender();
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
        , getId: function () {
            return Backbone.history.getFragment().split("/").pop().split("?")[0];
        }
        , getUserDetails: function () {
            var id = this.getId();
            var $container = $("#user-details");
            var self = this;
            var params = {id: id};
            var model = new UserModel(params);
            model.fetch({
                success: function (d) {
                    var details = self.prepareItems(d.toJSON(), params);
                    var template = Template.template.load('user', 'user.details.partial');
                    template.done(function (tmpl) {
                        var handlebarsTemplate = Template.handlebars.compile(tmpl);
                        var output = handlebarsTemplate(details);
                        $container.html(output).promise().done(function () {
//                            self.afterRender();
                        });
                    });
                }
            });
        }
        , afterRender: function () {
            // Load user details
            this.getUserDetails();
            // Load user permissions
            var self = this;
            var params = {overrideUrl: Config.api.acl, id: this.getId()};
            var model = new UserModel(params);
            model.fetch({
                success: function (d) {
                    var permissions = self.prepareItems(d.toJSON(), params);
                    $.each(permissions, function () {
                        var value = this.Value ? this.Value : '""';
                        $('ul[data-type=' + this.Key + '] input[type=checkbox][value=' + value + ']').prop('checked', true);
                    });

                    // Tree
                    if (STORAGE.getItem('tree')) {
                        var storage = JSON.parse(STORAGE.getItem('tree'));
                        storage.state.checkbox && delete storage.state.checkbox;
                        storage.state.core.selected && delete storage.state.core.selected;
                        STORAGE.setItem('tree', JSON.stringify(storage));
                    }
                    if ($("#tree").length) {
                        var $tree = $("#tree");
                        $tree.bind("loaded.jstree", function (e, data) {
                            var instance = $tree.jstree(true);
                            self.treeInstance = data.instance;
                            instance.open_all();
                        });
                        $tree.bind("open_all.jstree", function (e, data) {
                            $tree.jstree(true).uncheck_all();
                            $tree.jstree(true).deselect_all();
                            $.each(permissions, function () {
                                if (this.Key === "categories") {
                                    var node = data.instance.get_node($('#' + parseInt(this.Value)));
                                    $tree.jstree(true).check_node(node);
                                }
                            });

                        });
                        self.tree = new Tree($("#tree"), Config.api.tree, null, {hasCheckboxes: true});
                        self.tree.render();
                    }

                    // News Schedule Tree
                    if (STORAGE.getItem('news-tree')) {
                        var newsStorage = JSON.parse(STORAGE.getItem('news-tree'));
                        newsStorage.state.checkbox && delete newsStorage.state.checkbox;
                        newsStorage.state.core.selected && delete newsStorage.state.core.selected;
                        STORAGE.setItem('news-tree', JSON.stringify(newsStorage));
                    }
                    if ($("#news-tree").length) {
                        var $newsTree = $("#news-tree");
                        $newsTree.bind("loaded.jstree", function (e, data) {
                            var instance = $newsTree.jstree(true);
                            self.newsTreeInstance = data.instance;
                            instance.open_all();
                        });
                        $newsTree.bind("open_all.jstree", function (e, data) {
                            $newsTree.jstree(true).uncheck_all();
                            $newsTree.jstree(true).deselect_all();
                            $.each(permissions, function () {
                                if (this.Key === "news-tree") {
                                    var node = data.instance.get_node($('#' + parseInt(this.Value)));
                                    $newsTree.jstree(true).check_node(node);
                                }
                            });

                        });
                        self.newsTree = new Tree($("#news-tree"), Config.api.newsTree, null, {hasCheckboxes: true});
                        self.newsTree.render();
                    }
                }
            });
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
        , renderToolbar: function () {
            var self = this;
//            if (self.flags.toolbarRendered)
//                return;
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
        , prepareContent: function () {
            this.renderToolbar();
        }
        , prepareSave: function () {
            var data = [];
            $('ul[data-type]').each(function () {
                $(this).find('input[type=checkbox]').each(function () {
                    if (this.checked)
                        data.push({Key: $(this).parents("ul[data-type]").attr('data-type'), Value: $(this).val()});
                });
            });
            var treeItems = this.treeInstance.get_checked();
            for (var i = 0; i < treeItems.length; i++)
                data.push({Key: 'categories', 'Value': treeItems[i]});
            var newsTreeItems = this.newsTreeInstance.get_checked();
            for (var i = 0; i < newsTreeItems.length; i++)
                data.push({Key: 'news-tree', 'Value': newsTreeItems[i]});
            return data;
        }
    });
    return UserACLView;
});
