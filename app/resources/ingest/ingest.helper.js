define(['jquery', 'underscore', 'backbone', 'config', 'global', 'mask', 'toastr'
], function ($, _, Backbone, Config, Global, mask, toastr) {
    var IngestHelper = {
        flags: {}
        , fields: {
            // Fixed fields
            path: {
                required: true,
                validation: 'text'
            },
            duration: {
                required: true,
                validation: 'text'
            },
            filename: {
                required: true,
                validation: 'text'
            },
            // Variable Fields
            episode: {
                required: Config.inputPolicies['ingest.EpisodeNumber'].required,
                validation: 'number',
                min: Config.inputPolicies['ingest.EpisodeNumber'].min
            },
            title: {
                required: Config.inputPolicies['ingest.Title'].required,
                validation: 'text',
                min: Config.inputPolicies['ingest.Title'].min
            },
            description: {
                required: Config.inputPolicies['ingest.Description'].required,
                validation: 'text',
                min: Config.inputPolicies['ingest.Description'].min
            },
            tags: {
                required: Config.inputPolicies['ingest.Tags'].required,
                validation: 'select',
                min: Config.inputPolicies['ingest.Tags'].min
            },
            subjects: {
                required: Config.inputPolicies['ingest.Subjects'].required,
                validation: 'select',
                min: Config.inputPolicies['ingest.Subjects'].min
            },
            website_title: {
                required: Config.inputPolicies['ingest.SiteTitle'].required,
                validation: 'text',
                min: Config.inputPolicies['ingest.SiteTitle'].min
            },
            website_summary: {
                required: Config.inputPolicies['ingest.SiteSummary'].required,
                validation: 'text',
                min: Config.inputPolicies['ingest.SiteSummary'].min
            },
            website_desc: {
                required: Config.inputPolicies['ingest.SiteDescr'].required,
                validation: 'text',
                min: Config.inputPolicies['ingest.SiteDescr'].min
            },
            audio_channels: {
                required: Config.inputPolicies['ingest.AudioChannels'].required,
                validation: 'text',
                min: Config.inputPolicies['ingest.AudioChannels'].min
            },
            recommended_broadcast_date: {
                required: Config.inputPolicies['ingest.RecommendedBroadcastDate'].required,
                validation: 'text',
                min: Config.inputPolicies['ingest.RecommendedBroadcastDate'].min
            },
            recommended_subtitle_time: {
                required: Config.inputPolicies['ingest.RecommendedSubtitleTime'].required,
                validation: 'text',
                min: Config.inputPolicies['ingest.RecommendedSubtitleTime'].min
            },
            archive_description: {
                required: Config.inputPolicies['ingest.ArchiveDescr'].required,
                validation: 'text',
                min: Config.inputPolicies['ingest.ArchiveDescr'].min
            }
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
        , checkFields: function () {
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
            console.log('error', error);
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
                    // if ($(this).attr("required") && ($(this).val().length < 1 || (typeof $(this).val() === 'string' && $.trim($(this).val()).length < 1))) {
                    if ($(this).attr("required") && ($(this).val().length < 1)) {
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

                // disabled website summary and description match for QuranTV

                // if (this.fields.website_summary.required === true && this.fields.website_desc.required) {
                //     if ($("[data-type=website_summary]").val() === $("[data-type=website_desc]").val()) {
                //         toastr.warning('توضیحات وب‌سایت نمی‌تواند با خلاصه وب‌سایت یکی باشد', 'خطا', {positionClass: 'toast-bottom-left', progressBar: true, closeButton: true});
                //         rquiredError = true;
                //     }
                // }
                if ($("[data-type=path]").legnth && $("[data-type=path]").val() === "") {
                    $("#metadata-form-modal").find(".help-inline").removeClass('hidden');
                    return false;
                } else
                    $("#metadata-form-modal").find(".help-inline").addClass('hidden');

                console.log('requiredError', rquiredError);
                return !rquiredError;
            };
        }
    };
    return IngestHelper;
});
