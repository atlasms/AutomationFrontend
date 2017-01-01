define(['jquery', 'underscore', 'backbone', 'config', 'global', 'x-editable', 'bootstrap/tooltip', 'bootstrap/popover'], function ($, _, Backbone, Config, Global, editable) {
    window.Editable = function (options, callback) {
        this.defaults = {
            rtl: true
            , showbuttons: true
        };
        this.options = $.extend({}, this.defaults, options);
        this.callback = (typeof callback !== "undefined") ? callback : null;
        if (typeof this.options.service === "undefined" || !this.options.service)
            throw 'No service specified';
    };
    _.extend(Editable.prototype, {
        init: function () {
            var self = this;
            var options = self.options;
            self.setGlobalSettings();
            window.setTimeout(function () {
                $(".x-editable").each(function () {
                    var $this = $(this);
                    $this.editable({
                        type: 'text'
                        , name: $this.attr('data-field')
                        , title: $this.attr('data-original-title')
                        , pk: $this.attr('data-pk')
                        , placement: options.rtl ? 'left' : 'right'
                        , rtl: options.rtl
                        , showbuttons: options.showbuttons
                        , validate: function (value) {
                            if ($.trim(value) === '')
                                return 'This field is required';
                        }
                    });
                    self.setEventListeners($this, options);
                });
            }, 1000);
        }
        , setGlobalSettings: function () {
            $.fn.editable.defaults.mode = 'inline';
            $.fn.editable.defaults.inputclass = 'form-control';
//            $.fn.editable.defaults.ajaxOptions = {type: "PATCH"};
        }
        , setEventListeners: function ($obj, options) {
            var self = this;
            $obj.on('save', function (e, params) {
                var data = {
                    key: $(e.currentTarget).attr('data-field')
                    , value: params.newValue
                };
                self.callback["handleEditables"]($(e.currentTarget).attr('data-pk'), data);
            });
//            $obj.on('init', function (e, edt) {
//                self.callback["handleEditables"]('aaaa');
//                edt.options.url = options.service;
//            });
        }
    });
    return Editable;
});