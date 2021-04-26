define(['jquery', 'underscore', 'backbone', 'config', 'global', 'moment-with-locales', 'jdate', 'hotkeys', 'toastr', 'bloodhound', 'typeahead', 'handlebars', 'user.helper'
], function ($, _, Backbone, Config, Global, moment, jDate, Hotkeys, toastr, Bloodhound, Typeahead, Handlebars, UserHelper) {
    var keysMap = Config.shortcuts.schedule;
    var ScheduleHelper = {
        flags: {}
        , counters: {}
        , init: function (reinit, scheduleInstance) {
            if (typeof reinit !== "undefined" && reinit === true) {
                ScheduleHelper.tableHelper();
                ScheduleHelper.suggestion();
            } else {
                ScheduleHelper.hotkeys(scheduleInstance);
                ScheduleHelper.tableHelper();
                ScheduleHelper.suggestion();
                ScheduleHelper.handleEdits();
            }
            ScheduleHelper.setStates();
        }
        , tableHelper: function () {
            $(document).on('click', 'li', function (e) {
                if (!e.shiftKey) {
                    $(this).parents('.table-body').find("li.active").removeClass('active').trigger('deactivated');
                    $(this).addClass('active').trigger('activated');
                }
            });
            // $(document).mouseup(function (e) {
            //     var container = $("#schedule-table .table-body");
            //     if (!container.is(e.target) && !$(e.target).parents('#media-modal').length // if the target of the click isn't the container...
            //         && container.has(e.target).length === 0) // ... nor a descendant of the container
            //     {
            //         container.find("li.active").removeClass('active').trigger('deactivated');
            //     }
            // });
            $(document).on('change', '[type="checkbox"]', function () {
                if ($(this).is(':checked'))
                    $(this).attr('value', 1);
                else
                    $(this).attr('value', 0);
            });
            $(document).on('keyup', "#schedule-table [data-type=duration], #schedule-table [data-type=start]", function (e) {
                var $this = $(this);
                if (!(e.which >= 37 && e.which <= 47) && !(e.which >= 16 && e.which <= 19)) {
//                    console.log('Key', e.which);
                    var $row = $(this).parents("li:first");

//                    var validate = new ScheduleHelper.validate();
//                    validate.time($(this));

                    if (!moment($row.find("[data-type=duration]").val(), 'HH:mm:SS', true).isValid() || !moment($row.find("[data-type=start]").val(), 'HH:mm:SS', true).isValid())
                        $row.addClass("error").attr('title', 'تایم غیرمجاز');
                    else
                        $row.removeClass("error").removeAttr('title');
                    if ($row.hasClass('fixed'))
                        ScheduleHelper.updateTimes($row.prev().prev());
                    else
                        ScheduleHelper.updateTimes($row);

                }
            });
            $(document).on('input', "#schedule-table [data-type=title], #schedule-table [data-type=episode-title]", function (e) {
                var $this = $(this);
                var $row = $(this).parents("li:first");
                if ($this.val() !== "")
                    if ($row.hasClass('gap'))
                        $row.removeClass('gap')
            });
            $(document).on('click', '[data-type="episode-title"]', function (e) {
                var $cell = $(this).parents(".td:first");
                var suggestionCreated = $cell.attr('data-filled');
                var currentTime = (new Date()).getTime();
                var timeDiff = currentTime - suggestionCreated;
                if ($(this).val() === "" && $cell.find('[name=ConductorMediaId]').val() === "" && timeDiff > 1000) {
                    $('input[data-suggestion="true"]').typeahead("destroy");
                    var clone = $cell.find("> div").clone();
                    $cell.empty();
                    clone.appendTo($cell).promise().done(function () {
                        ScheduleHelper.suggestion();
                        $cell.find("input[type=text][id]").focusin();
                        console.warn($cell.find("input[type=text][id]"));
                    });
                }
            });
        }
        , mask: function (type) {
            if (typeof type === "undefined")
                return false;
            switch (type) {
                case 'time':
                    $("input.time").mask('H0:M0:S0', {
                        placeholder: '00:00:00', translation: { 'H': { pattern: /[0-2]/ }, 'M': { pattern: /[0-5]/ }, 'S': { pattern: /[0-5]/ } }
                    });
                    break;
            }
        }
        , hotkeys: function (scheduleInstance) {
            $.hotkeys.options.filterInputAcceptingElements = false;
            $.hotkeys.options.filterTextInputs = false;
//            $(document).on('keydown', null, 'f2', function () {
//                alert('Hi');
//            });
            $(document).on('click', "#schedule-table .table-body li", function (e) {
                if (e.shiftKey) {
                    $(this).toggleClass("selected");
                    document.getSelection().removeAllRanges();
                    e.preventDefault();
                    return false;
                }
            }); //
            $(document).on('click', ".tools [data-task=add]", function (e) {
                var row = $(this).parents("li:first");
                ScheduleHelper.duplicateRow(row);
                e.preventDefault();
            });
            $(document).on('click', ".tools [data-task=delete]", function (e) {
                ScheduleHelper.deleteRow();
                e.preventDefault();
            });

            for (var key of Object.keys(keysMap)) {
                // if (typeof keysMap[key].value === 'object') {
                ScheduleHelper.initShortCutKey(key, scheduleInstance);
                // }
                // if (typeof keysMap[key].value === 'number') {
                //     ScheduleHelper.initFolderSelectionShortCuts(key, scheduleInstance);
                // }
            }
        }
        , checkActiveRowForEdit: function (activeRow) {
            if (typeof activeRow === 'undefined' || !activeRow.length) {
                toastr.warning('هیچ سطری انتخاب نشده است', '', Config.settings.toastr);
                return false;
            }
            if (activeRow.attr('data-readonly') === "true") {
                toastr.error('امکان ویرایش در این وضعیت وجود ندارد', 'خطا', Config.settings.toastr);
                return false;
            }
            return true;
        }
        // , initFolderSelectionShortCuts: function(key, )
        , initShortCutKey: function (type, scheduleInstance) {
            $(document).on('keydown', null, 'f1', function (e) {
                scheduleInstance.showHelp(e);
                e.preventDefault();
            });
            switch (type) {
                case 'down':
                    $(document).on('keydown', null, keysMap[type].key, function (e) {
                        var activeRow = $("#schedule-table .table-body li.active");
                        if (activeRow.length && !(activeRow.find('input[data-type="title"], select').is(":focus") || activeRow.find('input[data-type="episode-title"], select').is(":focus")))
                            if (activeRow.find("+ li").length) {
                                activeRow.removeClass('active').trigger('deactivated').next('li').addClass('active').trigger('activated');
                                if ($(e.target).is("input")) {
                                    var cellIndex = $(e.target).parents(".td:first").index();
                                    activeRow.find("+ li").find(">div").eq(cellIndex).find("input")[0].focus();
                                }
                            }
                    });
                    break;
                case 'up':
                    $(document).on('keydown', null, keysMap[type].key, function (e) {
                        var activeRow = $("#schedule-table .table-body li.active");
                        if (activeRow.length && !(activeRow.find('input[data-type="title"], select').is(":focus") || activeRow.find('input[data-type="episode-title"], select').is(":focus"))) {
                            if (activeRow.prev('li').length) {
                                activeRow.removeClass('active').trigger('deactivated').prev('li').addClass('active').trigger('activated');
                                if ($(e.target).is("input")) {
                                    var cellIndex = $(e.target).parents(".td:first").index();
                                    activeRow.prev('li').find(">div").eq(cellIndex).find("input")[0].focus();
                                }
                            }
                        }
                    });
                    break;
                case 'insert':
                    $(document).on('keydown', null, keysMap[type].key, function (e) {
                        var activeRow = $("#schedule-table .table-body li.active");
                        if (activeRow.attr('data-readonly') === "true")
                            return false;
                        ScheduleHelper.duplicateRow(activeRow);
                        e.preventDefault();
                    });
                    break;
                case 'focus':
                    $(document).on('keydown', null, keysMap[type].key, function (e) {
                        if ($(e.target).is("input, textarea, select"))
                            return;
                        var activeRow = $("#schedule-table .table-body li.active");
                        if (activeRow.length) {
                            activeRow.find("input.time:first").focus();
                        }
                    });
                    break;
                case 'remove':
                    $(document).on('keydown', null, keysMap[type].key, function (e) {
                        if ($("#schedule-table .table-body li.selected").length) {
                            console.log('items to delete: ' + $("#schedule-table .table-body li.selected").length);
                            $("#schedule-table .table-body li.selected").each(function () {
                                ScheduleHelper.deleteRow($(this));
                            });
                        } else
                            ScheduleHelper.deleteRow();
                        e.preventDefault();
                    });
                    break;
                case 'moveDown':
                    $(document).on('keydown', null, keysMap[type].key, function (e) {
                        var activeRow = $("#schedule-table .table-body li.active");
                        if (activeRow.length && !(activeRow.find('input[data-type="title"], select').is(":focus") || activeRow.find('input[data-type="episode-title"], select').is(":focus"))) {
                            var $next = activeRow.find("+ li");
                            if (typeof $next !== 'undefined' && $next && $next.length) {
                                activeRow.insertAfter($next);
                                ScheduleHelper.generateTimeArray();
                                e.preventDefault();
                            }
                        }
                    });
                    break;
                case 'moveUp':
                    $(document).on('keydown', null, keysMap[type].key, function (e) {
                        var activeRow = $("#schedule-table .table-body li.active");
                        if (activeRow.length && !(activeRow.find('input[data-type="title"], select').is(":focus") || activeRow.find('input[data-type="episode-title"], select').is(":focus"))) {
                            var $prev = activeRow.prev('li');
                            if (typeof $prev !== 'undefined' && $prev && $prev.length) {
                                activeRow.insertBefore($prev);
                                ScheduleHelper.generateTimeArray();
                                e.preventDefault();
                            }
                        }
                    });
                    break;
                case 'duplicate':
                    $(document).on('keydown', null, keysMap[type].key, function (e) {
                        var activeRow = $("#schedule-table .table-body li.active");
                        if (activeRow.length && !(activeRow.find('input[data-type="title"], select').is(":focus") || activeRow.find('input[data-type="episode-title"], select').is(":focus"))) {
                            var clonedRow = activeRow.clone(true, true);
                            if (clonedRow.hasClass('active')) {
                                clonedRow.removeClass('active');
                            }
                            clonedRow.insertAfter(activeRow);
                            ScheduleHelper.updateIndexes();
                            ScheduleHelper.generateTimeArray();
                            e.preventDefault();
                        }
                    });
                    break;
                case 'copy':
                    $(document).on('keydown', null, keysMap[type].key, function (e) {
                        var activeRow = $("#schedule-table .table-body li.active");
                        if (activeRow.length && !(activeRow.find('input[data-type="title"], select').is(":focus") || activeRow.find('input[data-type="episode-title"], select').is(":focus"))) {
                            var clonedRow = activeRow.clone(true, true);
                            if (clonedRow.hasClass('active')) {
                                clonedRow.removeClass('active');
                            }
                            window['schedule-clipboard'] = clonedRow;
                            toastr.info('سطر مورد نظر کپی شد', '', Config.settings.toastr);
                            e.preventDefault();
                        }
                    });
                    break;
                case 'paste':
                    $(document).on('keydown', null, keysMap[type].key, function (e) {
                        var activeRow = $("#schedule-table .table-body li.active");
                        if (activeRow.length && !(activeRow.find('input[data-type="title"], select').is(":focus") || activeRow.find('input[data-type="episode-title"], select').is(":focus"))) {
                            var clonedRow = window['schedule-clipboard'].clone(true, true);
                            clonedRow.insertAfter(activeRow);
                            ScheduleHelper.updateIndexes();
                            ScheduleHelper.generateTimeArray();
                            e.preventDefault();
                        }
                    });
                    break;
                case 'showDuplicateForm':
                    $(document).on('keydown', null, keysMap[type].key, function (e) {
                        e.preventDefault();
                        $('[data-task="show-duplicate-form"]')[0].click();
                    });
                    break;
                case 'showExportForm':
                    $(document).on('keydown', null, keysMap[type].key, function (e) {
                        e.preventDefault();
                        $('[data-task="show-export-form"]')[0].click();
                    });
                    break;
                case 'advancedSearchTab1':
                    $(document).on('keydown', null, keysMap[type].key, function (e) {
                        e.preventDefault();
                        var activeRow = $("#schedule-table .table-body li.active");
                        if (ScheduleHelper.checkActiveRowForEdit(activeRow)) {
                            $('#media-modal').modal('show');
                            $('#media-modal').find('[href="#media-search"]').click();
                        }
                    });
                    break;
                case 'advancedSearchTab2':
                    $(document).on('keydown', null, keysMap[type].key, function (e) {
                        e.preventDefault();
                        var activeRow = $("#schedule-table .table-body li.active");
                        if (ScheduleHelper.checkActiveRowForEdit(activeRow)) {
                            $('#media-modal').modal('show');
                            $('#media-modal').find('[href="#broadcast-date"]').click();
                        }
                    });
                    break;
                case 'fix':
                    $(document).on('keydown', null, keysMap[type].key, function (e) {
                        e.preventDefault();
                        var activeRow = $("#schedule-table .table-body li.active");
                        if (ScheduleHelper.checkActiveRowForEdit(activeRow)) {
                            ScheduleHelper.toggleFixedRow(activeRow);
                        }
                    });
                    break;
                case 'custom':
                    var custom = $.extend([], keysMap[type]);
                    if (custom.length) {
                        $.each(custom, function () {
                            const item = $.extend({}, this);
                            $(document).on('keydown', null, item.key, function (e) {
                                e.preventDefault();
                                if (typeof item.value === 'object') {
                                    var activeRow = $("#schedule-table .table-body li.active");
                                    if (ScheduleHelper.checkActiveRowForEdit(activeRow)) {
                                        var postfix = '';
                                        if (typeof item.value.counter$ !== 'undefined' && item.value.counter$ > 0) {
                                            if (typeof ScheduleHelper.counters[item.key] === 'undefined') {
                                                ScheduleHelper.counters[item.key] = 1;
                                            } else {
                                                if (ScheduleHelper.counters[item.key] < item.value.counter$) {
                                                    ScheduleHelper.counters[item.key]++;
                                                }
                                            }
                                            postfix = ' - ' + ScheduleHelper.counters[item.key];
                                        }
                                        var cloneItem = $.extend({}, item.value, { 'episode-title': item.value['episode-title'] + postfix });
                                        console.log(cloneItem);
                                        ScheduleHelper.duplicateRow(activeRow, false, cloneItem);
                                    }
                                }
                                if (typeof item.value === 'number') {
                                    var activeRow = $("#schedule-table .table-body li.active");
                                    if (ScheduleHelper.checkActiveRowForEdit(activeRow)) {
                                        $('#media-modal').modal('show');
                                        $('#media-modal').find('[href="#media-search"]').click();
                                        $('[data-type="change-mode"]').val('tree').change();
                                        setTimeout(function () {
                                            $('#tree').find('#' + item.value + '_anchor').click();
                                        });
                                    }
                                }
                            });
                        });
                    }
                    break;
            }
        }
        , toggleFixedRow: function ($row) {
            if ($row.hasClass('fixed')) {
                $row.find('[name="CondcutorIsFixed"]').prop('checked', false);
                $row.removeClass('fixed');
            } else {
                $row.find('[name="CondcutorIsFixed"]').prop('checked', true);
                $row.addClass('fixed');
            }
        }
        , deleteRow: function ($row, skipUpdate) {
            var $rows = $("#schedule-table .table-body li");
            if (typeof $row === "undefined")
                if ($rows.length < 2)
                    return false;
            var $row = (typeof $row !== "undefined") ? $row : $("#schedule-table .table-body li.active");
            var $next = $row.next();
            var $prev = $row.prev();
            $row.remove().promise().done(function () {
                $rows.parent().find("li.active").length && $rows.removeClass("active");
                $next.addClass('active');
            });
//            $row.remove().promise().done(function () {
            if ($next.length && $next.hasClass('fixed'))
                ScheduleHelper.insertGap($next.prev());
//                ScheduleHelper.updateTimes($prev);

            ScheduleHelper.updateIndexes();
//            });
            if (typeof skipUpdate !== "undefined" && skipUpdate === true)
                return true;
            ScheduleHelper.updateTimes($prev);
        }
        , insertGap: function ($next) {
            var $gap = ScheduleHelper.duplicateRow($next, true);
        }
        , duplicateRow: function (row, isGap, data) {
            var isGap = (typeof isGap !== "undefined" && isGap === true);
            var rows = $("#schedule-table .table-body li");
            if (rows.length > 1) {
                if (row.find("[data-type=duration]").val() === "" || Global.processTime(row.find("[data-type=duration]").val()) === 0) {
                    row.addClass("error").attr('title', 'مدت برنامه اشتباه است.');
                    return;
                }
            }
            ScheduleHelper.suggestion(row.find('input[data-suggestion="true"]'), true);
            var clone = row.clone();
            clone.addClass('error new').removeClass('gap fixed overlap').attr('title', 'اطلاعات سطر وارد نشده است.');
            clone.find('[id]').removeAttr('id');
            clone.find('img').attr('src', Config.placeholderImage);
            clone.find('textarea').val('');
            clone.find('input[type="hidden"]').val('');
            clone.find('input[type="text"]').val('');
            clone.find('input[data-suggestion="true"]').parent().find("label").text('');
            clone.find('input[type="checkbox"]').val(0).removeAttr('checked');
            clone.find('.item-link, .remove-meta').remove();
            if (typeof data !== 'undefined' && data) {
                for (var key of Object.keys(data)) {
                    clone.find('[data-type="' + key + '"]').val(data[key]);
                }
            }
            if (isGap) {
                clone.addClass('gap');
                var prevEnd = Global.processTime(row.find("[data-type=start]").val()) + Global.processTime(row.find("[data-type=duration]").val());
                var nextStart = Global.processTime(row.next().find("[data-type=start]").val());
                var duration = Global.createTime(nextStart - prevEnd);
                clone.find('[data-type="duration"]').val(duration);
                // Set gap duration
            }
            clone.insertAfter(row);
            ScheduleHelper.updateTimes(row);
            ScheduleHelper.updateIndexes();
            row.next().find("input:first").trigger('click');
            ScheduleHelper.mask("time");
            ScheduleHelper.suggestion(row.find('input[data-suggestion="true"]'));
            ScheduleHelper.suggestion(row.next().find('input[data-suggestion="true"]'));
            return row.next();
        }
        , checkTable: function () {
            // Check table for errors
            var $rows = $("#schedule-table .table-body li");
            $rows.each(function () {
                var $this = $(this);
                // Mark all gaps
                if ($this.find("[data-type=title][id]").val() === "" && $this.find("[data-type=episode-title][id]").val() === "" && $this.find("[data-type=episode-number]").val() === "0")
                    $this.addClass('gap');
            });
        }
        , updateTimes: function ($row) {
            console.log('------------------- PROCESSING TIMES -------------------');
            console.time('processing-time-finished');
            // Updated times from current row to the last row
            // If a fixed item is found, return
            var $rows = $row.nextAll().addBack();
            var stack = 0;
            var fixedTime = 0;
            var error = false;
//            if ($rows.length <= 2)
//                return;
            // Look table for any overlaps or gaps [error]
            console.time('looping-through-items');
            $rows.each(function (i) {
                var $this = $(this);
                // Found a gap => mark it as gap!
                if ($this.find('[data-type="title"]').val() === "" && $this.find('[name=ConductorMetaCategoryId]').val() === ""
                    && $this.find('[data-type="episode-title"]').val() === "" && $this.find('[name=ConductorMediaId]').val() === ""
                    && +$this.find('[data-type="episode-number"]').val() <= 0 && $this.next().length) {
                    $this.addClass('gap');
                }
                if (i === 0) // First items: use start value as stack
                    stack = Global.processTime($this.find("[data-type=start]").val());
                if (!$this.hasClass('fixed')) // Not a fixed item: collect duration in stack
                    stack += Global.processTime($this.find("[data-type=duration]").val());
                // Next is fixed
                if ($this.next().length && $this.next().is('.fixed')) {
                    var $fixed = $this.next();
                    fixedTime = Global.processTime($fixed.find("[data-type=start]").val());
                    if (fixedTime < stack) { // Overlap
                        var overlapTime = fixedTime - stack;
                        if ($this.is(".gap")) { // There's a gap right before fixed
                            var gapSpace = $this.find("[data-type=duration]").val();
                            if (gapSpace <= overlapTime) {
                                if (gapSpace < overlapTime)
                                    $this.find("[data-type=duration]").val(Global.createTime(gapSpace - overlapTime));
                                if (gapSpace === overlapTime)
                                    ScheduleHelper.deleteRow($this);
                            } else {
                                ScheduleHelper.deleteRow($this);
                                error = 'overlap';
                            }
                        } else {
                            error = 'overlap';
                        }
                    }
                    if (fixedTime > stack) { // Need to create a gap
                        ScheduleHelper.duplicateRow($this, true);
                    }
                }
            });
            console.timeEnd('looping-through-items');
            if (error) {
                $row.addClass('error').addClass(error).attr('title', 'تایم برنامه‌ها همپوشانی دارد.');
                return false;
            } else {
                if ($rows.length < 2) {
                    var rowStart = Global.createTime(Global.processTime($row.prev().find("[data-type=start]").val()) + Global.processTime($row.prev().find("[data-type=duration]").val()));
                    $row.find("[data-type=start]").val(rowStart);
                }
                console.time('looping-through-items-again');
                $rows.each(function () {
                    var $this = $(this);

                    var nextStart = Global.processTime($this.find("[data-type=start]").val()) + Global.processTime($this.find("[data-type=duration]").val());
                    if (!(/^\d+$/.test(nextStart)))
                        $this.addClass("error").attr('title', 'مقدار شروع اشتباه است.');
                    else
                        $this.removeClass("error").removeAttr('title');
                    // Prevent items from starting tomorrow
                    if ($this.prev().length && ScheduleHelper.getTimeInSeconds($this.find("[data-type=start]").val()) < ScheduleHelper.getTimeInSeconds($this.prev().find("[data-type=start]").val())) {
                        $this.addClass('error').attr('title', 'تایم شروع از امروز خارج شده است.');
                    }

                    if ($this.next().length) {
                        if ($this.next().hasClass('fixed')) {
                            return true;
                        }
                        $this.next().find("[data-type=start]").val(Global.createTime(nextStart));
                    }
                });
                console.timeEnd('looping-through-items-again');
            }
            console.time('process-gaps');
            ScheduleHelper.processGaps();
            console.timeEnd('process-gaps');
            console.time('set-footer-stats');
            ScheduleHelper.setStates();
            console.timeEnd('set-footer-stats');
            console.timeEnd('processing-time-finished');
        }
        , getTimeInSeconds: function (value) {
            if (typeof value !== "undefined" && value.indexOf(':') !== "undefined")
                return (+value.split(":")[0] * 3600) + (+value.split(":")[1] * 60) + +value.split(":")[2];
            return 0;
        }
        , checkForOverlaps: function () {
            var $rows = $("#schedule-table .table-body").find("li");
            $rows.each(function () {
                var $this = $(this);
                var nextStart = Global.processTime($this.find("[data-type=start]").val()) + Global.processTime($this.find("[data-type=duration]").val());
                if ($this.next().length) {
                    if (Global.processTime($this.next().find("[data-type=start]").val()) < nextStart)
                        !$this.hasClass('fixed') && $this.addClass('error overlap').attr('title', 'سطر همپوشانی پیدا کرده است.');
                    if (Global.processTime($this.next().find("[data-type=start]").val()) > nextStart)
                        ScheduleHelper.duplicateRow($this, true);
                }
            });
        }
        , handleOverlap: function ($row, diff) {
            var diff = diff;
            var $items = $row.nextAll().addBack();
            console.log('processing overlap: ' + diff);
            $items.each(function () {
                var $this = $(this);
                var $next = $this.next();
                if ($next.is('.fixed'))
                    return false;
                if ($next.is('.gap')) {
                    var availableSpace = Global.processTime($next.find("[data-type=duration]").val());
                    if (availableSpace > diff) { // Gap is larger than diff
                        $next.find('[data-type=duration]').val(Global.createTime(availableSpace - diff));
                        diff = 0;
//                        return false;
                    } else { // Gap is smaller than diff, remove it and continue loop to next gap
                        diff = availableSpace - diff;
                        if (ScheduleHelper.deleteRow($next, true)) {
                            ScheduleHelper.handleOverlap($row, diff);
                        }
                    }
                }
                if (diff === 0) {
                    ScheduleHelper.updateTimes($row);
                    return false;
                }
            });
            if (diff > 0)
                return false; // Overlap still remains: Show error
            return true; // Fixed overlap by decreasing gaps: remove error
        }
        , processGaps: function () {
            var $rows = $("#schedule-table .table-body li");
            $rows.each(function () {
                var $this = $(this);
                if ($this.hasClass("gap") && !$this.hasClass('new')) {
                    if (Global.processTime($this.find("[data-type=duration]").val()) < 1) {
                        $this.remove().promise().done(function () {
                            ScheduleHelper.updateIndexes();
                        });
                    }
                    if ($this.next().hasClass('gap'))
                        ScheduleHelper.mergeRows($this, $this.next());
                }
            });
        }
        , updateIndexes: function () {
            // Update table row indexes
            var $rows = $("#schedule-table .table-body li");
            var i = 1;
            $rows.each(function () {
//                if (!$(this).hasClass('gap')) {
                $(this).find(".idx").text(i);
                i++;
//                } else
//                    $(this).find(".idx").text('خ');
            });
            $rows = {};
        }
        , mergeRows: function ($row1, $row2) {
            var extraDuration = Global.processTime($row2.next().find("[data-type=start]").val()) - Global.processTime($row1.find("[data-type=start]").val());
            $row1.find("[data-type=duration]").val(Global.createTime(extraDuration));
            $row2.remove();
        }
        , suggestion: function ($obj, destroy) {
            var destroy = (typeof destroy !== "undefined") ? destroy : false;
            if (destroy && typeof $obj !== "undefined") {
                console.log('destroy typeahead')
                $obj.typeahead('destroy');
//                $obj.unbind(); //and then you can dynamically unbind this plugin
                return false;
            }
            var $obj = (typeof $obj !== "undefined") ? $obj : $('input[data-suggestion="true"]');
            // Instantiate the Bloodhound suggestion engine
            var suggestionsAdapter = new Bloodhound({
                datumTokenizer: function (datum) {
                    return Bloodhound.tokenizers.whitespace(datum.value);
                }
                , queryTokenizer: Bloodhound.tokenizers.whitespace
                , remote: {
                    wildcard: '%QUERY'
                    , cache: true
//                    , ttl: 1
                    , url: CONFIG.api.url + CONFIG.api.schedule + '/suggestion?q=%QUERY&type=%TYPE&category='
                    , prepare: function (query, settings) {
                        var $currentInput = $('[data-suggestion]:focus');
                        settings.url = settings.url.replace('%QUERY', query).replace('%TYPE', $currentInput.attr("data-suggestion-type"));
                        if ($currentInput.attr("data-suggestion-type") !== "cat" && parseInt($currentInput.parents("li:first").find("[name=ConductorMetaCategoryId]").val()) > 0)
                            settings.url += parseInt($currentInput.parents("li:first").find("[name=ConductorMetaCategoryId]").val());
                        settings.url += '&_t=' + (new Date()).getTime();
                        settings.headers = { "Authorization": UserHelper.getToken() };
                        return settings;
                    }
                    , transform: function (response) {
                        // Map the remote source JSON array to a JavaScript object array
                        return $.map(response, function (item) {
                            return {
                                value: item.text
                                , data: item
                            };
                        });
                    }
                }
            });
            $obj.typeahead({
                minLength: 0
                , highlight: true
                , hint: true
                , name: 'input_' + (new Date()).getTime()
            }, {
                display: 'value'
                , items: 100
                , limit: 10000
                , source: suggestionsAdapter
                , templates: {
                    suggestion: Handlebars.compile('<div><span class="fa suggestion-{{data.kind}}"></span> {{data.text}}{{#if data.episode}} ({{data.episode}}){{/if}}</div>')
                }
            });
            $('input[data-suggestion="true"]').bind('typeahead:render', function (e) {
                $(this).parents(".td").attr('data-filled', (new Date()).getTime());
            });
            $('input[data-suggestion="true"]').bind('typeahead:select', function (e, suggestion) {
                var data = suggestion.data;
                var $target = $(e.target);
                var $parent = $target.parents(".form-group:first");
                var $row = $target.parents("li:first");
                $row.hasClass('gap') && $row.removeClass('gap'); // Remove gap class if item has one
                switch ($target.attr('data-suggestion-type')) {
                    case 'cat':
                        if (parseInt(data.kind) !== 3) {
                            $parent.find("label").text(data.text);
                            $parent.find('[name="ConductorCategoryTitle"]').val(data.text);
                            if (!$parent.find(".remove-meta").length)
                                $parent.find('[name="ConductorMetaCategoryId"]').val(data.externalId).after('<a href="#" class="remove-meta">&times;</a>');
                            $row.find('[name="ConductorMediaId"]').parent().find(".remove-meta").trigger('click');
                        } else {
                            $parent.find("label").text('');
                            $parent.find(".remove-meta").remove();
                            $parent.find('[name="ConductorCategoryTitle"]').val(data.text);
                            $parent.find('[name="ConductorMetaCategoryId"]').val('');
                        }
                        break;
                    case 'media':
                        if (parseInt(data.kind) !== 3) {
                            $parent.find("label").html(data.text + ' (' + data.episode + ')');
                            $row.find("img").attr('src', data.thumbnail);
                            $parent.find('[name="ConductorTitle"]').val(data.text);
                            if (!$parent.find(".remove-meta").length)
                                $parent.find('[name="ConductorMediaId"]').val(data.externalId).after('<a href="#" class="remove-meta">&times;</a>');
                            if ($row.find(".item-link").length)
                                $row.find(".item-link").remove();
                            $row.find('.idx').after('<a class="item-link" href="/resources/mediaitem/' + data.externalId + '" target="_blank"><i class="fa fa-info-circle"></i></a>');
                            $row.find('[name="ConductorDuration"]').val(Global.createTime(data.duration));
                            $row.find('[name="ConductorEpisodeNumber"]').val(data.episode);
//                            if (!$row.find('[name="ConductorMetaCategoryId"]').val()) {
                            $row.find('[name="ConductorCategoryTitle"]').val(data.metaCategoryTitle);
                            $row.find('[name="ConductorMetaCategoryId"]').parent().find(".remove-meta").remove();
                            if (!$row.find('[name="ConductorMetaCategoryId"]').parents(".td:first").find(".remove-meta").length)
                                $row.find('[name="ConductorMetaCategoryId"]').val(data.metaCategoryId).after('<a href="#" class="remove-meta">&times;</a>');
                            $row.find('[name="ConductorMetaCategoryId"]').parent().find("label").text(data.metaCategoryTitle);
//                            }
                        } else {
                            $parent.find("label").html('');
                            $parent.find(".remove-meta, .item-link").remove();
                            $row.find("img").attr('src', data.thumbnail);
                            $parent.find('[name="ConductorTitle"]').val(data.text);
                            $parent.find('[name="ConductorMediaId"]').val('');
                        }
                        $row.find("input[data-type=duration]").trigger('keyup');
                        break;
                }
            });
        }
        , validate: function () {
            this.time = function ($element) {
//                if (!/^([0-1][0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/.test($element.val()))
                if (!moment($element.val(), 'HH:mm:SS', true).isValid())
                    $element.parent().addClass("has-error").attr('title', 'زمان برنامه اشتباه است.');
                else
                    $element.parent().removeClass("has-error").removeAttr('title');
            };
            this.beforeSave = function () {
                if ($("#schedule-table .table-body li.error").length) {
                    var idx = $("#schedule-table .table-body li.error:first .idx").text();
                    var msg = 'Please fix the error in row [' + idx + ']';
                    toastr.error(msg, 'خطا', Config.settings.toastr);
                    return false;
                }
                return true;
            };
        }
        , setStates: function () {
            var getRowsCount = function () {
                return function () {
                    if ($("#schedule-table .table-body li").length)
                        return $("#schedule-table .table-body li").length;
                    return 0;
                };
            };
            var getTotalTime = function () {
                return function () {
                    var $rows = $("#schedule-table .table-body li");
                    if ($rows.length > 1) {
                        var duration = 0;
                        $.each($rows, function () {
                            duration += Global.processTime($(this).find("[data-type=duration]").val());
                        });
                        return Global.createTime2(duration);
                    }
                    if ($rows.length === 1) {
                        return $rows.find("[data-type=duration]").val();
                    }
                    return '00:00:00';
                };
            };
            ScheduleHelper.handleStatusbar([
                { "type": "count", "value": getRowsCount() }
                , { "type": "duration", "value": getTotalTime() }
            ]);
        }
        , handleStatusbar: function (items) {
            if (typeof items !== "undefined") {
                for (var i in items) {
                    $(Config.positions.status).find('.total-' + items[i].type).find("span").text(items[i].value);
                }
            }
        }
        , handleEdits: function () {
            var $this = this;
            $(document).one('input', "#schedule-table .table-body", function (e) {
//                ScheduleHelper.generateTimeArray();
                var $target = $(e.target).closest("li");
                if (!$target.hasClass("new"))
                    $target.addClass('edited');
                // Handle unloads
                if (typeof $this.flags.updatedContent === "undefined" || $this.flags.updatedContent !== true) {
                    var myEvent = window.attachEvent || window.addEventListener;
                    var chkevent = window.attachEvent ? 'onbeforeunload' : 'beforeunload'; /// make IE7, IE8 compitable
                    myEvent(chkevent, function (e) { // For >=IE7, Chrome, Firefox
                        var confirmationMessage = 'Are you sure to leave the page?'; // a space
                        (e || window.event).returnValue = confirmationMessage;
                        return confirmationMessage;
                    });
                }

                $this.flags.updatedContent = true;
            });
        }
        , fillDuplicateSelects: function (items, source) {
            var source = typeof source !== "undefined" && source === true;
            var starts = [];
            $.each(items, function () {
                starts.push({
                    time: this.CondcutorStartTime.split('T')[1]
                    , title: (this.ConductorCategoryTitle ? this.ConductorCategoryTitle + ' » ' : '') + (this.ConductorTitle ? this.ConductorTitle : '')
                });
            });
            var last = {
                time: Global.createTime(Global.processTime(items[items.length - 1].CondcutorStartTime.split('T')[1]) + Global.processTime(items[items.length - 1].CondcutorStartTime.split('T')[1]))
                , title: ''
            };
            var ends = $.extend([], starts);
            ends.push(last);
            ends.shift();

            if (source) { // Filling source fields, not destinations
                $(".source[name=starttime], .source[name=endtime]").empty();
                for (var i = 0; i < starts.length; i++)
                    $(".source[name=starttime]").append('<option value="' + starts[i].time + '">[' + starts[i].time + '] ' + starts[i].title + '</option>');
                for (var i = 0; i < ends.length; i++)
                    $(".source[name=endtime]").append('<option value="' + ends[i].time + '">[' + ends[i].time + '] ' + ends[i].title + '</option>');
                $(".source[name=endtime]").find("option:last").attr('selected', 'selected');
            } else {
                $(".destination[name=starttime]").empty();
                for (var i = 0; i < starts.length; i++)
                    $(".destination[name=starttime]").append('<option value="' + starts[i].time + '">[' + starts[i].time + '] ' + starts[i].title + '</option>');
            }
        }
        , generateTimeArray: function (callback) {
            Config.env === "dev" && console.warn('Generating Time Arrays');
            /*
             * Method to generate two arrays containing all start times and all end times
             */
            var $startSelect = $("select[data-type=itemlist][name=startdate], .source[name=starttime]");
            var $endSelect = $("select[data-type=itemlist][name=enddate], .source[name=endtime], .destination[name=starttime]");
            var $rows = $("#schedule-table .table-body li");
            var starts = [];
            $.each($rows, function () {
                starts.push({
                    time: $(this).find('[data-type="start"]').val()
                    , title: $(this).find('[name="ConductorCategoryTitle"]').val() + ' » ' + $(this).find('[name="ConductorTitle"]').val()
                });
            });
            var last = {
                time: Global.createTime(Global.processTime($rows.last().find('[data-type="start"]').val()) + Global.processTime($rows.last().find('[data-type="duration"]').val()))
                , title: ''
            };
            var ends = $.extend([], starts);
            ends.push(last);
            if (typeof callback === "object")
                callback.timeArrays = { starts: starts, ends: ends };
            if ($startSelect.length) {
//                if (!$startSelect.hasClass('destination')) {
                $startSelect.empty();
                for (var i = 0; i < starts.length; i++)
                    $startSelect.append('<option value="' + starts[i].time + '">[' + starts[i].time + '] ' + starts[i].title + '</option>');
//                }
            }
            if ($endSelect.length) {
                $endSelect.each(function () {
                    var $this = $(this);
                    if ($this.hasClass('destination') && $this.html() !== "")
                        return true;
//                        ends.shift();
                    $this.empty();
                    for (var i = 0; i < ends.length; i++)
                        $this.append('<option value="' + ends[i].time + '">[' + ends[i].time + '] ' + ends[i].title + '</option>');
                    if (typeof $this.attr('data-selected') !== "undefined")
                        $this.find("option:last").attr('selected', 'selected');
                    if (!$this.hasClass('destination'))
                        $this.find("option:first").remove();
                });
            }
        }
        , resetCounters: function () {
            ScheduleHelper.counters = {};
        }
    };
    return ScheduleHelper;
});
