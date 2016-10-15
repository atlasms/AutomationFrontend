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
            var output = '<div class="form-group"><button type="' + type + '" class="' + cssClass + '">' + text + '</button></div>';
            this.toolbar = (affix === "prepend") ? output + this.toolbar : this.toolbar + output;
        }
        , input: function (args) {
            var cssClass = (typeof args.cssClass !== "undefined") ? args.cssClass : 'form-control';
            var placeholder = (typeof args.placeholder !== "undefined") ? args.placeholder : '';
            var type = (typeof args.type !== "undefined") ? args.type : 'text';
            var name = (typeof args.name !== "undefined") ? args.name : '';
            var affix = (typeof args.affix !== "undefined") ? 'append' : 'prepend';
            var output = '<div class="form-group"><input type="' + type + '" class="' + cssClass + '" name="' + name + '" placeholder="' + placeholder + '" /></div>';
            this.toolbar = (affix === "prepend") ? output + this.toolbar : this.toolbar + output;
        }
    });
    return ToolbarHelper;
});