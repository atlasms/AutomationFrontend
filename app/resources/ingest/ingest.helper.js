define(['jquery', 'underscore', 'backbone', 'config', 'global', 'mask'
], function ($, _, Backbone, Config, Global, mask) {
    var IngestHelper = {
        flags: {}
        , init: function (reinit) {
            if (typeof reinit !== "undefined" && reinit === true) {

            } else {

            }
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
        , validate: function () {
            this.beforeSave = function () {
                var rquiredError = false;
                if ($("#path").val() === "") {
                    toastr.warning('مسیر برنامه مشخص نشده است', 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    rquiredError = true;
                }
                $("input, select, textarea").each(function() {
                    if ($(this).attr("required") && $(this).val() === "") {
                        $(this).parents(".form-group:first").addClass('has-error');
                        rquiredError = true;
                    }
                });
                if ($("[data-type=path]").legnth && $("[data-type=path]").val() === "") {
                    $("#metadata-form-modal").find(".help-inline").removeClass('hidden');
                    return false;
                } else
                    $("#metadata-form-modal").find(".help-inline").addClass('hidden');
                if (rquiredError)
                    return false;
                return true;
            };
        }
    };
    return IngestHelper;
});