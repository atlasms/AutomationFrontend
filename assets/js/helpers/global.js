define(['jquery', 'underscore', 'backbone', 'config', 'jdate', 'cookie', 'persian-rex'
], function ($, _, Backbone, Config, jDate, Cookies, persianRex) {
//    window.formatPersian = false;

    var responsiveResize = (function () {
        var current_width = $(window).width();
        if (current_width < 768) {
            $('body').addClass("_xs").removeClass("_sm _md _lg");
        } else if (current_width > 767 && current_width < 992) {
            $('body').addClass("_sm").removeClass("_xs _md _lg");
        } else if (current_width > 991 && current_width < 1200) {
            $('body').addClass("_md").removeClass("_xs _sm _lg");
        } else if (current_width > 1199) {
            $('body').addClass("_lg").removeClass("_xs _sm _md");
        }
    })();

    String.prototype.toPersianDigits = function () {
        var id = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return this.replace(/[0-9]/g, function (w) {
            return id[+w];
        });
    };

    String.prototype.toEnglishDigits = function () {
        var id = { '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9' };
        return this.replace(/[^0-9.]/g, function (w) {
            return id[w] || w;
        });
    };

    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    !(function () {
        "use strict";
        $.fn.serializeObject = function () {
            var arr = this.serializeArray();

            return _.reduce(arr, function (memo, f) {
                var objField = _.reduceRight(f.name.replace(/\[/g, ".").replace(/\]/g, "").split("."), function (memo, p) {
                    var n = (/^[0-9]+$/.test(p)) ? [] : {};
                    n[p] = memo;
                    return n;
                }, f.value);
                $.extend(true, memo, objField);
                return memo;
            }, {});
        };
    })($);

    window.$_GET = {};
    document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
        function decode(s) {
            return decodeURIComponent(s.split("+").join(" "));
        }

        $_GET[decode(arguments[1])] = decode(arguments[2]);
    });

    window.versionCompare = function (left, right) {
        /**
         * Simply compares two string version values.
         *
         * Example:
         * versionCompare('1.1', '1.2') => -1
         * versionCompare('1.1', '1.1') =>  0
         * versionCompare('1.2', '1.1') =>  1
         * versionCompare('2.23.3', '2.22.3') => 1
         *
         * Returns:
         * -1 = left is LOWER than right
         *  0 = they are equal
         *  1 = left is GREATER = right is LOWER
         *  And FALSE if one of input versions are not valid
         *
         * @function
         * @param {String} left  Version #1
         * @param {String} right Version #2
         * @return {Integer|Boolean}
         * @author Alexey Bass (albass)
         * @since 2011-07-14
         */
        if (typeof left + typeof right != 'stringstring')
            return false;

        var a = left.split('.')
            , b = right.split('.')
            , i = 0, len = Math.max(a.length, b.length);

        for (; i < len; i++) {
            if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
                return 1;
            } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
                return -1;
            }
        }

        return 0;
    };

    $(document).off('click', '.sidebar-toggler');
    $(document).on('click', '.sidebar-toggler', function (e) {
        var $body = $('body');
        if ($body.hasClass("page-sidebar-closed") || $body.hasClass('page-sidebar-closed-hide-logo')) {
            console.log('body has class page-sidebar-closed', $body.attr('class'));
            $body.removeClass("page-sidebar-closed");
            $body.removeClass("page-sidebar-closed-hide-logo");
            if (Cookies) {
                Cookies.set('sidebar_closed', '0');
            }
        } else {
            console.log('body DOES NOT HAVE class page-sidebar-closed');
            $body.addClass("page-sidebar-closed");
            $body.addClass("page-sidebar-closed-hide-logo");
            if (Cookies) {
                Cookies.set('sidebar_closed', '1');
            }
        }
        $(window).trigger('resize');
    });

    var Global = {
        trimChar: function (string, charToRemove) {
            while (string.charAt(0) === charToRemove)
                string = string.substring(1);
            while (string.charAt(string.length - 1) === charToRemove)
                string = string.substring(0, string.length - 1);
            return string;
        }
        , convertTime: function (timestamp) {
            var d = new Date(timestamp * 1000), // Convert the passed timestamp to milliseconds
                yyyy = d.getFullYear(),
                mm = ('0' + (d.getMonth() + 1)).slice(-2), // Months are zero based. Add leading 0.
                dd = ('0' + d.getDate()).slice(-2), // Add leading 0.
                hh = d.getHours(),
                h = hh,
                min = ('0' + d.getMinutes()).slice(-2), // Add leading 0.
                ampm = 'AM',
                time;
            if (hh > 12) {
                h = hh - 12;
                ampm = 'PM';
            } else if (hh === 12) {
                h = 12;
                ampm = 'PM';
            } else if (hh === 0) {
                h = 12;
            }
            // ie: 2013-02-18, 8:35 AM	
            time = yyyy + '-' + mm + '-' + dd + ' ' + h + ':' + min + ' ' + ampm;
            return time;
        }
        , zeroFill: function (number, size) {
            size = (typeof size !== "undefined") ? size : 2;
            var number = number.toString();
            while (number.length < size)
                number = "0" + number;
            return number;
        }
        , processTime: function (time) {
            var seconds = 0;
            if (typeof time !== 'undefined') {
                var times = time.split(":");
                var hours = times[0];
                var minutes = times[1];
                seconds = times[2];
                seconds = parseInt(seconds, 10) + (parseInt(minutes, 10) * 60) + (parseInt(hours, 10) * 3600);
            }
            return seconds;
        }
        , extractDate: function (value, bypassConvert) {
            if (value && (+value.split('-')[0] === 1900 || +value.split('-')[0] === 0))
                return '';
            // var bypassConvert = typeof bypassConvert !== "undefined" && !!bypassConvert === true;
            if (value && value.indexOf("T") !== -1)
                return (bypassConvert) ? value.split('T')[0] : Global.gregorianToJalali(value.split('T')[0]);
            else
                return (bypassConvert) ? value : Global.gregorianToJalali(value);
        }
        , createTimeNoHours: function (timestamp) {
            if (typeof timestamp !== 'undefined') {
                var minutes = Global.zeroFill(parseInt(timestamp / 60));
                var seconds = Global.zeroFill(timestamp % 60);
                return seconds + '-' + minutes;
            }
            return '';
        }
        , createTime2: function (timestamp) {
            if (typeof timestamp !== 'undefined') {
                var hours = Global.zeroFill(parseInt(timestamp / 3600));
                var minutes = Global.zeroFill(parseInt(timestamp / 60) % 60);
                var seconds = Global.zeroFill(timestamp % 60);
                return hours + ":" + minutes + ":" + seconds;
            }
            return '';
        }
        , createTime: function (timestamp, showSign) {
            var output;
            var sign;
            showSign = (typeof showSign !== 'undefined');
            if (typeof timestamp !== 'undefined') {
                sign = (timestamp !== Math.abs(timestamp)) ? '-' : '+';
                timestamp = Math.abs(timestamp);
                var time = new Date(0, 0, 0, 0, 0, timestamp, 0);
            } else {
                var time = new Date();
            }
            var hours = Global.zeroFill(time.getHours(), 2);
            var minutes = Global.zeroFill(time.getMinutes(), 2);
            var seconds = Global.zeroFill(time.getSeconds(), 2);
            output = hours + ":" + minutes + ":" + seconds;
            output = (showSign) ? output + sign : output;
            return output;
        }
        , createDate: function (offset) {
            var output = '';
            if (typeof offset === 'undefined' || offset === '')
                offset = 0;
            var date = new Date();
            date.setDate(date.getDate() + offset);
            var dd = date.getDate();
            var mm = date.getMonth() + 1; //January is 0!
            var yyyy = date.getFullYear();
            if (dd < 10)
                dd = '0' + dd;
            if (mm < 10)
                mm = '0' + mm;
            output = yyyy + '-' + mm + '-' + dd;
            return output;
        }
        , persianToLatinDigits: function (s) {
            var a = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
            var p = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
            for (var i = 0; i < 10; i++) {
                s = s.replace(new RegExp(a[i], 'g'), i).replace(new RegExp(p[i], 'g'), i);
            }
            return s;
        }
        , jalaliToGregorian: function (datetime, splitter) {
            splitter = (typeof splitter !== "undefined") ? splitter : '-';
            if (typeof datetime === "undefined")
                return false;
            var datetime = Global.persianToLatinDigits(datetime).split(' ');
            var date = datetime[0].split(splitter);
            if (+date[0] > 1600)
                return datetime;
            if (+date[0] === 0)
                return datetime;
            var JDate = require('jdate');
            var gdate = JDate.to_gregorian(parseInt(date[0]), parseInt(date[1]), parseInt(date[2]));
            return greg_date = gdate.getFullYear() + '-' + Global.zeroFill(gdate.getMonth() + 1) + '-' + Global.zeroFill(gdate.getDate());
        }
        , gregorianToJalali: function (datetime, splitter) {
            if (typeof datetime === "undefined" || !datetime)
                return null;
            splitter = (typeof splitter !== "undefined") ? splitter : (datetime.indexOf('-') !== -1 ? '-' : '/');
            var dt = (datetime.indexOf(' ') !== -1) ? datetime.split(' ') : [datetime];
            var d = dt[0].split(splitter);
            if (+d[0] === 1900)
                return '';
            var JDate = require('jdate');
            var jdate = new JDate(new Date(d[0], (d[1] - 1), d[2]));
            for (var i in jdate.date)
                jdate.date[i] = Global.zeroFill(jdate.date[i]);
            return jdate.date.join('-');
        }
        , getVar: function (name, url) {
            if (!url) {
                url = window.location.href;
            }
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results)
                return null;
            if (!results[2])
                return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }
        , today: function () {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();
            if (dd < 10)
                dd = '0' + dd;
            if (mm < 10)
                mm = '0' + mm;
            return yyyy + '-' + mm + '-' + dd;
        }
        , getEPGMedia: function (data) {
            return typeof data === "undefined" || !data ? '' : CONFIG.epgMediaPath.replace(/{start}/, data.startMiladi.replace(' ', '/').replace(/\:/g, '/'))
                .replace(/{end}/, data.endMiladi.replace(' ', '/').replace(/\:/g, '/'))
                .replace(/{channel}/, data.channel);
        }
        , getQuery: function (name, url) {
            if (!url)
                url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results)
                return null;
            if (!results[2])
                return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }
        , getServerDate: function (callback) {
            $.ajax({
                type: 'HEAD'
                , url: window.location.href.toString()
                , cache: false
                , success: function (data, textStatus, request) {
                    if (typeof callback === "function")
                        callback(request);
                }
            });
        }
        , processPrice: function (num) {
            var n = num.toString(), p = n.indexOf('.');
            return n.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, function (m, i) {
                return p < 0 || i < p ? m + ',' : m;
            });
        }
        , wordCount: function ($el, preventMore) {
            var txtVal = $el.val();
            var limit = CONFIG.wordLimit;
            var words = txtVal.length === 0 ? 0 : txtVal.trim().replace(/\s+/gi, ' ').split(' ').length;
            var remaining = limit - words;
            var $counter = $el.parents('.form-group').find('.counter');
            $counter.html(remaining);
            if (Math.round(((remaining * 100) / limit)) < 10) {
                $counter.addClass('danger');
            } else {
                $counter.removeClass('danger');
            }
        }
        , characterCount: function ($el, preventMore) {
            var txtVal = $el.val();
            var limit = CONFIG.characterLimit;
            var remaining = limit - txtVal.length;
            var $counter = $el.parents('.form-group').find('.counter');
            $counter.html(remaining);
            if (Math.round(((remaining * 100) / limit)) < 10) {
                $counter.addClass('danger');
            } else {
                $counter.removeClass('danger');
            }
        }
        , getDefinitions: function (id) {
            var items = [];
            $.each(CONFIG.definitions, function () {
                if (this.Id === id) {
                    var $this = this;
                    for (i = 0; i < $this.Children.length; i++) {
                        items.push({ value: $this.Children[i].Value, text: $this.Children[i].Key });
                    }
                }
            });
            return items;
        }
        , getInputPolicy: function (key) {
            return typeof CONFIG.inputPolicies[key] !== 'undefined' ? CONFIG.inputPolicies[key] : null;
        }
        , calculateAspectRatio: function (val, lim) {
            var lower = [0, 1];
            var upper = [1, 0];
            while (true) {
                var mediant = [lower[0] + upper[0], lower[1] + upper[1]];
                if (val * mediant[1] > mediant[0]) {
                    if (lim < mediant[1]) {
                        return upper;
                    }
                    lower = mediant;
                } else if (val * mediant[1] == mediant[0]) {
                    if (lim >= mediant[1]) {
                        return mediant;
                    }
                    if (lower[1] < upper[1]) {
                        return lower;
                    }
                    return upper;
                } else {
                    if (lim < mediant[1]) {
                        return lower;
                    }
                    upper = mediant;
                }
            }
        }
        , checkForPersianCharacters: function (text, method) {
            method = typeof method === 'string' ? method : 'text';
            return persianRex[method].test(text);
        }
        , objectListToArray: function (obj) {
            var arr = [];
            try {
                for (var key in Object.keys(obj)) {
                    arr.push(obj[key]);
                }
            } catch (e) {
                // ignore
            }
            return arr;
        }
        , checkMediaFilesAvailability: function (files) {
            var avail = {};
            CONFIG.mainMediaExtensions.map(function (i) {
                avail[i] = 0;
            });
            for (var key in files) {
                var file = files[key];
                if (file.Path !== 'original') {
                    if (typeof avail[file.Extension] !== 'undefined' && file.State === 'online') {
                        avail[file.Extension]++;
                    }
                }
            }
            for (var i in avail) {
                if (avail[i] === 0) {
                    return false;
                }
            }
            return true;
        }
        // TEMP
        // TODO: Wee need a useful localStorage helper class
        , Cache: {
            getStorage: function () {
                return JSON.parse(STORAGE.getItem(CONFIG.storageKey));
            }
            , setStorage: function (obj) {
                var data = JSON.stringify(obj);
                STORAGE.setItem(CONFIG.storageKey, data);
            }
            , getMenu: function () {
                var storage = Global.Cache.getStorage();
                if (typeof storage.cache !== "undefined" && typeof storage.cache.menu !== "undefined")
                    return Global.Cache.getStorage().cache.menu;
                return {};
            }
            , saveMenu: function (data) {
                var storage = Global.Cache.getStorage();
                if (typeof storage.cache === "undefined")
                    storage.cache = {};
                storage.cache.menu = data;
                Global.Cache.setStorage(storage);
            }
        }
    };
    return Global;
});
