(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["persianDatepicker"] = factory();
	else
		root["persianDatepicker"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

let TypeChecking = __webpack_require__(25);
let Algorithms = __webpack_require__(18);
let Helpers = __webpack_require__(3);
let Duration = __webpack_require__(21);
let Validator = __webpack_require__(26);
let toPersianDigit = new Helpers().toPersianDigit;
let leftZeroFill = new Helpers().leftZeroFill;
let normalizeDuration = new Helpers().normalizeDuration;
let fa = __webpack_require__(23);
let en = __webpack_require__(22);


/**
 * @description persian date class
 */
class PersianDateClass {

    /**
     * @param input
     * @return {PersianDateClass}
     */
    constructor(input) {

        this.calendarType = PersianDateClass.calendarType;
        this.localType = PersianDateClass.localType;
        this.leapYearMode = PersianDateClass.leapYearMode;

        this.algorithms = new Algorithms(this);
        this.version = "1.2.0";
        this._utcMode = false;
        if (this.localType !== 'fa') {
            this.formatPersian = false;
        } else {
            this.formatPersian = '_default';
        }
        this.State = this.algorithms.State;
        this.setup(input);
        if (this.State.isInvalidDate) {
          // Return Date like message
          return new Date([-1, -1]);
        }
        return this;
    }

    /**
     * @param input
     */
    setup(input) {
        // Convert Any thing to Gregorian Date
        if (TypeChecking.isDate(input)) {
            this._gDateToCalculators(input);
        }
        else if (TypeChecking.isArray(input)) {
            if (!Validator.validateInputArray(input)) {
              this.State.isInvalidDate = true;
              return false;
            }
            this.algorithmsCalc([
              input[0], 
              input[1] ? input[1] : 1, 
              input[2] ? input[2] : 1, 
              input[3] ? input[3] : 0,
              input[4] ? input[4] : 0,
              input[5] ? input[5] : 0,
              input[6] ? input[6] : 0
            ]);
        }
        else if (TypeChecking.isNumber(input)) {
            const fromUnix = new Date(input);
            this._gDateToCalculators(fromUnix);
        }
        // instance of pDate
        else if (input instanceof PersianDateClass) {
            this.algorithmsCalc([
                input.year(),
                input.month(),
                input.date(),
                input.hour(),
                input.minute(),
                input.second(),
                input.millisecond()
            ]);
        }
        // ASP.NET JSON Date
        else if (input && input.substring(0, 6) === '/Date(') {
            const fromDotNet = new Date(parseInt(input.substr(6)));
            this._gDateToCalculators(fromDotNet);
        }
        else {
            const now = new Date();
            this._gDateToCalculators(now);
        }
    }

    /**
     * @param input
     * @return {*}
     * @private
     */
    _getSyncedClass(input) {
        let syncedCelander = PersianDateClass.toCalendar(this.calendarType).toLocale(this.localType).toLeapYearMode(this.leapYearMode);
        return new syncedCelander(input);
    }

    /**
     * @param inputgDate
     * @private
     */
    _gDateToCalculators(inputgDate) {
        this.algorithms.calcGregorian(
            [
                inputgDate.getFullYear(),
                inputgDate.getMonth(),
                inputgDate.getDate(),
                inputgDate.getHours(),
                inputgDate.getMinutes(),
                inputgDate.getSeconds(),
                inputgDate.getMilliseconds()
            ]);
    }

    /**
     * @since 1.0.0
     * @description Helper method that return date range name like week days name, month names, month days names (specially in persian calendar).
     * @static
     * @return {*}
     */
    static rangeName() {
        const p = PersianDateClass,
            t = p.calendarType;
        if (p.localType === 'fa') {
            if (t === 'persian') {
                return fa.persian;
            }
            else {
                return fa.gregorian;
            }
        } else {
            if (t === 'persian') {
                return en.persian;
            }
            else {
                return en.gregorian;
            }
        }
    }

    /**
     * @since 1.0.0
     * @description Helper method that return date range name like week days name, month names, month days names (specially in persian calendar).
     * @return {*}
     */
    rangeName() {
        const t = this.calendarType;
        if (this.localType === 'fa') {
            if (t === 'persian') {
                return fa.persian;
            }
            else {
                return fa.gregorian;
            }
        } else {
            if (t === 'persian') {
                return en.persian;
            }
            else {
                return en.gregorian;
            }
        }
    }

    /**
     * @since 1.0.0
     * @param input
     * @return {PersianDateClass}
     */
    toLeapYearMode(input) {
        this.leapYearMode = input;
        if (input === 'astronomical' && this.calendarType == 'persian') {
            this.leapYearMode = 'astronomical';
        }
        else if (input === 'algorithmic' && this.calendarType == 'persian') {
            this.leapYearMode = 'algorithmic';
        }
        this.algorithms.updateFromGregorian();
        return this;
    }

    /**
     * @since 1.0.0
     * @static
     * @param input
     * @return {PersianDateClass}
     */
    static toLeapYearMode(input) {
        let d = PersianDateClass;
        d.leapYearMode = input;
        return d;
    }

    /**
     * @since 1.0.0
     * @param input
     * @return {PersianDateClass}
     */
    toCalendar(input) {
        this.calendarType = input;
        this.algorithms.updateFromGregorian();
        return this;
    }


    /**
     * @since 1.0.0
     * @static
     * @param input
     * @return {PersianDateClass}
     */
    static toCalendar(input) {
        let d = PersianDateClass;
        d.calendarType = input;
        return d;
    }


    /**
     * @since 1.0.0
     * @static
     * @param input
     * @return {PersianDateClass}
     */
    static toLocale(input) {
        let d = PersianDateClass;
        d.localType = input;
        if (d.localType !== 'fa') {
            d.formatPersian = false;
        } else {
            d.formatPersian = '_default';
        }
        return d;
    }

    /**
     * @since 1.0.0
     * @param input
     * @return {PersianDateClass}
     */
    toLocale(input) {
        this.localType = input;
        if (this.localType !== 'fa') {
            this.formatPersian = false;
        } else {
            this.formatPersian = '_default';
        }
        return this;
    }

    /**
     * @return {*}
     * @private
     */
    _locale() {
        const t = this.calendarType;
        if (this.localType === 'fa') {
            if (t === 'persian') {
                return fa.persian;
            }
            else {
                return fa.gregorian;
            }
        } else {
            if (t === 'persian') {
                return en.persian;
            }
            else {
                return en.gregorian;
            }
        }
    }

    /**
     * @param input
     * @private
     */
    _weekName(input) {
        return this._locale().weekdays[input - 1];
    }

    /**
     * @param input
     * @private
     */
    _weekNameShort(input) {
        return this._locale().weekdaysShort[input - 1];
    }

    /**
     * @param input
     * @private
     */
    _weekNameMin(input) {
        return this._locale().weekdaysMin[input - 1];
    }

    /**
     * @param input
     * @return {*}
     * @private
     */
    _dayName(input) {
        return this._locale().persianDaysName[input - 1];
    }

    /**
     * @param input
     * @private
     */
    _monthName(input) {
        return this._locale().months[input - 1];
    }

    /**
     * @param input
     * @private
     */
    _monthNameShort(input) {
        return this._locale().monthsShort[input - 1];
    }


    /**
     * @param obj
     * @returns {boolean}
     */
    static isPersianDate(obj) {
        return obj instanceof PersianDateClass;
    }

    /**
     * @param obj
     * @return {boolean}
     */
    isPersianDate(obj) {
        return obj instanceof PersianDateClass;
    }

    /**
     * @returns {PersianDate}
     */
    clone() {
        return this._getSyncedClass(this.State.gDate);
    }

    /**
     * @since 1.0.0
     * @param dateArray
     * @return {*}
     */
    algorithmsCalc(dateArray) {
        if (this.isPersianDate(dateArray)) {
            dateArray = [
                dateArray.year(),
                dateArray.month(),
                dateArray.date(),
                dateArray.hour(),
                dateArray.minute(),
                dateArray.second(),
                dateArray.millisecond()
            ];
        }
        if (this.calendarType === 'persian' && this.leapYearMode == 'algorithmic') {
            return this.algorithms.calcPersian(dateArray);
        }
        else if (this.calendarType === 'persian' && this.leapYearMode == 'astronomical') {
            return this.algorithms.calcPersiana(dateArray);
        }
        else if (this.calendarType === 'gregorian') {
          dateArray[1] = dateArray[1] - 1;
          return this.algorithms.calcGregorian(dateArray);
        }
    }

    /**
     * @since 1.0.0
     * @return {*}
     */
    calendar() {
        let key;
        if (this.calendarType == 'persian') {
            if (this.leapYearMode == 'astronomical') {
                key = 'persianAstro';
            }
            else if (this.leapYearMode == 'algorithmic') {
                key = 'persianAlgo';
            }
        } else {
            key = 'gregorian';
        }
        return this.State[key];
    }


    /**
     * @description return Duration object
     * @param input
     * @param key
     * @returns {Duration}
     */
    static duration(input, key) {
        return new Duration(input, key);
    }

    /**
     * @description return Duration object
     * @param input
     * @param key
     * @returns {Duration}
     */
    duration(input, key) {
        return new Duration(input, key);
    }

    /**
     * @description check if passed object is duration
     * @param obj
     * @returns {boolean}
     */
    static isDuration(obj) {
        return obj instanceof Duration;
    }

    /**
     * @description check if passed object is duration
     * @param obj
     * @returns {boolean}
     */
    isDuration(obj) {
        return obj instanceof Duration;
    }


    /**
     * @param input
     * @returns {*}
     */
    years(input) {
        return this.year(input);
    }


    /**
     * @param input
     * @returns {*}
     */
    year(input) {
        if (input || input === 0) {
            this.algorithmsCalc(
                [input, this.month(), this.date(), this.hour(), this.minute(), this.second(), this.millisecond()]
            );
            return this;
        } else {
            return this.calendar().year;
        }
    }


    /**
     * @param input
     * @returns {*}
     */
    month(input) {
        if (input || input === 0) {
            this.algorithmsCalc([this.year(), input, this.date()]);
            return this;
        } else {
            return this.calendar().month + 1;
        }
    }


    /**
     * Day of week
     * @returns {Function|Date.toJSON.day|date_json.day|PersianDate.day|day|output.day|*}
     */
    days() {
        return this.day();
    }


    /**
     * @returns {Function|Date.toJSON.day|date_json.day|PersianDate.day|day|output.day|*}
     */
    day() {
        return this.calendar().weekday;
    }


    /**
     * Day of Months
     * @param input
     * @returns {*}
     */
    dates(input) {
        return this.date(input);
    }


    /**
     * @param input
     * @returns {*}
     */
    date(input) {
        if (input || input === 0) {
            this.algorithmsCalc([this.year(), this.month(), input]);
            return this;
        } else {
            return this.calendar().day;
        }
    }

    /**
     * @param input
     * @returns {*}
     */
    hour(input) {
        return this.hours(input);
    }


    /**
     * @param input
     * @returns {*}
     */
    hours(input) {
        if (input || input === 0) {
            if (input === 0 ) {
              input = 24;
            }
            this.algorithmsCalc([this.year(), this.month(), this.date(), input]);
            return this;
        } else {
            return this.State.gDate.getHours();
        }
    }

    /**
     * @param input
     * @returns {*}
     */
    minute(input) {
        return this.minutes(input);
    }


    /**
     * @param input
     * @returns {*}
     */
    minutes(input) {
        if (input || input === 0) {
            this.algorithmsCalc([this.year(), this.month(), this.date(), this.hour(), input]);
            return this;
        } else {
            return this.State.gDate.getMinutes();
        }
    }

    /**
     * @param input
     * @returns {*}
     */
    second(input) {
        return this.seconds(input);

    }


    /**
     * @param input
     * @returns {*}
     */
    seconds(input) {
        if (input || input === 0) {
            this.algorithmsCalc([this.year(), this.month(), this.date(), this.hour(), this.minute(), input]);
            return this;
        } else {
            return this.State.gDate.getSeconds();
        }
    }


    /**
     * @param input
     * @returns {*}
     * Getter Setter
     */
    millisecond(input) {
        return this.milliseconds(input);
    }


    /**
     * @param input
     * @returns {*}
     */
    milliseconds(input) {
        if (input || input === 0) {
            this.algorithmsCalc([this.year(), this.month(), this.date(), this.hour(), this.minute(), this.second(), input]);
            return this;
        } else {
            return this.State.gregorian.millisecond;
        }
    }


    /**
     * Return Milliseconds since the Unix Epoch (1318874398806)
     * @returns {*}
     * @private
     */
    //    _valueOf () {
    //        return this.State.gDate.valueOf();
    //    }


    static unix(timestamp) {
        if (timestamp) {
            return new PersianDateClass(timestamp * 1000);
        } else {
            return new PersianDateClass().unix();
        }
    }

    /**
     * Return Unix Timestamp (1318874398)
     * @param timestamp
     * @returns {*}
     */
    unix(timestamp) {
        let output;
        if (timestamp) {
            return this._getSyncedClass(timestamp * 1000);
        } else {
            let str = this.State.gDate.valueOf().toString();
            output = str.substring(0, str.length - 3);
        }
        return parseInt(output);
    }

    /**
     * @returns {*}
     */
    valueOf() {
        return this.State.gDate.valueOf();
    }


    /**
     * @param year
     * @param month
     * @returns {*}
     * @since 1.0.0
     */
    static getFirstWeekDayOfMonth(year, month) {
        return new PersianDateClass([year, month, 1]).day();
    }

    /**
     * @param year
     * @param month
     * @returns {*}
     * @since 1.0.0
     */
    getFirstWeekDayOfMonth(year, month) {
        return this._getSyncedClass([year, month, 1]).day();
    }


    /**
     * @param input
     * @param val
     * @param asFloat
     * @returns {*}
     */
    diff(input, val, asFloat) {
        let self = this,
            inputMoment = input,
            zoneDiff = 0,
            diff = self.State.gDate - inputMoment.toDate() - zoneDiff,
            year = self.year() - inputMoment.year(),
            month = self.month() - inputMoment.month(),
            date = (self.date() - inputMoment.date()) * -1, output;

        if (val === 'months' || val === 'month') {
            output = year * 12 + month + date / 30;
        } else if (val === 'years' || val === 'year') {
            output = year + (month + date / 30) / 12;
        } else {
            output = val === 'seconds' || val === 'second' ? diff / 1e3 : // 1000
                val === 'minutes' || val === 'minute' ? diff / 6e4 : // 1000 * 60
                    val === 'hours' || val === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                        val === 'days' || val === 'day' ? diff / 864e5 : // 1000 * 60 * 60 * 24
                            val === 'weeks' || val === 'week' ? diff / 6048e5 : // 1000 * 60 * 60 * 24 * 7
                                diff;
        }
        return asFloat ? output : Math.round(output);
    }


    /**
     * @param key
     * @returns {*}
     */
    startOf(key) {
        let syncedCelander = PersianDateClass.toCalendar(this.calendarType).toLocale(this.localType);
        let newArray = new PersianDateClass(this.valueOf() - ((this.calendar().weekday - 1) * 86400000)).toArray();
        // Simplify this\
        /* jshint ignore:start */
        switch (key) {
            case 'years':
            case 'year':
                return new syncedCelander([this.year(), 1, 1]);
            case 'months':
            case 'month':
                return new syncedCelander([this.year(), this.month(), 1]);
            case 'days':
            case 'day':
                return new syncedCelander([this.year(), this.month(), this.date(), 0, 0, 0]);
            case 'hours':
            case 'hour':
                return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), 0, 0]);
            case 'minutes':
            case 'minute':
                return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), this.minutes(), 0]);
            case 'seconds':
            case 'second':
                return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), this.minutes(), this.seconds()]);
            case 'weeks':
            case 'week':
                return new syncedCelander(newArray);
            default:
                return this.clone();
        }
        /* jshint ignore:end */
    }


    /**
     * @param key
     * @returns {*}
     */
    /* eslint-disable no-case-declarations */
    endOf(key) {
        let syncedCelander = PersianDateClass.toCalendar(this.calendarType).toLocale(this.localType);
        // Simplify this
        switch (key) {
            case 'years':
            case 'year':
                let days = this.isLeapYear() ? 30 : 29;
                return new syncedCelander([this.year(), 12, days, 23, 59, 59]);
            case 'months':
            case 'month':
                let monthDays = this.daysInMonth(this.year(), this.month());
                return new syncedCelander([this.year(), this.month(), monthDays, 23, 59, 59]);
            case 'days':
            case 'day':
                return new syncedCelander([this.year(), this.month(), this.date(), 23, 59, 59]);
            case 'hours':
            case 'hour':
                return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), 59, 59]);
            case 'minutes':
            case 'minute':
                return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), this.minutes(), 59]);
            case 'seconds':
            case 'second':
                return new syncedCelander([this.year(), this.month(), this.date(), this.hours(), this.minutes(), this.seconds()]);
            case 'weeks':
            case 'week':
                let weekDayNumber = this.calendar().weekday;
                return new syncedCelander([this.year(), this.month(), this.date() + (7 - weekDayNumber)]);
            default:
                return this.clone();
        }
        /* eslint-enable no-case-declarations */
    }


    /**
     * @returns {*}
     */
    sod() {
        return this.startOf('day');
    }


    /**
     * @returns {*}
     */
    eod() {
        return this.endOf('day');
    }

    /** Get the timezone offset in minutes.
     * @return {*}
     */
    zone(input) {
        if (input || input === 0) {
            this.State.zone = input;
            return this;
        } else {
            return this.State.zone;
        }
    }


    /**
     * @returns {PersianDate}
     */
    local() {
        let utcStamp;
        if (this._utcMode) {
            let ThatDayOffset = new Date(this.toDate()).getTimezoneOffset();
            let offsetMils = ThatDayOffset * 60 * 1000;
            if (ThatDayOffset < 0) {
                utcStamp = this.valueOf() - offsetMils;
            } else {
                /* istanbul ignore next */
                utcStamp = this.valueOf() + offsetMils;
            }
            this.toCalendar(PersianDateClass.calendarType);
            const utcDate = new Date(utcStamp);
            this._gDateToCalculators(utcDate);
            this._utcMode = false;
            this.zone(ThatDayOffset);
            return this;
        }
        else {
            return this;
        }
    }

    /**
     * @param input
     * @return {*}
     */
    static utc(input) {
        if (input) {
            return new PersianDateClass(input).utc();
        }
        else {
            return new PersianDateClass().utc();
        }
    }


    /**
     * @description Current date/time in UTC mode
     * @param input
     * @returns {*}
     */
    utc(input) {
        let utcStamp;
        if (input) {
            return this._getSyncedClass(input).utc();
        }
        if (this._utcMode) {
            return this;
        } else {
            let offsetMils = this.zone() * 60 * 1000;
            if (this.zone() < 0) {
                utcStamp = this.valueOf() + offsetMils;
            } else {
                /* istanbul ignore next */
                utcStamp = this.valueOf() - offsetMils;
            }
            const utcDate = new Date(utcStamp),
                d = this._getSyncedClass(utcDate);
            this.algorithmsCalc(d);
            this._utcMode = true;
            this.zone(0);
            return this;
        }
    }


    /**
     * @returns {boolean}
     */
    isUtc() {
        return this._utcMode;
    }


    /**
     * @returns {boolean}
     * @link https://fa.wikipedia.org/wiki/%D8%B3%D8%A7%D8%B9%D8%AA_%D8%AA%D8%A7%D8%A8%D8%B3%D8%AA%D8%A7%D9%86%DB%8C
     */
    isDST() {
        let month = this.month(),
            day = this.date();
        if ((month == 1 && day > 1) || (month == 6 && day < 31) || (month < 6 && month >= 2)) {
            return true;
        }
        else {
            return false;
        }
    }



    /**
     * @returns {boolean}
     */
    isLeapYear(year) {
        if (year === undefined) {
            year = this.year();
        }
        if (this.calendarType == 'persian' && this.leapYearMode === 'algorithmic') {
            return this.algorithms.leap_persian(year);
        }
        if (this.calendarType == 'persian' && this.leapYearMode === 'astronomical') {
            return this.algorithms.leap_persiana(year);
        }
        else if (this.calendarType == 'gregorian') {
            return this.algorithms.leap_gregorian(year);
        }
    }


    /**
     * @param yearInput
     * @param monthInput
     * @returns {number}
     */
    daysInMonth(yearInput, monthInput) {
        let year = yearInput ? yearInput : this.year(),
            month = monthInput ? monthInput : this.month();
        if (this.calendarType === 'persian') {
            if (month < 1 || month > 12)
                return 0;
            if (month < 7)
                return 31;
            if (month < 12)
                return 30;
            if (this.isLeapYear(year)) {
                return 30;
            }
            return 29;
        }
        if (this.calendarType === 'gregorian') {
            return new Date(year, month, 0).getDate();
        }
    }


    /**
     * @description Return Native Javascript Date
     * @returns {*|PersianDate.gDate}
     */
    toDate() {
        return this.State.gDate;
    }


    /**
     * @description Returns Array Of Persian Date
     * @returns {array}
     */
    toArray() {
        return [this.year(), this.month(), this.date(), this.hour(), this.minute(), this.second(), this.millisecond()];
    }


    /**
     * @returns {*}
     */
    formatNumber() {
        let output, self = this;

        // if default conf dosent set follow golbal config
        if (this.formatPersian === '_default') {
            if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
                /* istanbul ignore next */
                if (self.formatPersian === false) {
                    output = false;
                } else {
                    // Default Conf
                    output = true;
                }
            }
            /* istanbul ignore next */
            else {
                if (window.formatPersian === false) {
                    output = false;
                } else {
                    // Default Conf
                    output = true;
                }
            }
        } else {
            if (this.formatPersian === true) {
                output = true;
            } else if (this.formatPersian === false) {
                output = false;
            } else {
                Error('Invalid Config "formatPersian" !!');
            }
        }
        return output;
    }


    /**
     * @param inputString
     * @returns {*}
     */
    format(inputString) {
        if (this.State.isInvalidDate) {
          return false;
        }
        let self = this,
            formattingTokens = /([[^[]*])|(\\)?(Mo|MM?M?M?|Do|DD?D?D?|dddddd?|ddddd?|dddd?|do?|w[o|w]?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|zz?|ZZ?|X|LT|ll?l?l?|LL?L?L?)/g,
            info = {
                year: self.year(),
                month: self.month(),
                hour: self.hours(),
                minute: self.minutes(),
                second: self.seconds(),
                date: self.date(),
                timezone: self.zone(),
                unix: self.unix()
            },
            formatToPersian = self.formatNumber();

        let checkPersian = function (i) {
            if (formatToPersian) {
                return toPersianDigit(i);
            } else {
                return i;
            }
        };


        /* jshint ignore:start */
        function replaceFunction(input) {
            switch (input) {
                // AM/PM
                case ('a'): {
                    if (formatToPersian)
                        return ((info.hour >= 12) ? 'ب ظ' : 'ق ظ');
                    else
                        return ((info.hour >= 12) ? 'PM' : 'AM');
                }
                // Hours (Int)
                case ('H'): {
                    return checkPersian(info.hour);
                }
                case ('HH'): {
                    return checkPersian(leftZeroFill(info.hour, 2));
                }
                case ('h'): {
                    return checkPersian(info.hour % 12);
                }
                case ('hh'): {
                    return checkPersian(leftZeroFill(info.hour % 12, 2));
                }
                // Minutes
                case ('m'): {
                    return checkPersian(leftZeroFill(info.minute, 2));
                }
                // Two Digit Minutes
                case ('mm'): {
                    return checkPersian(leftZeroFill(info.minute, 2));
                }
                // Second
                case ('s'): {
                    return checkPersian(info.second);
                }
                case ('ss'): {
                    return checkPersian(leftZeroFill(info.second, 2));
                }
                // Day (Int)
                case ('D'): {
                    return checkPersian(leftZeroFill(info.date));
                }
                // Return Two Digit
                case ('DD'): {
                    return checkPersian(leftZeroFill(info.date, 2));
                }
                // Return day Of Month
                case ('DDD'): {
                    let t = self.startOf('year');
                    return checkPersian(leftZeroFill(self.diff(t, 'days'), 3));
                }
                // Return Day of Year
                case ('DDDD'): {
                    let t = self.startOf('year');
                    return checkPersian(leftZeroFill(self.diff(t, 'days'), 3));
                }
                // Return day Of week
                case ('d'): {
                    return checkPersian(self.calendar().weekday);
                }
                // Return week day name abbr
                case ('ddd'): {
                    return self._weekNameShort(self.calendar().weekday);
                }
                case ('dddd'): {
                    return self._weekName(self.calendar().weekday);
                }
                // Return Persian Day Name
                case ('ddddd'): {
                    return self._dayName(self.calendar().day);
                }
                // Return Persian Day Name
                case ('dddddd'): {
                    return self._weekNameMin(self.calendar().weekday);
                }
                // Return Persian Day Name
                case ('w'): {
                    let t = self.startOf('year'),
                        day = parseInt(self.diff(t, 'days') / 7) + 1;
                    return checkPersian(day);
                }
                // Return Persian Day Name
                case ('ww'): {
                    let t = self.startOf('year'),
                        day = leftZeroFill(parseInt(self.diff(t, 'days') / 7) + 1, 2);
                    return checkPersian(day);
                }
                // Month  (Int)
                case ('M'): {
                    return checkPersian(info.month);
                }
                // Two Digit Month (Str)
                case ('MM'): {
                    return checkPersian(leftZeroFill(info.month, 2));
                }
                // Abbr String of Month (Str)
                case ('MMM'): {
                    return self._monthNameShort(info.month);
                }
                // Full String name of Month (Str)
                case ('MMMM'): {
                    return self._monthName(info.month);
                }
                // Year
                // Two Digit Year (Str)
                case ('YY'): {
                    let yearDigitArray = info.year.toString().split('');
                    return checkPersian(yearDigitArray[2] + yearDigitArray[3]);
                }
                // Full Year (Int)
                case ('YYYY'): {
                    return checkPersian(info.year);
                }
                /* istanbul ignore next */
                case ('Z'): {
                    let flag = '+',
                        hours = Math.round(info.timezone / 60),
                        minutes = info.timezone % 60;

                    if (minutes < 0) {
                        minutes *= -1;
                    }
                    if (hours < 0) {
                        flag = '-';
                        hours *= -1;
                    }

                    let z = flag + leftZeroFill(hours, 2) + ':' + leftZeroFill(minutes, 2);
                    return checkPersian(z);
                }
                /* istanbul ignore next */
                case ('ZZ'): {
                    let flag = '+',
                        hours = Math.round(info.timezone / 60),
                        minutes = info.timezone % 60;

                    if (minutes < 0) {
                        minutes *= -1;
                    }
                    if (hours < 0) {
                        flag = '-';
                        hours *= -1;
                    }
                    let z = flag + leftZeroFill(hours, 2) + '' + leftZeroFill(minutes, 2);
                    return checkPersian(z);
                }
                /* istanbul ignore next */
                case ('X'): {
                    return self.unix();
                }
                // 8:30 PM
                case ('LT'): {
                    return self.format('H:m a');
                }
                // 09/04/1986
                case ('L'): {
                    return self.format('YYYY/MM/DD');
                }
                // 9/4/1986
                case ('l'): {
                    return self.format('YYYY/M/D');
                }
                // September 4th 1986
                case ('LL'): {
                    return self.format('MMMM DD YYYY');
                }
                // Sep 4 1986
                case ('ll'): {
                    return self.format('MMM DD YYYY');
                }
                //September 4th 1986 8:30 PM
                case ('LLL'): {
                    return self.format('MMMM YYYY DD   H:m  a');
                }
                // Sep 4 1986 8:30 PM
                case ('lll'): {
                    return self.format('MMM YYYY DD   H:m  a');
                }
                //Thursday, September 4th 1986 8:30 PM
                case ('LLLL'): {
                    return self.format('dddd D MMMM YYYY  H:m  a');
                }
                // Thu, Sep 4 1986 8:30 PM
                case ('llll'): {
                    return self.format('ddd D MMM YYYY  H:m  a');
                }
            }
        }

        /* jshint ignore:end */

        if (inputString) {
            return inputString.replace(formattingTokens, replaceFunction);
        } else {
            let inputString = 'YYYY-MM-DD HH:mm:ss a';
            return inputString.replace(formattingTokens, replaceFunction);
        }
    }


    /**
     * @param key
     * @param value
     * @returns {PersianDate}
     */
    add(key, value) {
        if (value === 0 ) {
          return this;
        }
        let unit = normalizeDuration(key, value).unit,
            arr = this.toArray();
        value = normalizeDuration(key, value).value;
        if (unit === 'year') {
            let normalizedDate = arr[2] ,
              monthDays = this.daysInMonth(arr[0] + value, arr[1]);
            if (arr[2] > monthDays) {
                normalizedDate = monthDays;
            }
            let tempDate = new PersianDateClass([arr[0] + value, arr[1], normalizedDate, arr[3], arr[4], arr[5], arr[6], arr[7]]);
            return tempDate;
        }
        if (unit === 'month') {
            let tempYear = Math.floor(value / 12);
            let remainingMonth = value - (tempYear * 12),
                calcedMonth = null;
            if (arr[1] + remainingMonth > 12) {
                tempYear += 1;
                calcedMonth = arr[1] + remainingMonth - 12;
            } else {
                calcedMonth = arr[1] + remainingMonth ;
            }
            let normalizaedDate = arr[2],
                tempDateArray = new PersianDateClass([arr[0] + tempYear, calcedMonth, 1, arr[3], arr[4], arr[5], arr[6], arr[7]]).toArray(),
                monthDays = this.daysInMonth(arr[0] + tempYear, calcedMonth);
            if (arr[2] > monthDays) {
                normalizaedDate = monthDays;
            }
            return new PersianDateClass([tempDateArray[0], tempDateArray[1], normalizaedDate, tempDateArray[3], tempDateArray[4], tempDateArray[5], tempDateArray[6], tempDateArray[7]]);
        }
        if (unit === 'day') {
            let calcedDay = new PersianDateClass(this.valueOf()).hour(12),
                newMillisecond = calcedDay.valueOf() + (value * 86400000),
                newDate = new PersianDateClass(newMillisecond);
            return newDate.hour(arr[3]);
        }
        if (unit === 'week') {
            let calcedDay = new PersianDateClass(this.valueOf()).hour(12),
                newMillisecond = calcedDay.valueOf() + (7 * value * 86400000),
                newDate = new PersianDateClass(newMillisecond);
            return newDate.hour(arr[3]);
        }
        if (unit === 'hour') {
            let newMillisecond = this.valueOf() + (value * 3600000);
            return this.unix(newMillisecond / 1000);
        }
        if (unit === 'minute') {
            let newMillisecond = this.valueOf() + (value * 60000);
            return this.unix(newMillisecond / 1000);
        }
        if (unit === 'second') {
            let newMillisecond = this.valueOf() + (value * 1000);
            return this.unix(newMillisecond / 1000);
        }
        if (unit === 'millisecond') {
            let newMillisecond = this.valueOf() + value;
            return this.unix(newMillisecond / 1000);
        }
        return this._getSyncedClass(this.valueOf());
    }


    /**
     * @param key
     * @param value
     * @returns {PersianDate}
     */
    subtract(key, value) {
        return this.add(key, value * -1);
    }

    /**
     * check if a date is same as b
     * @param dateA
     * @param dateB
     * @since 1.0.0
     * @return {boolean}
     * @static
     */
    static isSameDay(dateA, dateB) {
        return dateA && dateB && dateA.date() == dateB.date() && dateA.year() == dateB.year() && dateA.month() == dateB.month();
    }

    /**
     * @param dateB
     * @since 1.0.0
     * @return {PersianDateClass|*|boolean}
     */
    isSameDay(dateB) {
        return this && dateB && this.date() == dateB.date() && this.year() == dateB.year() && this.month() == dateB.month();
    }

    /**
     * @desc check if a month is same as b
     * @param {Date} dateA
     * @param {Date} dateB
     * @return {boolean}
     * @since 1.0.0
     * @static
     */
    static isSameMonth(dateA, dateB) {
        return dateA && dateB && dateA.year() == dateB.year() && dateA.month() == dateB.month();
    }

    /**
     * @desc check two for month similarity
     * @param dateA
     * @param dateB
     * @since 1.0.0
     * @return {*|boolean}
     */
    isSameMonth(dateB) {
        return this && dateB && this.year() == this.year() && this.month() == dateB.month();
    }
}

/**
 * @type {PersianDateClass}
 */
module.exports = PersianDateClass;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Helper = {

    // leading edge, instead of the trailing.
    debounce: function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this,
                args = arguments;
            var later = function later() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },


    /**
     * @desc normal log
     * @param input
     * @example log('whoooooha')
     */
    log: function log(input) {
        /*eslint-disable no-console */
        console.log(input);
        /*eslint-enable no-console */
    },


    /* eslint-disable no-useless-escape */
    isMobile: function () {
        var check = false;
        (function (a) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
        })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }(),
    /* eslint-enable no-useless-escape */

    /**
     * @desc show debug messages if window.persianDatepickerDebug set as true
     * @param elem
     * @param input
     * @example window.persianDatepickerDebug = true;
     * debug('element','message');
     */
    debug: function debug(elem, input) {
        /*eslint-disable no-console */
        if (window.persianDatepickerDebug) {
            if (elem.constructor.name) {
                console.log('Debug: ' + elem.constructor.name + ' : ' + input);
            } else {
                console.log('Debug: ' + input);
            }
        }
        /*eslint-enable no-console */
    },
    delay: function delay(callback, ms) {
        clearTimeout(window.datepickerTimer);
        window.datepickerTimer = setTimeout(callback, ms);
    }
};

module.exports = Helper;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * @type {string}
 */
var Template = "\n<div id=\"plotId\" class=\"datepicker-plot-area {{cssClass}}\">\n    {{#navigator.enabled}}\n        <div data-navigator class=\"datepicker-navigator\">\n            <div class=\"pwt-btn pwt-btn-next\">{{navigator.text.btnNextText}}</div>\n            <div class=\"pwt-btn pwt-btn-switch\">{{navigator.switch.text}}</div>\n            <div class=\"pwt-btn pwt-btn-prev\">{{navigator.text.btnPrevText}}</div>\n        </div>\n    {{/navigator.enabled}}\n    <div class=\"datepicker-grid-view\" >\n    {{#days.enabled}}\n        {{#days.viewMode}}\n        <div class=\"datepicker-day-view\" >    \n            <div class=\"month-grid-box\">\n                <div class=\"header\">\n                    <div class=\"title\"></div>\n                    <div class=\"header-row\">\n                        {{#weekdays.list}}\n                            <div class=\"header-row-cell\">{{.}}</div>\n                        {{/weekdays.list}}\n                    </div>\n                </div>    \n                <table cellspacing=\"0\" class=\"table-days\">\n                    <tbody>\n                        {{#days.list}}\n                           \n                            <tr>\n                                {{#.}}\n                                    {{#enabled}}\n                                        <td data-date=\"{{dataDate}}\" data-unix=\"{{dataUnix}}\" >\n                                            <span  class=\"{{#otherMonth}}other-month{{/otherMonth}}\">{{title}}</span>\n                                            {{#altCalendarShowHint}}\n                                            <i  class=\"alter-calendar-day\">{{alterCalTitle}}</i>\n                                            {{/altCalendarShowHint}}\n                                        </td>\n                                    {{/enabled}}\n                                    {{^enabled}}\n                                        <td data-date=\"{{dataDate}}\" data-unix=\"{{dataUnix}}\" class=\"disabled\">\n                                            <span class=\"{{#otherMonth}}other-month{{/otherMonth}}\">{{title}}</span>\n                                            {{#altCalendarShowHint}}\n                                            <i  class=\"alter-calendar-day\">{{alterCalTitle}}</i>\n                                            {{/altCalendarShowHint}}\n                                        </td>\n                                    {{/enabled}}\n                                    \n                                {{/.}}\n                            </tr>\n                        {{/days.list}}\n                    </tbody>\n                </table>\n            </div>\n        </div>\n        {{/days.viewMode}}\n    {{/days.enabled}}\n    \n    {{#month.enabled}}\n        {{#month.viewMode}}\n            <div class=\"datepicker-month-view\">\n                {{#month.list}}\n                    {{#enabled}}               \n                        <div data-year=\"{{year}}\" data-month=\"{{dataMonth}}\" class=\"month-item {{#selected}}selected{{/selected}}\">{{title}}</small></div>\n                    {{/enabled}}\n                    {{^enabled}}               \n                        <div data-year=\"{{year}}\"data-month=\"{{dataMonth}}\" class=\"month-item month-item-disable {{#selected}}selected{{/selected}}\">{{title}}</small></div>\n                    {{/enabled}}\n                {{/month.list}}\n            </div>\n        {{/month.viewMode}}\n    {{/month.enabled}}\n    \n    {{#year.enabled }}\n        {{#year.viewMode }}\n            <div class=\"datepicker-year-view\" >\n                {{#year.list}}\n                    {{#enabled}}\n                        <div data-year=\"{{dataYear}}\" class=\"year-item {{#selected}}selected{{/selected}}\">{{title}}</div>\n                    {{/enabled}}\n                    {{^enabled}}\n                        <div data-year=\"{{dataYear}}\" class=\"year-item year-item-disable {{#selected}}selected{{/selected}}\">{{title}}</div>\n                    {{/enabled}}                    \n                {{/year.list}}\n            </div>\n        {{/year.viewMode }}\n    {{/year.enabled }}\n    \n    </div>\n    {{#time}}\n    {{#enabled}}\n    <div class=\"datepicker-time-view\">\n        {{#hour.enabled}}\n            <div class=\"hour time-segment\" data-time-key=\"hour\">\n                <div class=\"up-btn\" data-time-key=\"hour\">\u25B2</div>\n                <input disabled value=\"{{hour.title}}\" type=\"text\" placeholder=\"hour\" class=\"hour-input\">\n                <div class=\"down-btn\" data-time-key=\"hour\">\u25BC</div>                    \n            </div>       \n            <div class=\"divider\">\n                <span>:</span>\n            </div>\n        {{/hour.enabled}}\n        {{#minute.enabled}}\n            <div class=\"minute time-segment\" data-time-key=\"minute\" >\n                <div class=\"up-btn\" data-time-key=\"minute\">\u25B2</div>\n                <input disabled value=\"{{minute.title}}\" type=\"text\" placeholder=\"minute\" class=\"minute-input\">\n                <div class=\"down-btn\" data-time-key=\"minute\">\u25BC</div>\n            </div>        \n            <div class=\"divider second-divider\">\n                <span>:</span>\n            </div>\n        {{/minute.enabled}}\n        {{#second.enabled}}\n            <div class=\"second time-segment\" data-time-key=\"second\"  >\n                <div class=\"up-btn\" data-time-key=\"second\" >\u25B2</div>\n                <input disabled value=\"{{second.title}}\"  type=\"text\" placeholder=\"second\" class=\"second-input\">\n                <div class=\"down-btn\" data-time-key=\"second\" >\u25BC</div>\n            </div>\n            <div class=\"divider meridian-divider\"></div>\n            <div class=\"divider meridian-divider\"></div>\n        {{/second.enabled}}\n        {{#meridian.enabled}}\n            <div class=\"meridian time-segment\" data-time-key=\"meridian\" >\n                <div class=\"up-btn\" data-time-key=\"meridian\">\u25B2</div>\n                <input disabled value=\"{{meridian.title}}\" type=\"text\" class=\"meridian-input\">\n                <div class=\"down-btn\" data-time-key=\"meridian\">\u25BC</div>\n            </div>\n        {{/meridian.enabled}}\n    </div>\n    {{/enabled}}\n    {{/time}}\n    \n    {{#toolbox}}\n    {{#enabled}}\n    <div class=\"toolbox\">\n        {{#toolbox.submitButton.enabled}}\n            <div class=\"pwt-btn-submit\">{{submitButtonText}}</div>\n        {{/toolbox.submitButton.enabled}}        \n        {{#toolbox.todayButton.enabled}}\n            <div class=\"pwt-btn-today\">{{todayButtonText}}</div>\n        {{/toolbox.todayButton.enabled}}        \n        {{#toolbox.calendarSwitch.enabled}}\n            <div class=\"pwt-btn-calendar\">{{calendarSwitchText}}</div>\n        {{/toolbox.calendarSwitch.enabled}}\n    </div>\n    {{/enabled}}\n    {{^enabled}}\n        {{#onlyTimePicker}}\n        <div class=\"toolbox\">\n            <div class=\"pwt-btn-submit\">{{submitButtonText}}</div>\n        </div>\n        {{/onlyTimePicker}}\n    {{/enabled}}\n    {{/toolbox}}\n</div>\n";

module.exports = Template;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

let durationUnit = __webpack_require__(20).durationUnit;

class Helpers {

    /**
     * @description return converted string to persian digit
     * @param digit
     * @returns {string|*}
     */
    toPersianDigit (digit, latinDigit = false) {
        return digit.toString().replace(/\d+/g, function (digit) {
            let enDigitArr = [], peDigitArr = [], i, j;
            for (i = 0; i < digit.length; i += 1) {
                enDigitArr.push(digit.charCodeAt(i));
            }
            for (j = 0; j < enDigitArr.length; j += 1) {
                peDigitArr.push(String.fromCharCode(enDigitArr[j] + ((!!latinDigit && latinDigit === true) ? 1584 : 1728)));
            }
            return peDigitArr.join('');
        });
    }

    /**
     * @param number
     * @param targetLength
     * @returns {string}
     */
    leftZeroFill (number, targetLength) {
        let output = number + '';
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return output;
    }

    /**
     * @description normalize duration params and return valid param
     * @return {{unit: *, value: *}}
     */
    normalizeDuration () {
        let unit, value;
        if (typeof arguments[0] === 'string') {
            unit = arguments[0];
            value = arguments[1];
        }
        else {
            value = arguments[0];
            unit = arguments[1];
        }
        if (durationUnit.year.indexOf(unit) > -1) {
            unit = 'year';
        }
        else if (durationUnit.month.indexOf(unit) > -1) {
            unit = 'month';
        }
        else if (durationUnit.week.indexOf(unit) > -1) {
            unit = 'week';
        }
        else if (durationUnit.day.indexOf(unit) > -1) {
            unit = 'day';
        }
        else if (durationUnit.hour.indexOf(unit) > -1) {
            unit = 'hour';
        }
        else if (durationUnit.minute.indexOf(unit) > -1) {
            unit = 'minute';
        }
        else if (durationUnit.second.indexOf(unit) > -1) {
            unit = 'second';
        }
        else if (durationUnit.millisecond.indexOf(unit) > -1) {
            unit = 'millisecond';
        }
        return {
            unit: unit,
            value: value
        };
    }


    /**
     *
     * @param number
     * @returns {number}
     */
    absRound (number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    /**
     *
     * @param number
     * @return {number}
     */
    absFloor (number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }
}

module.exports = Helpers;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var State = __webpack_require__(13);
var Toolbox = __webpack_require__(14);
var View = __webpack_require__(15);
var Input = __webpack_require__(8);
var API = __webpack_require__(5);
var Navigator = __webpack_require__(9);
var Options = __webpack_require__(10);
var PersianDateWrapper = __webpack_require__(12);

/**
 * Main datepicker object, manage every things
 */

var Model = function () {

  /**
   * @param inputElement
   * @param options
   * @private
   */
  function Model(inputElement, options) {
    _classCallCheck(this, Model);

    return this.components(inputElement, options);
  }

  _createClass(Model, [{
    key: 'components',
    value: function components(inputElement, options) {
      /**
       * @desc [initialUnix=null]
       * @type {unix}
       */
      this.initialUnix = null;

      /**
       * @desc inputElement=inputElement
       * @type {Object}
       */
      this.inputElement = inputElement;

      /**
       * @desc handle works about config
       * @type {Options}
       */
      this.options = new Options(options, this);

      /**
       *
       * @type {PersianDateWrapper}
       */
      this.PersianDate = new PersianDateWrapper(this);

      /**
       * @desc set and get selected and view and other state
       * @type {State}
       */
      this.state = new State(this);

      this.api = new API(this);

      /**
       * @desc handle works about input and alt field input element
       * @type {Input}
       */
      this.input = new Input(this, inputElement);

      /**
       * @desc render datepicker view base on State
       * @type {View}
       */
      this.view = new View(this);

      /**
       * @desc handle works about toolbox
       * @type {Toolbox}
       */
      this.toolbox = new Toolbox(this);

      /**
       *
       * @param unix
       */
      this.updateInput = function (unix) {
        this.input.update(unix);
      };

      this.state.setViewDateTime('unix', this.input.getOnInitState());
      this.state.setSelectedDateTime('unix', this.input.getOnInitState());
      this.view.render();

      /**
       * @desc handle navigation and dateoicker element events
       * @type {Navigator}
       */
      this.navigator = new Navigator(this);

      return this.api;
    }
  }]);

  return Model;
}();

module.exports = Model;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This is the API documentation for persian-datepicker
 */
var API = function () {
    function API(model) {
        _classCallCheck(this, API);

        this.model = model;
    }

    /**
     * @description get current option object
     * @example var pd = $('.selector').persianDatepicker();
     * console.log(pd.options);
     */


    _createClass(API, [{
        key: 'show',


        /**
         * @description make datepicker visible
         * @example var pd = $('.selector').persianDatepicker();
         * pd.show();
         */
        value: function show() {
            console.log(this.model);
            this.model.view.show();
            this.model.options.onShow(this.model);
            return this.model;
        }

        /**
         * @description return datepicker current state
         * @since 1.0.0
         * @example var pd = $('.selector').persianDatepicker();
         * var state = pd.getState();
         *
         * console.log(state.selected);
         * console.log(state.view);
         * */

    }, {
        key: 'getState',
        value: function getState() {
            return this.model.state;
        }

        /**
         * @description make datepicker invisible
         * @example var pd = $('.selector').persianDatepicker();
         * pd.show();
         */

    }, {
        key: 'hide',
        value: function hide() {
            this.model.view.hide();
            this.model.options.onHide(this.model);
            return this.model;
        }

        /**
         * @description toggle datepicker visibility state
         * @example var pd = $('.selector').persianDatepicker();
         * pd.toggle();
         */

    }, {
        key: 'toggle',
        value: function toggle() {
            this.model.view.toggle();
            this.model.options.onToggle(this.model);
            return this.model;
        }

        /**
         * @description destroy every thing clean dom and
         * @example var pd = $('.selector').persianDatepicker();
         * pd.destroy();
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            if (this.model) {
                this.model.view.destroy();
                this.model.options.onDestroy(this.model);
                delete this.model;
            }
        }

        /**
         * @description set selected date of datepicker accept unix timestamp
         * @param unix
         * @example var pd = $('.selector').persianDatepicker();
         * pd.setDate(1382276091100)
         */

    }, {
        key: 'setDate',
        value: function setDate(unix) {
            this.model.state.setSelectedDateTime('unix', unix);
            this.model.state.setViewDateTime('unix', unix);
            this.model.state.setSelectedDateTime('unix', unix);
            this.model.view.render(this.view);
            this.model.options.onSet(unix);
            return this.model;
        }
    }, {
        key: 'options',
        get: function get() {
            return this.model.options;
        }

        /**
         * @description set options live
         * @example var pd = $('.selector').persianDatepicker();
         * pd.options;
         * //return current options
         * pd.options = {};
         * // set options and render datepicker with new options
         */
        ,
        set: function set(inputOptions) {
            var opt = $.extend(true, this.model.options, inputOptions);
            this.model.view.destroy();
            this.model.components(this.model.inputElement, opt);
        }
    }]);

    return API;
}();

module.exports = API;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Helper = __webpack_require__(1);

/**
 * @description persian-datepicker configuration document
 */
var Config = {

  /**
   * @description set default calendar mode of datepicker, available options: 'persian', 'gregorian'
   * @default 'persian'
   * @type string
   * @since 1.0.0
   */
  'calendarType': 'persian',

  /**
   * @description calendar type and localization configuration
   * @type object
   * @since 1.0.0
   * @example
   * {
   *     'persian': {
   *         'locale': 'fa',
   *         'showHint': false,
   *         'leapYearMode': 'algorithmic' // "astronomical"
   *     },
   *
   *     'gregorian': {
   *         'locale': 'en',
   *         'showHint': false
   *     }
   * }
   *
   *
   *
   */
  'calendar': {

    /**
     * @description Persian calendar configuration
     * @type object
     * @since 1.0.0
     */
    'persian': {

      /**
       * @description set locale of Persian calendar available options: 'fa', 'en'
       * @default 'fa'
       * @type string
       * @since 1.0.0
       */
      'locale': 'fa',

      /**
       * @description if set true, small date hint of this calendar will be shown on another calendar
       * @type boolean
       * @default false
       * @since 1.0.0
       */
      'showHint': false,

      /**
       * @description Persian calendar leap year calculation mode, available options: 'algorithmic', 'astronomical'
       * @type string
       * @link http://babakhani.github.io/PersianWebToolkit/doc/persian-date/leapyear
       * @default 'algorithmic'
       * @since 1.0.0
       */
      'leapYearMode': 'algorithmic' // "astronomical"
    },

    /**
     * @description Gregorian calendar configuration
     * @type object
     * @since 1.0.0
     */
    'gregorian': {

      /**
       * @description set locale of Gregorian calendar available options: 'fa', 'en'
       * @default 'en'
       * @type string
       * @since 1.0.0
       */
      'locale': 'en',

      /**
       * @description if set true, small date hint of this calendar will be shown on another calendar
       * @type boolean
       * @default false
       * @since 1.0.0
       */
      'showHint': false
    }
  },

  /**
   * @description if set true make enable responsive view on mobile devices
   * @type boolean
   * @since 1.0.0
   * @default true
   */
  'responsive': true,

  /**
   * @description if true datepicker render inline
   * @type boolean
   * @default false
   */
  'inline': false,

  /**
   * @description If set true datepicker init with input value date, use data-date property when you want set inline datepicker initial value
   * @type boolean
   * @default true
   */
  'initialValue': true,

  /**
   * @description Initial value calendar type, accept: 'persian', 'gregorian'
   * @type boolean
   * @default true
   */
  'initialValueType': 'gregorian',

  /**
   * @description from v1.0.0 this options is deprecated, use calendar.persian.locale instead
   * @deprecated
   * @type boolean
   * @default true
   */
  'persianDigit': true,

  /**
   * @description default view mode, Acceptable value : day,month,year
   * @type {string}
   * @default 'day'
   */
  'viewMode': 'day',

  /**
   * @description the date format, combination of d, dd, m, mm, yy, yyy.
   * @link http://babakhani.github.io/PersianWebToolkit/doc/persian-date/#format
   * @type {boolean}
   * @default 'LLLL'
   */
  'format': 'LLLL',

  /**
   * @description format value of input
   * @param unixDate
   * @default function
   * @example function (unixDate) {
   *      var self = this;
   *      var pdate = new persianDate(unixDate);
   *      pdate.formatPersian = this.persianDigit;
   *      return pdate.format(self.format);
   *  }
   */
  'formatter': function formatter(unixDate) {
    var self = this,
        pdate = this.model.PersianDate.date(unixDate);
    return pdate.format(self.format);
  },

  /**
   * @description An input element that is to be updated with the selected date from the datepicker. Use the altFormat option to change the format of the date within this field. Leave as blank for no alternate field. acceptable value: : '#elementId','.element-class'
   * @type {boolean}
   * @default false
   * @example
   * altField: '#inputAltFirld'
   *
   * altField: '.input-alt-field'
   */
  'altField': false,

  /**
   * @description the date format, combination of d, dd, m, mm, yy, yyy.
   * @link http://babakhani.github.io/PersianWebToolkit/doc/persian-date/#format
   * @type {string}
   * @default 'unix'
   */
  'altFormat': 'unix',

  /**
   * @description format value of 'altField' input
   * @param unixDate
   * @default function
   * @example function (unixDate) {
   *      var self = this;
   *      var thisAltFormat = self.altFormat.toLowerCase();
   *      if (thisAltFormat === 'gregorian' || thisAltFormat === 'g') {
   *          return new Date(unixDate);
   *      }
   *      if (thisAltFormat === 'unix' || thisAltFormat === 'u') {
   *          return unixDate;
   *      }
   *      else {
   *          var pd = new persianDate(unixDate);
   *          pd.formatPersian = this.persianDigit;
   *          return pd.format(self.altFormat);
   *      }
   *  }
   */
  'altFieldFormatter': function altFieldFormatter(unixDate) {
    var self = this,
        thisAltFormat = self.altFormat.toLowerCase(),
        pd = void 0;
    if (thisAltFormat === 'gregorian' || thisAltFormat === 'g') {
      return new Date(unixDate);
    }
    if (thisAltFormat === 'unix' || thisAltFormat === 'u') {
      return unixDate;
    } else {
      pd = this.model.PersianDate.date(unixDate);
      return pd.format(self.altFormat);
    }
  },

  /**
   * @description Set min date on datepicker, prevent user select date before given unix time
   * @property minDate
   * @type Date
   * @default null
   */
  'minDate': null,

  /**
   * @description Set max date on datepicker, prevent user select date after given unix time
   * @property maxDate
   * @type Date
   * @default null
   */
  'maxDate': null,

  /**
   * @description navigator config object
   * @type {object}
   * @default true
   */
  'navigator': {
    /**
     * @description make navigator enable or disable
     * @type boolean
     * @default true
     */
    'enabled': true,

    /**
     * @description navigate by scroll configuration
     * @type object
     * @description scroll navigation options
     */
    'scroll': {

      /**
       * @description if you want make disable scroll navigation set this option false
       * @type boolean
       * @default true
       */
      'enabled': true
    },

    /**
     * @description navigator text config object
     */
    'text': {
      /**
       * @description text of next button
       * @default '<'
       */
      'btnNextText': '<',

      /**
       * @description text of prev button
       * @default: '>'
       */
      'btnPrevText': '>'
    },

    /**
     * @description Called when navigator goes to next state
     * @event
     * @example function (navigator) {
     *      //log('navigator next ');
     *  }
     */
    'onNext': function onNext(datepickerObject) {
      Helper.debug(datepickerObject, 'Event: onNext');
    },

    /**
     * @description Called when navigator goes to previews state
     * @event
     * @example function (navigator) {
     *      //log('navigator prev ');
     *  }
     */
    'onPrev': function onPrev(datepickerObject) {
      Helper.debug(datepickerObject, 'Event: onPrev');
    },

    /**
     * @description Called when navigator switch
     * @event
     * @example function (datepickerObject) {
            // console.log('navigator switch ');
     *  }
     */
    'onSwitch': function onSwitch(datepickerObject) {
      Helper.debug(datepickerObject, 'dayPicker Event: onSwitch');
    }
  },

  /**
   * @description toolbox config object
   * @type {object}
   * @default true
   */
  'toolbox': {

    /**
     * @description boolean option that make toolbar enable or disable
     * @type boolean
     * @default true
     */
    'enabled': true,

    /**
     * @description toolbox button text configuration
     * @type object
     * @deprecated from 1.0.0
     */
    'text': {

      /**
       * @description text of today button, deprecated from 1.0.0
       * @type string
       * @default 'امروز'
       * @deprecated from 1.0.0
       */
      btnToday: 'امروز'

    },

    /**
     * @description submit button configuration (only shown on mobile)
     * @since 1.0.0
     */
    submitButton: {

      /**
       * @description make submit button enable or disable
       * @type boolean
       * @default false
       * @since 1.0.0
       */
      enabled: Helper.isMobile,

      /**
       * @description submit button text
       * @since 1.0.0
       * @type object
       */
      text: {

        /**
         * @description show when current calendar is Persian
         * @since 1.0.0
         * @type object
         * @default تایید
         */
        fa: 'تایید',

        /**
         * @description show when current calendar is Gregorian
         * @since 1.0.0
         * @type object
         * @default submit
         */
        en: 'submit'
      },

      /**
       * @description Called when submit button clicked
       * @since 1.0.0
       * @type function
       * @event
       */
      onSubmit: function onSubmit(datepickerObject) {
        Helper.debug(datepickerObject, 'dayPicker Event: onSubmit');
      }
    },

    /**
     * @description toolbox today button configuration
     * @since 1.0.0
     */
    todayButton: {

      /**
       * @description make toolbox today button enable or disable
       * @type boolean
       * @since 1.0.0
       */
      enabled: true,

      /**
       * @description today button text
       * @since 1.0.0
       * @type object
       */
      text: {

        /**
         * @description show when current calendar is Persian
         * @since 1.0.0
         * @type object
         * @default امروز
         */
        fa: 'امروز',

        /**
         * @description show when current calendar is Gregorian
         * @since 1.0.0
         * @type object
         * @default today
         */
        en: 'today'
      },

      /**
       * @description Called when today button clicked
       * @since 1.0.0
       * @type function
       * @event
       */
      onToday: function onToday(datepickerObject) {
        Helper.debug(datepickerObject, 'dayPicker Event: onToday');
      }
    },

    /**
     * @description toolbox calendar switch configuration
     * @type object
     * @since 1.0.0
     */
    calendarSwitch: {

      /**
       * @description make calendar switch enable or disable
       * @type boolean
       * @since 1.0.0
       * @default true
       */
      enabled: true,

      /**
       * @description calendar switch text format string
       * @link http://babakhani.github.io/PersianWebToolkit/doc/persian-date/#format
       * @type string
       * @since 1.0.0
       * @default MMMM
       */
      format: 'MMMM',

      /**
       * @description Called when calendar switch clicked
       * @since 1.0.0
       * @type function
       * @event
       */
      onSwitch: function onSwitch(datepickerObject) {
        Helper.debug(datepickerObject, 'dayPicker Event: onSwitch');
      }
    },

    /**
     * @event
     * @param toolbox
     * @example function (toolbox) {
     *      //log('toolbox today btn');
     *  }
     *  @deprecated 1.0.0
     */
    onToday: function onToday(datepickerObject) {
      Helper.debug(datepickerObject, 'dayPicker Event: onToday');
    }
  },

  /**
   * @description if true all pickers hide and just show timepicker
   * @default false
   * @type boolean
   */
  'onlyTimePicker': false,

  /**
   * @description  if true date select just by click on day in month grid, and when user select month or year selected date doesnt change
   * @property justSelectOnDate
   * @type boolean
   * @default: true
   */
  'onlySelectOnDate': true,

  /**
   * @description Validate date access before render
   * @type function
   */
  'checkDate': function checkDate() {
    return true;
  },

  /**
   * @description Validate month access before render
   * @type {function}
   */
  'checkMonth': function checkMonth() {
    return true;
  },

  /**
   * @description Validate year access before render
   * @type {function}
   */
  'checkYear': function checkYear() {
    return true;
  },

  /**
   * @description timePicker configuration
   * @type {object}
   */
  'timePicker': {

    /**
     * @description make timePicker enable or disable
     * @type boolean
     */
    'enabled': false,

    /**
     * @description The amount that increases or decreases by pressing the button
     * @type number
     */
    'step': 1,

    /**
     * @description hour selector configuration
     * @type object
     */
    'hour': {

      /**
       * @description make hour selector enable or disable
       * @type boolean
       */
      'enabled': true,

      /**
       * @description The amount that increases or decreases hour, by pressing the button. overwrite by timepicker.step
       * @type boolean
       */
      'step': null
    },

    /**
     * @description minute selector configuration
     * @type object
     */
    'minute': {

      /**
       * @description make minute selector enable or disable
       * @type boolean
       */
      'enabled': true,

      /**
       * @description The amount that increases or decreases minute, by pressing the button. overwrite by timepicker.step
       * @description overwrite by parent step
       * @type boolean
       */
      'step': null
    },

    /**
     * @description second selector configuration
     * @type object
     */
    'second': {

      /**
       * @description make second selector enable or disable
       * @type boolean
       */
      'enabled': true,

      /**
       * @description The amount that increases or decreases second, by pressing the button. overwrite by timepicker.step
       * @type boolean
       */
      'step': null
    },

    /**
     * @description meridian selector configuration
     * @type object
     */
    'meridian': {

      /**
       * @description if you set this as false, datepicker timepicker system moved to 24-hour system
       * @type boolean
       */
      'enabled': false
    }
  },

  /**
   * @description dayPicker configuration
   * @type {object}
   */
  'dayPicker': {

    /**
     * @description make daypicker enable or disable
     * @type boolean
     * @default true
     */
    'enabled': true,

    /**
     * @description daypicker title format string
     * @type string
     * @default 'YYYY MMMM'
     * @link http://babakhani.github.io/PersianWebToolkit/doc/persian-date/#format
     */
    'titleFormat': 'YYYY MMMM',

    /**
     * @description daypicker title formatter function
     * @param year
     * @param month
     * @return {*}
     */
    'titleFormatter': function titleFormatter(year, month) {
      var titleDate = this.model.PersianDate.date([year, month]);
      return titleDate.format(this.model.options.dayPicker.titleFormat);
    },

    /**
     * @description fired when user select date
     * @event
     * @param selectedDayUnix
     */
    'onSelect': function onSelect(selectedDayUnix) {
      Helper.debug(this, 'dayPicker Event: onSelect : ' + selectedDayUnix);
    }

  },

  /**
   * @description monthPicker configuration
   * @type {object}
   */
  'monthPicker': {

    /**
     * @description make monthPicker enable or disable
     * @type boolean
     * @default true
     */
    'enabled': true,

    /**
     * @description monthPicker title format string
     * @type string
     * @default 'YYYY'
     */
    'titleFormat': 'YYYY',

    /**
     * @description monthPicker title formatter function
     * @param unix
     * @return {*}
     */
    'titleFormatter': function titleFormatter(unix) {
      var titleDate = this.model.PersianDate.date(unix);
      return titleDate.format(this.model.options.monthPicker.titleFormat);
    },

    /**
     * @description fired when user select month
     * @event
     * @param monthIndex
     */
    'onSelect': function onSelect(monthIndex) {
      Helper.debug(this, 'monthPicker Event: onSelect : ' + monthIndex);
    }
  },

  /**
   * @description yearPicker configuration
   * @type {object}
   */
  'yearPicker': {

    /**
     * @description make yearPicker enable or disable
     * @type boolean
     * @default true
     */
    'enabled': true,

    /**
     * @description yearPicker title format string
     * @type string
     * @default 'YYYY'
     */
    'titleFormat': 'YYYY',

    /**
     * @description yearPicker title formatter function
     * @param year
     * @return {string}
     */
    'titleFormatter': function titleFormatter(year) {
      var remaining = parseInt(year / 12, 10) * 12;
      var startYear = this.model.PersianDate.date([remaining]);
      var endYear = this.model.PersianDate.date([remaining + 11]);
      return startYear.format(this.model.options.yearPicker.titleFormat) + '-' + endYear.format(this.model.options.yearPicker.titleFormat);
    },

    /**
     * @description fired when user select year
     * @event
     * @param year
     */
    'onSelect': function onSelect(year) {
      Helper.debug(this, 'yearPicker Event: onSelect : ' + year);
    }
  },

  /**
   * @description Called when date Select by user.
   * @event
   * @param unixDate
   */
  'onSelect': function onSelect(unixDate) {
    Helper.debug(this, 'datepicker Event: onSelect : ' + unixDate);
  },

  /**
   * @description Called when date Select by api.
   * @event
   * @param unixDate
   */
  'onSet': function onSet(unixDate) {
    Helper.debug(this, 'datepicker Event: onSet : ' + unixDate);
  },

  /**
   * @description position of datepicker relative to input element
   * @type string | array
   * @default 'auto'
   * @example
   *  'position': 'auto'
   *'position': [10,10]
   */
  'position': 'auto',

  /**
   * @description A function that takes current datepicker instance. It is called just before the datepicker is displayed.
   * @event
   */
  'onShow': function onShow(datepickerObject) {
    Helper.debug(datepickerObject, 'Event: onShow ');
  },

  /**
   * @description A function that takes current datepicker instance. It is called just before the datepicker Hide.
   * @event
   */
  'onHide': function onHide(datepickerObject) {
    Helper.debug(datepickerObject, 'Event: onHide ');
  },

  /**
   * @description on toggle datepicker event
   * @event
   */
  'onToggle': function onToggle(datepickerObject) {
    Helper.debug(datepickerObject, 'Event: onToggle ');
  },

  /**
   * @description on destroy datepicker event
   * @event
   */
  'onDestroy': function onDestroy(datepickerObject) {
    Helper.debug(datepickerObject, 'Event: onDestroy ');
  },

  /**
   * @description If true datepicker close When select a date
   * @type {boolean}
   * @default false
   */
  'autoClose': false,

  /**
   * @description by default datepicker have a template string, and you can overwrite it simply by replace string in config.
   * @type string
   * @example
   * <div id="plotId" class="datepicker-plot-area datepicker-plot-area-inline-view">
   {{#navigator.enabled}}
   <div class="navigator">
   <div class="datepicker-header">
   <div class="btn btn-next">{{navigator.text.btnNextText}}</div>
   <div class="btn btn-switch">{{ navigator.switch.text }}</div>
   <div class="btn btn-prev">{{navigator.text.btnPrevText}}</div>
   </div>
   </div>
   {{/navigator.enabled}}
   <div class="datepicker-grid-view" >
   {{#days.enabled}}
   {{#days.viewMode}}
   <div class="datepicker-day-view" >
   <div class="month-grid-box">
   <div class="header">
   <div class="title"></div>
   <div class="header-row">
   <div class="header-row-cell">ش</div>
   <div class="header-row-cell">ی</div>
   <div class="header-row-cell">د</div>
   <div class="header-row-cell">س</div>
   <div class="header-row-cell">چ</div>
   <div class="header-row-cell">پ</div>
   <div class="header-row-cell">ج</div>
   </div>
   </div>
   <table cellspacing="0" class="table-days">
   <tbody>
   {{#days.list}}
    <tr>
   {{#.}}
    {{#enabled}}
   <td data-unix="{{dataUnix}}" ><span  class="{{#otherMonth}}other-month{{/otherMonth}} {{#selected}}selected{{/selected}}">{{title}}</span></td>
   {{/enabled}}
   {{^enabled}}
   <td data-unix="{{dataUnix}}" class="disabled"><span class="{{#otherMonth}}other-month{{/otherMonth}}">{{title}}</span></td>
   {{/enabled}}
    {{/.}}
   </tr>
   {{/days.list}}
   </tbody>
   </table>
   </div>
   </div>
   {{/days.viewMode}}
   {{/days.enabled}}
    {{#month.enabled}}
   {{#month.viewMode}}
   <div class="datepicker-month-view">
   {{#month.list}}
   {{#enabled}}
   <div data-month="{{dataMonth}}" class="month-item {{#selected}}selected{{/selected}}">{{title}}</small></div>
   {{/enabled}}
   {{^enabled}}
   <div data-month="{{dataMonth}}" class="month-item month-item-disable {{#selected}}selected{{/selected}}">{{title}}</small></div>
   {{/enabled}}
   {{/month.list}}
   </div>
   {{/month.viewMode}}
   {{/month.enabled}}
    {{#year.enabled }}
   {{#year.viewMode }}
   <div class="datepicker-year-view" >
   {{#year.list}}
   {{#enabled}}
   <div data-year="{{dataYear}}" class="year-item {{#selected}}selected{{/selected}}">{{title}}</div>
   {{/enabled}}
   {{^enabled}}
   <div data-year="{{dataYear}}" class="year-item year-item-disable {{#selected}}selected{{/selected}}">{{title}}</div>
   {{/enabled}}
   {{/year.list}}
   </div>
   {{/year.viewMode }}
   {{/year.enabled }}
    </div>
   {{#time}}
   {{#enabled}}
   <div class="datepicker-time-view">
   {{#hour.enabled}}
   <div class="hour time-segment" data-time-key="hour">
   <div class="up-btn" data-time-key="hour">▲</div>
   <input value="{{hour.title}}" type="text" placeholder="hour" class="hour-input">
   <div class="down-btn" data-time-key="hour">▼</div>
   </div>
   <div class="divider">:</div>
   {{/hour.enabled}}
   {{#minute.enabled}}
   <div class="minute time-segment" data-time-key="minute" >
   <div class="up-btn" data-time-key="minute">▲</div>
   <input value="{{minute.title}}" type="text" placeholder="minute" class="minute-input">
   <div class="down-btn" data-time-key="minute">▼</div>
   </div>
   <div class="divider second-divider">:</div>
   {{/minute.enabled}}
   {{#second.enabled}}
   <div class="second time-segment" data-time-key="second"  >
   <div class="up-btn" data-time-key="second" >▲</div>
   <input value="{{second.title}}"  type="text" placeholder="second" class="second-input">
   <div class="down-btn" data-time-key="second" >▼</div>
   </div>
   <div class="divider meridian-divider"></div>
   <div class="divider meridian-divider"></div>
   {{/second.enabled}}
   {{#meridian.enabled}}
   <div class="meridian time-segment" data-time-key="meridian" >
   <div class="up-btn" data-time-key="meridian">▲</div>
   <input value="{{meridian.title}}" type="text" class="meridian-input">
   <div class="down-btn" data-time-key="meridian">▼</div>
   </div>
   {{/meridian.enabled}}
   </div>
   {{/enabled}}
   {{/time}}
    {{#toolbox}}
   {{#enabled}}
   <div class="toolbox ">
   <div class="btn-today">{{text.btnToday}}</div>
   </div>
   {{/enabled}}
   {{/toolbox}}
   </div>
   */
  'template': null,

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////// Under Implement ///////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * @description if true datepicker update self by user inputted date string, accept 'yyyy/mm/dd'
   * @example '1396/10/2', ''
   * @type {boolean}
   * @default false
   */
  'observer': false,

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////// Un  implemented ///////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  /**
   * @description waite time for last user key-down event, accept millisecond
   * @type {number}
   * @default 800
   */
  'inputDelay': 800
};

module.exports = Config;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Model = __webpack_require__(4);

/**
 * @author babakhani.reza@gmail.com
 * @description jquery plugin initializer
 */
(function ($) {

  $.fn.persianDatepicker = $.fn.pDatepicker = function (options) {
    var args = Array.prototype.slice.call(arguments),
        output = null,
        self = this;
    if (!this) {
      $.error('Invalid selector');
    }
    $(this).each(function () {
      // encapsulation Args
      var emptyArr = [],
          tempArg = args.concat(emptyArr),
          dp = $(this).data('datepicker'),
          funcName = null;
      if (dp && typeof tempArg[0] === 'string') {
        funcName = tempArg[0];
        output = dp[funcName](tempArg[0]);
      } else {
        self.pDatePicker = new Model(this, options);
      }
    });
    $(this).data('datepicker', self.pDatePicker);
    return self.pDatePicker;
  };
  /*eslint-enable no-unused-vars */
})(jQuery);

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Helper = __webpack_require__(1);
var PersianDateParser = __webpack_require__(11);
/**
 * Do every thing about input element like get default value, set new value, set alt field input and etc.
 */

var Input = function () {

    /**
     * @param {Model} model
     * @param {Element}
     * @return {Input}
     */
    function Input(model, inputElement) {
        _classCallCheck(this, Input);

        /**
         * @type {Object}
         */
        this.model = model;

        /**
         * @type {boolean}
         * @private
         */
        this._firstUpdate = true;

        /**
         * @type {Element}
         */
        this.elem = inputElement;

        if (this.model.options.observer) {
            this.observe();
        }

        this.addInitialClass();

        /**
         * @type {Number}
         */
        this.initialUnix = null;

        if (this.model.options.inline == false) {
            this._attachInputElementEvents();
        }

        return this;
    }

    _createClass(Input, [{
        key: 'addInitialClass',
        value: function addInitialClass() {
            $(this.elem).addClass('pwt-datepicker-input-element');
        }
    }, {
        key: 'parseInput',
        value: function parseInput(inputString) {
            var parse = new PersianDateParser(),
                that = this;
            if (parse.parse(inputString) !== undefined) {
                var pd = this.model.PersianDate.date(parse.parse(inputString)).valueOf();
                that.model.state.setSelectedDateTime('unix', pd);
                that.model.state.setViewDateTime('unix', pd);
                that.model.view.render();
            }
        }
    }, {
        key: 'observe',
        value: function observe() {
            var that = this;
            /////////////////   Manipulate by Copy And paste
            $(that.elem).bind('paste', function (e) {
                Helper.delay(function () {
                    that.parseInput(e.target.value);
                }, 60);
            });
            var typingTimer = void 0,
                doneTypingInterval = that.model.options.inputDelay,
                ctrlDown = false,
                ctrlKey = [17, 91],
                vKey = 86;

            $(document).keydown(function (e) {
                if ($.inArray(e.keyCode, ctrlKey) > 0) ctrlDown = true;
            }).keyup(function (e) {
                if ($.inArray(e.keyCode, ctrlKey) > 0) ctrlDown = false;
            });

            $(that.elem).bind('keyup', function (e) {
                var $self = $(this);
                var trueKey = false;
                if (e.keyCode === 8 || e.keyCode < 105 && e.keyCode > 96 || e.keyCode < 58 && e.keyCode > 47 || ctrlDown && (e.keyCode == vKey || $.inArray(e.keyCode, ctrlKey) > 0)) {
                    trueKey = true;
                }
                if (trueKey) {
                    clearTimeout(typingTimer);
                    typingTimer = setTimeout(function () {
                        doneTyping($self);
                    }, doneTypingInterval);
                }
            });

            $(that.elem).on('keydown', function () {
                clearTimeout(typingTimer);
            });
            function doneTyping($self) {
                that.parseInput($self.val());
            }

            /////////////////   Manipulate by alt changes
            // TODO
            // self.model.options.altField.bind("change", function () {
            //     //if (!self._flagSelfManipulate) {
            //         let newDate = new Date($(this).val());
            //         if (newDate !== "Invalid Date") {
            //             let newPersainDate = this.model.PersianDate.date(newDate);
            //             self.selectDate(newPersainDate.valueOf());
            //         }
            //   //  }
            // });
        }

        /**
         * @private
         * @desc attach events to input field
         */

    }, {
        key: '_attachInputElementEvents',
        value: function _attachInputElementEvents() {
            var that = this;
            var closePickerHandler = function closePickerHandler(e) {
                if (!$(e.target).is(that.elem) && !$(e.target).is(that.model.view.$container) && $(e.target).closest('#' + that.model.view.$container.attr('id')).length == 0 && !$(e.target).is($(that.elem).children())) {
                    that.model.api.hide();
                    $('body').unbind('click', closePickerHandler);
                }
            };

            $(this.elem).on('focus click', Helper.debounce(function (evt) {
                that.model.api.show();
                if (that.model.state.ui.isInline === false) {
                    $('body').unbind('click', closePickerHandler).bind('click', closePickerHandler);
                }
                if (Helper.isMobile) {
                    $(this).blur();
                }
                evt.stopPropagation();
                return false;
            }, 200));

            $(this.elem).on('keydown', Helper.debounce(function (evt) {
                if (evt.which === 9) {
                    that.model.api.hide();
                    return false;
                }
            }, 200));
        }

        /**
         * @desc get <input/> element position
         * @return {{top: Number, left: Number}}
         * @todo remove jquery
         */

    }, {
        key: 'getInputPosition',
        value: function getInputPosition() {
            return $(this.elem).offset();
        }

        /**
         * @desc get <input/> element size
         * @return {{width: Number, height: Number}}
         * @todo remove jquery
         */

    }, {
        key: 'getInputSize',
        value: function getInputSize() {
            return {
                width: $(this.elem).outerWidth(),
                height: $(this.elem).outerHeight()
            };
        }

        /**
         * @desc update <input/> element value
         * @param {Number} unix
         * @todo remove jquery
         * @private
         */

    }, {
        key: '_updateAltField',
        value: function _updateAltField(unix) {
            var value = this.model.options.altFieldFormatter(unix);
            $(this.model.options.altField).val(value);
        }

        /**
         * @desc update <input/> element value
         * @param {Number} unix
         * @todo remove jquery
         * @private
         */

    }, {
        key: '_updateInputField',
        value: function _updateInputField(unix) {
            var value = this.model.options.formatter(unix);
            if ($(this.elem).val() != value) {
                $(this.elem).val(value);
            }
        }

        /**
         * @param unix
         */

    }, {
        key: 'update',
        value: function update(unix) {
            if (this.model.options.initialValue == false && this._firstUpdate) {
                this._firstUpdate = false;
            } else {
                this._updateInputField(unix);
                this._updateAltField(unix);
            }
        }

        /**
         * @desc return initial value
         * @return {Number} - unix
         */

    }, {
        key: 'getOnInitState',
        value: function getOnInitState() {
            var persianDatePickerTimeRegex = '^([0-1][0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$';
            var garegurianDate = null,
                $inputElem = $(this.elem),
                inputValue = void 0;

            // Define input value by check inline mode and input mode

            if ($inputElem[0].nodeName === 'INPUT') {
                inputValue = $inputElem[0].getAttribute('value');
            } else {
                inputValue = $inputElem.data('date');
            }

            // Check time string by regex
            if (inputValue && inputValue.match(persianDatePickerTimeRegex)) {
                var timeArray = inputValue.split(':'),
                    tempDate = new Date();
                tempDate.setHours(timeArray[0]);
                tempDate.setMinutes(timeArray[1]);
                if (timeArray[2]) {
                    tempDate.setSeconds(timeArray[2]);
                } else {
                    tempDate.setSeconds(0);
                }
                this.initialUnix = tempDate.valueOf();
            } else {
                if (this.model.options.initialValueType === 'persian' && inputValue) {
                    var parse = new PersianDateParser();
                    var pd = new persianDate(parse.parse(inputValue)).valueOf();
                    garegurianDate = new Date(pd).valueOf();
                } else if (this.model.options.initialValueType === 'unix' && inputValue) {
                    garegurianDate = parseInt(inputValue);
                } else if (inputValue) {
                    garegurianDate = new Date(inputValue).valueOf();
                }
                if (garegurianDate && garegurianDate != 'undefined') {
                    this.initialUnix = garegurianDate;
                } else {
                    this.initialUnix = new Date().valueOf();
                }
            }
            return this.initialUnix;
        }
    }]);

    return Input;
}();

module.exports = Input;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hamsterjs = __webpack_require__(16);

var Hamster = _interopRequireWildcard(_hamsterjs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This navigator class do every thing about navigate and select date
 * @public
 */
var Navigator = function () {
  /**
   * @param {object} datepicker
   * @return {Navigator}
   */
  function Navigator(model) {
    _classCallCheck(this, Navigator);

    /**
     * @type {Datepicker}
     */
    this.model = model;
    this.liveAttach();
    this._attachEvents();
    return this;
  }

  /**
   * @desc attach events that needed attach after every render
   * @public
   * @todo attach as a live way
   */


  _createClass(Navigator, [{
    key: "liveAttach",
    value: function liveAttach() {
      // Check options
      if (this.model.options.navigator.scroll.enabled) {
        var that = this;
        var gridPlot = $("#" + that.model.view.id + " .datepicker-grid-view")[0];
        try {
          Hamster(gridPlot).wheel(function (event, delta) {
            if (delta > 0) {
              that.model.state.navigate("next");
            } else {
              that.model.state.navigate("prev");
            }
            that.model.view.render();
            event.preventDefault();
          });
        } catch (e) {
          //
        }

        if (this.model.options.timePicker.enabled) {
          $("#" + that.model.view.id + " .time-segment").each(function () {
            try {
              Hamster(this).wheel(function (event, delta) {
                var $target = $(event.target);
                var key = $target.data("time-key") ? $target.data("time-key") : $target.parents("[data-time-key]").data("time-key");
                if (key) {
                  if (delta > 0) {
                    that.timeUp(key);
                  } else {
                    that.timeDown(key);
                  }
                }
                that.model.view.render();
                event.preventDefault();
              });
            } catch (e) {
              //
            }
          });
        }
      }
    }

    /**
     * @desc set time up depend to timekey
     * @param {String} timekey - accept hour, minute,second
     * @public
     */

  }, {
    key: "timeUp",
    value: function timeUp(timekey) {
      if (this.model.options.timePicker[timekey] == undefined) {
        return;
      }
      var step = void 0,
          t = void 0,
          that = this;
      if (timekey == "meridian") {
        step = 12;
        if (this.model.state.view.meridian == "PM") {
          t = this.model.PersianDate.date(this.model.state.selected.unixDate).add("hour", step).valueOf();
        } else {
          t = this.model.PersianDate.date(this.model.state.selected.unixDate).subtract("hour", step).valueOf();
        }
        this.model.state.meridianToggle();
      } else {
        step = this.model.options.timePicker[timekey].step;
        t = this.model.PersianDate.date(this.model.state.selected.unixDate).add(timekey, step).valueOf();
      }
      this.model.state.setViewDateTime("unix", t);
      this.model.state.setSelectedDateTime("unix", t);
      this.model.view.renderTimePartial();
      clearTimeout(this.scrollDelayTimeDown);
      this.scrollDelayTimeUp = setTimeout(function () {
        that.model.view.markSelectedDay();
      }, 300);
    }

    /**
     * @desc set time down depend to timekey
     * @param {String} timekey - accept hour, minute,second
     * @public
     */

  }, {
    key: "timeDown",
    value: function timeDown(timekey) {
      if (this.model.options.timePicker[timekey] == undefined) {
        return;
      }
      var step = void 0,
          t = void 0,
          that = this;
      if (timekey == "meridian") {
        step = 12;
        if (this.model.state.view.meridian == "AM") {
          t = this.model.PersianDate.date(this.model.state.selected.unixDate).add("hour", step).valueOf();
        } else {
          t = this.model.PersianDate.date(this.model.state.selected.unixDate).subtract("hour", step).valueOf();
        }
        this.model.state.meridianToggle();
      } else {
        step = this.model.options.timePicker[timekey].step;
        t = this.model.PersianDate.date(this.model.state.selected.unixDate).subtract(timekey, step).valueOf();
      }
      this.model.state.setViewDateTime("unix", t);
      this.model.state.setSelectedDateTime("unix", t);
      this.model.view.renderTimePartial();
      clearTimeout(this.scrollDelayTimeDown);
      this.scrollDelayTimeDown = setTimeout(function () {
        that.model.view.markSelectedDay();
      }, 300);
    }

    /**
     * @desc attach dom events
     * @todo remove jquery
     * @private
     */

  }, {
    key: "_attachEvents",
    value: function _attachEvents() {
      var that = this;

      if (this.model.options.navigator.enabled) {
        /**
         * @description navigator click event
         */
        $(document).on("click", "#" + that.model.view.id + " .pwt-btn", function () {
          if ($(this).is(".pwt-btn-next")) {
            that.model.state.navigate("next");
            that.model.view.render();
            that.model.options.navigator.onNext(that.model);
          } else if ($(this).is(".pwt-btn-switch")) {
            that.model.state.switchViewMode();
            that.model.view.render();
            that.model.options.navigator.onSwitch(that.model);
          } else if ($(this).is(".pwt-btn-prev")) {
            that.model.state.navigate("prev");
            that.model.view.render();
            that.model.options.navigator.onPrev(that.model);
          }
        });
      }

      /**
       * @description check if timePicker enabled attach Events
       */
      if (this.model.options.timePicker.enabled) {
        /**
         * @description time up btn click event
         */
        $(document).on("click", "#" + that.model.view.id + " .up-btn", function () {
          var timekey = $(this).data("time-key");
          that.timeUp(timekey);
          that.model.options.onSelect(that.model.state.selected.unixDate);
        });

        /**
         * @description time down btn click event
         */
        $(document).on("click", "#" + that.model.view.id + " .down-btn", function () {
          var timekey = $(this).data("time-key");
          that.timeDown(timekey);
          that.model.options.onSelect(that.model.state.selected.unixDate);
        });
      }

      /**
       * @description check if dayPicker enabled attach Events
       */
      if (this.model.options.dayPicker.enabled) {
        /**
         * @description days click event
         */
        $(document).on("click", "#" + that.model.view.id + " .datepicker-day-view td:not(.disabled)", function () {
          var thisUnix = $(this).data("unix"),
              mustRender = void 0;
          that.model.state.setSelectedDateTime("unix", thisUnix);
          if (that.model.state.selected.month !== that.model.state.view.month) {
            mustRender = true;
          } else {
            mustRender = false;
          }
          that.model.state.setViewDateTime("unix", that.model.state.selected.unixDate);
          if (that.model.options.autoClose) {
            that.model.view.hide();
            that.model.options.onHide(that);
          }
          if (mustRender) {
            that.model.view.render();
          } else {
            that.model.view.markSelectedDay();
          }
          that.model.options.dayPicker.onSelect(thisUnix);
          that.model.options.onSelect(thisUnix);
        });
      }

      /**
       * @description check if monthPicker enabled attach Events
       */
      if (this.model.options.monthPicker.enabled) {
        /**
         * @description month click event
         */
        $(document).on("click", "#" + that.model.view.id + " .datepicker-month-view .month-item:not(.month-item-disable)", function () {
          var month = $(this).data("month");
          var year = $(this).data("year");
          that.model.state.switchViewModeTo("day");
          if (!that.model.options.onlySelectOnDate) {
            that.model.state.setSelectedDateTime("year", year);
            that.model.state.setSelectedDateTime("month", month);
            if (that.model.options.autoClose) {
              that.model.view.hide();
              that.model.options.onHide(that);
            }
          }
          that.model.state.setViewDateTime("month", month);
          that.model.view.render();
          that.model.options.monthPicker.onSelect(month);
          that.model.options.onSelect(that.model.state.selected.unixDate);
        });
      }

      /**
       * @description check if yearPicker enabled attach Events
       */
      if (this.model.options.yearPicker.enabled) {
        /**
         * @description year click event
         */
        $(document).on("click", "#" + that.model.view.id + " .datepicker-year-view .year-item:not(.year-item-disable)", function () {
          var year = $(this).data("year");
          that.model.state.switchViewModeTo("month");
          if (!that.model.options.onlySelectOnDate) {
            that.model.state.setSelectedDateTime("year", year);
            if (that.model.options.autoClose) {
              that.model.view.hide();
              that.model.options.onHide(that);
            }
          }
          that.model.state.setViewDateTime("year", year);
          that.model.view.render();
          that.model.options.yearPicker.onSelect(year);
          that.model.options.onSelect(that.model.state.selected.unixDate);
        });
      }
    }
  }]);

  return Navigator;
}();

module.exports = Navigator;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Config = __webpack_require__(6);
var Template = __webpack_require__(2);
var persianDate = __webpack_require__(0);
/**
 * Extend default config from user interred and do compatibility works
 * @public
 */

var Options = function () {

    /**
     * @param {object} options config passed when initialize
     * @return {object}
     * @todo remove jquery
     */
    function Options(options, model) {
        _classCallCheck(this, Options);

        this.model = model;
        return this._compatibility($.extend(true, this, Config, options));
    }

    /**
     * @private
     * @param options
     */


    _createClass(Options, [{
        key: '_compatibility',
        value: function _compatibility(options) {

            if (options.inline) {
                options.toolbox.submitButton.enabled = false;
            }

            if (!options.template) {
                options.template = Template;
            }
            persianDate.toCalendar(options.calendarType);
            persianDate.toLocale(options.calendar[options.calendarType].locale);
            if (options.onlyTimePicker) {
                options.dayPicker.enabled = false;
                options.monthPicker.enabled = false;
                options.yearPicker.enabled = false;
                options.navigator.enabled = false;
                options.toolbox.enabled = false;
                options.timePicker.enabled = true;
            }

            if (options.timePicker.hour.step === null) {
                options.timePicker.hour.step = options.timePicker.step;
            }
            if (options.timePicker.minute.step === null) {
                options.timePicker.minute.step = options.timePicker.step;
            }
            if (options.timePicker.second.step === null) {
                options.timePicker.second.step = options.timePicker.step;
            }

            if (options.dayPicker.enabled === false) {
                options.onlySelectOnDate = false;
            }

            options._viewModeList = [];
            if (options.dayPicker.enabled) {
                options._viewModeList.push('day');
            }
            if (options.monthPicker.enabled) {
                options._viewModeList.push('month');
            }
            if (options.yearPicker.enabled) {
                options._viewModeList.push('year');
            }
        }
    }]);

    return Options;
}();

module.exports = Options;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PersianDateParser = function () {
    function PersianDateParser() {
        _classCallCheck(this, PersianDateParser);

        this.pattern = {
            iso: /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$/g,
            jalali: /^[1-4]\d{3}(\/|-|\.)((0?[1-6](\/|-|\.)((3[0-1])|([1-2][0-9])|(0?[1-9])))|((1[0-2]|(0?[7-9]))(\/|-|\.)(30|([1-2][0-9])|(0?[1-9]))))$/g
        };
    }

    _createClass(PersianDateParser, [{
        key: 'parse',
        value: function parse(inputString) {
            var that = this,
                persianDateArray = void 0,
                isoPat = new RegExp(that.pattern.iso),
                jalaliPat = new RegExp(that.pattern.jalali);

            String.prototype.toEnglishDigits = function () {
                var charCodeZero = '۰'.charCodeAt(0);
                return this.replace(/[۰-۹]/g, function (w) {
                    return w.charCodeAt(0) - charCodeZero;
                });
            };

            inputString = inputString.toEnglishDigits();
            if (jalaliPat.test(inputString)) {
                /* eslint-disable no-useless-escape */
                persianDateArray = inputString.split(/\/|-|\,|\./).map(Number);
                /* eslint-enable no-useless-escape */
                return persianDateArray;
            } else if (isoPat.test(inputString)) {
                /* eslint-disable no-useless-escape */
                persianDateArray = inputString.split(/\/|-|\,|\:|\T|\Z/g).map(Number);
                return persianDateArray;
                /* eslint-enable no-useless-escape */
            } else {
                return undefined;
            }
        }
    }]);

    return PersianDateParser;
}();

module.exports = PersianDateParser;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PersianDateClass = __webpack_require__(0);

var PersianDateWrapper = function () {
    function PersianDateWrapper(model) {
        _classCallCheck(this, PersianDateWrapper);

        this.model = model;
        this.model.options.calendar_ = this.model.options.calendarType;
        this.model.options.locale_ = this.model.options.calendar[this.model.options.calendarType].locale;

        PersianDateClass.calendarType = 'persian';
        PersianDateClass.leapYearMode = 'astronomical';
        PersianDateClass.localType = 'fa';
        this.persianDate = PersianDateClass;

        return this;
    }

    _createClass(PersianDateWrapper, [{
        key: 'date',
        value: function date(input) {
            if (window.inspdCount || window.inspdCount === 0) {
                window.inspdCount++;
            } else {
                window.inspdCount = 0;
            }
            var that = this;
            var output = void 0,
                cp = void 0;
            cp = this.persianDate.toCalendar(that.model.options.calendar_);
            if (this.model.options.calendar[this.model.options.calendarType].leapYearMode) {
                cp.toLeapYearMode(this.model.options.calendar[this.model.options.calendarType].leapYearMode);
            }
            output = new cp(input);
            return output.toLocale(that.model.options.locale_);
        }
    }]);

    return PersianDateWrapper;
}();

module.exports = PersianDateWrapper;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var persianDate = __webpack_require__(0);

/**
 * All state set in his object and get from this
 * also this object notify other object to update self or update view or etc.
 */

var State = function () {

    /**
     * @param {model} model
     * @return {State}
     */
    function State(model) {
        _classCallCheck(this, State);

        /**
         * @type {object}
         */
        this.model = model;

        /**
         * @type {Boolean}
         */
        this.filetredDate = this.model.options.minDate || this.model.options.maxDate;

        /**
         * @desc get generated view mode list from options object
         * @type {Array}
         */
        this.viewModeList = this.model.options._viewModeList;

        /**
         * @desc view mode string day, month, year
         * @type {String}
         * @default day
         * @todo add time to view modes
         */
        this.viewMode = this.viewModeList.indexOf(model.options.viewMode) > 0 ? model.options.viewMode : this.viewModeList[0];

        /**
         * @desc view mode string index in view mode list
         * @type {number}
         */
        this.viewModeIndex = this.viewModeList.indexOf(model.options.viewMode) > 0 ? this.viewModeList.indexOf(model.options.viewMode) : 0; // defaul 'day'


        /**
         * @desc contain filtered date objects
         * @type {{start: {year: number, month: number, date: number, hour: number, minute: number, second: number, unixDate: number}, end: {year: number, month: number, date: number, hour: number, minute: number, second: number, unixDate: number}}}
         */
        this.filterDate = {
            start: {
                year: 0,
                month: 0,
                date: 0,
                hour: 0,
                minute: 0,
                second: 0,
                unixDate: 0
            },
            end: {
                year: 0,
                month: 0,
                date: 0,
                hour: 0,
                minute: 0,
                second: 0,
                unixDate: 0
            }
        };

        /**
         * @desc contain view date object
         * @type {{year: number, month: number, date: number, hour: number, minute: number, second: number, unixDate: number, dateObject: null, meridian: string}}
         */
        this.view = {
            year: 0,
            month: 0,
            date: 0,
            hour: 0,
            minute: 0,
            second: 0,
            unixDate: 0,
            dateObject: null,
            meridian: 'AM'
        };

        /**
         * @desc contain selected date object
         * @type {{year: number, month: number, date: number, hour: number, minute: number, second: number, unixDate: number, dateObject: null}}
         */
        this.selected = {
            year: 0,
            month: 0,
            date: 0,
            hour: 0,
            hour12: 0,
            minute: 0,
            second: 0,
            unixDate: 0,
            dateObject: null
        };

        this.ui = {
            isOpen: false,
            isInline: this.model.options.inline
        };

        this._setFilterDate(this.model.options.minDate, this.model.options.maxDate);
        return this;
    }

    /**
     * @private
     * @param minDate
     * @param maxDate
     */


    _createClass(State, [{
        key: '_setFilterDate',
        value: function _setFilterDate(minDate, maxDate) {
            var self = this;
            if (!minDate) {
                minDate = -2000000000000000;
            }
            if (!maxDate) {
                maxDate = 2000000000000000;
            }
            var pd = self.model.PersianDate.date(minDate);
            self.filterDate.start.unixDate = minDate;
            self.filterDate.start.hour = pd.hour();
            self.filterDate.start.minute = pd.minute();
            self.filterDate.start.second = pd.second();
            self.filterDate.start.month = pd.month();
            self.filterDate.start.date = pd.date();
            self.filterDate.start.year = pd.year();

            var pdEnd = self.model.PersianDate.date(maxDate);
            self.filterDate.end.unixDate = maxDate;
            self.filterDate.end.hour = pdEnd.hour();
            self.filterDate.end.minute = pdEnd.minute();
            self.filterDate.end.second = pdEnd.second();
            self.filterDate.end.month = pdEnd.month();
            self.filterDate.end.date = pdEnd.date();
            self.filterDate.end.year = pdEnd.year();
        }

        /**
         * @desc change view state
         * @param {String} nav - accept next, prev
         */

    }, {
        key: 'navigate',
        value: function navigate(nav) {
            if (nav == 'next') {
                if (this.viewMode == 'year') {
                    this.setViewDateTime('year', this.view.year + 12);
                }
                if (this.viewMode == 'month') {
                    var newYear = this.view.year + 1;
                    if (newYear === 0) {
                        newYear = 1;
                    }
                    this.setViewDateTime('year', newYear);
                }
                if (this.viewMode == 'day') {
                    var _newYear = this.view.year + 1;
                    if (_newYear === 0) {
                        _newYear = 1;
                    }
                    if (this.view.month + 1 == 13) {
                        this.setViewDateTime('year', _newYear);
                        this.setViewDateTime('month', 1);
                    } else {
                        this.setViewDateTime('month', this.view.month + 1);
                    }
                }
            } else {
                if (this.viewMode == 'year') {
                    this.setViewDateTime('year', this.view.year - 12);
                }
                if (this.viewMode == 'month') {
                    var _newYear2 = this.view.year - 1;
                    if (_newYear2 === 0) {
                        _newYear2 = -1;
                    }
                    this.setViewDateTime('year', _newYear2);
                }
                if (this.viewMode == 'day') {
                    if (this.view.month - 1 <= 0) {
                        var _newYear3 = this.view.year - 1;
                        if (_newYear3 === 0) {
                            _newYear3 = -1;
                        }
                        this.setViewDateTime('year', _newYear3);
                        this.setViewDateTime('month', 12);
                    } else {
                        this.setViewDateTime('month', this.view.month - 1);
                    }
                }
            }
        }

        /**
         * @public
         * @desc every time called view state changed to next in queue
         * @return {State}
         */

    }, {
        key: 'switchViewMode',
        value: function switchViewMode() {
            this.viewModeIndex = this.viewModeIndex + 1 >= this.viewModeList.length ? 0 : this.viewModeIndex + 1;
            this.viewMode = this.viewModeList[this.viewModeIndex] ? this.viewModeList[this.viewModeIndex] : this.viewModeList[0];
            this._setViewDateTimeUnix();
            return this;
        }

        /**
         * @desc switch to specified view mode
         * @param {String} viewMode - accept date, month, year
         */

    }, {
        key: 'switchViewModeTo',
        value: function switchViewModeTo(viewMode) {
            if (this.viewModeList.indexOf(viewMode) >= 0) {
                this.viewMode = viewMode;
                this.viewModeIndex = this.viewModeList.indexOf(viewMode);
            }
        }

        /**
         * @desc called on date select
         * @param {String} key - accept date, month, year, hour, minute, second
         * @param {Number} value
         * @public
         * @return {State}
         */

    }, {
        key: 'setSelectedDateTime',
        value: function setSelectedDateTime(key, value) {
            var that = this;
            switch (key) {
                case 'unix':
                    that.selected.unixDate = value;
                    var pd = this.model.PersianDate.date(value);
                    that.selected.year = pd.year();
                    that.selected.month = pd.month();
                    that.selected.date = pd.date();
                    that.selected.hour = pd.hour();
                    that.selected.hour12 = pd.format('hh');
                    that.selected.minute = pd.minute();
                    that.selected.second = pd.second();
                    break;
                case 'year':
                    this.selected.year = value;
                    break;
                case 'month':
                    this.selected.month = value;
                    break;
                case 'date':
                    this.selected.date = value;
                    break;
                case 'hour':
                    this.selected.hour = value;
                    break;
                case 'minute':
                    this.selected.minute = value;
                    break;
                case 'second':
                    this.selected.second = value;
                    break;
            }
            that._updateSelectedUnix();
            return this;
        }

        /**
         * @return {State}
         * @private
         */

    }, {
        key: '_updateSelectedUnix',
        value: function _updateSelectedUnix() {
            this.selected.dateObject = this.model.PersianDate.date([this.selected.year, this.selected.month, this.selected.date, this.view.hour, this.view.minute, this.view.second]);
            this.selected.unixDate = this.selected.dateObject.valueOf();
            this.model.updateInput(this.selected.unixDate);
            return this;
        }

        /**
         *
         * @return {State}
         * @private
         */

    }, {
        key: '_setViewDateTimeUnix',
        value: function _setViewDateTimeUnix() {
            var daysInMonth = new persianDate().daysInMonth(this.view.year, this.view.month);
            if (this.view.date > daysInMonth) {
                this.view.date = daysInMonth;
            }
            this.view.dateObject = this.model.PersianDate.date([this.view.year, this.view.month, this.view.date, this.view.hour, this.view.minute, this.view.second]);
            this.view.year = this.view.dateObject.year();
            this.view.month = this.view.dateObject.month();
            this.view.date = this.view.dateObject.date();
            this.view.hour = this.view.dateObject.hour();
            this.view.hour12 = this.view.dateObject.format('hh');
            this.view.minute = this.view.dateObject.minute();
            this.view.second = this.view.dateObject.second();
            this.view.unixDate = this.view.dateObject.valueOf();
            return this;
        }

        /**
         *
         * @param {String} key -  accept date, month, year, hour, minute, second
         * @param {Number} value
         * @return {State}
         */

    }, {
        key: 'setViewDateTime',
        value: function setViewDateTime(key, value) {
            var self = this;
            switch (key) {
                case 'unix':
                    var pd = this.model.PersianDate.date(value);
                    self.view.year = pd.year();
                    self.view.month = pd.month();
                    self.view.date = pd.date();
                    self.view.hour = pd.hour();
                    self.view.minute = pd.minute();
                    self.view.second = pd.second();
                    break;
                case 'year':
                    this.view.year = value;
                    break;
                case 'month':
                    this.view.month = value;
                    break;
                case 'date':
                    this.view.date = value;
                    break;
                case 'hour':
                    this.view.hour = value;
                    break;
                case 'minute':
                    this.view.minute = value;
                    break;
                case 'second':
                    this.view.second = value;
                    break;
            }
            this._setViewDateTimeUnix();
            return this;
        }

        /**
         * desc change meridian state
         */

    }, {
        key: 'meridianToggle',
        value: function meridianToggle() {
            var self = this;
            if (self.view.meridian === 'AM') {
                self.view.meridian = 'PM';
            } else if (self.view.meridian === 'PM') {
                self.view.meridian = 'AM';
            }
        }
    }]);

    return State;
}();

module.exports = State;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Do every things about toolbox, like attach events to toolbox elements
 */
var Toolbox = function () {

    /**
     * @param {Datepicker} datepicker
     * @return {Toolbox}
     */
    function Toolbox(model) {
        _classCallCheck(this, Toolbox);

        /**
         * @type {Datepicker}
         */
        this.model = model;
        this._attachEvents();
        return this;
    }

    _createClass(Toolbox, [{
        key: '_toggleCalendartype',
        value: function _toggleCalendartype() {
            var that = this;
            if (that.model.options.calendar_ == 'persian') {
                that.model.options.calendar_ = 'gregorian';
                that.model.options.locale_ = this.model.options.calendar.gregorian.locale;
            } else {
                that.model.options.calendar_ = 'persian';
                that.model.options.locale_ = this.model.options.calendar.persian.locale;
            }
        }

        /**
         * attach all events about toolbox
         */

    }, {
        key: '_attachEvents',
        value: function _attachEvents() {
            var that = this;
            $(document).on('click', '#' + that.model.view.id + ' .pwt-btn-today', function () {
                that.model.state.setSelectedDateTime('unix', new Date().valueOf());
                that.model.state.setViewDateTime('unix', new Date().valueOf());
                that.model.view.reRender();
                /**
                 * @deprecated
                 * @todo remove this
                 */
                that.model.options.toolbox.onToday(that.model);
                that.model.options.toolbox.todayButton.onToday(that.model);
            });

            $(document).on('click', '#' + that.model.view.id + ' .pwt-btn-calendar', function () {
                that._toggleCalendartype();
                that.model.state.setSelectedDateTime('unix', that.model.state.selected.unixDate);
                that.model.state.setViewDateTime('unix', that.model.state.view.unixDate);
                that.model.view.render();
                that.model.options.toolbox.calendarSwitch.onSwitch(that.model);
            });

            $(document).on('click', '#' + that.model.view.id + ' .pwt-btn-submit', function () {
                that.model.view.hide();
                that.model.options.toolbox.submitButton.onSubmit(that.model);
                that.model.options.onHide(this);
            });
        }
    }]);

    return Toolbox;
}();

module.exports = Toolbox;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Template = __webpack_require__(2);
var Helper = __webpack_require__(1);
var Mustache = __webpack_require__(17);
var persianDate = __webpack_require__(0);

/**
 * As its name suggests, all rendering works do in this object
 */

var View = function () {

    /**
     *
     * @param {Datepicker} model
     * @return {View}
     */
    function View(model) {
        _classCallCheck(this, View);

        /**
         * @type {number}
         */
        this.yearsViewCount = 12;

        /**
         *
         * @type {Datepicker}
         */
        this.model = model;

        /**
         *
         * @type {null}
         */
        this.rendered = null;

        /**
         *
         * @type {null}
         */
        this.$container = null;

        /**
         *
         * @type {string}
         */
        this.id = 'persianDateInstance-' + parseInt(Math.random(100) * 1000);
        var that = this;

        if (this.model.state.ui.isInline) {
            this.$container = $('<div  id="' + this.id + '" class="datepicker-container-inline"></div>').appendTo(that.model.inputElement);
        } else {
            this.$container = $('<div  id="' + this.id + '" class="datepicker-container"></div>').appendTo('body');
            this.hide();
            this.setPickerBoxPosition();
            this.addCompatibilityClass();
        }
        return this;
    }

    /**
     * @desc add css class to handle compatibility ui things
     */


    _createClass(View, [{
        key: 'addCompatibilityClass',
        value: function addCompatibilityClass() {
            if (Helper.isMobile && this.model.options.responsive) {
                this.$container.addClass('pwt-mobile-view');
            }
        }

        /**
         * @desc remove datepicker container element from dom
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            this.$container.remove();
        }

        /**
         * @desc set datepicker container element based on <input/> element position
         */

    }, {
        key: 'setPickerBoxPosition',
        value: function setPickerBoxPosition() {
            var inputPosition = this.model.input.getInputPosition(),
                inputSize = this.model.input.getInputSize();

            if (Helper.isMobile && this.model.options.responsive) {
                return false;
            }

            if (this.model.options.position === 'auto') {
                this.$container.css({
                    left: inputPosition.left + 'px',
                    top: inputSize.height + inputPosition.top + 'px'
                });
            } else {
                this.$container.css({
                    left: this.model.options.position[1] + inputPosition.left + 'px',
                    top: this.model.options.position[0] + inputPosition.top + 'px'
                });
            }
        }

        /**
         * @desc show datepicker container element
         */

    }, {
        key: 'show',
        value: function show() {
            this.$container.removeClass('pwt-hide');
            this.setPickerBoxPosition();
        }

        /**
         * @desc hide datepicker container element
         */

    }, {
        key: 'hide',
        value: function hide() {
            this.$container.addClass('pwt-hide');
        }

        /**
         * @desc toggle datepicker container element
         */

    }, {
        key: 'toggle',
        value: function toggle() {
            this.$container.toggleClass('pwt-hide');
        }

        /**
         * @desc return navigator switch text
         * @param {String} data -  accept day, month, year
         * @private
         * @return {String}
         */

    }, {
        key: '_getNavSwitchText',
        value: function _getNavSwitchText(data) {
            var output = void 0;
            if (this.model.state.viewMode == 'day') {
                output = this.model.options.dayPicker.titleFormatter.call(this, data.year, data.month);
            } else if (this.model.state.viewMode == 'month') {
                output = this.model.options.monthPicker.titleFormatter.call(this, data.dateObject.valueOf());
            } else if (this.model.state.viewMode == 'year') {
                output = this.model.options.yearPicker.titleFormatter.call(this, data.year);
            }
            return output;
        }

        /**
         * @desc check year is accessible
         * @param {Number} year - year number
         * @return {Boolean}
         */

    }, {
        key: 'checkYearAccess',
        value: function checkYearAccess(year) {
            var output = true;
            if (this.model.state.filetredDate) {
                var startYear = this.model.state.filterDate.start.year,
                    endYear = this.model.state.filterDate.end.year;
                if (startYear && year < startYear) {
                    return false;
                } else if (endYear && year > endYear) {
                    return false;
                }
            }
            if (output) {
                return this.model.options.checkYear(year);
            }
        }

        /**
         * @private
         * @param viewState
         * @return {{enabled: boolean, viewMode: boolean, list: Array}}
         */

    }, {
        key: '_getYearViewModel',
        value: function _getYearViewModel(viewState) {
            var _this = this;

            var isEnabled = this.model.options.yearPicker.enabled;
            // Make performance better
            if (!isEnabled) {
                return {
                    enabled: false
                };
            }
            /**
             * @description Generate years list based on viewState year
             * @return ['1380',n+12,'1392']
             */
            var list = [].concat(_toConsumableArray(Array(this.yearsViewCount).keys())).map(function (value) {
                return value + parseInt(viewState.year / _this.yearsViewCount) * _this.yearsViewCount;
            });
            /*
             * @description Generate years object based on list
             */
            var yearsModel = [],
                yearStr = this.model.PersianDate.date();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var i = _step.value;

                    yearStr.year([i]);
                    yearsModel.push({
                        title: yearStr.format('YYYY'),
                        enabled: this.checkYearAccess(i),
                        dataYear: i,
                        selected: this.model.state.selected.year == i
                    });
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return {
                enabled: isEnabled,
                viewMode: this.model.state.viewMode == 'year',
                list: yearsModel
            };
        }

        /**
         * @desc check month is accessible
         * @param {Number} month - month number
         * @return {Boolean}
         */

    }, {
        key: 'checkMonthAccess',
        value: function checkMonthAccess(month) {
            month = month + 1;
            var output = true,
                y = this.model.state.view.year;
            if (this.model.state.filetredDate) {
                var startMonth = this.model.state.filterDate.start.month,
                    endMonth = this.model.state.filterDate.end.month,
                    startYear = this.model.state.filterDate.start.year,
                    endYear = this.model.state.filterDate.end.year;
                if (startMonth && endMonth && (y == endYear && month > endMonth || y > endYear) || y == startYear && month < startMonth || y < startYear) {
                    return false;
                } else if (endMonth && (y == endYear && month > endMonth || y > endYear)) {
                    return false;
                } else if (startMonth && (y == startYear && month < startMonth || y < startYear)) {
                    return false;
                }
            }
            if (output) {
                return this.model.options.checkMonth(month, y);
            }
        }

        /**
         * @private
         * @return {{enabled: boolean, viewMode: boolean, list: Array}}
         */

    }, {
        key: '_getMonthViewModel',
        value: function _getMonthViewModel() {
            var isEnaled = this.model.options.monthPicker.enabled;
            // Make performance better
            if (!isEnaled) {
                return {
                    enabled: false
                };
            }

            var monthModel = [],
                that = this;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = that.model.PersianDate.date().rangeName().months.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _step2$value = _slicedToArray(_step2.value, 2),
                        index = _step2$value[0],
                        month = _step2$value[1];

                    monthModel.push({
                        title: month,
                        enabled: this.checkMonthAccess(index),
                        year: this.model.state.view.year,
                        dataMonth: index + 1,
                        selected: this.model.state.selected.year == this.model.state.view.year && this.model.state.selected.month == index + 1
                    });
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return {
                enabled: isEnaled,
                viewMode: this.model.state.viewMode == 'month',
                list: monthModel
            };
        }

        /**
         * @desc check day is accessible
         * @param {Number} thisUnix - month number
         * @return {Boolean}
         */

    }, {
        key: 'checkDayAccess',
        value: function checkDayAccess(unixtimespan) {
            var self = this,
                output = true;
            self.minDate = this.model.options.minDate;
            self.maxDate = this.model.options.maxDate;

            if (self.model.state.filetredDate) {
                if (self.minDate && self.maxDate) {
                    self.minDate = self.model.PersianDate.date(self.minDate).startOf('day').valueOf();
                    self.maxDate = self.model.PersianDate.date(self.maxDate).endOf('day').valueOf();
                    if (!(unixtimespan >= self.minDate && unixtimespan <= self.maxDate)) {
                        return false;
                    }
                } else if (self.minDate) {
                    self.minDate = self.model.PersianDate.date(self.minDate).startOf('day').valueOf();
                    if (unixtimespan <= self.minDate) {
                        return false;
                    }
                } else if (self.maxDate) {
                    self.maxDate = self.model.PersianDate.date(self.maxDate).endOf('day').valueOf();
                    if (unixtimespan >= self.maxDate) {
                        return false;
                    }
                }
            }
            if (output) {
                return self.model.options.checkDate(unixtimespan);
            }
        }

        /**
         * @private
         * @return {object}
         */

    }, {
        key: '_getDayViewModel',
        value: function _getDayViewModel() {
            if (this.model.state.viewMode != 'day') {
                return [];
            }

            var isEnabled = this.model.options.dayPicker.enabled;
            // Make performance better
            if (!isEnabled) {
                return {
                    enabled: false
                };
            }

            //log('if you see this many time your code has performance issue');
            var viewMonth = this.model.state.view.month,
                viewYear = this.model.state.view.year;
            var pdateInstance = this.model.PersianDate.date(),
                daysCount = pdateInstance.daysInMonth(viewYear, viewMonth),
                firstWeekDayOfMonth = pdateInstance.getFirstWeekDayOfMonth(viewYear, viewMonth) - 1,
                outputList = [],
                daysListindex = 0,
                nextMonthListIndex = 0,
                daysMatrix = [['null', 'null', 'null', 'null', 'null', 'null', 'null'], ['null', 'null', 'null', 'null', 'null', 'null', 'null'], ['null', 'null', 'null', 'null', 'null', 'null', 'null'], ['null', 'null', 'null', 'null', 'null', 'null', 'null'], ['null', 'null', 'null', 'null', 'null', 'null', 'null'], ['null', 'null', 'null', 'null', 'null', 'null', 'null']];

            var anotherCalendar = this._getAnotherCalendar();
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = daysMatrix.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _step3$value = _slicedToArray(_step3.value, 2),
                        rowIndex = _step3$value[0],
                        daysRow = _step3$value[1];

                    outputList[rowIndex] = [];
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = daysRow.entries()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var _step4$value = _slicedToArray(_step4.value, 1),
                                dayIndex = _step4$value[0];

                            var calcedDate = void 0,
                                otherMonth = void 0;
                            // Set hour 12 prevent issues with DST times
                            if (rowIndex === 0 && dayIndex < firstWeekDayOfMonth) {
                                calcedDate = this.model.state.view.dateObject.startOf('month').hour(12).subtract('days', firstWeekDayOfMonth - dayIndex);
                                otherMonth = true;
                            } else if (rowIndex === 0 && dayIndex >= firstWeekDayOfMonth || rowIndex <= 5 && daysListindex < daysCount) {
                                daysListindex += 1;
                                calcedDate = new persianDate([this.model.state.view.year, this.model.state.view.month, daysListindex]);
                                otherMonth = false;
                            } else {
                                nextMonthListIndex += 1;
                                calcedDate = this.model.state.view.dateObject.endOf('month').hour(12).add('days', nextMonthListIndex);
                                otherMonth = true;
                            }
                            outputList[rowIndex].push({
                                title: calcedDate.format('D'),
                                alterCalTitle: new persianDate(calcedDate.valueOf()).toCalendar(anotherCalendar[0]).toLocale(anotherCalendar[1]).format('D'),
                                dataDate: [calcedDate.year(), calcedDate.month(), calcedDate.date()].join(','),
                                dataUnix: calcedDate.hour(12).valueOf(),
                                otherMonth: otherMonth,
                                // TODO: make configurable
                                enabled: this.checkDayAccess(calcedDate.valueOf())
                            });
                        }
                    } catch (err) {
                        _didIteratorError4 = true;
                        _iteratorError4 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                _iterator4.return();
                            }
                        } finally {
                            if (_didIteratorError4) {
                                throw _iteratorError4;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return {
                enabled: isEnabled,
                viewMode: this.model.state.viewMode == 'day',
                list: outputList
            };
        }
    }, {
        key: 'markSelectedDay',
        value: function markSelectedDay() {
            var selected = this.model.state.selected;
            this.$container.find('.table-days td').each(function () {
                if ($(this).data('date') == [selected.year, selected.month, selected.date].join(',')) {
                    $(this).addClass('selected');
                } else {
                    $(this).removeClass('selected');
                }
            });
        }
    }, {
        key: 'markToday',
        value: function markToday() {
            var today = new persianDate();
            this.$container.find('.table-days td').each(function () {
                if ($(this).data('date') == [today.year(), today.month(), today.date()].join(',')) {
                    $(this).addClass('today');
                } else {
                    $(this).removeClass('today');
                }
            });
        }

        /**
         * @private
         * @return {{enabled: boolean, hour: {title, enabled: boolean}, minute: {title, enabled: boolean}, second: {title, enabled: boolean}, meridian: {title: (meridian|{title, enabled}|ClassDatepicker.ClassConfig.timePicker.meridian|{enabled}|string|string), enabled: boolean}}}
         */

    }, {
        key: '_getTimeViewModel',
        value: function _getTimeViewModel() {

            var isEnabled = this.model.options.timePicker.enabled;
            // Make performance better
            if (!isEnabled) {
                return {
                    enabled: false
                };
            }

            var hourTitle = void 0;
            if (this.model.options.timePicker.meridian.enabled) {
                hourTitle = this.model.state.view.dateObject.format('hh');
            } else {
                hourTitle = this.model.state.view.dateObject.format('HH');
            }

            return {
                enabled: isEnabled,
                hour: {
                    title: hourTitle,
                    enabled: this.model.options.timePicker.hour.enabled
                },
                minute: {
                    title: this.model.state.view.dateObject.format('mm'),
                    enabled: this.model.options.timePicker.minute.enabled
                },
                second: {
                    title: this.model.state.view.dateObject.format('ss'),
                    enabled: this.model.options.timePicker.second.enabled
                },
                meridian: {
                    title: this.model.state.view.dateObject.format('a'),
                    enabled: this.model.options.timePicker.meridian.enabled
                }
            };
        }

        /**
         *
         * @return {{enabled: boolean, list: (*|Array)}}
         * @private
         */

    }, {
        key: '_getWeekViewModel',
        value: function _getWeekViewModel() {
            return {
                enabled: true,
                list: this.model.PersianDate.date().rangeName().weekdaysMin
            };
        }

        /**
         *
         * @return {string}
         */

    }, {
        key: 'getCssClass',
        value: function getCssClass() {
            return [this.model.state.ui.isInline ? 'datepicker-plot-area-inline-view' : '', !this.model.options.timePicker.meridian.enabled ? 'datepicker-state-no-meridian' : '', this.model.options.onlyTimePicker ? 'datepicker-state-only-time' : '', !this.model.options.timePicker.second.enabled ? 'datepicker-state-no-second' : '', this.model.options.calendar_ == 'gregorian' ? 'datepicker-gregorian' : 'datepicker-persian'].join(' ');
        }

        /**
         * @param data
         * @return {*}
         */

    }, {
        key: 'getViewModel',
        value: function getViewModel(data) {
            var anotherCalendar = this._getAnotherCalendar();
            return {
                plotId: '',
                navigator: {
                    enabled: this.model.options.navigator.enabled,
                    switch: {
                        enabled: true,
                        text: this._getNavSwitchText(data)
                    },
                    text: this.model.options.navigator.text
                },
                selected: this.model.state.selected,
                time: this._getTimeViewModel(data),
                days: this._getDayViewModel(data),
                weekdays: this._getWeekViewModel(data),
                month: this._getMonthViewModel(data),
                year: this._getYearViewModel(data),
                toolbox: this.model.options.toolbox,
                cssClass: this.getCssClass(),
                onlyTimePicker: this.model.options.onlyTimePicker,
                altCalendarShowHint: this.model.options.calendar[anotherCalendar[0]].showHint,
                calendarSwitchText: this.model.state.view.dateObject.toCalendar(anotherCalendar[0]).toLocale(anotherCalendar[1]).format(this.model.options.toolbox.calendarSwitch.format),
                todayButtonText: this._getButtonText().todayButtontext,
                submitButtonText: this._getButtonText().submitButtonText
            };
        }
    }, {
        key: '_getButtonText',
        value: function _getButtonText() {
            var output = {};
            if (this.model.options.locale_ == 'fa') {
                output.todayButtontext = this.model.options.toolbox.todayButton.text.fa;
                output.submitButtonText = this.model.options.toolbox.submitButton.text.fa;
            } else if (this.model.options.locale_ == 'en') {
                output.todayButtontext = this.model.options.toolbox.todayButton.text.en;
                output.submitButtonText = this.model.options.toolbox.submitButton.text.en;
            }
            return output;
        }
    }, {
        key: '_getAnotherCalendar',
        value: function _getAnotherCalendar() {
            var that = this,
                cal = void 0,
                loc = void 0;
            if (that.model.options.calendar_ == 'persian') {
                cal = 'gregorian';
                loc = that.model.options.calendar.gregorian.locale;
            } else {
                cal = 'persian';
                loc = that.model.options.calendar.persian.locale;
            }
            return [cal, loc];
        }

        /**
         * @desc render times area, prevent performance issue with scroll and time section
         */

    }, {
        key: 'renderTimePartial',
        value: function renderTimePartial() {
            var timeViewModel = this._getTimeViewModel(this.model.state.view);
            this.$container.find('[data-time-key="hour"] input').val(timeViewModel.hour.title);
            this.$container.find('[data-time-key="minute"] input').val(timeViewModel.minute.title);
            this.$container.find('[data-time-key="second"] input').val(timeViewModel.second.title);
            this.$container.find('[data-time-key="meridian"] input').val(timeViewModel.meridian.title);
        }

        /**
         * @render datepicker view element
         * @param data
         */

    }, {
        key: 'render',
        value: function render(data) {
            if (!data) {
                data = this.model.state.view;
            }
            Helper.debug(this, 'render');
            Mustache.parse(Template);
            this.rendered = $(Mustache.render(this.model.options.template, this.getViewModel(data)));
            this.$container.empty().append(this.rendered);
            this.markSelectedDay();
            this.markToday();
            this.afterRender();
        }
    }, {
        key: 'reRender',
        value: function reRender() {
            var data = this.model.state.view;
            this.render(data);
        }

        /**
         * @desc do after render work like attache events
         */

    }, {
        key: 'afterRender',
        value: function afterRender() {
            if (this.model.navigator) {
                this.model.navigator.liveAttach();
            }
        }
    }]);

    return View;
}();

module.exports = View;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

/*
 * Hamster.js v1.1.2
 * (c) 2013 Monospaced http://monospaced.com
 * License: MIT
 */

(function(window, document){
'use strict';

/**
 * Hamster
 * use this to create instances
 * @returns {Hamster.Instance}
 * @constructor
 */
var Hamster = function(element) {
  return new Hamster.Instance(element);
};

// default event name
Hamster.SUPPORT = 'wheel';

// default DOM methods
Hamster.ADD_EVENT = 'addEventListener';
Hamster.REMOVE_EVENT = 'removeEventListener';
Hamster.PREFIX = '';

// until browser inconsistencies have been fixed...
Hamster.READY = false;

Hamster.Instance = function(element){
  if (!Hamster.READY) {
    // fix browser inconsistencies
    Hamster.normalise.browser();

    // Hamster is ready...!
    Hamster.READY = true;
  }

  this.element = element;

  // store attached event handlers
  this.handlers = [];

  // return instance
  return this;
};

/**
 * create new hamster instance
 * all methods should return the instance itself, so it is chainable.
 * @param   {HTMLElement}       element
 * @returns {Hamster.Instance}
 * @constructor
 */
Hamster.Instance.prototype = {
  /**
   * bind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  wheel: function onEvent(handler, useCapture){
    Hamster.event.add(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.add(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  },

  /**
   * unbind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  unwheel: function offEvent(handler, useCapture){
    // if no handler argument,
    // unbind the last bound handler (if exists)
    if (handler === undefined && (handler = this.handlers.slice(-1)[0])) {
      handler = handler.original;
    }

    Hamster.event.remove(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.remove(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  }
};

Hamster.event = {
  /**
   * cross-browser 'addWheelListener'
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  add: function add(hamster, eventName, handler, useCapture){
    // store the original handler
    var originalHandler = handler;

    // redefine the handler
    handler = function(originalEvent){

      if (!originalEvent) {
        originalEvent = window.event;
      }

      // create a normalised event object,
      // and normalise "deltas" of the mouse wheel
      var event = Hamster.normalise.event(originalEvent),
          delta = Hamster.normalise.delta(originalEvent);

      // fire the original handler with normalised arguments
      return originalHandler(event, delta[0], delta[1], delta[2]);

    };

    // cross-browser addEventListener
    hamster.element[Hamster.ADD_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // store original and normalised handlers on the instance
    hamster.handlers.push({
      original: originalHandler,
      normalised: handler
    });
  },

  /**
   * removeWheelListener
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  remove: function remove(hamster, eventName, handler, useCapture){
    // find the normalised handler on the instance
    var originalHandler = handler,
        lookup = {},
        handlers;
    for (var i = 0, len = hamster.handlers.length; i < len; ++i) {
      lookup[hamster.handlers[i].original] = hamster.handlers[i];
    }
    handlers = lookup[originalHandler];
    handler = handlers.normalised;

    // cross-browser removeEventListener
    hamster.element[Hamster.REMOVE_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // remove original and normalised handlers from the instance
    for (var h in hamster.handlers) {
      if (hamster.handlers[h] == handlers) {
        hamster.handlers.splice(h, 1);
        break;
      }
    }
  }
};

/**
 * these hold the lowest deltas,
 * used to normalise the delta values
 * @type {Number}
 */
var lowestDelta,
    lowestDeltaXY;

Hamster.normalise = {
  /**
   * fix browser inconsistencies
   */
  browser: function normaliseBrowser(){
    // detect deprecated wheel events
    if (!('onwheel' in document || document.documentMode >= 9)) {
      Hamster.SUPPORT = document.onmousewheel !== undefined ?
                        'mousewheel' : // webkit and IE < 9 support at least "mousewheel"
                        'DOMMouseScroll'; // assume remaining browsers are older Firefox
    }

    // detect deprecated event model
    if (!window.addEventListener) {
      // assume IE < 9
      Hamster.ADD_EVENT = 'attachEvent';
      Hamster.REMOVE_EVENT = 'detachEvent';
      Hamster.PREFIX = 'on';
    }

  },

  /**
   * create a normalised event object
   * @param   {Function}    originalEvent
   * @returns {Object}      event
   */
   event: function normaliseEvent(originalEvent){
    var event = {
          // keep a reference to the original event object
          originalEvent: originalEvent,
          target: originalEvent.target || originalEvent.srcElement,
          type: 'wheel',
          deltaMode: originalEvent.type === 'MozMousePixelScroll' ? 0 : 1,
          deltaX: 0,
          deltaZ: 0,
          preventDefault: function(){
            if (originalEvent.preventDefault) {
              originalEvent.preventDefault();
            } else {
              originalEvent.returnValue = false;
            }
          },
          stopPropagation: function(){
            if (originalEvent.stopPropagation) {
              originalEvent.stopPropagation();
            } else {
              originalEvent.cancelBubble = false;
            }
          }
        };

    // calculate deltaY (and deltaX) according to the event

    // 'mousewheel'
    if (originalEvent.wheelDelta) {
      event.deltaY = - 1/40 * originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaX) {
      event.deltaX = - 1/40 * originalEvent.wheelDeltaX;
    }

    // 'DomMouseScroll'
    if (originalEvent.detail) {
      event.deltaY = originalEvent.detail;
    }

    return event;
  },

  /**
   * normalise 'deltas' of the mouse wheel
   * @param   {Function}    originalEvent
   * @returns {Array}       deltas
   */
  delta: function normaliseDelta(originalEvent){
    var delta = 0,
      deltaX = 0,
      deltaY = 0,
      absDelta = 0,
      absDeltaXY = 0,
      fn;

    // normalise deltas according to the event

    // 'wheel' event
    if (originalEvent.deltaY) {
      deltaY = originalEvent.deltaY * -1;
      delta  = deltaY;
    }
    if (originalEvent.deltaX) {
      deltaX = originalEvent.deltaX;
      delta  = deltaX * -1;
    }

    // 'mousewheel' event
    if (originalEvent.wheelDelta) {
      delta = originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaY) {
      deltaY = originalEvent.wheelDeltaY;
    }
    if (originalEvent.wheelDeltaX) {
      deltaX = originalEvent.wheelDeltaX * -1;
    }

    // 'DomMouseScroll' event
    if (originalEvent.detail) {
      delta = originalEvent.detail * -1;
    }

    // Don't return NaN
    if (delta === 0) {
      return [0, 0, 0];
    }

    // look for lowest delta to normalize the delta values
    absDelta = Math.abs(delta);
    if (!lowestDelta || absDelta < lowestDelta) {
      lowestDelta = absDelta;
    }
    absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
    if (!lowestDeltaXY || absDeltaXY < lowestDeltaXY) {
      lowestDeltaXY = absDeltaXY;
    }

    // convert deltas to whole numbers
    fn = delta > 0 ? 'floor' : 'ceil';
    delta  = Math[fn](delta / lowestDelta);
    deltaX = Math[fn](deltaX / lowestDeltaXY);
    deltaY = Math[fn](deltaY / lowestDeltaXY);

    return [delta, deltaX, deltaY];
  }
};

if (typeof window.define === 'function' && window.define.amd) {
  // AMD
  window.define('hamster', [], function(){
    return Hamster;
  });
} else if (true) {
  // CommonJS
  module.exports = Hamster;
} else {
  // Browser global
  window.Hamster = Hamster;
}

})(window, window.document);


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false Mustache: true*/

(function defineMustache (global, factory) {
  if (typeof exports === 'object' && exports && typeof exports.nodeName !== 'string') {
    factory(exports); // CommonJS
  } else if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
  } else {
    global.Mustache = {};
    factory(global.Mustache); // script, wsh, asp
  }
}(this, function mustacheFactory (mustache) {

  var objectToString = Object.prototype.toString;
  var isArray = Array.isArray || function isArrayPolyfill (object) {
    return objectToString.call(object) === '[object Array]';
  };

  function isFunction (object) {
    return typeof object === 'function';
  }

  /**
   * More correct typeof string handling array
   * which normally returns typeof 'object'
   */
  function typeStr (obj) {
    return isArray(obj) ? 'array' : typeof obj;
  }

  function escapeRegExp (string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  /**
   * Null safe way of checking whether or not an object,
   * including its prototype, has a given property
   */
  function hasProperty (obj, propName) {
    return obj != null && typeof obj === 'object' && (propName in obj);
  }

  /**
   * Safe way of detecting whether or not the given thing is a primitive and
   * whether it has the given property
   */
  function primitiveHasOwnProperty (primitive, propName) {  
    return (
      primitive != null
      && typeof primitive !== 'object'
      && primitive.hasOwnProperty
      && primitive.hasOwnProperty(propName)
    );
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var regExpTest = RegExp.prototype.test;
  function testRegExp (re, string) {
    return regExpTest.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace (string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  function escapeHtml (string) {
    return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   */
  function parseTemplate (template, tags) {
    if (!template)
      return [];

    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace () {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags (tagsToCompile) {
      if (typeof tagsToCompile === 'string')
        tagsToCompile = tagsToCompile.split(spaceRe, 2);

      if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
        throw new Error('Invalid tags: ' + tagsToCompile);

      openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }

    compileTags(tags || mustache.tags);

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push([ 'text', chr, start, start + 1 ]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n')
            stripSpace();
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      token = [ type, value, start, scanner.pos ];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();

    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens (tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens (tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
        case '#':
        case '^':
          collector.push(token);
          sections.push(token);
          collector = token[4] = [];
          break;
        case '/':
          section = sections.pop();
          section[5] = token[2];
          collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
          break;
        default:
          collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner (string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function eos () {
    return this.tail === '';
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function scan (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0)
      return '';

    var string = match[0];

    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function scanUntil (re) {
    var index = this.tail.search(re), match;

    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;
      case 0:
        match = '';
        break;
      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context (view, parentContext) {
    this.view = view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function push (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function lookup (name) {
    var cache = this.cache;

    var value;
    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      var context = this, intermediateValue, names, index, lookupHit = false;

      while (context) {
        if (name.indexOf('.') > 0) {
          intermediateValue = context.view;
          names = name.split('.');
          index = 0;

          /**
           * Using the dot notion path in `name`, we descend through the
           * nested objects.
           *
           * To be certain that the lookup has been successful, we have to
           * check if the last object in the path actually has the property
           * we are looking for. We store the result in `lookupHit`.
           *
           * This is specially necessary for when the value has been set to
           * `undefined` and we want to avoid looking up parent contexts.
           *
           * In the case where dot notation is used, we consider the lookup
           * to be successful even if the last "object" in the path is
           * not actually an object but a primitive (e.g., a string, or an
           * integer), because it is sometimes useful to access a property
           * of an autoboxed primitive, such as the length of a string.
           **/
          while (intermediateValue != null && index < names.length) {
            if (index === names.length - 1)
              lookupHit = (
                hasProperty(intermediateValue, names[index]) 
                || primitiveHasOwnProperty(intermediateValue, names[index])
              );

            intermediateValue = intermediateValue[names[index++]];
          }
        } else {
          intermediateValue = context.view[name];

          /**
           * Only checking against `hasProperty`, which always returns `false` if
           * `context.view` is not an object. Deliberately omitting the check
           * against `primitiveHasOwnProperty` if dot notation is not used.
           *
           * Consider this example:
           * ```
           * Mustache.render("The length of a football field is {{#length}}{{length}}{{/length}}.", {length: "100 yards"})
           * ```
           *
           * If we were to check also against `primitiveHasOwnProperty`, as we do
           * in the dot notation case, then render call would return:
           *
           * "The length of a football field is 9."
           *
           * rather than the expected:
           *
           * "The length of a football field is 100 yards."
           **/
          lookupHit = hasProperty(context.view, name);
        }

        if (lookupHit) {
          value = intermediateValue;
          break;
        }

        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value))
      value = value.call(this.view);

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer () {
    this.cache = {};
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function clearCache () {
    this.cache = {};
  };

  /**
   * Parses and caches the given `template` according to the given `tags` or
   * `mustache.tags` if `tags` is omitted,  and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function parse (template, tags) {
    var cache = this.cache;
    var cacheKey = template + ':' + (tags || mustache.tags).join(':');
    var tokens = cache[cacheKey];

    if (tokens == null)
      tokens = cache[cacheKey] = parseTemplate(template, tags);

    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   *
   * If the optional `tags` argument is given here it must be an array with two
   * string values: the opening and closing tags used in the template (e.g.
   * [ "<%", "%>" ]). The default is to mustache.tags.
   */
  Writer.prototype.render = function render (template, view, partials, tags) {
    var tokens = this.parse(template, tags);
    var context = (view instanceof Context) ? view : new Context(view);
    return this.renderTokens(tokens, context, partials, template, tags);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function renderTokens (tokens, context, partials, originalTemplate, tags) {
    var buffer = '';

    var token, symbol, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];

      if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate);
      else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate);
      else if (symbol === '>') value = this.renderPartial(token, context, partials, tags);
      else if (symbol === '&') value = this.unescapedValue(token, context);
      else if (symbol === 'name') value = this.escapedValue(token, context);
      else if (symbol === 'text') value = this.rawValue(token);

      if (value !== undefined)
        buffer += value;
    }

    return buffer;
  };

  Writer.prototype.renderSection = function renderSection (token, context, partials, originalTemplate) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender (template) {
      return self.render(template, context, partials);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
      }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string')
        throw new Error('Cannot use higher-order sections without the original template');

      // Extract the portion of the original template that the section contains.
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

      if (value != null)
        buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate);
    }
    return buffer;
  };

  Writer.prototype.renderInverted = function renderInverted (token, context, partials, originalTemplate) {
    var value = context.lookup(token[1]);

    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || (isArray(value) && value.length === 0))
      return this.renderTokens(token[4], context, partials, originalTemplate);
  };

  Writer.prototype.renderPartial = function renderPartial (token, context, partials, tags) {
    if (!partials) return;

    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null)
      return this.renderTokens(this.parse(value, tags), context, partials, value);
  };

  Writer.prototype.unescapedValue = function unescapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return value;
  };

  Writer.prototype.escapedValue = function escapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return mustache.escape(value);
  };

  Writer.prototype.rawValue = function rawValue (token) {
    return token[1];
  };

  mustache.name = 'mustache.js';
  mustache.version = '3.0.1';
  mustache.tags = [ '{{', '}}' ];

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function clearCache () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function parse (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer. If the optional `tags` argument is given here it must be an
   * array with two string values: the opening and closing tags used in the
   * template (e.g. [ "<%", "%>" ]). The default is to mustache.tags.
   */
  mustache.render = function render (template, view, partials, tags) {
    if (typeof template !== 'string') {
      throw new TypeError('Invalid template! Template should be a "string" ' +
                          'but "' + typeStr(template) + '" was given as the first ' +
                          'argument for mustache#render(template, view, partials)');
    }

    return defaultWriter.render(template, view, partials, tags);
  };

  // This is here for backwards compatibility with 0.4.x.,
  /*eslint-disable */ // eslint wants camel cased function name
  mustache.to_html = function to_html (template, view, partials, send) {
    /*eslint-enable*/

    var result = mustache.render(template, view, partials);

    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

  return mustache;
}));


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

// Start algorithm class
let ASTRO = __webpack_require__(19);
let State = __webpack_require__(24);

class Algorithms {
    constructor (parent) {
        this.parent = parent;
        this.ASTRO = new ASTRO();
        this.State = new State();
        /*  You may notice that a variety of array variables logically local
         to functions are declared globally here.  In JavaScript, construction
         of an array variable from source code occurs as the code is
         interpreted.  Making these variables pseudo-globals permits us
         to avoid overhead constructing and disposing of them in each
         call on the function in which whey are used.  */
        // TODO this block didnt used in main agorithm
        this.J0000 = 1721424.5;                // Julian date of Gregorian epoch: 0000-01-01
        this.J1970 = 2440587.5;                // Julian date at Unix epoch: 1970-01-01
        this.JMJD = 2400000.5;                // Epoch of Modified Julian Date system
        this.NormLeap = [false/*"Normal year"*/, true/*"Leap year"*/];
        // TODO END
        this.GREGORIAN_EPOCH = 1721425.5;
        this.PERSIAN_EPOCH = 1948320.5;
    }


    /**
     * @desc LEAP_GREGORIAN  --  Is a given year in the Gregorian calendar a leap year ?
     * @param year
     * @return {boolean}
     */
    leap_gregorian (year) {
        return ((year % 4) === 0) &&
          (!(((year % 100) === 0) && ((year % 400) !== 0)));
    }


    /**
     * @desc Determine Julian day number from Gregorian calendar date
     * @param {*} year
     * @param {*} month
     * @param {*} day
     */
    gregorian_to_jd (year, month, day) {
        return (this.GREGORIAN_EPOCH - 1) +
          (365 * (year - 1)) +
          Math.floor((year - 1) / 4) +
          (-Math.floor((year - 1) / 100)) +
          Math.floor((year - 1) / 400) +
          Math.floor((((367 * month) - 362) / 12) +
            ((month <= 2) ? 0 :
                (this.leap_gregorian(year) ? -1 : -2)
            ) +
            day);
    }


    /**
     * @desc Calculate Gregorian calendar date from Julian day
     * @param {*} jd
     */
    jd_to_gregorian (jd) {
        let wjd, depoch, quadricent, dqc, cent, dcent, quad, dquad,
          yindex, year, yearday, leapadj, month, day;

        wjd = Math.floor(jd - 0.5) + 0.5;
        depoch = wjd - this.GREGORIAN_EPOCH;
        quadricent = Math.floor(depoch / 146097);
        dqc = this.ASTRO.mod(depoch, 146097);
        cent = Math.floor(dqc / 36524);
        dcent = this.ASTRO.mod(dqc, 36524);
        quad = Math.floor(dcent / 1461);
        dquad = this.ASTRO.mod(dcent, 1461);
        yindex = Math.floor(dquad / 365);
        year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;
        if (!((cent === 4) || (yindex === 4))) {
            year++;
        }
        yearday = wjd - this.gregorian_to_jd(year, 1, 1);
        leapadj = ((wjd < this.gregorian_to_jd(year, 3, 1)) ? 0
            :
            (this.leap_gregorian(year) ? 1 : 2)
        );
        month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);
        day = (wjd - this.gregorian_to_jd(year, month, 1)) + 1;

        return [year, month, day];
    }


    /**
     * @param {*} year
     */
//    leap_julian (year) {
//        return this.ASTRO.mod(year, 4) === ((year > 0) ? 0 : 3);
//    }


    /**
     * @desc Calculate Julian calendar date from Julian day
     * @param {*} td
     */
//    jd_to_julian (td) {
//        let z, a, b, c, d, e, year, month, day;
//
//        td += 0.5;
//        z = Math.floor(td);
//
//        a = z;
//        b = a + 1524;
//        c = Math.floor((b - 122.1) / 365.25);
//        d = Math.floor(365.25 * c);
//        e = Math.floor((b - d) / 30.6001);
//
//        month = Math.floor((e < 14) ? (e - 1) : (e - 13));
//        year = Math.floor((month > 2) ? (c - 4716) : (c - 4715));
//        day = b - d - Math.floor(30.6001 * e);
//
//        /*  If year is less than 1, subtract one to convert from
//         a zero based date system to the common era system in
//         which the year -1 (1 B.C.E) is followed by year 1 (1 C.E.).  */
//
//        if (year < 1) {
//            year--;
//        }
//
//        return [year, month, day];
//    }


    /**
     * @desc TEHRAN_EQUINOX  --  Determine Julian day and fraction of the
     March equinox at the Tehran meridian in
     a given Gregorian year.
     * @param {*} year
     */
    tehran_equinox (year) {
        let equJED, equJD, equAPP, equTehran, dtTehran;

        //  March equinox in dynamical time
        equJED = this.ASTRO.equinox(year, 0);

        //  Correct for delta T to obtain Universal time
        equJD = equJED - (this.ASTRO.deltat(year) / (24 * 60 * 60));

        //  Apply the equation of time to yield the apparent time at Greenwich
        equAPP = equJD + this.ASTRO.equationOfTime(equJED);

        /*  Finally, we must correct for the constant difference between
         the Greenwich meridian andthe time zone standard for
         Iran Standard time, 52°30' to the East.  */

        dtTehran = (52 + (30 / 60.0) + (0 / (60.0 * 60.0))) / 360;
        equTehran = equAPP + dtTehran;

        return equTehran;
    }


    /**
     * @desc TEHRAN_EQUINOX_JD  --  Calculate Julian day during which the
     March equinox, reckoned from the Tehran
     meridian, occurred for a given Gregorian
     year.
     * @param {*} year
     */
    tehran_equinox_jd (year) {
        let ep, epg;

        ep = this.tehran_equinox(year);
        epg = Math.floor(ep);

        return epg;
    }


    /**
     * @desc  PERSIANA_YEAR  --  Determine the year in the Persian
     astronomical calendar in which a
     given Julian day falls.  Returns an
     array of two elements:

     [0]  Persian year
     [1]  Julian day number containing
     equinox for this year.
     * @param {*} jd
     */
    persiana_year (jd) {
        let guess = this.jd_to_gregorian(jd)[0] - 2,
          lasteq, nexteq, adr;

        lasteq = this.tehran_equinox_jd(guess);
        while (lasteq > jd) {
            guess--;
            lasteq = this.tehran_equinox_jd(guess);
        }
        nexteq = lasteq - 1;
        while (!((lasteq <= jd) && (jd < nexteq))) {
            lasteq = nexteq;
            guess++;
            nexteq = this.tehran_equinox_jd(guess);
        }
        adr = Math.round((lasteq - this.PERSIAN_EPOCH) / this.ASTRO.TropicalYear) + 1;

        return [adr, lasteq];
    }


    /**
     * @desc Calculate date in the Persian astronomical
     calendar from Julian day.
     * @param {*} jd
     */
    jd_to_persiana (jd) {
        let year, month, day,
          adr, equinox, yday;

        jd = Math.floor(jd) + 0.5;
        adr = this.persiana_year(jd);
        year = adr[0];
        equinox = adr[1];
        day = Math.floor((jd - equinox) / 30) + 1;

        yday = (Math.floor(jd) - this.persiana_to_jd(year, 1, 1)) + 1;
        month = (yday <= 186) ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
        day = (Math.floor(jd) - this.persiana_to_jd(year, month, 1)) + 1;

        return [year, month, day];
    }


    /**
     * @desc Obtain Julian day from a given Persian
     astronomical calendar date.
     * @param {*} year
     * @param {*} month
     * @param {*} day
     */
    persiana_to_jd (year, month, day) {
        let adr, equinox, guess, jd;

        guess = (this.PERSIAN_EPOCH - 1) + (this.ASTRO.TropicalYear * ((year - 1) - 1));
        adr = [year - 1, 0];

        while (adr[0] < year) {
            adr = this.persiana_year(guess);
            guess = adr[1] + (this.ASTRO.TropicalYear + 2);
        }
        equinox = adr[1];

        jd = equinox +
          ((month <= 7) ?
              ((month - 1) * 31) :
              (((month - 1) * 30) + 6)
          ) +
          (day - 1);
        return jd;
    }


    /**
     * @desc Is a given year a leap year in the Persian astronomical calendar ?
     * @param {*} year
     */
    leap_persiana (year) {
        return (this.persiana_to_jd(year + 1, 1, 1) -
          this.persiana_to_jd(year, 1, 1)) > 365;
    }


    /**
     * @desc Is a given year a leap year in the Persian calendar ?
     * also nasa use this algorithm https://eclipse.gsfc.nasa.gov/SKYCAL/algorithm.js search for 'getLastDayOfPersianMonth' and you can find it
     * @param {*} year
     *
     */
    leap_persian (year) {
        return ((((((year - ((year > 0) ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816) < 682;
    }


    /**
     * @desc Determine Julian day from Persian date
     * @param {*} year
     * @param {*} month
     * @param {*} day
     */
    persian_to_jd (year, month, day) {
        let epbase, epyear;

        epbase = year - ((year >= 0) ? 474 : 473);
        epyear = 474 + this.ASTRO.mod(epbase, 2820);

        return day +
          ((month <= 7) ?
              ((month - 1) * 31) :
              (((month - 1) * 30) + 6)
          ) +
          Math.floor(((epyear * 682) - 110) / 2816) +
          (epyear - 1) * 365 +
          Math.floor(epbase / 2820) * 1029983 +
          (this.PERSIAN_EPOCH - 1);
    }


    /**
     * @desc Calculate Persian date from Julian day
     * @param {*} jd
     */
    jd_to_persian (jd) {
        let year, month, day, depoch, cycle, cyear, ycycle,
          aux1, aux2, yday;


        jd = Math.floor(jd) + 0.5;

        depoch = jd - this.persian_to_jd(475, 1, 1);
        cycle = Math.floor(depoch / 1029983);
        cyear = this.ASTRO.mod(depoch, 1029983);
        if (cyear === 1029982) {
            ycycle = 2820;
        } else {
            aux1 = Math.floor(cyear / 366);
            aux2 = this.ASTRO.mod(cyear, 366);
            ycycle = Math.floor(((2134 * aux1) + (2816 * aux2) + 2815) / 1028522) +
              aux1 + 1;
        }
        year = ycycle + (2820 * cycle) + 474;
        if (year <= 0) {
            year--;
        }
        yday = (jd - this.persian_to_jd(year, 1, 1)) + 1;
        month = (yday <= 186) ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
        day = (jd - this.persian_to_jd(year, month, 1)) + 1;
        return [year, month, day];
    }


    /**
     *
     * @param {*} weekday
     */
    gWeekDayToPersian (weekday) {
        if (weekday + 2 === 8) {
            return 1;
        } else if (weekday + 2 === 7) {
            return 7;
        } else {
            return weekday + 2;
        }

    }


    /**
     * @desc updateFromGregorian  --  Update all calendars from Gregorian.
     "Why not Julian date?" you ask.  Because
     starting from Gregorian guarantees we're
     already snapped to an integral second, so
     we don't get roundoff errors in other
     calendars.
     */
    updateFromGregorian () {
        let j, year, mon, mday, hour, min, sec,
          weekday, utime, perscal;

        year = this.State.gregorian.year;
        mon = this.State.gregorian.month;
        mday = this.State.gregorian.day;
        hour = 0;//this.State.gregorian.hour;
        min = 0;//this.State.gregorian.minute;
        sec = 0;//this.State.gregorian.second;

        this.State.gDate = new Date(
          year,
          mon,
          mday,
          this.State.gregorian.hour,
          this.State.gregorian.minute,
          this.State.gregorian.second,
          this.State.gregorian.millisecond
        );

        if (this.parent._utcMode === false) {
            this.State.zone = this.State.gDate.getTimezoneOffset();
        }


        // Added for this algorithms cant parse 2016,13,32 successfully
        this.State.gregorian.year = this.State.gDate.getFullYear();
        this.State.gregorian.month = this.State.gDate.getMonth();
        this.State.gregorian.day = this.State.gDate.getDate();

        //  Update Julian day
        // ---------------------------------------------------------------------------
        j = this.gregorian_to_jd(year, mon + 1, mday) +
          (Math.floor(sec + 60 * (min + 60 * hour) + 0.5) / 86400.0);

        this.State.julianday = j;
        this.State.modifiedjulianday = j - this.JMJD;

        //  Update day of week in Gregorian box
        // ---------------------------------------------------------------------------
        weekday = this.ASTRO.jwday(j);
        // Move to 1 indexed number
        this.State.gregorian.weekday = weekday + 1;

        //  Update leap year status in Gregorian box
        // ---------------------------------------------------------------------------
        this.State.gregorian.leap = this.NormLeap[this.leap_gregorian(year) ? 1 : 0];

        //  Update Julian Calendar
        // ---------------------------------------------------------------------------
//        julcal = this.jd_to_julian(j);
//
//        this.State.juliancalendar.year = julcal[0];
//        this.State.juliancalendar.month = julcal[1] - 1;
//        this.State.juliancalendar.day = julcal[2];
//        this.State.juliancalendar.leap = this.NormLeap[this.leap_julian(julcal[0]) ? 1 : 0];
        weekday = this.ASTRO.jwday(j);
//        this.State.juliancalendar.weekday = weekday;

        //  Update Persian Calendar
        // ---------------------------------------------------------------------------
        if (this.parent.calendarType == 'persian' && this.parent.leapYearMode == 'algorithmic') {
            perscal = this.jd_to_persian(j);
            this.State.persian.year = perscal[0];
            this.State.persian.month = perscal[1] - 1;
            this.State.persian.day = perscal[2];
            this.State.persian.weekday = this.gWeekDayToPersian(weekday);
            this.State.persian.leap = this.NormLeap[this.leap_persian(perscal[0]) ? 1 : 0];
        }

        //  Update Persian Astronomical Calendar
        // ---------------------------------------------------------------------------
        if (this.parent.calendarType == 'persian' && this.parent.leapYearMode == 'astronomical') {
            perscal = this.jd_to_persiana(j);
            this.State.persianAstro.year = perscal[0];
            this.State.persianAstro.month = perscal[1] - 1;
            this.State.persianAstro.day = perscal[2];
            this.State.persianAstro.weekday = this.gWeekDayToPersian(weekday);
            this.State.persianAstro.leap = this.NormLeap[this.leap_persiana(perscal[0]) ? 1 : 0];
        }
        //  Update Gregorian serial number
        // ---------------------------------------------------------------------------
        if (this.State.gregserial.day !== null) {
            this.State.gregserial.day = j - this.J0000;
        }


        //  Update Unix time()
        // ---------------------------------------------------------------------------
        utime = (j - this.J1970) * (60 * 60 * 24 * 1000);

        this.State.unixtime = Math.round(utime / 1000);
    }


    /**
     * @desc Perform calculation starting with a Gregorian date
     * @param {*} dateArray
     */
    calcGregorian (dateArray) {
        if (dateArray[0] || dateArray[0] === 0) {
            this.State.gregorian.year = dateArray[0];
        }
        if (dateArray[1] || dateArray[1] === 0) {
            this.State.gregorian.month = dateArray[1];
        }
        if (dateArray[2] || dateArray[2] === 0) {
            this.State.gregorian.day = dateArray[2];
        }
        if (dateArray[3] || dateArray[3] === 0) {
            this.State.gregorian.hour = dateArray[3];
        }
        if (dateArray[4] || dateArray[4] === 0) {
          this.State.gregorian.minute = dateArray[4];
        }
        if (dateArray[5] || dateArray[5] === 0) {
            this.State.gregorian.second = dateArray[5];
        }
        if (dateArray[6] || dateArray[6] === 0) {
            this.State.gregorian.millisecond = dateArray[6];
        }
        this.updateFromGregorian();
    }

    /**
     * @desc Perform calculation starting with a Julian date
     */
    calcJulian () {
        let j, date;
        j = this.State.julianday;
        date = this.jd_to_gregorian(j);
        this.State.gregorian.year = date[0];
        this.State.gregorian.month = date[1] - 1;
        this.State.gregorian.day = date[2];
        //        this.State.gregorian.hour = this.pad(time[0], 2, " ");
        //        this.State.gregorian.minute = this.pad(time[1], 2, "0");
        //        this.State.gregorian.second = this.pad(time[2], 2, "0");
        this.updateFromGregorian();
    }


    /**
     * @desc Set Julian date and update all calendars
     * @param {*} j
     */
    setJulian (j) {
        this.State.julianday = j;
        this.calcJulian();
    }


    /**
     * @desc  Update from Persian calendar
     * @param {*} dateArray
     */
    calcPersian (dateArray) {
        if (dateArray[0] || dateArray[0] === 0) {
            this.State.persian.year = dateArray[0];
        }
        if (dateArray[1] || dateArray[1] === 0) {
            this.State.persian.month = dateArray[1];
        }
        if (dateArray[2] || dateArray[2] === 0) {
            this.State.persian.day = dateArray[2];
        }
        if (dateArray[3] || dateArray[3] === 0) {
            this.State.gregorian.hour = dateArray[3];
        }
        if (dateArray[4] || dateArray[4] === 0) {
            this.State.gregorian.minute = dateArray[4];
        }
        if (dateArray[5] || dateArray[5] === 0) {
            this.State.gregorian.second = dateArray[5];
        }
        if (dateArray[6] || dateArray[6] === 0) {
            this.State.gregorian.millisecond = dateArray[6];
        }

        this.setJulian(
          this.persian_to_jd(
            this.State.persian.year,
            this.State.persian.month,
            this.State.persian.day)
        );
    }


    /**
     * @desc Update from Persian astronomical calendar
     * @param {*} dateArray
     */
    calcPersiana (dateArray) {
        if (dateArray[0] || dateArray[0] === 0) {
            this.State.persianAstro.year = dateArray[0];
        }
        if (dateArray[1] || dateArray[1] === 0) {
            this.State.persianAstro.month = dateArray[1];
        }
        if (dateArray[2] || dateArray[2] === 0) {
            this.State.persianAstro.day = dateArray[2];
        }

        if (dateArray[3] || dateArray[3] === 0) {
            this.State.gregorian.hour = dateArray[3];
        }
        if (dateArray[4] || dateArray[4] === 0) {
            this.State.gregorian.minute = dateArray[4];
        }
        if (dateArray[5] || dateArray[5] === 0) {
            this.State.gregorian.second = dateArray[5];
        }
        if (dateArray[6] || dateArray[6] === 0) {
            this.State.gregorian.millisecond = dateArray[6];
        }
        this.setJulian(
          this.persiana_to_jd(
            this.State.persianAstro.year,
            this.State.persianAstro.month,
            this.State.persianAstro.day + 0.5)
        );
    }
}


module.exports = Algorithms;


/***/ }),
/* 19 */
/***/ (function(module, exports) {

/*
 JavaScript functions for positional astronomy
 by John Walker  --  September, MIM
 http://www.fourmilab.ch/
 This program is in the public domain.
 */

class ASTRO {
    constructor () {
        //  Frequently-used constants
        this.J2000 = 2451545.0;              // Julian day of J2000 epoch
        this.JulianCentury = 36525.0;                // Days in Julian century
        this.JulianMillennium = (this.JulianCentury * 10);   // Days in Julian millennium
        //        this.AstronomicalUnit = 149597870.0;           // Astronomical unit in kilometres
        this.TropicalYear = 365.24219878;           // Mean solar tropical year

        /*  OBLIQEQ  --  Calculate the obliquity of the ecliptic for a given
         Julian date.  This uses Laskar's tenth-degree
         polynomial fit (J. Laskar, Astronomy and
         Astrophysics, Vol. 157, page 68 [1986]) which is
         accurate to within 0.01 arc second between AD 1000
         and AD 3000, and within a few seconds of arc for
         +/-10000 years around AD 2000.  If we're outside the
         range in which this fit is valid (deep time) we
         simply return the J2000 value of the obliquity, which
         happens to be almost precisely the mean.  */
        this.oterms = [
            -4680.93,
            -1.55,
            1999.25,
            -51.38,
            -249.67,
            -39.05,
            7.12,
            27.87,
            5.79,
            2.45
        ];
        /* Periodic terms for nutation in longiude (delta \Psi) and
         obliquity (delta \Epsilon) as given in table 21.A of
         Meeus, "Astronomical Algorithms", first edition. */
        this.nutArgMult = [
            0, 0, 0, 0, 1,
            -2, 0, 0, 2, 2,
            0, 0, 0, 2, 2,
            0, 0, 0, 0, 2,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            -2, 1, 0, 2, 2,
            0, 0, 0, 2, 1,
            0, 0, 1, 2, 2,
            -2, -1, 0, 2, 2,
            -2, 0, 1, 0, 0,
            -2, 0, 0, 2, 1,
            0, 0, -1, 2, 2,
            2, 0, 0, 0, 0,
            0, 0, 1, 0, 1,
            2, 0, -1, 2, 2,
            0, 0, -1, 0, 1,
            0, 0, 1, 2, 1,
            -2, 0, 2, 0, 0,
            0, 0, -2, 2, 1,
            2, 0, 0, 2, 2,
            0, 0, 2, 2, 2,
            0, 0, 2, 0, 0,
            -2, 0, 1, 2, 2,
            0, 0, 0, 2, 0,
            -2, 0, 0, 2, 0,
            0, 0, -1, 2, 1,
            0, 2, 0, 0, 0,
            2, 0, -1, 0, 1,
            -2, 2, 0, 2, 2,
            0, 1, 0, 0, 1,
            -2, 0, 1, 0, 1,
            0, -1, 0, 0, 1,
            0, 0, 2, -2, 0,
            2, 0, -1, 2, 1,
            2, 0, 1, 2, 2,
            0, 1, 0, 2, 2,
            -2, 1, 1, 0, 0,
            0, -1, 0, 2, 2,
            2, 0, 0, 2, 1,
            2, 0, 1, 0, 0,
            -2, 0, 2, 2, 2,
            -2, 0, 1, 2, 1,
            2, 0, -2, 0, 1,
            2, 0, 0, 0, 1,
            0, -1, 1, 0, 0,
            -2, -1, 0, 2, 1,
            -2, 0, 0, 0, 1,
            0, 0, 2, 2, 1,
            -2, 0, 2, 0, 1,
            -2, 1, 0, 2, 1,
            0, 0, 1, -2, 0,
            -1, 0, 1, 0, 0,
            -2, 1, 0, 0, 0,
            1, 0, 0, 0, 0,
            0, 0, 1, 2, 0,
            -1, -1, 1, 0, 0,
            0, 1, 1, 0, 0,
            0, -1, 1, 2, 2,
            2, -1, -1, 2, 2,
            0, 0, -2, 2, 2,
            0, 0, 3, 2, 2,
            2, -1, 0, 2, 2
        ];

        this.nutArgCoeff = [
            -171996, -1742, 92095, 89, /*  0,  0,  0,  0,  1 */
            -13187, -16, 5736, -31, /* -2,  0,  0,  2,  2 */
            -2274, -2, 977, -5, /*  0,  0,  0,  2,  2 */
            2062, 2, -895, 5, /*  0,  0,  0,  0,  2 */
            1426, -34, 54, -1, /*  0,  1,  0,  0,  0 */
            712, 1, -7, 0, /*  0,  0,  1,  0,  0 */
            -517, 12, 224, -6, /* -2,  1,  0,  2,  2 */
            -386, -4, 200, 0, /*  0,  0,  0,  2,  1 */
            -301, 0, 129, -1, /*  0,  0,  1,  2,  2 */
            217, -5, -95, 3, /* -2, -1,  0,  2,  2 */
            -158, 0, 0, 0, /* -2,  0,  1,  0,  0 */
            129, 1, -70, 0, /* -2,  0,  0,  2,  1 */
            123, 0, -53, 0, /*  0,  0, -1,  2,  2 */
            63, 0, 0, 0, /*  2,  0,  0,  0,  0 */
            63, 1, -33, 0, /*  0,  0,  1,  0,  1 */
            -59, 0, 26, 0, /*  2,  0, -1,  2,  2 */
            -58, -1, 32, 0, /*  0,  0, -1,  0,  1 */
            -51, 0, 27, 0, /*  0,  0,  1,  2,  1 */
            48, 0, 0, 0, /* -2,  0,  2,  0,  0 */
            46, 0, -24, 0, /*  0,  0, -2,  2,  1 */
            -38, 0, 16, 0, /*  2,  0,  0,  2,  2 */
            -31, 0, 13, 0, /*  0,  0,  2,  2,  2 */
            29, 0, 0, 0, /*  0,  0,  2,  0,  0 */
            29, 0, -12, 0, /* -2,  0,  1,  2,  2 */
            26, 0, 0, 0, /*  0,  0,  0,  2,  0 */
            -22, 0, 0, 0, /* -2,  0,  0,  2,  0 */
            21, 0, -10, 0, /*  0,  0, -1,  2,  1 */
            17, -1, 0, 0, /*  0,  2,  0,  0,  0 */
            16, 0, -8, 0, /*  2,  0, -1,  0,  1 */
            -16, 1, 7, 0, /* -2,  2,  0,  2,  2 */
            -15, 0, 9, 0, /*  0,  1,  0,  0,  1 */
            -13, 0, 7, 0, /* -2,  0,  1,  0,  1 */
            -12, 0, 6, 0, /*  0, -1,  0,  0,  1 */
            11, 0, 0, 0, /*  0,  0,  2, -2,  0 */
            -10, 0, 5, 0, /*  2,  0, -1,  2,  1 */
            -8, 0, 3, 0, /*  2,  0,  1,  2,  2 */
            7, 0, -3, 0, /*  0,  1,  0,  2,  2 */
            -7, 0, 0, 0, /* -2,  1,  1,  0,  0 */
            -7, 0, 3, 0, /*  0, -1,  0,  2,  2 */
            -7, 0, 3, 0, /*  2,  0,  0,  2,  1 */
            6, 0, 0, 0, /*  2,  0,  1,  0,  0 */
            6, 0, -3, 0, /* -2,  0,  2,  2,  2 */
            6, 0, -3, 0, /* -2,  0,  1,  2,  1 */
            -6, 0, 3, 0, /*  2,  0, -2,  0,  1 */
            -6, 0, 3, 0, /*  2,  0,  0,  0,  1 */
            5, 0, 0, 0, /*  0, -1,  1,  0,  0 */
            -5, 0, 3, 0, /* -2, -1,  0,  2,  1 */
            -5, 0, 3, 0, /* -2,  0,  0,  0,  1 */
            -5, 0, 3, 0, /*  0,  0,  2,  2,  1 */
            4, 0, 0, 0, /* -2,  0,  2,  0,  1 */
            4, 0, 0, 0, /* -2,  1,  0,  2,  1 */
            4, 0, 0, 0, /*  0,  0,  1, -2,  0 */
            -4, 0, 0, 0, /* -1,  0,  1,  0,  0 */
            -4, 0, 0, 0, /* -2,  1,  0,  0,  0 */
            -4, 0, 0, 0, /*  1,  0,  0,  0,  0 */
            3, 0, 0, 0, /*  0,  0,  1,  2,  0 */
            -3, 0, 0, 0, /* -1, -1,  1,  0,  0 */
            -3, 0, 0, 0, /*  0,  1,  1,  0,  0 */
            -3, 0, 0, 0, /*  0, -1,  1,  2,  2 */
            -3, 0, 0, 0, /*  2, -1, -1,  2,  2 */
            -3, 0, 0, 0, /*  0,  0, -2,  2,  2 */
            -3, 0, 0, 0, /*  0,  0,  3,  2,  2 */
            -3, 0, 0, 0           /*  2, -1,  0,  2,  2 */
        ];


        /**
         * @desc Table of observed Delta T values at the beginning of even numbered years from 1620 through 2002.
         * @type Array
         */
        this.deltaTtab = [
            121, 112, 103, 95, 88, 82, 77, 72, 68, 63, 60, 56, 53, 51, 48, 46,
            44, 42, 40, 38, 35, 33, 31, 29, 26, 24, 22, 20, 18, 16, 14, 12,
            11, 10, 9, 8, 7, 7, 7, 7, 7, 7, 8, 8, 9, 9, 9, 9, 9, 10, 10, 10,
            10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13,
            13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16,
            16, 16, 15, 15, 14, 13, 13.1, 12.5, 12.2, 12, 12, 12, 12, 12, 12,
            11.9, 11.6, 11, 10.2, 9.2, 8.2, 7.1, 6.2, 5.6, 5.4, 5.3, 5.4, 5.6,
            5.9, 6.2, 6.5, 6.8, 7.1, 7.3, 7.5, 7.6, 7.7, 7.3, 6.2, 5.2, 2.7,
            1.4, -1.2, -2.8, -3.8, -4.8, -5.5, -5.3, -5.6, -5.7, -5.9, -6,
            -6.3, -6.5, -6.2, -4.7, -2.8, -0.1, 2.6, 5.3, 7.7, 10.4, 13.3, 16,
            18.2, 20.2, 21.1, 22.4, 23.5, 23.8, 24.3, 24, 23.9, 23.9, 23.7,
            24, 24.3, 25.3, 26.2, 27.3, 28.2, 29.1, 30, 30.7, 31.4, 32.2,
            33.1, 34, 35, 36.5, 38.3, 40.2, 42.2, 44.5, 46.5, 48.5, 50.5,
            52.2, 53.8, 54.9, 55.8, 56.9, 58.3, 60, 61.6, 63, 65, 66.6
        ];


        /*  EQUINOX  --  Determine the Julian Ephemeris Day of an
         equinox or solstice.  The "which" argument
         selects the item to be computed:

         0   March equinox
         1   June solstice
         2   September equinox
         3   December solstice

         */
        /**
         * @desc Periodic terms to obtain true time
         * @type Array
         */
        this.EquinoxpTerms = [
            485, 324.96, 1934.136,
            203, 337.23, 32964.467,
            199, 342.08, 20.186,
            182, 27.85, 445267.112,
            156, 73.14, 45036.886,
            136, 171.52, 22518.443,
            77, 222.54, 65928.934,
            74, 296.72, 3034.906,
            70, 243.58, 9037.513,
            58, 119.81, 33718.147,
            52, 297.17, 150.678,
            50, 21.02, 2281.226,
            45, 247.54, 29929.562,
            44, 325.15, 31555.956,
            29, 60.93, 4443.417,
            18, 155.12, 67555.328,
            17, 288.79, 4562.452,
            16, 198.04, 62894.029,
            14, 199.76, 31436.921,
            12, 95.39, 14577.848,
            12, 287.11, 31931.756,
            12, 320.81, 34777.259,
            9, 227.73, 1222.114,
            8, 15.45, 16859.074
        ];

        this.JDE0tab1000 = [
            new Array(1721139.29189, 365242.13740, 0.06134, 0.00111, -0.00071),
            new Array(1721233.25401, 365241.72562, -0.05323, 0.00907, 0.00025),
            new Array(1721325.70455, 365242.49558, -0.11677, -0.00297, 0.00074),
            new Array(1721414.39987, 365242.88257, -0.00769, -0.00933, -0.00006)
        ];

        this.JDE0tab2000 = [
            new Array(2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057),
            new Array(2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030),
            new Array(2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078),
            new Array(2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032)
        ];

    }


    /**
     *
     * @param Degrees to radians.
     * @return {number}
     */
    dtr (d) {
        return (d * Math.PI) / 180.0;
    }


    /**
     * @desc Radians to degrees.
     * @param r
     * @return {number}
     */
    rtd (r) {
        return (r * 180.0) / Math.PI;
    }


    /**
     * @desc Range reduce angle in degrees.
     * @param a
     * @return {number}
     */
    fixangle (a) {
        return a - 360.0 * (Math.floor(a / 360.0));
    }


    /**
     * @desc Range reduce angle in radians.
     * @param a
     * @return {number}
     */
    fixangr (a) {
        return a - (2 * Math.PI) * (Math.floor(a / (2 * Math.PI)));
    }


    /**
     * @desc  Sine of an angle in degrees
     * @param d
     * @return {number}
     */
    dsin (d) {
        return Math.sin(this.dtr(d));
    }


    /**
     * @desc Cosine of an angle in degrees
     * @param d
     * @return {number}
     */
    dcos (d) {
        return Math.cos(this.dtr(d));
    }


    /**
     * @desc Modulus function which works for non-integers.
     * @param a
     * @param b
     * @return {number}
     */
    mod (a, b) {
        return a - (b * Math.floor(a / b));
    }

    /**
     *
     * @param j
     * @return {number}
     */
    jwday (j) {
        return this.mod(Math.floor((j + 1.5)), 7);
    }

    /**
     *
     * @param jd
     * @return {number|*}
     */
    obliqeq (jd) {
        var eps, u, v, i;
        v = u = (jd - this.J2000) / (this.JulianCentury * 100);
        eps = 23 + (26 / 60.0) + (21.448 / 3600.0);

        if (Math.abs(u) < 1.0) {
            for (i = 0; i < 10; i++) {
                eps += (this.oterms[i] / 3600.0) * v;
                v *= u;
            }
        }
        return eps;
    }


    /**
     * @desc  Calculate the nutation in longitude, deltaPsi, and
     obliquity, deltaEpsilon for a given Julian date
     jd.  Results are returned as a two element Array
     giving (deltaPsi, deltaEpsilon) in degrees.
     * @param jd
     * @return Object
     */
    nutation (jd) {
        var deltaPsi, deltaEpsilon,
          i, j,
          t = (jd - 2451545.0) / 36525.0, t2, t3, to10,
          ta = [],
          dp = 0, de = 0, ang;

        t3 = t * (t2 = t * t);

        /* Calculate angles.  The correspondence between the elements
         of our array and the terms cited in Meeus are:

         ta[0] = D  ta[0] = M  ta[2] = M'  ta[3] = F  ta[4] = \Omega

         */

        ta[0] = this.dtr(297.850363 + 445267.11148 * t - 0.0019142 * t2 +
          t3 / 189474.0);
        ta[1] = this.dtr(357.52772 + 35999.05034 * t - 0.0001603 * t2 -
          t3 / 300000.0);
        ta[2] = this.dtr(134.96298 + 477198.867398 * t + 0.0086972 * t2 +
          t3 / 56250.0);
        ta[3] = this.dtr(93.27191 + 483202.017538 * t - 0.0036825 * t2 +
          t3 / 327270);
        ta[4] = this.dtr(125.04452 - 1934.136261 * t + 0.0020708 * t2 +
          t3 / 450000.0);

        /* Range reduce the angles in case the sine and cosine functions
         don't do it as accurately or quickly. */

        for (i = 0; i < 5; i++) {
            ta[i] = this.fixangr(ta[i]);
        }

        to10 = t / 10.0;
        for (i = 0; i < 63; i++) {
            ang = 0;
            for (j = 0; j < 5; j++) {
                if (this.nutArgMult[(i * 5) + j] !== 0) {
                    ang += this.nutArgMult[(i * 5) + j] * ta[j];
                }
            }
            dp += (this.nutArgCoeff[(i * 4) + 0] + this.nutArgCoeff[(i * 4) + 1] * to10) * Math.sin(ang);
            de += (this.nutArgCoeff[(i * 4) + 2] + this.nutArgCoeff[(i * 4) + 3] * to10) * Math.cos(ang);
        }

        /* Return the result, converting from ten thousandths of arc
         seconds to radians in the process. */

        deltaPsi = dp / (3600.0 * 10000.0);
        deltaEpsilon = de / (3600.0 * 10000.0);

        return [deltaPsi, deltaEpsilon];
    }


    /**
     * @desc  Determine the difference, in seconds, between
     Dynamical time and Universal time.
     * @param year
     * @return {*}
     */
    deltat (year) {
        var dt, f, i, t;

        if ((year >= 1620) && (year <= 2000)) {
            i = Math.floor((year - 1620) / 2);
            f = ((year - 1620) / 2) - i;
            /* Fractional part of year */
            dt = this.deltaTtab[i] + ((this.deltaTtab[i + 1] - this.deltaTtab[i]) * f);
        } else {
            t = (year - 2000) / 100;
            if (year < 948) {
                dt = 2177 + (497 * t) + (44.1 * t * t);
            } else {
                dt = 102 + (102 * t) + (25.3 * t * t);
                if ((year > 2000) && (year < 2100)) {
                    dt += 0.37 * (year - 2100);
                }
            }
        }
        return dt;
    }


    /**
     *
     * @param year
     * @param which
     * @return {*}
     */
    equinox (year, which) {
        let deltaL, i, j, JDE0, JDE, JDE0tab, S, T, W, Y;
        /*  Initialise terms for mean equinox and solstices.  We
         have two sets: one for years prior to 1000 and a second
         for subsequent years.  */

        if (year < 1000) {
            JDE0tab = this.JDE0tab1000;
            Y = year / 1000;
        } else {
            JDE0tab = this.JDE0tab2000;
            Y = (year - 2000) / 1000;
        }

        JDE0 = JDE0tab[which][0] +
          (JDE0tab[which][1] * Y) +
          (JDE0tab[which][2] * Y * Y) +
          (JDE0tab[which][3] * Y * Y * Y) +
          (JDE0tab[which][4] * Y * Y * Y * Y);
        T = (JDE0 - 2451545.0) / 36525;
        W = (35999.373 * T) - 2.47;
        deltaL = 1 + (0.0334 * this.dcos(W)) + (0.0007 * this.dcos(2 * W));
        S = 0;
        for (i = j = 0; i < 24; i++) {
            S += this.EquinoxpTerms[j] * this.dcos(this.EquinoxpTerms[j + 1] + (this.EquinoxpTerms[j + 2] * T));
            j += 3;
        }
        JDE = JDE0 + ((S * 0.00001) / deltaL);
        return JDE;
    }


    /**
     * @desc  Position of the Sun.  Please see the comments
     on the return statement at the end of this function
     which describe the array it returns.  We return
     intermediate values because they are useful in a
     variety of other contexts.
     * @param jd
     * @return Object
     */
    sunpos (jd) {
        let T, T2, L0, M, e, C, sunLong, sunAnomaly, sunR,
          Omega, Lambda, epsilon, epsilon0, Alpha, Delta,
          AlphaApp, DeltaApp;

        T = (jd - this.J2000) / this.JulianCentury;
        T2 = T * T;
        L0 = 280.46646 + (36000.76983 * T) + (0.0003032 * T2);
        L0 = this.fixangle(L0);
        M = 357.52911 + (35999.05029 * T) + (-0.0001537 * T2);
        M = this.fixangle(M);
        e = 0.016708634 + (-0.000042037 * T) + (-0.0000001267 * T2);
        C = ((1.914602 + (-0.004817 * T) + (-0.000014 * T2)) * this.dsin(M)) +
          ((0.019993 - (0.000101 * T)) * this.dsin(2 * M)) +
          (0.000289 * this.dsin(3 * M));
        sunLong = L0 + C;
        sunAnomaly = M + C;
        sunR = (1.000001018 * (1 - (e * e))) / (1 + (e * this.dcos(sunAnomaly)));
        Omega = 125.04 - (1934.136 * T);
        Lambda = sunLong + (-0.00569) + (-0.00478 * this.dsin(Omega));
        epsilon0 = this.obliqeq(jd);
        epsilon = epsilon0 + (0.00256 * this.dcos(Omega));
        Alpha = this.rtd(Math.atan2(this.dcos(epsilon0) * this.dsin(sunLong), this.dcos(sunLong)));
        Alpha = this.fixangle(Alpha);
        Delta = this.rtd(Math.asin(this.dsin(epsilon0) * this.dsin(sunLong)));
        AlphaApp = this.rtd(Math.atan2(this.dcos(epsilon) * this.dsin(Lambda), this.dcos(Lambda)));
        AlphaApp = this.fixangle(AlphaApp);
        DeltaApp = this.rtd(Math.asin(this.dsin(epsilon) * this.dsin(Lambda)));

        return [                 //  Angular quantities are expressed in decimal degrees
            L0,                           //  [0] Geometric mean longitude of the Sun
            M,                            //  [1] Mean anomaly of the Sun
            e,                            //  [2] Eccentricity of the Earth's orbit
            C,                            //  [3] Sun's equation of the Centre
            sunLong,                      //  [4] Sun's true longitude
            sunAnomaly,                   //  [5] Sun's true anomaly
            sunR,                         //  [6] Sun's radius vector in AU
            Lambda,                       //  [7] Sun's apparent longitude at true equinox of the date
            Alpha,                        //  [8] Sun's true right ascension
            Delta,                        //  [9] Sun's true declination
            AlphaApp,                     // [10] Sun's apparent right ascension
            DeltaApp                      // [11] Sun's apparent declination
        ];
    }

    /**
     * @desc Compute equation of time for a given moment. Returns the equation of time as a fraction of a day.
     * @param jd
     * @return {number|*}
     */
    equationOfTime (jd) {
        let alpha, deltaPsi, E, epsilon, L0, tau;
        tau = (jd - this.J2000) / this.JulianMillennium;
        L0 = 280.4664567 + (360007.6982779 * tau) +
          (0.03032028 * tau * tau) +
          ((tau * tau * tau) / 49931) +
          (-((tau * tau * tau * tau) / 15300)) +
          (-((tau * tau * tau * tau * tau) / 2000000));
        L0 = this.fixangle(L0);
        alpha = this.sunpos(jd)[10];
        deltaPsi = this.nutation(jd)[0];
        epsilon = this.obliqeq(jd) + this.nutation(jd)[1];
        E = L0 + (-0.0057183) + (-alpha) + (deltaPsi * this.dcos(epsilon));
        E = E - 20.0 * (Math.floor(E / 20.0));
        E = E / (24 * 60);
        return E;
    }


}

module.exports = ASTRO;

/***/ }),
/* 20 */
/***/ (function(module, exports) {

/**
 * Constants
 * @module constants
 */

module.exports = {
    durationUnit: {
        year: ['y', 'years', 'year'],
        month: ['M', 'months', 'month'],
        day: ['d', 'days', 'day'],
        hour: ['h', 'hours', 'hour'],
        minute: ['m', 'minutes', 'minute'],
        second: ['s', 'second', 'seconds'],
        millisecond: ['ms', 'milliseconds', 'millisecond'],
        week: ['W', 'w', 'weeks', 'week'],
    }
};


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

let Helpers = __webpack_require__(3);
let normalizeDuration = new Helpers().normalizeDuration;
let absRound = new Helpers().absRound;
let absFloor = new Helpers().absFloor;
/**
 * Duration object constructor
 * @param duration
 * @class Duration
 * @constructor
 */
class Duration {
    constructor(key, value) {
        let duration = {},
            data = this._data = {},
            milliseconds = 0,
            normalizedUnit = normalizeDuration(key, value),
            unit = normalizedUnit.unit;
        duration[unit] = normalizedUnit.value;
        milliseconds = duration.milliseconds || duration.millisecond || duration.ms || 0;

        let years = duration.years || duration.year || duration.y || 0,
            months = duration.months || duration.month || duration.M || 0,
            weeks = duration.weeks || duration.w || duration.week || 0,
            days = duration.days || duration.d || duration.day || 0,
            hours = duration.hours || duration.hour || duration.h || 0,
            minutes = duration.minutes || duration.minute || duration.m || 0,
            seconds = duration.seconds || duration.second || duration.s || 0;
        // representation for dateAddRemove
        this._milliseconds = milliseconds + seconds * (1e3) + minutes * (6e4) + hours * (36e5);
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = days + weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = months + years * 12;
        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;
        seconds += absFloor((milliseconds / 1000));
        data.seconds = seconds % 60;
        minutes += absRound(seconds / 60);
        data.minutes = minutes % 60;
        hours += absRound(minutes / 60);
        data.hours = hours % 24;
        days += absRound(hours / 24);
        days += weeks * 7;
        data.days = days % 30;
        months += absRound(days / 30);
        data.months = months % 12;
        years += absRound(months / 12);
        data.years = years;
        return this;
    }

    valueOf () {
        return this._milliseconds + this._days * (864e5) + this._months * (2592e6);
    }
}

module.exports = Duration;


/***/ }),
/* 22 */
/***/ (function(module, exports) {

/**
 * Constants
 * @module constants
 */

module.exports = {
    gregorian: {
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        weekdaysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    },
    persian: {
        months: ['Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar', 'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'],
        monthsShort: ['Far', 'Ord', 'Kho', 'Tir', 'Mor', 'Sha', 'Meh', 'Aba', 'Aza', 'Dey', 'Bah', 'Esf'],
        weekdays: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        weekdaysShort: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        weekdaysMin: ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'],
        persianDaysName: [
            'Urmazd',
            'Bahman',
            'Ordibehesht',
            'Shahrivar',
            'Sepandarmaz',
            'Khurdad',
            'Amordad',
            'Dey-be-azar',
            'Azar',
            'Aban',
            'Khorshid',
            'Mah',
            'Tir',
            'Gush',
            'Dey-be-mehr',
            'Mehr',
            'Sorush',
            'Rashn',
            'Farvardin',
            'Bahram',
            'Ram',
            'Bad',
            'Dey-be-din',
            'Din',
            'Ord',
            'Ashtad',
            'Asman',
            'Zamyad',
            'Mantre-sepand',
            'Anaram',
            'Ziadi']
    }
};


/***/ }),
/* 23 */
/***/ (function(module, exports) {

/**
 * Constants
 * @module constants
 */

module.exports = {
    gregorian: {
        months: 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
        monthsShort: 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
        weekdays: 'یک\u200cشنبه_دوشنبه_سه\u200cشنبه_چهارشنبه_پنج\u200cشنبه_جمعه_شنبه'.split('_'),
        weekdaysShort: 'یک\u200cشنبه_دوشنبه_سه\u200cشنبه_چهارشنبه_پنج\u200cشنبه_جمعه_شنبه'.split('_'),
        weekdaysMin: 'ی_د_س_چ_پ_ج_ش'.split('_'),
    },
    persian: {
        months: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
        monthsShort: ['فرو', 'ارد', 'خرد', 'تیر', 'مرد', 'شهر', 'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف'],
        weekdays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهار شنبه', 'پنج\u200cشنبه', 'جمعه'],
        weekdaysShort: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
        weekdaysMin: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
        persianDaysName: [
            'اورمزد',
            'بهمن',
            'اوردیبهشت',
            'شهریور',
            'سپندارمذ',
            'خورداد',
            'امرداد',
            'دی به آذز',
            'آذز',
            'آبان',
            'خورشید',
            'ماه',
            'تیر',
            'گوش',
            'دی به مهر',
            'مهر',
            'سروش',
            'رشن',
            'فروردین',
            'بهرام',
            'رام',
            'باد',
            'دی به دین',
            'دین',
            'ارد',
            'اشتاد',
            'آسمان',
            'زامیاد',
            'مانتره سپند',
            'انارام',
            'زیادی']
    }
};


/***/ }),
/* 24 */
/***/ (function(module, exports) {

class Container {
    constructor () {

        this.isInvalidDate = null;

        this.gDate = null;
        /**
         *
         * @type {number}
         */
        this.modifiedjulianday = 0;

        /**
         *
         * @type {number}
         */
        this.julianday = 0;

        /**
         *
         * @type {{day: number}}
         */
        this.gregserial = {
            day: 0
        };

        this.zone = 0;

        /**
         *
         * @type {{year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number, weekday: number, unix: number, leap: number}}
         */
        this.gregorian = {
            year: 0,
            month: 0,
            day: 0,
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
            weekday: 0,
            unix: 0,
            leap: 0
        };

        /**
         *
         * @type {{year: number, month: number, day: number, leap: number, weekday: number}}
         */
        this.juliancalendar = {
            year: 0,
            month: 0,
            day: 0,
            leap: 0,
            weekday: 0,
        };

        /**
         *
         * @type {{year: number, month: number, day: number, leap: number, weekday: number}}
         */
        this.islamic = {
            year: 0,
            month: 0,
            day: 0,
            leap: 0,
            weekday: 0,
        };

        /**
         *
         * @type {{year: number, month: number, day: number, leap: number, weekday: number}}
         */
        this.persianAlgo = this.persian = {
            year: 0,
            month: 0,
            day: 0,
            leap: 0,
            weekday: 0,
        };

        /**
         *
         * @type {{year: number, month: number, day: number, leap: number, weekday: number}}
         */
        this.persianAstro = {
            year: 0,
            month: 0,
            day: 0,
            leap: 0,
            weekday: 0,
        };

        /**
         *
         * @type {{year: number, week: number, day: number}}
         */
        this.isoweek = {
            year: 0,
            week: 0,
            day: 0,
        };

        /**
         *
         * @type {{year: number, day: number}}
         */
        this.isoday = {
            year: 0,
            day: 0
        };
    }


}

module.exports = Container;


/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = {
    /**
     * @param input
     * @returns {boolean}
     */
    isArray (input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    },


    /**
     *
     * @param input
     * @returns {boolean}
     */
    isNumber (input) {
        return typeof input === 'number';
    },


    /**
     *
     * @param input
     * @returns {boolean}
     */
    isDate (input) {
        return input instanceof Date;
    }
};


/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = {
    /**
     * @param input
     * @returns {boolean}
     */
    validateInputArray (input) {
      let out = true;
      // Check month
      if (input[1] < 1 || input[1] > 12) {
        out = false;
      } 
      // Check date
      if (input[2] < 1 || input[1] > 31) {
        out = false;
      } 
      // Check hour 
      if (input[3] < 0 || input[3] > 24) {
        out = false;
      } 
      // Check minute 
      if (input[4] < 0 || input[4] > 60) {
        out = false;
      } 
      // Check second 
      if (input[5] < 0 || input[5] > 60) {
        out = false;
      } 
      return out;
    }

};


/***/ })
/******/ ]);
});