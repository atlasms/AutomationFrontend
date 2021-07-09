define(['jquery', 'underscore', 'backbone', 'config', 'jstree', 'bootstrap/modal', 'bootbox'], function ($, _, Backbone, Config, jstree, modal, bootbox) {
    bootbox.setLocale('fa');
    var NewsTree = function ($el, api, callback, options) {
        var $this = this;
        this.selected = {};
        this.$el = (typeof $el !== "undefined") ? $el : $("tree");
        this.api = api.indexOf('//') !== -1 ? api : Config.api.url + api;
        this.callback = (typeof callback !== "undefined") ? callback : null;
        this.defaults = {
            "core": {
                "themes": {
                    "responsive": false
                }
                // so that create works
                , "check_callback": true
                , 'data': {
                    'url': function (node) {
                        return $this.api;
                    }
                    , 'data': function (node) {
                        return { 'pid': node.id.replace('#', 0) };
                    }
                }
            }
            , "types": {
                "default": { "icon": 'hidden' }
                , "file": { "icon": 'hidden' }
            }
            , "state": { "key": "news-tree" }
            // , "plugins": ["contextmenu", "state", "types"]
            , "plugins": ["state", "types"]
            , "checkbox": {
                "tie_selection": false
            }
        };

        if (options && typeof options.hasCheckboxes !== "undefined" && options.hasCheckboxes)
            this.defaults.plugins.push("checkbox");

        this.options = $.extend({}
            , this.defaults, options);
    };
    _.extend(NewsTree.prototype, {
        render: function () {
            var self = this;
            $(self.$el).jstree(self.options);
            // Tree Event Listeners
            $(self.$el).on('select_node.jstree', function (e, data) {
                var i, j, r = [];
                for (i = 0, j = data.selected.length; i < j; i++)
                    r.push(data.instance.get_node(data.selected[i]).id);

                self.selected.id = data.instance.get_node(data.selected[0]).id;
                self.selected.text = data.instance.get_node(data.selected[0]).text;

                var file_data = [];
                var selectedNodes = data.instance.get_selected();
                for (var i = 0; i < selectedNodes.length; i++) {
                    var full_node = data.instance.get_node(selectedNodes[i]);
                    file_data[i] = data.instance.get_path(full_node, "/");
                }
                // Sending processes to callback method
                if (self.callback && typeof self.callback['handleTreeCalls'] !== "undefined")
                    self.callback['handleTreeCalls'](r, file_data);
            });
            $(self.$el).on('after.jstree', function (e, data) {
            });
            $(self.$el).on('loaded.jstree', function (e, data) {
                if (!$(self.$el).jstree('get_selected', true).length) {
                    $(self.$el).jstree('select_node', '1');
                }
            });
            $(self.$el).on('ready.jstree', function (e, data) {
                window.setTimeout(function () {
                    var params = { method: 'ready', id: self.selected.id, task: '', text: self.selected.text, parent: null };
                    if (self.callback && typeof self.callback['handleTreeCallbacks'] !== "undefined")
                        self.callback['handleTreeCallbacks'](params, $(self.$el));
                }, 500);
            });
        }
    });

    return NewsTree;
});
