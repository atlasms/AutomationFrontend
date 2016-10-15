define([
    'jquery',
    'underscore',
    'backbone',
    'config'
], function ($, _, Backbone, Config) {
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
            if (typeof time !== 'undefined') {
                var times = time.split(":");
                var hours = times[0];
                var minutes = times[1];
                var seconds = times[2];
                seconds = parseInt(seconds, 10) + (parseInt(minutes, 10) * 60) + (parseInt(hours, 10) * 3600);
            } else {
                var seconds = null;
            }
            return seconds;
        }
        , createTime: function (timestamp, showSign) {
            var output;
            var sign;
            showSign = (typeof showSign !== 'undefined') ? true : false;
            if (typeof timestamp !== 'undefined') {
                sign = (timestamp != Math.abs(timestamp)) ? '-' : '+';
                timestamp = Math.abs(timestamp);
                var time = new Date(0, 0, 0, 0, 0, timestamp, 0);
                var hours = Global.zeroFill(time.getHours(), 2);
                var minutes = Global.zeroFill(time.getMinutes(), 2);
                var seconds = Global.zeroFill(time.getSeconds(), 2);
                output = hours + ":" + minutes + ":" + seconds;
                output = (showSign) ? output + sign : output;
            }
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
    };
    return Global;
});