define(["jquery", "underscore", "backbone", "router", "template"
], function ($, _, Backbone, Router, Template) {
    var initialize = function () {
        var responsiveResize = (function () {
            var current_width = $(window).width();
            if (current_width < 768) {
                $('body').addClass("_xs").removeClass("_sm _md _lg");
            } else if (current_width > 767 && current_width < 992) {
                $('body').addClass("_sm").removeClass("_xs _md _lg");
            } else if (current_width > 991 && current_width < 1200) {
                $('body').addClass("_md").removeClass("_xs _sm _lg");
            } else if (current_width > 1199) {
                $('body').addClass("_lg").removeClass("_xs _sm _md");
            }
        })();
    };

    return {
        initialize: initialize
    };
});