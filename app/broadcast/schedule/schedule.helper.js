define(['jquery', 'underscore', 'backbone', 'config', 'global', 'moment-with-locales', 'jdate', 'mousetrap', 'hotkeys', 'toastr', 'bloodhound', 'typeahead', 'handlebars', 'user.helper'
], function ($, _, Backbone, Config, Global, moment, jDate, Mousetrap, Hotkeys, toastr, Bloodhound, Typeahead, Handlebars, UserHelper) {
    window.ScheduleHelper = {
        flags: {}
        , init: function (reinit) {
            if (typeof reinit !== "undefined" && reinit === true) {
                ScheduleHelper.tableHelper();
                ScheduleHelper.suggestion();
            } else {
                ScheduleHelper.hotkeys();
                ScheduleHelper.tableHelper();
                ScheduleHelper.suggestion();
                ScheduleHelper.handleEdits();
            }
            ScheduleHelper.setStates();
        }
        , tableHelper: function () {
            $(document).on('click', 'tbody > tr:not(.preview-pane)', function (e) {
                if (!e.shiftKey) {
                    $(this).parents('tbody').find("tr.active").removeClass('active').trigger('deactivated');
                    $(this).addClass('active').trigger('activated');
                }
            });
            $(document).mouseup(function (e) {
                var container = $("#schedule-page tbody");
                if (!container.is(e.target) // if the target of the click isn't the container...
                        && container.has(e.target).length === 0) // ... nor a descendant of the container
                {
                    container.find("tr.active").removeClass('active').trigger('deactivated');
                }
            });
            $(document).on('change', '[type="checkbox"]', function () {
                if ($(this).is(':checked'))
                    $(this).attr('value', 1);
                else
                    $(this).attr('value', 0);
            });
            $(document).on('keyup', "#schedule-page [data-type=duration], #schedule-page [data-type=start]", function (e) {
                var $this = $(this);
                if (!(e.which >= 37 && e.which <= 47) && !(e.which >= 16 && e.which <= 19)) {
//                    console.log('Key', e.which);
                    var $row = $(this).parents("tr:first");

//                    var validate = new ScheduleHelper.validate();
//                    validate.time($(this));

                    if (!moment($row.find("[data-type=duration]").val(), 'HH:mm:SS', true).isValid() || !moment($row.find("[data-type=start]").val(), 'HH:mm:SS', true).isValid())
                        $row.addClass("error");
                    else
                        $row.removeClass("error");

                    ScheduleHelper.updateTimes($row);

                }
            });
            $(document).on('input', "#schedule-page [data-type=title], #schedule-page [data-type=episode-title]", function (e) {
                var $this = $(this);
                var $row = $(this).parents("tr:first");
                if ($this.val() !== "")
                    if ($row.hasClass('gap'))
                        $row.removeClass('gap')
            });
//            $(document).on('activated', '#schedule-page tbody tr', function() {
//                console.log($(this).find("[data-suggestion=true]").data());
//                ScheduleHelper.suggestion($(this).find("[data-suggestion=true]"));
//            });
//            $(document).on('deactivated', '#schedule-page tbody tr', function() {
//                console.log('tr deactivated!');
//                ScheduleHelper.suggestion($(this), true);
//            });
            $(document).on('click', '[data-type="episode-title"]', function (e) {
                var $cell = $(this).parents("td:first");
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
                        placeholder: '00:00:00', translation: {'H': {pattern: /[0-2]/}, 'M': {pattern: /[0-5]/}, 'S': {pattern: /[0-5]/}}
                    });
                    break;
            }
        }
        , hotkeys: function () {
            $.hotkeys.options.filterInputAcceptingElements = false;
            $.hotkeys.options.filterTextInputs = false;
            $(document).on('keydown', null, 'f2', function () {
                alert('Hi');
            });
            $(document).on('click', "#schedule-page tbody tr", function (e) {
                if (e.shiftKey) {
                    $(this).toggleClass("selected");
                    e.preventDefault();
                    return false;
                }
            }); //
            $(document).on('keydown', null, 'down', function (e) {
                var activeRow = $("#schedule-page tbody").find("tr.active");
                if (activeRow.length && !(activeRow.find('input[data-type="title"], select').is(":focus") || activeRow.find('input[data-type="episode-title"], select').is(":focus")))
                    if (activeRow.find("+ tr").length) {
                        activeRow.removeClass('active').trigger('deactivated').next('tr').addClass('active').trigger('activated');
                        if ($(e.target).is("input")) {
                            var cellIndex = $(e.target).parents("td:first").index();
                            activeRow.find("+ tr").find("td").eq(cellIndex).find("input")[0].focus();
                        }
                    }
            });
            $(document).on('keydown', null, 'up', function (e) {
                var activeRow = $("#schedule-page tbody").find("tr.active");
                if (activeRow.length && !(activeRow.find('input[data-type="title"], select').is(":focus") || activeRow.find('input[data-type="episode-title"], select').is(":focus"))) {
                    if (activeRow.prev('tr').length) {
                        activeRow.removeClass('active').trigger('deactivated').prev('tr').addClass('active').trigger('activated');
                        if ($(e.target).is("input")) {
                            var cellIndex = $(e.target).parents("td:first").index();
                            activeRow.prev('tr').find("td").eq(cellIndex).find("input")[0].focus();
                        }
                    }
                }
            });
            $(document).on('keydown', null, 'insert', function (e) {
                var activeRow = $("#schedule-page tbody").find("tr.active");
                if (activeRow.attr('data-readonly') === "true")
                    return false;
                ScheduleHelper.duplicateRow(activeRow);
                e.preventDefault();
            });
            $(document).on('keydown', null, 'space', function (e) {
                if ($(e.target).is("input, textarea, select"))
                    return;
                var activeRow = $("#schedule-page tbody").find("tr.active");
                if (activeRow.length) {
                    activeRow.find("input.time:first").focus();
                }
            });
            $(document).on('click', ".tools [data-task=add]", function (e) {
                var row = $("#schedule-page tbody").find("tr.active");
                ScheduleHelper.duplicateRow(row);
                e.preventDefault();
            });
            $(document).on('keydown', null, 'shift+del', function (e) {
                ScheduleHelper.deleteRow();
                e.preventDefault();
            });
            $(document).on('click', ".tools [data-task=delete]", function (e) {
                ScheduleHelper.deleteRow();
                e.preventDefault();
            });
        }
        , deleteRow: function ($row, skipUpdate) {
            if (typeof $row === "undefined") {
                var $rows = $("#schedule-page tbody").find("tr");
                if ($rows.length < 2)
                    return false;
            }
            var $row = (typeof $row !== "undefined") ? $row : $("#schedule-page tbody").find("tr.active");
            var $next = $row.next();
            var $prev = $row.prev();
            $row.remove();
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
        , duplicateRow: function (row, isGap) {
            var isGap = (typeof isGap !== "undefined" && isGap === true) ? true : false;
            var rows = $("#schedule-page tbody").find("tr");
            if (rows.length > 1) {
                if (row.find("[data-type=duration]").val() === "" || Global.processTime(row.find("[data-type=duration]").val()) === 0) {
                    row.addClass("error");
                    return;
                }
            }
            $('input[data-suggestion="true"]').typeahead("destroy");
            var clone = row.clone();
            clone.addClass('error new').removeClass('gap fixed overlap');
            clone.find('[id]').removeAttr('id');
            clone.find('img').attr('src', Config.placeholderImage);
            clone.find('textarea').val('');
            clone.find('input[type="hidden"]').val('');
            clone.find('input[type="text"]').val('');
            clone.find('input[data-suggestion="true"]').parent().find("label").text('');
            clone.find('input[type="checkbox"]').val(0).removeAttr('checked');
            clone.find('.item-link, .remove-meta').remove();
            if (isGap) {
                clone.addClass('gap');
                var prevEnd = Global.processTime(row.find("[data-type=start]").val()) + Global.processTime(row.find("[data-type=duration]").val());
                var nextStart = Global.processTime(row.next().find("[data-type=start]").val());
                var duration = Global.createTime(nextStart - prevEnd);
                clone.find('[data-type="duration"]').val(duration);
                // Set gap duration
            }
            clone.insertAfter(row);
//            ScheduleHelper.rebuildTable();
            ScheduleHelper.updateTimes(row);
            ScheduleHelper.updateIndexes();
            row.next().find("input:first").trigger('click');
            ScheduleHelper.mask("time");
            ScheduleHelper.suggestion();
            return row.next();
        }
        , checkTable: function () {
            // Check table for errors
            var $rows = $("#schedule-page tbody tr");
            $rows.each(function () {
                var $this = $(this);
                // Mark all gaps
                if ($this.find("[data-type=title][id]").val() === "" && $this.find("[data-type=episode-title][id]").val() === "" && $this.find("[data-type=episode-number]").val() === "0")
                    $this.addClass('gap');
            });
        }
        , updateTimes: function ($row) {
            // Updated times from current row to the last row
            // If a fixed item is found, return
            var $rows = $row.nextAll().addBack();
            var stack = 0;
            var fixedTime = 0;
            var error = false;
            if ($rows.length < 2)
                return
            // Look table for any overlaps or gaps [error]
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
            if (error) {
                $row.addClass('error').addClass(error);
                return false;
            } else {
                if ($rows.length < 2) {
                    var rowStart = Global.createTime(Global.processTime($row.prev().find("[data-type=start]").val()) + Global.processTime($row.prev().find("[data-type=duration]").val()));
                    $row.find("[data-type=start]").val(rowStart);
                }
                $rows.each(function () {
                    var $this = $(this);

                    // TODO: Time is not correct (maybe tomorrow?)
                    if ($this.prev().length && Global.processTime($this.find("[data-type=start]").val()) < Global.processTime($this.prev().find("[data-type=start]").val()))
                        $this.addClass('error');

                    var nextStart = Global.processTime($this.find("[data-type=start]").val()) + Global.processTime($this.find("[data-type=duration]").val());
                    if (!(/^\d+$/.test(nextStart)))
                        $this.addClass("error");
                    else
                        $this.removeClass("error");
                    if ($this.next().length) {
                        if ($this.next().hasClass('fixed')) {
                            return true;
                        }
                        $this.next().find("[data-type=start]").val(Global.createTime(nextStart));
                    }
                });
            }
            ScheduleHelper.processGaps();
        }
        , checkForOverlaps: function () {
            var $rows = $("#schedule-page tbody").find("tr");
            $rows.each(function () {
                var $this = $(this);
                var nextStart = Global.processTime($this.find("[data-type=start]").val()) + Global.processTime($this.find("[data-type=duration]").val());
                if ($this.next().length) {
                    if (Global.processTime($this.next().find("[data-type=start]").val()) < nextStart)
                        !$this.hasClass('fixed') && $this.addClass('error overlap');
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
            var $rows = $("#schedule-page tbody tr");
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
            var $rows = $("#schedule-page tbody tr");
            var i = 1;
            $rows.each(function () {
//                if (!$(this).hasClass('gap')) {
                $(this).find(".idx").text(i);
                i++;
//                } else
//                    $(this).find(".idx").text('خ');
            });
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
                    , cache: false
                    , ttl: 1
                    , url: CONFIG.api.url + CONFIG.api.schedule + '/suggestion?q=%QUERY&type=%TYPE&category='
                    , prepare: function (query, settings) {
                        var $currentInput = $('[data-suggestion]:focus');
                        settings.url = settings.url.replace('%QUERY', query).replace('%TYPE', $currentInput.attr("data-suggestion-type"));
                        if ($currentInput.attr("data-suggestion-type") !== "cat" && parseInt($currentInput.parents("tr:first").find("[name=ConductorMetaCategoryId]").val()) > 0)
                            settings.url += parseInt($currentInput.parents("tr:first").find("[name=ConductorMetaCategoryId]").val());
                        settings.url += '&_t=' + (new Date()).getTime();
                        settings.headers = {"Authorization": UserHelper.getToken()};
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
                $(this).parents("td").attr('data-filled', (new Date()).getTime());
            });
            $('input[data-suggestion="true"]').bind('typeahead:select', function (e, suggestion) {
                var data = suggestion.data;
                var $target = $(e.target);
                var $parent = $target.parents(".form-group:first");
                var $row = $target.parents("tr:first");
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
                            if (!$row.find('[name="ConductorMetaCategoryId"]').parents("td:first").find(".remove-meta").length)
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
                if (!moment($element.val(), 'HH:mm:SS', true).isValid())
                    $element.parent().addClass("has-error");
                else
                    $element.parent().removeClass("has-error");
            };
            this.beforeSave = function () {
                if ($("#schedule-page tbody tr.error").length) {
                    var idx = $("#schedule-page tbody tr.error:first .idx").text();
                    var msg = 'Please fix the error in row [' + idx + ']';
                    toastr.error(msg, 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    return false;
                }
                return true;
            }
            ;
        }
        , setStates: function () {
            var getRowsCount = function () {
                return function () {
                    if ($("#schedule-page tbody tr").length)
                        return $("#schedule-page tbody tr").length;
                    return 0;
                };
            };
            var getTotalTime = function () {
                return function () {
                    var $rows = $("#schedule-page tbody tr");
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
                {"type": "count", "value": getRowsCount()}
                , {"type": "duration", "value": getTotalTime()}
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
            $(document).on('input', "#schedule-page tbody", function (e) {
                ScheduleHelper.generateTimeArray();
                var $target = $(e.target).closest("tr");
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
            var source = typeof source !== "undefined" && source === true ? true : false;
            var starts = [];
            $.each(items, function () {
                starts.push({
                    time: this.CondcutorStartTime.split('T')[1]
                    , title: this.ConductorCategoryTitle + ' » ' + this.ConductorTitle
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
                $(".source[name=startdate], .source[name=enddate]").empty();
                for (var i = 0; i < starts.length; i++)
                    $(".source[name=startdate]").append('<option value="' + starts[i].time + '">[' + starts[i].time + '] ' + starts[i].title + '</option>');
                for (var i = 0; i < ends.length; i++)
                    $(".source[name=enddate]").append('<option value="' + ends[i].time + '">[' + ends[i].time + '] ' + ends[i].title + '</option>');
                $(".source[name=enddate]").find("option:last").attr('selected', 'selected');
            } else {
                $(".destination[name=startdate]").empty();
                for (var i = 0; i < starts.length; i++)
                    $(".destination[name=startdate]").append('<option value="' + starts[i].time + '">[' + starts[i].time + '] ' + starts[i].title + '</option>');
            }
        }
        , generateTimeArray: function (callback) {
            Config.env === "dev" && console.log('Generating Time Arrays');
            /*
             * Method to generate two arrays containing all start times and all end times
             */
            var $rows = $("#schedule-page table tbody tr");
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
            ends.shift();
            if (typeof callback === "object")
                callback.timeArrays = {starts: starts, ends: ends};
            if ($("select[data-type=itemlist][name=startdate]").length) {
                $("select[data-type=itemlist][name=startdate]").empty();
                for (var i = 0; i < starts.length; i++)
                    $("select[data-type=itemlist][name=startdate]").append('<option value="' + starts[i].time + '">[' + starts[i].time + '] ' + starts[i].title + '</option>');
            }
            if ($("select[data-type=itemlist][name=enddate]").length) {
                $("select[data-type=itemlist][name=enddate]").empty();
                for (var i = 0; i < ends.length; i++)
                    $("select[data-type=itemlist][name=enddate]").append('<option value="' + ends[i].time + '">[' + ends[i].time + '] ' + ends[i].title + '</option>');
                if (typeof $("select[data-type=itemlist][name=enddate]").attr('data-selected') !== "undefined")
                    $("select[data-type=itemlist][name=enddate]").find("option:last").attr('selected', 'selected');
            }
        }
    };
    return ScheduleHelper;
});