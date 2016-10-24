define(['jquery', 'underscore', 'backbone', 'config', 'global', 'moment-with-locales', 'jdate', 'mousetrap', 'hotkeys', 'toastr', 'bloodhound', 'typeahead'
], function ($, _, Backbone, Config, Global, moment, jDate, Mousetrap, Hotkeys, toastr, Bloodhound, Typeahead) {
    var IngestHelper = {
        flags: {}
        , init: function (reinit) {
            if (typeof reinit !== "undefined" && reinit === true) {

            } else {

            }
        }
    };
    return IngestHelper;
});