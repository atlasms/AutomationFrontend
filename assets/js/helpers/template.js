define(['jquery', 'underscore', 'backbone', 'handlebars', 'config', 'global'
], function ($, _, Backbone, Handlebars, Config, Global) {

    var template = {
        handlebarHelpers: function () {
            if (typeof Handlebars === "undefined")
                return false;
            Handlebars.registerHelper("math", function (lvalue, operator, rvalue, options) {
                lvalue = parseFloat(lvalue);
                rvalue = parseFloat(rvalue);

                return {
                    "+": lvalue + rvalue,
                    "-": lvalue - rvalue,
                    "*": lvalue * rvalue,
                    "/": lvalue / rvalue,
                    "%": lvalue % rvalue
                }[operator];
            });
            Handlebars.registerHelper('times', function (n, block) { // Loop a block starting at 0
                var accum = '';
                for (var i = 0; i < n; ++i)
                    accum += block.fn(i);
                return accum;
            });
            Handlebars.registerHelper('debug', function (value, options) {
                console.log(value);
            });
            Handlebars.registerHelper('extractTime', function (value, options) {
                return (value && value.indexOf("T") !== -1) ? value.split('T')[1] : value;
            });
            Handlebars.registerHelper('htimes', function (n, block) { // Loop a block starting at 1 [human-readable times]
                var accum = '';
                for (var i = 1; i < (n + 1); ++i)
                    accum += block.fn(i);
                return accum;
            });
            Handlebars.registerHelper('for', function (from, to, incr, block) { // For loop {{#for i to steps}} -> {{#for 0 10 2}}
                var accum = '';
                for (var i = from; i < to; i += incr)
                    accum += block.fn(i);
                return accum;
            });
            Handlebars.registerHelper('ifCond', function (v1, v2, options) {
                if (v1 === v2) {
                    return options.fn(this);
                }
                return options.inverse(this);
            });
            Handlebars.registerHelper('ifCondNot', function (v1, v2, options) {
                if (v1 !== v2) {
                    return options.fn(this);
                }
                return options.inverse(this);
            });
            Handlebars.registerHelper('ifActive', function (val, options) {
                var currentID = (typeof Location.parts[2] === "undefined") ? 0 : Location.parts[2];
                if (parseInt(val) === parseInt(currentID)) {
                    return "grey-cascade";
                }
                return "btn-default";
            });
            Handlebars.registerHelper('stringify', function (obj, options) {
                if (typeof obj === "object") {
                    $.each(obj, function () {
                        delete this.raw;
                    });
                }
                var output = (typeof obj === "object") ? JSON.stringify(obj) : obj;
                return output;
            });
            Handlebars.registerHelper('Bool2Label', function (val, options) {
                var output = '';
                if (val === true) {
                    output = '<span class="label label-success">Yes</label>';
                } else {
                    output = '<span class="label label-warning">No</label>';
                }
                return output;
            });
            Handlebars.registerHelper('Num2Label', function (val, options) {
                var output = '';
                switch (val) {
                    case 0:
                        output = '<span class="label label-warning">No</label>';
                        break;
                    case 1:
                        output = '<span class="label label-success">Yes</label>';
                        break;
                }
                return output;
            });
            Handlebars.registerHelper('isChecked', function (val, options) {
                var output = '';
                if (val === true || val === 1) {
                    output = 'checked';
                }
                return output;
            });
            Handlebars.registerHelper('cycle', function (value, block) {
                var values = value.split(' ');
                return values[block.data.index % (values.length + 1)];
            });
            Handlebars.registerHelper('select', function (value, options) {
                var $el = $('<select />').html(options.fn(this));
                $el.find('[value=' + value + ']').attr({'selected': 'selected'});
                return $el.html();
            });
            Handlebars.registerHelper('date', function (offset, options) {
                return Global.createDate(offset);
            });
            Handlebars.registerHelper('convert2Jalali', function (value, options) {
                return Global.convertDateTime(value);
            });
        }
        , load: function (path, file) {
            var bust = (CONFIG.env === "dev") ? '?bust=' + (new Date()).getTime() : '';
            return $.ajax({
                url: '/app/' + path + '/' + file + '.template.html' + bust
                , contentType: 'text/x-handlebars-template'
            });
        }
    };
    var handlebars = Handlebars;
    return {
        handlebars: handlebars
        , template: template
    };

});
