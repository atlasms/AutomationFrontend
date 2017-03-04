define(['jquery', 'underscore', 'backbone', 'config'
], function ($, _, Backbone, Config) {
    var StatusHelper = Backbone.View.extend({
        el: $(Config.positions.status)
        , statusbar: ''
        , initialize: function () {
//            var $statusbar = this.$el;
        }
        , render: function () {
            this.$el.html(this.statusbar);
        }
        , addItem: function(args) {
            var cssClass = (typeof args.cssClass !== "undefined") ? args.cssClass : 'badge';
            var text = (typeof args.text !== "undefined") ? args.text : '';
            var type = (typeof args.type !== "undefined") ? args.type : 'total';
            var output = '<li class="' + type + '" ><span class="' + cssClass + '"></span>&nbsp;' + text + '</li>';
            var affix = (typeof args.affix !== "undefined") ? 'append' : 'prepend';
            this.statusbar = (affix === "prepend") ? output + this.statusbar : this.statusbar + output;
        }
    });
    return StatusHelper;
});