define(['jquery', 'underscore', 'backbone', 'config', 'global', 'mask', 'toastr'
], function ($, _, Backbone, Config, Global, mask, toastr) {
    var IngestHelper = {
        flags: {}
        , fields: {
            path: { required: true, validation: 'text' },
            duration: { required: true, validation: 'text' },
            filename: { required: true, validation: 'text' },
            episode: { required: true, validation: 'number', min: 0 },
            title: { required: true, validation: 'text', min: 4 },
            description: { required: true, validation: 'text', min: 9 },
            tags: { required: true, validation: 'select', min: 1 },
            subjects: { required: true, validation: 'select', min: 1 },
            website_title: { required: true, validation: 'text', min: 4 },
            website_summary: { required: true, validation: 'text', min: 4 },
            website_desc: { required: true, validation: 'text', min: 9 }
        }
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
        , checkFields: function() {
            var error = false;
            for (var field in this.fields) {
                var description = this.fields[field];
                var $field = $('[data-type="' + field + '"]');
                if (!$field.length) {
                    toastr.warning('لطفا صفحه را ریفرش کنید و اطلاعات را مجدد وارد کنید.', 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    error = true;
                }
                if (typeof description.required !== 'undefined' && description.required) {
                    if (typeof $field.val() === 'undefined' || $field.val() === "" || !$field.val()) {
                        $field.parents(".form-group:first").addClass('has-error');
                        error = true;
                    }
                }
                if (typeof description.min !== 'undefined' && description.min > 0) {
                    switch (description.validation) {
                        case 'number':
                            if (~~$field.val() < description.min) {
                                $field.parents(".form-group:first").addClass('has-error');
                                error = true;
                            }
                            break;
                        default:
                            if ($field.val().length < description.min) {
                                $field.parents(".form-group:first").addClass('has-error');
                                error = true;
                            }
                            break;
                    }
                }
                if (description.validation === 'number') {
                    if (isNaN($field.val()) || ~~$field.val() <= 0) {
                        toastr.warning('شماره قسمت فقط می‌تواند یک مقدار عددی بزرگتر از صفر باشد', 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                        $field.parents(".form-group:first").addClass('has-error');
                        error = true;
                    }
                }
            }
            return !error;
        }
        , validate: function () {
            this.beforeSave = function () {
                var rquiredError = false;
                if ($("#path").val() === "") {
                    toastr.warning('مسیر برنامه مشخص نشده است', 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    rquiredError = true;
                }
                $("input, select, textarea").each(function () {
                    if ($(this).attr("required") && ($(this).val().length < 1 || (typeof $(this).val() === 'string' && $.trim($(this).val()).length < 1))) {
                        $(this).parents(".form-group:first").addClass('has-error');
                        rquiredError = true;
                        // } else {
                        //     $(this).parents(".form-group:first").removeClass('has-error');
                    }
                });

                // disabled description match error by request of Mr. Kasraee

                // if ($("[data-type=description]").val() === $("[data-type=website_desc]").val()) {
                //     toastr.warning('توضیحات وب‌سایت با توضیحات اتوماسیون یکی است', 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                //     rquiredError = true; 
                // }
                if ($("[data-type=website_summary]").val() === $("[data-type=website_desc]").val()) {
                    toastr.warning('توضیحات وب‌سایت نمی‌تواند با خلاصه وب‌سایت یکی باشد', 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                    rquiredError = true;
                }
                if ($("[data-type=path]").legnth && $("[data-type=path]").val() === "") {
                    $("#metadata-form-modal").find(".help-inline").removeClass('hidden');
                    return false;
                } else
                    $("#metadata-form-modal").find(".help-inline").addClass('hidden');

                return !rquiredError;
            };
        }
    };
    return IngestHelper;
});