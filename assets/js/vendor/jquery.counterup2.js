'use strict';
!function(module, factory) {
    if ("object" == typeof exports && "object" == typeof module) {
        module.exports = factory();
    } else {
        if ("function" == typeof define && define.amd) {
            define([], factory);
        } else {
            if ("object" == typeof exports) {
                exports.counterUp = factory();
            } else {
                module.counterUp = factory();
            }
        }
    }
}(window, function() {
    return function(e) {
        /**
         * @param {number} i
         * @return {?}
         */
        function t(i) {
            if (n[i]) {
                return n[i].exports;
            }
            var module = n[i] = {
                i : i,
                l : false,
                exports : {}
            };
            return e[i].call(module.exports, module, module.exports, t), module.l = true, module.exports;
        }
        var n = {};
        return t.m = e, t.c = n, t.d = function(d, name, n) {
            if (!t.o(d, name)) {
                Object.defineProperty(d, name, {
                    enumerable : true,
                    get : n
                });
            }
        }, t.r = function(x) {
            if ("undefined" != typeof Symbol && Symbol.toStringTag) {
                Object.defineProperty(x, Symbol.toStringTag, {
                    value : "Module"
                });
            }
            Object.defineProperty(x, "__esModule", {
                value : true
            });
        }, t.t = function(val, byteOffset) {
            if (1 & byteOffset && (val = t(val)), 8 & byteOffset) {
                return val;
            }
            if (4 & byteOffset && "object" == typeof val && val && val.__esModule) {
                return val;
            }
            /** @type {!Object} */
            var d = Object.create(null);
            if (t.r(d), Object.defineProperty(d, "default", {
                enumerable : true,
                value : val
            }), 2 & byteOffset && "string" != typeof val) {
                var s;
                for (s in val) {
                    t.d(d, s, function(attrPropertyName) {
                        return val[attrPropertyName];
                    }.bind(null, s));
                }
            }
            return d;
        }, t.n = function(module) {
            /** @type {function(): ?} */
            var n = module && module.__esModule ? function() {
                return module.default;
            } : function() {
                return module;
            };
            return t.d(n, "a", n), n;
        }, t.o = function(e, input) {
            return Object.prototype.hasOwnProperty.call(e, input);
        }, t.p = "", t(t.s = 0);
    }([function(canCreateDiscussions, a, active) {
        active.r(a);
        active.d(a, "divideNumbers", function() {
            return callback;
        });
        active.d(a, "hasComma", function() {
            return clickWithWebdriver;
        });
        active.d(a, "isFloat", function() {
            return isArray;
        });
        active.d(a, "decimalPlaces", function() {
            return forEach;
        });
        /**
         * @param {!Element} item
         * @return {undefined}
         */
        a.default = function(item) {
            var info = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
            var value = info.action;
            var type = void 0 === value ? "start" : value;
            var key = info.duration;
            var newElKey = void 0 === key ? 1e3 : key;
            var offset = info.delay;
            var delay = void 0 === offset ? 16 : offset;
            var m = info.lang;
            var querylang = void 0 === m ? void 0 : m;
            if ("stop" !== type) {
                if (cb(item), /[0-9]/.test(item.innerHTML)) {
                    var result = callback(item.innerHTML, {
                        duration : newElKey || item.getAttribute("data-duration"),
                        lang : querylang || document.querySelector("html").getAttribute("lang") || void 0,
                        delay : delay || item.getAttribute("data-delay")
                    });
                    item._countUpOrigInnerHTML = item.innerHTML;
                    item.innerHTML = result[0];
                    /** @type {string} */
                    item.style.visibility = "visible";
                    /** @type {number} */
                    item.countUpTimeout = setTimeout(function e() {
                        item.innerHTML = result.shift();
                        if (result.length) {
                            clearTimeout(item.countUpTimeout);
                            /** @type {number} */
                            item.countUpTimeout = setTimeout(e, delay);
                        } else {
                            item._countUpOrigInnerHTML = void 0;
                        }
                    }, delay);
                }
            } else {
                cb(item);
            }
        };
        /**
         * @param {!Element} item
         * @return {undefined}
         */
        var cb = function(item) {
            clearTimeout(item.countUpTimeout);
            if (item._countUpOrigInnerHTML) {
                item.innerHTML = item._countUpOrigInnerHTML;
                item._countUpOrigInnerHTML = void 0;
            }
            /** @type {string} */
            item.style.visibility = "";
        };
        /**
         * @param {string} t
         * @return {?}
         */
        var callback = function(t) {
            var d = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
            var v = d.duration;
            var r = void 0 === v ? 1e3 : v;
            var key = d.delay;
            var k = void 0 === key ? 16 : key;
            var original = d.lang;
            var locale = void 0 === original ? void 0 : original;
            /** @type {number} */
            var length = r / k;
            var tokens = t.toString().split(/(<[^>]+>|[0-9.][,.0-9]*[0-9]*)/);
            /** @type {!Array} */
            var positions = [];
            /** @type {number} */
            var i = 0;
            for (; i < length; i++) {
                positions.push("");
            }
            /** @type {number} */
            var j = 0;
            for (; j < tokens.length; j++) {
                if (/([0-9.][,.0-9]*[0-9]*)/.test(tokens[j]) && !/<[^>]+>/.test(tokens[j])) {
                    var p = tokens[j];
                    /** @type {boolean} */
                    var choiceParagraphElement = /[0-9]+,[0-9]+/.test(p);
                    p = p.replace(/,/g, "");
                    /** @type {boolean} */
                    var e = /^[0-9]+\.[0-9]+$/.test(p);
                    var c = e ? (p.split(".")[1] || []).length : 0;
                    /** @type {number} */
                    var b = positions.length - 1;
                    /** @type {number} */
                    var ratio = length;
                    for (; ratio >= 1; ratio--) {
                        /** @type {number} */
                        var n = parseInt(p / length * ratio, 10);
                        if (e) {
                            /** @type {string} */
                            n = parseFloat(p / length * ratio).toFixed(c);
                            /** @type {string} */
                            n = parseFloat(n).toLocaleString(locale);
                        }
                        if (choiceParagraphElement) {
                            n = n.toLocaleString(locale);
                        }
                        positions[b--] += n;
                    }
                } else {
                    /** @type {number} */
                    var i = 0;
                    for (; i < length; i++) {
                        positions[i] += tokens[j];
                    }
                }
            }
            return positions[positions.length] = t.toString(), positions;
        };
        /**
         * @param {?} selector
         * @return {?}
         */
        var clickWithWebdriver = function(selector) {
            return /[0-9]+,[0-9]+/.test(selector);
        };
        /**
         * @param {string} val
         * @return {?}
         */
        var isArray = function(val) {
            return /^[0-9]+\.[0-9]+$/.test(val);
        };
        /**
         * @param {string} obj
         * @return {?}
         */
        var forEach = function(obj) {
            return isArray(obj) ? (obj.split(".")[1] || []).length : 0;
        };
    }]);
});
