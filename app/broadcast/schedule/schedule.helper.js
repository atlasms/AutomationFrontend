define(['jquery', 'underscore', 'backbone', 'config', 'global', 'moment-with-locales', 'jdate', 'mousetrap', 'hotkeys', 'toastr', 'bloodhound', 'typeahead', 'handlebars'
], function ($, _, Backbone, Config, Global, moment, jDate, Mousetrap, Hotkeys, toastr, Bloodhound, Typeahead, Handlebars) {
    var ScheduleHelper = {
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
            $(document).on('click', 'tbody tr', function () {
                $(this).parent().find("tr").removeClass('active');
                $(this).addClass("active");
            });
            $(document).mouseup(function (e) {
                var container = $("#schedule-page tbody");
                if (!container.is(e.target) // if the target of the click isn't the container...
                        && container.has(e.target).length === 0) // ... nor a descendant of the container
                {
                    container.find("tr.active").removeClass('active');
                }
            });
            $(document).on('change', '[type="checkbox"]', function () {
                if ($(this).is(':checked'))
                    $(this).attr('value', 1);
                else
                    $(this).attr('value', 0);
            });
            $(document).on('keyup change', "#schedule-page tbody [data-type=duration], #schedule-page tbody [data-type=start]", function () {
                ScheduleHelper.rebuildTable();
            });
        }
        , mask: function (type) {
            if (typeof type === "undefined")
                return false;
            switch (type) {
                case 'time':
//                    $("input.time").unmask();
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
            $(document).on('keydown', null, 'down', function (e) {
                var activeRow = $("#schedule-page tbody").find("tr.active");
                if (activeRow.length && !activeRow.find('input[data-type="title"], select').is(":focus"))
                    if (activeRow.find("+ tr").length) {
                        activeRow.removeClass('active').next('tr').addClass('active');
                        if ($(e.target).is("input")) {
                            var cellIndex = $(e.target).parents("td:first").index();
                            activeRow.find("+ tr").find("td").eq(cellIndex).find("input")[0].focus();
                        }
                    }
            });
            $(document).on('keydown', null, 'up', function (e) {
                var activeRow = $("#schedule-page tbody").find("tr.active");
                if (activeRow.length && !activeRow.find('input[data-type="title"]').is(":focus"))
                    if (activeRow.prev('tr').length) {
                        activeRow.removeClass('active').prev('tr').addClass('active');
                        if ($(e.target).is("input")) {
                            var cellIndex = $(e.target).parents("td:first").index();
                            activeRow.prev('tr').find("td").eq(cellIndex).find("input")[0].focus();
                        }
                    }
            });
            $(document).on('keydown', null, 'insert', function (e) {
                var activeRow = $("#schedule-page tbody").find("tr.active");
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
            $(document).on('click', ".tools [data-task=delete]", function (e) {
                var rows = $("#schedule-page tbody").find("tr");
                if (rows.length < 2)
                    return false;
                var row = $("#schedule-page tbody").find("tr.active");
                row.remove().promise().done(function () {
                    ScheduleHelper.rebuildTable();
                });
                e.preventDefault();
            });
        }
        , duplicateRow: function (row) {
            var rows = $("#schedule-page tbody").find("tr");
            if (rows.length > 1) {
                if (row.find("[data-type=duration]").val() === "" || Global.processTime(row.find("[data-type=duration]").val()) === 0) {
                    row.addClass("error");
                    return;
                }
            }
            $('input[data-suggestion="true"]').typeahead("destroy");
            var clone = row.clone();
            clone.addClass('error new');
            clone.find('[id]').removeAttr('id');
            clone.find('img').attr('src', Config.placeholderImage);
            clone.find('input[type="hidden"]').val('');
            clone.find('input[type="text"]').val('');
            clone.find('input[data-suggestion="true"]').parent().find("label").text('');
            clone.find('input[type="checkbox"]').val(0).removeAttr('checked');
            clone.insertAfter(row);
            ScheduleHelper.rebuildTable();
            row.next().find("input:first").trigger('click');
            ScheduleHelper.mask("time");
            ScheduleHelper.suggestion();
        }
        , rebuildTable: function () {
            var $rows = $("#schedule-page tbody tr");
            var start = 0;
            var error = false;
//            var scheduleStart = Global.processTime($rows.eq(0).find("[data-type=start]").val());
            $rows.each(function (i) {
                var $this = $(this);
                $(this).find(".idx").text(i + 1);
                start = Global.processTime($this.find("[data-type=start]").val()) + Global.processTime($this.find("[data-type=duration]").val());
                var preStart = Global.processTime($this.find("[data-type=start]").val());
                if (!(/^\d+$/.test(start)) || error)
                    $this.addClass("error");
                else
                    $this.removeClass("error");
                if ($this.next().length) {
                    $this.next().find("[data-type=start]").val(Global.createTime(start));
                    if (Global.processTime(Global.createTime(start)) < preStart)
                        error = true;
                }
            });
            ScheduleHelper.setStates();
        }
        , suggestion: function ($obj) {
// Instantiate the Bloodhound suggestion engine
            $.fn.typeahead.defaults = {items: 'all'};
            var suggestionsAdapter = new Bloodhound({
                datumTokenizer: function (datum) {
                    return Bloodhound.tokenizers.whitespace(datum.value);
                }
                , queryTokenizer: Bloodhound.tokenizers.whitespace
                , remote: {
                    wildcard: '%QUERY'
                    , cache: false
                    , url: CONFIG.api.url + CONFIG.api.schedule + '/suggestion?q=%QUERY&type=%TYPE'
                    , replace: function (url, uriEncodedQuery) {
                        return url.replace('%TYPE', $('[data-suggestion]:focus').attr("data-suggestion-type")).replace('%QUERY', uriEncodedQuery);
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
            var $obj = (typeof $obj !== "undefined") ? $obj : $('input[data-suggestion="true"]');
            $obj.typeahead({
                minLength: 0
                , highlight: true
                , hint: true
            }, {
                display: 'value'
                , items: 100
                , limit: 100
                , source: suggestionsAdapter
                , templates: {
                    suggestion: Handlebars.compile('<div><span class="fa suggestion-{{data.kind}}"></span> {{data.text}}</div>')
                }
            });
            $('input[data-suggestion="true"]').bind('typeahead:select', function (e, suggestion) {
                var data = suggestion.data;
                var $target = $(e.target);
                var $parent = $target.parents(".form-group:first");
                var $row = $target.parents("tr:first");
                switch ($target.attr('data-suggestion-type')) {
                    case 'cat':
                        if (parseInt(data.kind) !== 3) {
                            $parent.find("label").text(data.text);
                            $parent.find('[name="ConductorCategoryTitle"]').val(data.text);
                            $parent.find('[name="ConductorMetaCategoryId"]').val(data.externalId);
                        } else {
                            $parent.find("label").text('');
                            $parent.find('[name="ConductorCategoryTitle"]').val(data.text);
                            $parent.find('[name="ConductorMetaCategoryId"]').val('');
                        }
                        break;
                    case 'media':
                        if (parseInt(data.kind) !== 3) {
                            $parent.find("label").html(data.text);
                            $row.find("img").attr('src', data.thumbnail);
                            $parent.find('[name="ConductorTitle"]').val(data.text);
                            $parent.find('[name="ConductorMediaId"]').val(data.externalId);
                            $row.find('[name="ConductorDuration"]').val(Global.createTime(data.duration));
                            $row.find('[name="ConductorEpisodeNumber"]').val(data.episode);
                        } else {
                            $parent.find("label").html('');
                            $row.find("img").attr('src', data.thumbnail);
                            $parent.find('[name="ConductorTitle"]').val(data.text);
                            $parent.find('[name="ConductorMediaId"]').val('');
//                            $parent.find('[name="ConductorDuration"]').val('00:00:00');
                        }
                        $row.find("input").trigger('change');
                        break;
                }
                console.log('Selection: ' + JSON.stringify(suggestion));
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
        , generateTimeArray: function (callback) {
            /*
             * Method to generate two arrays containing all start times and all end times
             */
            var $rows = $("#schedule-page table tbody tr");
            var starts = [];
            $.each($rows, function () {
                starts.push({
                    time: $(this).find('[data-type="start"]').val()
                    , title: $(this).find('[name="ConductorCategoryTitle"]').val() + ' ' + $(this).find('[name="ConductorTitle"]').val()
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
            if ($(".export-schedule select[name=startdate]").length)
                for (var i = 0; i < starts.length; i++)
                    $(".export-schedule select[name=startdate]").append('<option value="' + starts[i].time + '">[' + starts[i].time + '] ' + starts[i].title + '</option>');
            if ($(".export-schedule select[name=enddate]").length)
                for (var i = 0; i < ends.length; i++)
                    $(".export-schedule select[name=enddate]").append('<option value="' + ends[i].time + '">[' + ends[i].time + '] ' + ends[i].title + '</option>');
        }
    };
    return ScheduleHelper;
});