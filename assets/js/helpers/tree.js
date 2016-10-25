define(['jquery', 'underscore', 'backbone', 'jstree'], function ($, _, Backbone, jstree) {
    var Tree = function ($el, api) {
        this.$el = (typeof $el !== "undefined") ? $el : $("tree");
        this.api = api;
//        console.log($.fn.jstree);
    };

    _.extend(Tree.prototype, {
        render: function () {
            $(this.$el).jstree({
                "core": {
                    "themes": {
                        "responsive": false
                    },
                    // so that create works
                    "check_callback": true,
                    'data': {
                        'url': function (node) {
                            return this.api;
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