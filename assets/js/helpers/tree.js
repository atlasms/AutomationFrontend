define(['jquery', 'underscore', 'backbone', 'config', 'jstree', 'bootstrap/modal', 'bootbox', 'storage.helper', 'authorization'
], function ($, _, Backbone, Config, jstree, modal, bootbox, Storage, Authorize) {
    bootbox.setLocale('fa');
    var Tree = function ($el, api, callback, options) {
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
                        return {'pid': node.id.replace('#', 0)};
                    }
                }
            }
            , "types": {
                "default": {"icon": "fa fa-folder folder icon-state-warning icon-lg"}
                , "file": {"icon": "fa fa-file file icon-state-warning icon-lg"}
            }
            , "state": {"key": "tree"}
            , "plugins": ["contextmenu", "state", "types"]
            , "checkbox": {
                "tie_selection": false
            }
            , contextmenu: {
                items: function (node) {
                    var Callees = {
                        destroy: function (node) {
                            var params = {method: 'delete', id: node.toString()};
                            bootbox.confirm({
                                message: "آیا مطمئن هستید مورد انتخاب شده پاک شود؟"
                                , buttons: {
                                    confirm: {className: 'btn-success'}
                                    , cancel: {className: 'btn-danger'}
                                }
                                , callback: function (results) {
                                    if ($this.callback && typeof $this.callback['handleTreeCallbacks'] !== "undefined")
                                        if (results)
                                            $this.callback['handleTreeCallbacks'](params, $($this.$el));
                                }
                            });
                        }
                    };
                    var contextItems = {};
                    if (Authorize.access(8)) {
                        contextItems.Create = {
                            "label": "مورد جدید"
                            , icon: 'fa fa-plus'
                            , "action": function (data) {
                                var ref = $.jstree.reference(data.reference);
                                sel = ref.get_selected();
                                if (!sel.length || ref.is_closed(sel))
                                    return false;
                                sel = sel[0];
                                sel = ref.create_node(sel, {"type": "folder"});
                                if (sel)
                                    ref.edit(sel);
                            }
                        };
                    }
                    if (Authorize.access(16)) {
                        contextItems.Rename = {
                            "label": "تغییر نام"
                            , icon: 'fa fa-pencil'
                            , "action": function (data) {
                                var inst = $.jstree.reference(data.reference);
                                obj = inst.get_node(data.reference);
                                inst.edit(obj);
                            }
                        };
                    }
                    if (Authorize.access(32)) {
                        contextItems.Delete = {
                            "label": "حذف"
                            , icon: 'fa fa-trash'
                            , "action": function (data) {
                                var ref = $.jstree.reference(data.reference),
                                        sel = ref.get_selected();
                                if (!sel.length || ref.is_closed(sel) || node.children.length)
                                    return false;
                                Callees.destroy(sel);
                            }
                        };
                    }
                    return contextItems;
                }
            }
        };
        
        if (Authorize.access(64))
            this.defaults.plugins.push("dnd");
        if (options && typeof options.hasCheckboxes !== "undefined" && options.hasCheckboxes)
            this.defaults.plugins.push("checkbox");

        this.options = $.extend({}
        , this.defaults, options);
    };
    _.extend(Tree.prototype, {
        render: function () {
            var $this = this;
            $($this.$el).jstree($this.options);
            // Tree Event Listeners
            $($this.$el).on('select_node.jstree', function (e, data) {
                var i, j, r = [];
                for (i = 0, j = data.selected.length; i < j; i++)
                    r.push(data.instance.get_node(data.selected[i]).id);

                $this.selected.id = data.instance.get_node(data.selected[0]).id;
                $this.selected.text = data.instance.get_node(data.selected[0]).text;

                var file_data = [];
                var selectedNodes = data.instance.get_selected();
                for (var i = 0; i < selectedNodes.length; i++) {
                    var full_node = data.instance.get_node(selectedNodes[i]);
                    file_data[i] = data.instance.get_path(full_node, "/");
                }
                // Sending proccesses to callback methos
                if ($this.callback && typeof $this.callback['handleTreeCalls'] !== "undefined")
                    $this.callback['handleTreeCalls'](r, file_data);
            });
//            $($this.$el).on('loaded.jstree', function (e, data) {
//
//            });
//            $($this.$el).on('before.jstree', function (e, data) {
//                
//            });
//            $($this.$el).on('ready.jstree', function (e, data) {
//            
//            });
            $($this.$el).on('create_node.jstree', function (node, parent, position) {
                // Do nothing! 
            });
            $($this.$el).on('rename_node.jstree', function (e, data) {
                var params = {method: 'put', id: null, task: 'rename', text: data.text, parent: data.node.parent.replace("#", 0)};
                if (data.node.id.indexOf('j') !== -1 && data.node.id.indexOf('_') !== -1)
                    params.method = 'post';
                else
                    params.id = data.node.id;
                if ($this.callback && typeof $this.callback['handleTreeCallbacks'] !== "undefined")
                    $this.callback['handleTreeCallbacks'](params, $($this.$el), data.node);
            });
            $($this.$el).on('move_node.jstree', function (e, data) {
                var params = {method: 'put', id: data.node.id, task: 'dnd', text: data.node.text, parent: data.parent.replace("#", 0)};
                if ($this.callback && typeof $this.callback['handleTreeCallbacks'] !== "undefined")
                    $this.callback['handleTreeCallbacks'](params, $($this.$el), data.node);
            });
        }
    });

    return Tree;
});