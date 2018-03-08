define(['jquery', 'underscore', 'backbone', 'config', 'authorization'
], function ($, _, Backbone, Config, Authorize) {
    var ToolbarHelper = Backbone.View.extend({
        el: Config.positions.toolbar
        , toolbar: ''
        , events: {
//            'submit': 'submit'
//            , 'keyup input.time': 'processTime'
        }
        , initialize: function () {
            var $toolbar = this.$el;
            if (!this.$el.length)
                return;
            var gap = $toolbar.offset().top;
            var width = $toolbar.parent().width() - 30;
            $(window).on('scroll', function () {
                if ($("body").hasClass("_md") || $("body").hasClass("_lg")) {
                    if ($(this).scrollTop() > gap)
                        !$("body").hasClass('fixed-toolbar') && $("body").addClass("fixed-toolbar").find("#toolbar").width(width - 17);
                    else
                        $("body").hasClass('fixed-toolbar') && $("body").removeClass("fixed-toolbar").find("#toolbar").width('inherit');
                }
                if ($(this).scrollTop() !== 0)
                    $("body").addClass('scrolled');
                else
                    $("body").removeClass('scrolled');
            });
        }
        , getDefinedToolbar: function (id, name) {
            var items = [];
            $.each(Config.definitions, function () {
                if (this.Id === id) {
                    var $this = this;
                    var item = {};
                    var key = (typeof $this.Description !== "undefined" && $this.Description !== "") ? $this.Description : 'select';
                    item[key] = {
                        name: name
                        , options: []
                        , addon: true
                        , icon: 'fa fa-filter'
                    };
                    for (i = 0; i < $this.Children.length; i++)
                        item[key].options.push({value: $this.Children[i].Value, text: $this.Children[i].Key});
                    items.push(item);
                }
            });
            return items;
        }
        , render: function () {
            if (this.toolbar === "")
                this.$el.slideUp(Config.transitionSpedd);
            else
                this.$el.html(this.toolbar + '<div class="clearfix"></div>').slideDown(Config.transitionSpedd);
        }
        , button: function (args) {
//            console.log(Authorize.access(args.access));
            var cssClass = (typeof args.cssClass !== "undefined") ? args.cssClass : 'btn';
            var text = (typeof args.text !== "undefined") ? args.text : 'Submit';
            var type = (typeof args.type !== "undefined") ? args.type : 'submit';
            var task = (typeof args.task !== "undefined") ? args.task : '';
            var icon = (typeof args.icon !== "undefined") ? '<i class="' + args.icon + '"></i> ' : '';
            var affix = (typeof args.affix !== "undefined") ? 'append' : 'prepend';

            if (!args.access || Authorize.access(args.access))
                var output = '<button type="' + type + '" class="' + cssClass + '" data-task="' + task + '">' + icon + text + '</button>';
            else
                var output = '<button type="' + type + '" class="' + cssClass + '" disabled>' + icon + text + '</button>';
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
            var disabled = (typeof args.disabled !== "undefined") ? ' disabled' : '';
            var icon = (typeof args.icon !== "undefined") ? '<i class="' + args.icon + '"></i>' : '';
            var output = '<div class="form-group"><div class="input-group">';
//            output += addon ? '<span class="input-group-addon"></span>' : '';
            output += addon ? '<span class="input-group-addon' + (icon !== "" ? ' has-icon' : '') + '">' + icon + '</span>' : '';
            output += '<input type="' + type + '" ' + disabled + ' class="' + cssClass + '" name="' + name + '" placeholder="' + placeholder + '" value="' + value + '" /></div></div>';
            this.toolbar = (affix === "prepend") ? output + this.toolbar : this.toolbar + output;
        }
        , select: function (args) {
            var cssClass = (typeof args.cssClass !== "undefined") ? args.cssClass : 'form-control';
            var name = (typeof args.name !== "undefined") ? args.name : '';
            var label = (typeof args.text !== "undefined") ? args.text : '';
            var affix = (typeof args.affix !== "undefined") ? 'append' : 'prepend';
            var addon = (typeof args.addon !== "undefined") ? args.addon : false;
            var multi = (typeof args.multi !== "undefined" && args.multi) ? ' multiple="true"' : '';
            var placeholder = (typeof args.placeholder !== "undefined" && args.placeholder) ? ' placeholder="' + args.placeholder + '"' : '';
            var icon = (typeof args.icon !== "undefined") ? '<i class="' + args.icon + '"></i>' : '';
            if (label && !icon)
                icon = label;
            var options = '';
            if (typeof args.options !== "undefined" && args.options.length)
                for (var i = 0; i < args.options.length; i++)
                    options += '<option value="' + args.options[i].value + '">' + args.options[i].text + '</option>';
            var output = '<div class="form-group"><div class="input-group">';
            output += addon ? '<span class="input-group-addon' + (icon !== "" ? ' has-icon' : '') + '">' + icon + '</span>' : '';
            output += '<select data-type="' + name + '" class="' + cssClass + '" name="' + name + '"' + multi + placeholder + '>' + options + '</select></div></div>';
            this.toolbar = (affix === "prepend") ? output + this.toolbar : this.toolbar + output;
        }
        , radio: function (args) {
            var cssClass = (typeof args.cssClass !== "undefined") ? args.cssClass : 'form-control';
            var name = (typeof args.name !== "undefined") ? args.name : '';
            var label = (typeof args.text !== "undefined") ? args.text : '';
            var affix = (typeof args.affix !== "undefined") ? 'append' : 'prepend';
            var addon = (typeof args.addon !== "undefined") ? args.addon : false;
            var icon = (typeof args.icon !== "undefined") ? '<i class="' + args.icon + '"></i>' : '';
            var options = '';
            if (typeof args.options !== "undefined" && args.options.length)
                for (var i = 0; i < args.options.length; i++)
                    options += '<div class="radio"><label><input type="radio" name="{name}" value="' + args.options[i].value + '" />' + args.options[i].text + '</label></div>';
            var output = '<div class="form-group">';
            output += options.replace(/{name}/gi, args.name);
            output += '</div>';
            this.toolbar = (affix === "prepend") ? output + this.toolbar : this.toolbar + output;
        }
        , separator: function(args) {
            var affix = (typeof args.affix !== "undefined") ? 'append' : 'prepend';
            var output = '<div class="clearfix"></div>';
            this.toolbar = (affix === "prepend") ? output + this.toolbar : this.toolbar + output;
        }
    });
    return ToolbarHelper;
});