define(['jquery', 'underscore', 'backbone', 'config', 'global', 'moment-with-locales', 'jdate', 'hotkeys', 'toastr'
], function ($, _, Backbone, Config, Global, moment, jDate, Hotkeys, toastr) {
    var CrawlHelper = {
        flags: {}
        , init: function (reinit) {

        }
        , tableHelper: function () {
            $(document).on('click', 'tbody > tr:not(.preview-pane)', function () {
                $(this).parent().find("tr").removeClass('active');
                $(this).addClass("active");
            });
            $(document).mouseup(function (e) {
                var container = $("#crawl-page tbody");
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
            $(document).on('keyup change', "#crawl-page tbody [data-type=duration], #crawl-page tbody [data-type=start]", function () {
                CrawlHelper.rebuildTable();
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
        }
        , duplicateRow: function (row) {
            var rows = $("#crawl-page tbody").find("tr");
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
            CrawlHelper.rebuildTable();
            row.next().find("input:first").trigger('click');
            CrawlHelper.mask("time");
        }
        , rebuildTable: function () {
            var $rows = $("#crawl-page tbody tr");
            var start = 0;
            var error = false;
            $rows.each(function (i) {
                var $this = $(this);
                $(this).find(".idx").text(i + 1);
            });
            CrawlHelper.setStates();
        }
        , suggestion: function ($obj) {

        }
        , validate: function () {
            this.beforeSave = function () {
                if ($("#crawl-page tbody tr.error").length) {
                    var idx = $("#crawl-page tbody tr.error:first .idx").text();
                    var msg = 'Please fix the error in row [' + idx + ']';
                    toastr.error(msg, 'خطا', Config.settings.toastr);
                    return false;
                }
                return true;
            };
        }
        , setStates: function () {
            CrawlHelper.handleStatusbar([
//                {"type": "count", "value": getRowsCount()}
//                , {"type": "duration", "value": getTotalTime()}
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
            $(document).on('input', "#crawl-page tbody", function (e) {
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
    };
    return CrawlHelper;
});
