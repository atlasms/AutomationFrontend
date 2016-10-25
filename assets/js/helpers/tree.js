define(['jquery', 'underscore', 'backbone', 'config', 'jstree'], function ($, _, Backbone, Config, jstree) {
    var Tree = function ($el, api) {
        this.$el = (typeof $el !== "undefined") ? $el : $("tree");
        this.api = api;
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
                            return {'parent': node.id};
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
        }
    });

    return Tree;
});