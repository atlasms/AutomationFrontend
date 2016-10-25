define(['jquery', 'underscore', 'backbone', 'config', 'jstree'], function ($, _, Backbone, Config, jstree) {
    var Tree = function ($el, api) {
        this.$el = (typeof $el !== "undefined") ? $el : $("tree");
        this.api = api.indexOf('//') !== -1 ? api : Config.api.url + api;
    };

    _.extend(Tree.prototype, {
        render: function () {
            var $this = this;
            $($this.$el).jstree({
                "core": {
                    "themes": {
                        "responsive": false
                    },
                    // so that create works
                    "check_callback": true,
                    'data': {
                        'url': function (node) {
                            return $this.api;
                        },
                        'data': function (node) {
                            return {'pid': node.id.replace('#', 0)};
                        }
                    }
                },
                "types": {
                    "default": {
                        "icon": "fa fa-folder icon-state-warning icon-lg"
                    },
                    "file": {
                        "icon": "fa fa-file icon-state-warning icon-lg"
                    }
                },
                "state": {"key": "demo3"},
                "plugins": ["dnd", "state", "types"]
            });

            // Tree Event Listeners
            $($this.$el).on('select_node.jstree', function (e, data) {
//                console.log($('#' + data.node.id).parents("li:first").attr('id'));
                var i, j, r = [];
                for (i = 0, j = data.selected.length; i < j; i++) {
                    r.push(data.instance.get_node(data.selected[i]).id);
                }
                alert('Selected node id: ' + r.join(', '));
            });
        }
    });

    return Tree;
});