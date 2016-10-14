define(['jquery', 'underscore', 'backbone', 'config'
], function ($, _, Backbone, Config) {
    var ToolbarHelper = Backbone.View.extend({
        el: $(Config.positions.toolbar)
        , toolbar: ''
        , events: {
//            'submit': 'submit'
//            , 'keyup input.time': 'processTime'
        }
        , render: function () {
            this.$el.html(this.toolbar);
        }
        , button: function (args) {
            var cssClass = (typeof args.cssClass !== "undefined") ? args.cssClass : 'btn';
            var text = (typeof args.text !== "undefined") ? args.text : 'Submit';
            var type = (typeof args.type !== "undefined") ? args.type : 'submit';
            var affix = (typeof args.affix !== "undefined") ? 'append' : 'prepend';
            var output = '<button type="' + type + '" class="' + cssClass + '">' + text + '</button>';
            this.toolbar = (affix === "prepend") ? output + this.toolbar : this.toolbar + output;
        }
    });
    return ToolbarHelper;
});