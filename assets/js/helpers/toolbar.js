define(['jquery', 'underscore', 'backbone', 'config'
], function ($, _, Backbone, Config) {
    var ToolbarHelper = Backbone.View.extend({
        el: $(Config.positions.toolbar)
        , toolbar: ''
        , events: {
//            'submit': 'submit'
//            , 'keyup input.time': 'processTime'
        }
        , initialize: function () {
            var $toolbar = this.$el;
            var gap = $toolbar.offset().top;
            var width = $toolbar.width();
            $(window).on('scroll', function () {
                if ($("body").hasClass("_md") || $("body").hasClass("_lg")) {
                    if ($(this).scrollTop() > gap)
                        !$("body").hasClass('fixed-toolbar') && $("body").addClass("fixed-toolbar").find("#toolbar").width(width);
                    else
                        $("body").hasClass('fixed-toolbar') && $("body").removeClass("fixed-toolbar").find("#toolbar").width('inherit');
                }
            });
        }
        , render: function () {
            this.$el.html(this.toolbar + '<div class="clearfix"></div>');
        }
        , button: function (args) {
            var cssClass = (typeof args.cssClass !== "undefined") ? args.cssClass : 'btn';
            var text = (typeof args.text !== "undefined") ? args.text : 'Submit';
            var type = (typeof args.type !== "undefined") ? args.type : 'submit';
            var task = (typeof args.task !== "undefined") ? args.task : '';
            var icon = (typeof args.icon!== "undefined") ? '<i class="' + args.icon + '"></i> ' : '';
            var affix = (typeof args.affix !== "undefined") ? 'append' : 'prepend';
            var output = '<button type="' + type + '" class="' + cssClass + '" data-task="' + task + '">' + icon + text + '</button>';
            this.toolbar = (affix === "prepend") ? output + this.toolbar : this.toolbar + output;
        }
        , input: function (args) {
            var cssClass = (typeof args.cssClass !== "undefined") ? args.cssClass : 'form-control';
            var placeholder = (typeof args.placeholder !== "undefined") ? args.placeholder : '';
            var type = (typeof args.type !== "undefined") ? args.type : 'text';
            var name = (typeof args.name !== "undefined") ? args.name : '';
            var value = (typeof args.value !== "undefined") ? args.value : '';
            var affix = (typeof args.affix !== "undefined") ? 'append' : 'prepend';
            var addon = (typeof args.addon !== "undefined") ? args.addon : false;
            var output = '<div class="form-group"><div class="input-group">';
                output += addon ? '<span class="input-group-addon"></span>' : '';
                output += '<input type="' + type + '" class="' + cssClass + '" name="' + name + '" placeholder="' + placeholder + '" value="' + value + '" /></div></div>';
            this.toolbar = (affix === "prepend") ? output + this.toolbar : this.toolbar + output;
        }
    });
    return ToolbarHelper;
});