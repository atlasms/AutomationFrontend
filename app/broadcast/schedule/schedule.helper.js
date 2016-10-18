define(['jquery', 'underscore', 'backbone', 'config', 'global', 'moment-with-locales', 'jdate', 'mousetrap', 'hotkeys', 'toastr'
], function ($, _, Backbone, Config, Global, moment, jDate, Mousetrap, Hotkeys, toastr) {
    var ScheduleHelper = {
        init: function (reinit) {
            if (typeof reinit !== "undefined" && reinit === true) {
                ScheduleHelper.tableHelper();
                ScheduleHelper.suggestion();
            } else {
                ScheduleHelper.hotkeys();
                ScheduleHelper.tableHelper();
                ScheduleHelper.suggestion();
            }
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
            $(document).on('keyup', "#schedule-page tbody [data-type=duration], #schedule-page tbody [data-type=start]", function () {
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
            $(document).on('keydown', null, 'f2', function () {
                alert('Hi');
            });
            $(document).on('keydown', '*', 'down', function () {
                var activeRow = $("#schedule-page tbody").find("tr.active");
                if (activeRow.length && activeRow.next().is("tr")) {
                    $("#schedule-page tbody tr").removeClass('active');
                    activeRow.next().addClass('active');
                }
            });
            $(document).on('keydown', '*', 'up', function () {
                var activeRow = $("#schedule-page tbody").find("tr.active");
                if (activeRow.length && activeRow.prev().is("tr")) {
                    $("#schedule-page tbody tr").removeClass('active');
                    activeRow.prev().addClass('active');
                }
            });
            $(document).on('keydown', '*', 'insert', function (e) {
                var activeRow = $("#schedule-page tbody").find("tr.active");
                ScheduleHelper.duplicateRow(activeRow);
                e.preventDefault();
            });
            $(document).on('keydown', '*:not(input)', 'space', function () {
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
                var row = $("#schedule-page tbody").find("tr.active");
                row.remove().promise().done(function () {
                    ScheduleHelper.rebuildTable();
                });
                e.preventDefault();
            });
        }
        , duplicateRow: function (row) {
            if (row.find("[data-type=duration]").val() === "" || Global.processTime(row.find("[data-type=duration]").val()) === 0) {
                row.addClass("error");
                return;
            }
            var clone = row.clone();
            clone.addClass('error');
            clone.find('[id]').removeAttr('id');
            clone.find('input[type="text"]').val('');
            clone.find('input[type="checkbox"]').val(0).removeAttr('checked');
            clone.insertAfter(row);

            ScheduleHelper.rebuildTable();
            row.next().find("input:first").trigger('click');
            ScheduleHelper.mask("time");
        }
        , rebuildTable: function () {
            var $rows = $("#schedule-page tbody tr");
            var start = 0;
            $rows.each(function (i) {
                var $this = $(this);
                $(this).find(".idx").text(i + 1);
                start = Global.processTime($this.find("[data-type=start]").val()) + Global.processTime($this.find("[data-type=duration]").val());
                if (!(/^\d+$/.test(start)))
                    $this.addClass("error");
                else
                    $this.removeClass("error");
                if ($this.next().length) {
                    $this.next().find("[data-type=start]").val(Global.createTime(start));
                }
            });
        }
        , suggestion: function () {
//            alert(typeof $.fn.typehead + typeof typehead + typeof $.typehead);
//            $('input[data-type="title"]').typehead({
//                highlight: true
//            }, {
//                name: 'schedule-title-dataset'
//                , source: function (query, process) {
//                    return $.get(CONFIG.api.url + CONFIG.api.schedule, {q: query}, function (data) {
//                        console.log(data);
//                    });
//                }
//                , remote: '/my_search_url/?q=%QUERY'
//            });
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
            };
        }
    };
    return ScheduleHelper;
});