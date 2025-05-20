define(['jquery', 'underscore', 'backbone', 'handlebars', 'config', 'global', 'moment-hijri', 'moment-with-locales', 'authorization', 'pdatepicker', 'pdate'
], function ($, _, Backbone, Handlebars, Config, Global, moment, momentWithLocales, Authorize, pDatepicker) {
    momentWithLocales.locale('fa');
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
            Handlebars.registerHelper('min2sec', function (value, options) {
                return Global.createTime(+value * 60);
            });
            Handlebars.registerHelper('debug', function (value, options) {
                console.log(value);
            });
            Handlebars.registerHelper('extractTime', function (value, options) {
                if (typeof value === "undefined" || !value || +value.split('-')[0] === 1900)
                    return '';
                var splitter = (value.indexOf('T') !== -1) ? 'T' : ' ';
                return time = value.split(splitter)[1];
//                return (parseInt(time) !== 0) ? time : '';
            });
            Handlebars.registerHelper('checkAllowedBroadcastCount', function (allowedCount, useCount, options) {
                return (~~allowedCount !== 0 && ~~allowedCount <= ~~useCount)
                    ? '<span class="bg-red-mint bg-font-red-mint show">' + useCount + '</span>'
                    : useCount;
            });
            Handlebars.registerHelper('extractDate', function (value, bypassConvert, options) {
                return Global.extractDate(value, typeof bypassConvert !== "undefined" && !isNaN(bypassConvert) && !!bypassConvert === true);
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
            Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
                switch (operator) {
                    case '==':
                        return (v1 == v2) ? options.fn(this) : options.inverse(this);
                    case '!=':
                        return (v1 != v2) ? options.fn(this) : options.inverse(this);
                    case '===':
                        return (v1 === v2) ? options.fn(this) : options.inverse(this);
                    case '<':
                        return (v1 < v2) ? options.fn(this) : options.inverse(this);
                    case '<=':
                        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                    case '>':
                        return (v1 > v2) ? options.fn(this) : options.inverse(this);
                    case '>=':
                        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                    case '&&':
                        return (v1 && v2) ? options.fn(this) : options.inverse(this);
                    case '||':
                        return (v1 || v2) ? options.fn(this) : options.inverse(this);
                    case 'in':
                        var values = v2.split(',');
                        var condition = false;
                        for (var i = 0; i < values.length; i++) {
                            if (v1 == values[i] || condition)
                                condition = true;
                        }
                        return condition ? options.fn(this) : options.inverse(this);
                    default:
                        return options.inverse(this);
                }
            });
            Handlebars.registerHelper('validateBroadcastCount', function (broadcastCount, broadcastLimit, options) {
                if (parseInt(broadcastCount) === 0 || parseInt(broadcastLimit) === 0) {
                    return options.fn(this);
                }
                if (parseInt(broadcastCount) > parseInt(broadcastLimit)) {
                    return options.inverse(this);
                }
            });
            Handlebars.registerHelper('ifDate', function (value, options) {
                return (value && value.indexOf('1970-01') === -1) ? options.fn(this) : options.inverse(this);
            });
            Handlebars.registerHelper('ifIsToday', function (value, options) {
                var givenDate = (value && value.indexOf("T") !== -1) ? value.split('T')[0] : value;
                var today = moment().format('YYYY-MM-DD');
                if (givenDate === today)
                    return '<i class="fa fa-clock-o"></i> ' + value.split('T')[1];
                return '<i class="fa fa-calendar"></i> ' + Global.gregorianToJalali(value.split('T')[0]);
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
            Handlebars.registerHelper('isChecked', function (defaultValue, givenValue) {
                var output = '';
                if (defaultValue == givenValue) {
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

                if (typeof value === "undefined")
                    return $el.html();
                value = "" + value;
                if (!value || value === "") {
                    return $el.html();
                }
                if (typeof value === "string" && value.toLowerCase().indexOf('config') !== -1) {
                    var values = value.split('.').slice(1);
                    var conditionValue = Config;
                    for (var i in values)
                        conditionValue = conditionValue[values[i]];
                    if (typeof conditionValue === "string" && conditionValue.indexOf(',') !== -1) {
                        $.each(values, function () {
                            $el.find('[value="' + this + '"]').attr({ 'selected': 'selected' });
                        });
                    } else {
                        $el.find('[value="' + conditionValue + '"]').attr({ 'selected': 'selected' });
                    }
                } else if (typeof value === "string" && value.indexOf(',') !== -1) {
                    var values = value.split(',');
                    $.each(values, function () {
                        $el.find('[value=' + this + ']').attr({ 'selected': 'selected' });
                    });
                } else
                    $el.find('[value=' + value + ']').attr({ 'selected': 'selected' });
                return $el.html();
            });
            Handlebars.registerHelper('createDate', function (offset, options) {
                return Global.createDate(offset);
            });
            Handlebars.registerHelper('time', function (timestamp, options) {
                return Global.createTime(timestamp);
            });
            Handlebars.registerHelper('percent', function (value, whole, options) {
                return Math.round((~~value * 100) / ~~whole);
            });
            Handlebars.registerHelper('filesPercent', function (value, options) {
                if (typeof value === 'undefined' || !value || value.indexOf('/') === -1) {
                    return 0;
                }
                var numbers = value.split('/');
                var percent = Math.round((~~numbers[0] * 100) / ~~numbers[1]);
                percent = percent > 100 ? 100 : percent;
                percent = percent < 0 ? 0 : percent;
                return percent;
            });
            Handlebars.registerHelper('time2', function (timestamp, options) {
                return Global.createTime2(timestamp);
            });
            Handlebars.registerHelper('seconds', function (time, options) {
                return Global.processTime(time);
            });
            Handlebars.registerHelper('config', function (value, options) {
                if (typeof value === 'string' && value.indexOf('.') !== -1) {
                    var values = value.split('.');
                    var configValue = Config;
                    for (var i in values)
                        configValue = configValue[values[i]];
                    return configValue;
                }
                return Config[value];
            });
            Handlebars.registerHelper('ifConfig', function (value, options) {
                var values = value.split('.');
                var conditionValue = Config;
                for (var i in values)
                    conditionValue = conditionValue[values[i]];
                return conditionValue ? options.fn(this) : options.inverse(this);
            });
            Handlebars.registerHelper('getName', function (value, source, options) {
                return source[value];
            });
            Handlebars.registerHelper('formatJalali', function (value, format, options) {
                var date = (value && value.indexOf("T") !== -1) 
                        ? Global.gregorianToJalali(value.split('T')[0]).split('-') 
                        : Global.gregorianToJalali(value).split('-');
                for (var i = 0; i < date.length; i++)
                    date[i] = parseInt(date[i]);
                console.log(date);
                return momentWithLocales(date.join('-'), 'YYYY-MM-DD').locale('fa').format(format);
            });
            Handlebars.registerHelper('formatGregorian', function (value, format, options) {
                var date = (value && value.indexOf("T") !== -1) ? value.split('T')[0].split('-') : value.split('-');
                for (var i = 0; i < date.length; i++)
                    date[i] = (i === 1) ? parseInt(date[i]) - 1 : parseInt(date[i]);
                return new moment(date).format(format);
            });
            Handlebars.registerHelper('formatHijri', function (value, format, options) {
                var date = (value && value.indexOf("T") !== -1) ? value.split('T')[0].split('-') : value.split('-');
                for (var i = 0; i < date.length; i++)
                    date[i] = (i === 1) ? parseInt(date[i]) - 1 : parseInt(date[i]);
                return new moment(date).subtract(1, 'days').format(format);
            });
            Handlebars.registerHelper('getMedia', function (value, hq, options) {
                var hq = typeof hq !== "undefined" && hq == true;
                var fix = hq ? 'hq' : 'lq';
                var suffix = hq ? Config.hqVideoFormat : 'mp4'
                return value.replace('.jpg', '_' + fix + '.' + suffix);
            });
            Handlebars.registerHelper('getOriginalMedia', function (files, thumbnail, options) {
                var file = _.filter(files, function (file) {
                    return file.Path === 'original';
                })[0];
                if (file['State'] === 'online') {
                    return thumbnail.replace('converted', 'original').replace('.jpg', file.Extension);
                }
                return '#';
            });
            Handlebars.registerHelper('replace', function (haystack, needle, replace, options) {
                return haystack.replace(needle, replace);
            });
            Handlebars.registerHelper('find', function (needle, haystack, options) {
                if (typeof haystack === "undefined" || !haystack)
                    return false;
                if (typeof haystack === "string" && haystack.indexOf(',') !== -1)
                    haystack = haystack.split(',');
                else
                    haystack = !(haystack instanceof Array) ? [haystack] : haystack;
                var found = false;
                if (haystack.length) {
                    for (var i in haystack)
                        if (needle == haystack[i])
                            found = true;
                }
                return (found) ? options.fn(this) : options.inverse(this);
            });
            Handlebars.registerHelper('resolveLabel', function (value, options) {
                var value = +value;
                switch (value) {
                    case 0:
                        // بازبینی نشده
                        return 'warning';
                    case 1:
                        // تایید شده
                        return 'success';
                    case 2:
                        // رد شده
                        return 'danger';
                    case 3:
                        // حذف شده
                        return ' bg-blue-ebonyclay bg-font-blue-ebonyclay';
                    case 4:
                        // پخش شده
                        return ' bg-blue-hoki bg-font-blue-hoki';
                    case 5:
                        // غیر قابل پخش
                        return ' bg-red-thunderbird bg-font-red-thunderbird';
                    case 6:
                        // بازبینی گروه شده
                        return ' bg-yellow bg-font-yellow';
                    case 7:
                        // تایید گروه شده
                        return ' bg-purple-seance bg-font-purple-seance';
                    case 8:
                        // تایید هماهنگی
                        return ' bg-blue-hoki bg-font-blue-hoki';
                    case 9:
                        // استعلام
                        return 'info';
                    case 10:
                        // ????
                        return 'info';
                    default:
                        // پیش فرض
                        return ' bg-grey-mint bg-font-grey-mint';
                }
            });
            Handlebars.registerHelper('resolveNewsLabel', function (value, options) {
                var value = +value;
                switch (value) {
                    case 0:
                        return 'primary';
                    case 1:
                        return 'warning';
                    case 2:
                        return 'success';
                    case 3:
                        return 'danger';
                    default:
                        return 'info';
                }
            });
            Handlebars.registerHelper('resolveTaskLabel', function (value, options) {
                var value = +value;
                switch (value) {
                    case 1:
                        // بازبینی
                        return ' bg-blue-steel bg-font-blue-steel';
                    case 2:
                        // رفع اشکال
                        return ' bg-yellow-gold bg-font-yellow-gold';
                    default:
                        // پیش فرض
                        return 'info';
                }
            });
            Handlebars.registerHelper('getDefinitions', function (id, options) {
                return JSON.stringify(Global.getDefinitions(id));
            });
            Handlebars.registerHelper('getDefinitionOptions', function (id, accessType, options) {
                var items = '';
                var accessType = typeof accessType === "string" ? accessType : false;
                var id = typeof id === 'string' && id.indexOf('$') === 0 ? Config[id.slice(1)] : id;
                $.each(Config.definitions, function () {
                    if (this.Id === id)
                        for (i = 0; i < this.Children.length; i++)
                            if (accessType) {
                                if (Authorize.access(this.Children[i].Id, null, accessType))
                                    items += '<option value="' + this.Children[i].Value + '">' + this.Children[i].Key + '</option>';
                            } else
                                items += '<option value="' + this.Children[i].Value + '">' + this.Children[i].Key + '</option>';
                });
                return items;
            });
            Handlebars.registerHelper('getDefinitionCheckboxes', function (id, type, container, options) {
                var type = (typeof type !== "undefined") ? type : 'checkbox';
                var container = (typeof container !== "undefined") ? container : null;
                var items = '';
                $.each(Config.definitions, function () {
                    if (this.Id === id)
                        for (i = 0; i < this.Children.length; i++)
                            items += (container ? '<' + container + '>' : '') + '<div class="checkbox checkbox-primary checkbox-circle col-xs-12"><input name="force" data-validation="digit" id="checkbox_df' + this.Children[i].Value + '" value="' + this.Children[i].Value + '" type="' + type + '"><label for="checkbox_df' + this.Children[i].Value + '">' + this.Children[i].Key + '</label></div>' + (container ? '</' + container + '>' : '');
//                            items += '<option value="' + this.Children[i].Value + '">' + this.Children[i].Key + '</option>';
                });
                return items;
            });
            Handlebars.registerHelper('getDefinitionCheckboxesById', function (id, type, container, options) {
                var type = (typeof type !== "undefined") ? type : 'checkbox';
                var container = (typeof container !== "undefined") ? container : null;
                var items = '';
                $.each(Config.definitions, function () {
                    if (this.Id === id)
                        for (i = 0; i < this.Children.length; i++)
                            items += (container ? '<' + container + '>' : '') + '<div class="checkbox checkbox-primary checkbox-circle col-xs-12"><input name="force" data-validation="digit" id="checkbox_df' + this.Children[i].Id + '" value="' + this.Children[i].Id + '" type="' + type + '"><label for="checkbox_df' + this.Children[i].Id + '">' + this.Children[i].Key + '</label></div>' + (container ? '</' + container + '>' : '');
                });
                return items;
            });
            Handlebars.registerHelper('replaceTarget', function (html, options) {
                return html.replace(new RegExp('<a ', 'g'), '<a target="_blank" ');
            });
            Handlebars.registerHelper('authorize', function (action, options) {
                if (Authorize.access(action)) {
                    return options.fn(this);
                }
                return options.inverse(this);
            });
            Handlebars.registerHelper('authorizeByType', function (action, type, options) {
                var requestType = typeof type !== 'undefined' && type ? type : null;
                if (Authorize.access(action, null, requestType)) {
                    return options.fn(this);
                }
                return options.inverse(this);
            });
            Handlebars.registerHelper('zeroFill', function (number, size, options) {
                return Global.zeroFill(number, size);
            });
            Handlebars.registerHelper('zeroFillIndex', function (number, size, options) {
                return Global.zeroFill(number + 1, size);
            });
            Handlebars.registerHelper('shortenPath', function (path, parts, options) {
                var pathArray = path.split('\\');
                var outputArray = [];
                for (var i = 0; i < (pathArray.length - parts); i++) {
                    delete pathArray[i];
                }
                pathArray = $.grep(pathArray, function (n) {
                    return n == 0 || n;
                });
                return pathArray.join('\\');
            });
            Handlebars.registerHelper('generateSafeFileName', function (id, title, episodeNumber, duration, options) {
                var template = Config.hqFilenameTemplate;
                var safeString = template.replace(/{id}/, id)
                    .replace(/{episodeNumber}/, episodeNumber)
                    .replace(/{title}/, title.replace(/\s+/g, '-').replace(/[|&:;$%@"<>()+,]/g, ''))
                    .replace(/{duration}/, Global.createTimeNoHours(duration));
                return safeString;
                // var safeString = param0;
                // var safeString = '';
                // safeString += param1.replace(/[|&:;$%@"<>()+,]/g, '').replace(' ', '-');
                // safeString += '_' + Global.createTime2(param3).split(':').reverse().join('-');
                // safeString += '_کلاکت-' + param2;
                // return safeString;
            });
            Handlebars.registerHelper('$_get', function (property, date, options) {
                var date = typeof date !== "undefined" ? date : false;
                var output = '';
                if (typeof $_GET[property] !== "undefined") {
                    output = $_GET[property];
                    if (date)
                        output = Global.gregorianToJalali(output.split('T')[0]);
                }
                return output;
            });
            Handlebars.registerHelper('br', function (text) {
                text = Handlebars.Utils.escapeExpression(text);
                text = text.replace(/(\r\n|\n|\r)/gm, '<br />');
                return new Handlebars.SafeString(text);
            });
            Handlebars.registerHelper('parseList', function (text) {
                try {
                    var data = JSON.parse(text);
                    var html = '<ul class="parsed-list">';
                    for (var i in data) {
                        html += '<li>' + data[i] + '</li>';
                    }
                    html += '</ul>';
                } catch (e) {
                    html = text;
                }
                return html;
            });
            Handlebars.registerHelper('extractId', function (list) {
                var result = [];
                for (var i in list) {
                    result.push(list[i]['id']);
                }
                return result.join(',');
            });
            Handlebars.registerHelper('price', function (price) {
                return Global.processPrice(price);
            });
            Handlebars.registerHelper('stringify', function (json) {
                return JSON.stringify(json);
            });
            Handlebars.registerHelper('size', function (value) {
                return Global.humanFileSize(value);
            });
            Handlebars.registerHelper('input', function (value, options) {
                var policy = Global.getInputPolicy(value);
                var $el = $(options.fn(this));
                if (typeof policy.required !== 'undefined' && policy.required)
                    $el.prop('required', 'required');
                if (typeof policy.show !== 'undefined' && !policy.show) {
                    $el.addClass('invisible hide');
                    $el.attr('type', 'hidden');
                }
                if (typeof policy.min !== 'undefined' && policy.min)
                    $el.attr('data-min', policy.min);
                return $el.wrap('<p/>').parent().html();
            });
            Handlebars.registerHelper('persons', function (value, options) {
                var items = [];
                var output = '';
                var policies = Config.inputPolicies.persons.items;
                Object.keys(policies).forEach(function (item) {
                    if (policies[item].required) {
                        items.push(policies[item]);
                        output += '<tr class="placeholder" data-type="' + item + '" data-id="0"><td data-type="id">-</td><td data-type="family">ندارد</td><td data-type="name">ندارد</td><td data-type="type">' + policies[item].title + '</td><td></td></tr>';
                    }
                });
                return output ? output : '';
            });
            Handlebars.registerHelper('personsWarning', function (value, options) {
                var items = [];
                var policies = Config.inputPolicies.persons.items;
                Object.keys(policies).forEach(function (item) {
                    if (policies[item].required)
                        items.push(policies[item].title);
                });
                return items.length ? '<div class="alert alert-danger pull-right" style="margin-bottom: 10px; padding-top: 8px; padding-bottom: 8px;">وارد کردن ' + '<strong>' + items.join('، ') + '</strong>' + ' اجباری است.</div>' : '';
            });
        }
        , handlebarPartials: function () {
            Handlebars.registerPartial('scheduleRowTools', function () {
                var output = '<div class="tools"><button class="btn" data-task="add"><i class="fa fa-plus"></i></button><button class="btn" data-task="delete"><i class="fa fa-minus"></i></button></div>';
                return output;
            });
            Handlebars.registerPartial('mediaOptions2', function (options) {
                var options = typeof options !== 'undefined' && options !== '' ? options : {};
                var output = '<div class="btn-group dropdown dropdown-dark media-options">' +
                    '<button class="btn red btn-circle btn-icon-only dropdown-toggle" type="button" data-toggle="dropdown"><i class="fa fa-wrench"></i></button>' +
                    '<ul class="dropdown-menu" role="menu">' +
                    Config.mediaOptions.forEach(function (menu) {
                        if (typeof menu.items === 'undefined' || Authorize.access(menu.access)) {
                            var menuColor = typeof menu.color !== 'undefined' && menu.color !== null ? menu.color : 'primary';
                            output += '<li';
                            output += (typeof menu.items !== 'undefined' && menu.items !== null) ? ' class="dropdown-submenu"' : '';
                            output += (typeof menu.task !== 'undefined' && menu.task !== null) ? ' data-task="' + menu.task + '"' : '';
                            output += (typeof menu.value !== 'undefined' && menu.value !== null) ? ' data-task="' + menu.value + '"' : '';
                            output += '>';
                            output += '<a href="javascript:;">';
                            output += (typeof menu.icon !== 'undefined' && menu.icon !== null) ? '<span class="badge badge-' + menuColor + '"><i class="fa fa-' + menu.icon + '"></i></span>' : '';
                            output += menu.text + '</a>';
                            if (typeof menu.items !== 'undefined' && menu.items !== null) {
                                menu.items = (typeof menu.source !== 'undefined' && menu.source === 'dfn') ? Global.getDefinitions(menu.items) : menu.items;
                                output += '<ul class="dropdown-menu">';
                                menu.items.forEach(function (submenu) {
                                    var submenuColor = typeof submenu.color !== 'undefined' && submenu.color !== null ? submenu.color : 'primary';
                                    output += '<li';
                                    output += (typeof submenu.task !== 'undefined' && submenu.task !== null) ? ' data-task="' + submenu.task + '"' : '';
                                    output += (typeof submenu.value !== 'undefined' && submenu.value !== null) ? ' data-task="' + submenu.value + '"' : '';
                                    output += '>';
                                    output += '<a href="javascript:;">';
                                    output += (typeof submenu.icon !== 'undefined' && submenu.icon !== null) ? '<span class="badge badge-' + submenuColor + '"><i class="fa fa-' + submenu.icon + '"></i></span>' : '';
                                    output += submenu.text + '</a>';
                                    output += '</li>';
                                });
                                output += '</ul>';
                            }
                            output += '</li>';
                        }
                    });
                output += '</ul>';
                return output;
            });
            Handlebars.registerPartial('mediaOptions', function (options) {
                var options = typeof options !== 'undefined' && options !== '' ? options : {};
                var definitionTypes = Global.getDefinitions(2);
                var buttonClasses = 'btn blue-hoki btn-circle btn-icon-only dropdown-toggle';
                buttonClasses += (typeof options.small !== 'undefined') ? ' btn-sm' : "";
                var output = '<div class="btn-group dropdown dropdown-dark media-options">' +
                    '<button class="' + buttonClasses + '" type="button" data-toggle="dropdown"><i class="fa fa-wrench"></i></button>' +
                    '<ul class="dropdown-menu" role="menu">' +
                    '<li><a href="#" data-task="open-assign-modal"><i class="fa fa-share"></i> ارجاع</a></li>';
                // if (Authorize.access(4)) {
                output += '<li class="dropdown-submenu"><a href="javascript:;"><i class="fa fa-exchange"></i> تغییر وضعیت</a> ' +
                    '<ul class="dropdown-menu">';
                for (var i = 0; i < definitionTypes.length; i++) {
                    if (definitionTypes[i].value && Authorize.access(definitionTypes[i].value, null, 'media-state')) {
                        output += '<li data-task="state" data-value="' + definitionTypes[i].value + '"><a href="#">' + definitionTypes[i].text + '</a></li>';
                    }
                }
                output += '</ul></li>';
                // }
                output += '</ul></div>';
                return output;
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
    return {
        handlebars: Handlebars
        , template: template
    };

});
