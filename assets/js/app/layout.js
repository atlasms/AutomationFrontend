define(['jquery', 'cookie', 'bootstrap/dropdown', "bootstrap/collapse"], function ($, Cookies) {

    /*! Copyright (c) 2011 Piotr Rochala (http://rocha.la)
    * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
    * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
    *
    * Improved by keenthemes for Metronic Theme
    * Version: 1.3.2
    *
    */
    !function (e) {
        jQuery.fn.extend({
            slimScroll: function (i) {
                var o = {
                    width: "auto",
                    height: "250px",
                    size: "7px",
                    color: "#000",
                    position: "right",
                    distance: "1px",
                    start: "top",
                    opacity: .4,
                    alwaysVisible: !1,
                    disableFadeOut: !1,
                    railVisible: !1,
                    railColor: "#333",
                    railOpacity: .2,
                    railDraggable: !0,
                    railClass: "slimScrollRail",
                    barClass: "slimScrollBar",
                    wrapperClass: "slimScrollDiv",
                    allowPageScroll: !1,
                    wheelStep: 20,
                    touchScrollStep: 200,
                    borderRadius: "7px",
                    railBorderRadius: "7px",
                    animate: !0
                }, a = e.extend(o, i);
                return this.each(function () {
                    function o(t) {
                        if (u) {
                            var t = t || window.event, i = 0;
                            t.wheelDelta && (i = -t.wheelDelta / 120), t.detail && (i = t.detail / 3);
                            var o = t.target || t.srcTarget || t.srcElement;
                            e(o).closest("." + a.wrapperClass).is(S.parent()) && r(i, !0), t.preventDefault && !y && t.preventDefault(), y || (t.returnValue = !1)
                        }
                    }

                    function r(e, t, i) {
                        y = !1;
                        var o = e, r = S.outerHeight() - M.outerHeight();
                        if (t && (o = parseInt(M.css("top")) + e * parseInt(a.wheelStep) / 100 * M.outerHeight(), o = Math.min(Math.max(o, 0), r), o = e > 0 ? Math.ceil(o) : Math.floor(o), M.css({top: o + "px"})), v = parseInt(M.css("top")) / (S.outerHeight() - M.outerHeight()), o = v * (S[0].scrollHeight - S.outerHeight()), i) {
                            o = e;
                            var s = o / S[0].scrollHeight * S.outerHeight();
                            s = Math.min(Math.max(s, 0), r), M.css({top: s + "px"})
                        }
                        "scrollTo" in a && a.animate ? S.animate({scrollTop: o}) : S.scrollTop(o), S.trigger("slimscrolling", ~~o), l(), c()
                    }

                    function s() {
                        window.addEventListener ? (this.addEventListener("DOMMouseScroll", o, !1), this.addEventListener("mousewheel", o, !1)) : document.attachEvent("onmousewheel", o)
                    }

                    function n() {
                        f = Math.max(S.outerHeight() / S[0].scrollHeight * S.outerHeight(), m), M.css({height: f + "px"});
                        var e = f == S.outerHeight() ? "none" : "block";
                        M.css({display: e})
                    }

                    function l() {
                        if (n(), clearTimeout(p), v == ~~v) {
                            if (y = a.allowPageScroll, b != v) {
                                var e = 0 == ~~v ? "top" : "bottom";
                                S.trigger("slimscroll", e)
                            }
                        } else y = !1;
                        return b = v, f >= S.outerHeight() ? void (y = !0) : (M.stop(!0, !0).fadeIn("fast"), void (a.railVisible && H.stop(!0, !0).fadeIn("fast")))
                    }

                    function c() {
                        a.alwaysVisible || (p = setTimeout(function () {
                            a.disableFadeOut && u || h || d || (M.fadeOut("slow"), H.fadeOut("slow"))
                        }, 1e3))
                    }

                    var u, h, d, p, g, f, v, b, w = "<div></div>", m = 30, y = !1, S = e(this);
                    if ("ontouchstart" in window && window.navigator.msPointerEnabled && S.css("-ms-touch-action", "none"), S.parent().hasClass(a.wrapperClass)) {
                        var E = S.scrollTop();
                        if (M = S.parent().find("." + a.barClass), H = S.parent().find("." + a.railClass), n(), e.isPlainObject(i)) {
                            if ("height" in i && "auto" == i.height) {
                                S.parent().css("height", "auto"), S.css("height", "auto");
                                var x = S.parent().parent().height();
                                S.parent().css("height", x), S.css("height", x)
                            }
                            if ("scrollTo" in i) E = parseInt(a.scrollTo); else if ("scrollBy" in i) E += parseInt(a.scrollBy); else if ("destroy" in i) return M.remove(), H.remove(), void S.unwrap();
                            r(E, !1, !0)
                        }
                    } else {
                        a.height = "auto" == i.height ? S.parent().height() : i.height;
                        var C = e(w).addClass(a.wrapperClass).css({position: "relative", overflow: "hidden", width: a.width, height: a.height});
                        S.css({overflow: "hidden", width: a.width, height: a.height});
                        var H = e(w).addClass(a.railClass).css({
                            width: a.size,
                            height: "100%",
                            position: "absolute",
                            top: 0,
                            display: a.alwaysVisible && a.railVisible ? "block" : "none",
                            "border-radius": a.railBorderRadius,
                            background: a.railColor,
                            opacity: a.railOpacity,
                            zIndex: 90
                        }), M = e(w).addClass(a.barClass).css({
                            background: a.color,
                            width: a.size,
                            position: "absolute",
                            top: 0,
                            opacity: a.opacity,
                            display: a.alwaysVisible ? "block" : "none",
                            "border-radius": a.borderRadius,
                            BorderRadius: a.borderRadius,
                            MozBorderRadius: a.borderRadius,
                            WebkitBorderRadius: a.borderRadius,
                            zIndex: 99
                        }), D = "right" == a.position ? {right: a.distance} : {left: a.distance};
                        H.css(D), M.css(D), S.wrap(C), S.parent().append(M), S.parent().append(H), a.railDraggable && M.bind("mousedown", function (i) {
                            var o = e(document);
                            return d = !0, t = parseFloat(M.css("top")), pageY = i.pageY, o.bind("mousemove.slimscroll", function (e) {
                                currTop = t + e.pageY - pageY, M.css("top", currTop), r(0, M.position().top, !1)
                            }), o.bind("mouseup.slimscroll", function () {
                                d = !1, c(), o.unbind(".slimscroll")
                            }), !1
                        }).bind("selectstart.slimscroll", function (e) {
                            return e.stopPropagation(), e.preventDefault(), !1
                        }), "ontouchstart" in window && window.navigator.msPointerEnabled && (S.bind("MSPointerDown", function (e) {
                            g = e.originalEvent.pageY
                        }), S.bind("MSPointerMove", function (e) {
                            e.originalEvent.preventDefault();
                            var t = (g - e.originalEvent.pageY) / a.touchScrollStep;
                            r(t, !0), g = e.originalEvent.pageY
                        })), H.hover(function () {
                            l()
                        }, function () {
                            c()
                        }), M.hover(function () {
                            h = !0
                        }, function () {
                            h = !1
                        }), S.hover(function () {
                            u = !0, l(), c()
                        }, function () {
                            u = !1, c()
                        }), S.bind("touchstart", function (e) {
                            e.originalEvent.touches.length && (g = e.originalEvent.touches[0].pageY)
                        }), S.bind("touchmove", function (e) {
                            if (y || e.originalEvent.preventDefault(), e.originalEvent.touches.length) {
                                var t = (g - e.originalEvent.touches[0].pageY) / a.touchScrollStep;
                                r(t, !0), g = e.originalEvent.touches[0].pageY
                            }
                        }), n(), "bottom" === a.start ? (M.css({top: S.outerHeight() - M.outerHeight()}), r(0, !0)) : "top" !== a.start && (r(e(a.start).position().top, null, !0), a.alwaysVisible || M.hide()), s()
                    }
                }), this
            }
        }), jQuery.fn.extend({slimscroll: jQuery.fn.slimScroll})
    }(jQuery);

    /**
     * App.js
     Core script to handle the entire theme and core functions
     **/
    var App = function () {

// IE mode
        var isRTL = true;
        var isIE8 = false;
        var isIE9 = false;
        var isIE10 = false;
        var resizeHandlers = [];
        var assetsPath = '../assets/';
        var globalImgPath = 'global/img/';
        var globalPluginsPath = 'global/plugins/';
        var globalCssPath = 'global/css/';
        // theme layout color set

        var brandColors = {
            'blue': '#89C4F4',
            'red': '#F3565D',
            'green': '#1bbc9b',
            'purple': '#9b59b6',
            'grey': '#95a5a6',
            'yellow': '#F8CB00'
        };
        // initializes main settings
        var handleInit = function () {

            if ($('body').css('direction') === 'rtl') {
                isRTL = true;
            }

            isIE8 = !!navigator.userAgent.match(/MSIE 8.0/);
            isIE9 = !!navigator.userAgent.match(/MSIE 9.0/);
            isIE10 = !!navigator.userAgent.match(/MSIE 10.0/);
            if (isIE10) {
                $('html').addClass('ie10'); // detect IE10 version
            }

            if (isIE10 || isIE9 || isIE8) {
                $('html').addClass('ie'); // detect IE10 version
            }
        };
        // runs callback functions set by App.addResponsiveHandler().
        var _runResizeHandlers = function () {
            // reinitialize other subscribed elements
            for (var i = 0; i < resizeHandlers.length; i++) {
                var each = resizeHandlers[i];
                each.call();
            }
        };
        var handleOnResize = function () {
            var windowWidth = $(window).width();
            var resize;
            if (isIE8) {
                var currheight;
                $(window).resize(function () {
                    if (currheight == document.documentElement.clientHeight) {
                        return; //quite event since only body resized not window.
                    }
                    if (resize) {
                        clearTimeout(resize);
                    }
                    resize = setTimeout(function () {
                        _runResizeHandlers();
                    }, 50); // wait 50ms until window resize finishes.                
                    currheight = document.documentElement.clientHeight; // store last body client height
                });
            } else {
                $(window).resize(function () {
                    if ($(window).width() != windowWidth) {
                        windowWidth = $(window).width();
                        if (resize) {
                            clearTimeout(resize);
                        }
                        resize = setTimeout(function () {
                            _runResizeHandlers();
                        }, 50); // wait 50ms until window resize finishes.
                    }
                });
            }
        };
        // Handles portlet tools & actions
        var handlePortletTools = function () {
            // handle portlet remove
            $('body').on('click', '.portlet > .portlet-title > .tools > a.remove', function (e) {
                e.preventDefault();
                var portlet = $(this).closest(".portlet");
                if ($('body').hasClass('page-portlet-fullscreen')) {
                    $('body').removeClass('page-portlet-fullscreen');
                }

//            portlet.find('.portlet-title .fullscreen').tooltip('destroy');
//            portlet.find('.portlet-title > .tools > .reload').tooltip('destroy');
//            portlet.find('.portlet-title > .tools > .remove').tooltip('destroy');
//            portlet.find('.portlet-title > .tools > .config')tooltip.tooltip('destroy');
//            portlet.find('.portlet-title > .tools > .collapse, .portlet > .portlet-title > .tools > .expand').tooltip('destroy');

                portlet.remove();
            });
            // handle portlet fullscreen
            $('body').on('click', '.portlet > .portlet-title .fullscreen', function (e) {
                e.preventDefault();
                var portlet = $(this).closest(".portlet");
                if (portlet.hasClass('portlet-fullscreen')) {
                    $(this).removeClass('on');
                    portlet.removeClass('portlet-fullscreen');
                    $('body').removeClass('page-portlet-fullscreen');
                    portlet.children('.portlet-body').css('height', 'auto');
                } else {
                    var height = App.getViewPort().height -
                        portlet.children('.portlet-title').outerHeight() -
                        parseInt(portlet.children('.portlet-body').css('padding-top')) -
                        parseInt(portlet.children('.portlet-body').css('padding-bottom'));
                    $(this).addClass('on');
                    portlet.addClass('portlet-fullscreen');
                    $('body').addClass('page-portlet-fullscreen');
                    portlet.children('.portlet-body').css('height', height);
                }
            });
            $('body').on('click', '.portlet > .portlet-title > .tools > a.reload', function (e) {
                e.preventDefault();
                var el = $(this).closest(".portlet").children(".portlet-body");
                var url = $(this).attr("data-url");
                var error = $(this).attr("data-error-display");
                if (url) {
                    App.blockUI({
                        target: el,
                        animate: true,
                        overlayColor: 'none'
                    });
                    $.ajax({
                        type: "GET",
                        cache: false,
                        url: url,
                        dataType: "html",
                        success: function (res) {
                            App.unblockUI(el);
                            el.html(res);
                            App.initAjax() // reinitialize elements & plugins for newly loaded content
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            App.unblockUI(el);
                            var msg = 'Error on reloading the content. Please check your connection and try again.';
                            if (error == "toastr" && toastr) {
                                toastr.error(msg);
                            } else if (error == "notific8" && $.notific8) {
                                $.notific8('zindex', 11500);
                                $.notific8(msg, {
                                    theme: 'ruby',
                                    life: 3000
                                });
                            } else {
                                alert(msg);
                            }
                        }
                    });
                } else {
                    // for demo purpose
                    App.blockUI({
                        target: el,
                        animate: true,
                        overlayColor: 'none'
                    });
                    window.setTimeout(function () {
                        App.unblockUI(el);
                    }, 1000);
                }
            });
            // load ajax data on page init
            $('.portlet .portlet-title a.reload[data-load="true"]').click();
            $('body').on('click', '.portlet > .portlet-title > .tools > .collapse, .portlet .portlet-title > .tools > .expand', function (e) {
                e.preventDefault();
                var el = $(this).closest(".portlet").children(".portlet-body");
                if ($(this).hasClass("collapse")) {
                    $(this).removeClass("collapse").addClass("expand");
                    el.slideUp(200);
                } else {
                    $(this).removeClass("expand").addClass("collapse");
                    el.slideDown(200);
                }
            });
        };
        // Handlesmaterial design checkboxes
        var handleMaterialDesign = function () {

            // Material design ckeckbox and radio effects
            $('body').on('click', '.md-checkbox > label, .md-radio > label', function () {
                var the = $(this);
                // find the first span which is our circle/bubble
                var el = $(this).children('span:first-child');
                // add the bubble class (we do this so it doesnt show on page load)
                el.addClass('inc');
                // clone it
                var newone = el.clone(true);
                // add the cloned version before our original
                el.before(newone);
                // remove the original so that it is ready to run on next click
                $("." + el.attr("class") + ":last", the).remove();
            });
            if ($('body').hasClass('page-md')) {
                // Material design click effect
                // credit where credit's due; http://thecodeplayer.com/walkthrough/ripple-click-effect-google-material-design       
                var element, circle, d, x, y;
                $('body').on('click', 'a.btn, button.btn, input.btn, label.btn', function (e) {
                    element = $(this);
                    if (element.find(".md-click-circle").length == 0) {
                        element.prepend("<span class='md-click-circle'></span>");
                    }

                    circle = element.find(".md-click-circle");
                    circle.removeClass("md-click-animate");
                    if (!circle.height() && !circle.width()) {
                        d = Math.max(element.outerWidth(), element.outerHeight());
                        circle.css({height: d, width: d});
                    }

                    x = e.pageX - element.offset().left - circle.width() / 2;
                    y = e.pageY - element.offset().top - circle.height() / 2;
                    circle.css({top: y + 'px', left: x + 'px'}).addClass("md-click-animate");
                    setTimeout(function () {
                        circle.remove();
                    }, 1000);
                });
            }

            // Floating labels
            var handleInput = function (el) {
                if (el.val() != "") {
                    el.addClass('edited');
                } else {
                    el.removeClass('edited');
                }
            }

            $('body').on('keydown', '.form-md-floating-label .form-control', function (e) {
                handleInput($(this));
            });
            $('body').on('blur', '.form-md-floating-label .form-control', function (e) {
//                handleInput($(this));
// Farid
                $(this).removeClass("edited");
            });
            $('.form-md-floating-label .form-control').each(function () {
                if ($(this).val().length > 0) {
                    $(this).addClass('edited');
                }
            });
        }

// Handles custom checkboxes & radios using jQuery iCheck plugin
        var handleiCheck = function () {
            if (!$().iCheck) {
                return;
            }

            $('.icheck').each(function () {
                var checkboxClass = $(this).attr('data-checkbox') ? $(this).attr('data-checkbox') : 'icheckbox_minimal-grey';
                var radioClass = $(this).attr('data-radio') ? $(this).attr('data-radio') : 'iradio_minimal-grey';
                if (checkboxClass.indexOf('_line') > -1 || radioClass.indexOf('_line') > -1) {
                    $(this).iCheck({
                        checkboxClass: checkboxClass,
                        radioClass: radioClass,
                        insert: '<div class="icheck_line-icon"></div>' + $(this).attr("data-label")
                    });
                } else {
                    $(this).iCheck({
                        checkboxClass: checkboxClass,
                        radioClass: radioClass
                    });
                }
            });
        };
        // Handles Bootstrap switches
        var handleBootstrapSwitch = function () {
            if (!$().bootstrapSwitch) {
                return;
            }
            $('.make-switch').bootstrapSwitch();
        };
        // Handles Bootstrap confirmations
        var handleBootstrapConfirmation = function () {
            if (!$().confirmation) {
                return;
            }
            $('[data-toggle=confirmation]').confirmation({btnOkClass: 'btn btn-sm btn-success', btnCancelClass: 'btn btn-sm btn-danger'});
        }

// Handles Bootstrap Accordions.
        var handleAccordions = function () {
            $('body').on('shown.bs.collapse', '.accordion.scrollable', function (e) {
                App.scrollTo($(e.target));
            });
        };
        // Handles Bootstrap Tabs.
        var handleTabs = function () {
            //activate tab if tab id provided in the URL
            if (encodeURI(location.hash)) {
                var tabid = encodeURI(location.hash.substr(1));
                $('a[href="#' + tabid + '"]').parents('.tab-pane:hidden').each(function () {
                    var tabid = $(this).attr("id");
                    $('a[href="#' + tabid + '"]').click();
                });
                $('a[href="#' + tabid + '"]').click();
            }

            if ($().tabdrop) {
                $('.tabbable-tabdrop .nav-pills, .tabbable-tabdrop .nav-tabs').tabdrop({
                    text: '<i class="fa fa-ellipsis-v"></i>&nbsp;<i class="fa fa-angle-down"></i>'
                });
            }
        };
        // Handles Bootstrap Modals.
        var handleModals = function () {
            // fix stackable modal issue: when 2 or more modals opened, closing one of modal will remove .modal-open class. 
            $('body').on('hide.bs.modal', function () {
                if ($('.modal:visible').length > 1 && $('html').hasClass('modal-open') === false) {
                    $('html').addClass('modal-open');
                } else if ($('.modal:visible').length <= 1) {
                    $('html').removeClass('modal-open');
                }
            });
            // fix page scrollbars issue
            $('body').on('show.bs.modal', '.modal', function () {
                if ($(this).hasClass("modal-scroll")) {
                    $('body').addClass("modal-open-noscroll");
                }
            });
            // fix page scrollbars issue
            $('body').on('hidden.bs.modal', '.modal', function () {
                $('body').removeClass("modal-open-noscroll");
            });
            // remove ajax content and remove cache on modal closed 
            $('body').on('hidden.bs.modal', '.modal:not(.modal-cached)', function () {
                $(this).removeData('bs.modal');
            });
        };
        // Handles Bootstrap Tooltips.
        var handleTooltips = function () {
            // global tooltips
//        $('.tooltips').tooltip();
//
//        // portlet tooltips
//        $('.portlet > .portlet-title .fullscreen').tooltip({
//            trigger: 'hover',
//            container: 'body',
//            title: 'Fullscreen'
//        });
//        $('.portlet > .portlet-title > .tools > .reload').tooltip({
//            trigger: 'hover',
//            container: 'body',
//            title: 'Reload'
//        });
//        $('.portlet > .portlet-title > .tools > .remove').tooltip({
//            trigger: 'hover',
//            container: 'body',
//            title: 'Remove'
//        });
//        $('.portlet > .portlet-title > .tools > .config').tooltip({
//            trigger: 'hover',
//            container: 'body',
//            title: 'Settings'
//        });
//        $('.portlet > .portlet-title > .tools > .collapse, .portlet > .portlet-title > .tools > .expand').tooltip({
//            trigger: 'hover',
//            container: 'body',
//            title: 'Collapse/Expand'
//        });
        };
        // Handles Bootstrap Dropdowns
        var handleDropdowns = function () {
            /*
             Hold dropdown on click  
             */
            $('body').on('click', '.dropdown-menu.hold-on-click', function (e) {
                e.stopPropagation();
            });
        };
        var handleAlerts = function () {
            $('body').on('click', '[data-close="alert"]', function (e) {
                $(this).parent('.alert').hide();
                $(this).closest('.note').hide();
                e.preventDefault();
            });
            $('body').on('click', '[data-close="note"]', function (e) {
                $(this).closest('.note').hide();
                e.preventDefault();
            });
            $('body').on('click', '[data-remove="note"]', function (e) {
                $(this).closest('.note').remove();
                e.preventDefault();
            });
        };
        // Handle textarea autosize 
        var handleTextareaAutosize = function () {
            if (typeof (autosize) == "function") {
                autosize(document.querySelector('textarea.autosizeme'));
            }
        }

// Handles Bootstrap Popovers

// last popep popover
        var lastPopedPopover;
        var handlePopovers = function () {
//        $('.popovers').popover();
//
//        // close last displayed popover
//
//        $(document).on('click.bs.popover.data-api', function (e) {
//            if (lastPopedPopover) {
//                lastPopedPopover.popover('hide');
//            }
//        });
        };
        // Handles scrollable contents using jQuery SlimScroll plugin.
        var handleScrollers = function () {
            App.initSlimScroll('.scroller');
        };
        // Handles Image Preview using jQuery Fancybox plugin
        var handleFancybox = function () {
            if (!jQuery.fancybox) {
                return;
            }

            if ($(".fancybox-button").length > 0) {
                $(".fancybox-button").fancybox({
                    groupAttr: 'data-rel',
                    prevEffect: 'none',
                    nextEffect: 'none',
                    closeBtn: true,
                    helpers: {
                        title: {
                            type: 'inside'
                        }
                    }
                });
            }
        };
        // Handles counterup plugin wrapper
        var handleCounterup = function () {
            if (!$().counterUp) {
                return;
            }

            $("[data-counter='counterup']").counterUp({
                delay: 10,
                time: 1000
            });
        };
        // Fix input placeholder issue for IE8 and IE9
        var handleFixInputPlaceholderForIE = function () {
            //fix html5 placeholder attribute for ie7 & ie8
            if (isIE8 || isIE9) { // ie8 & ie9
                // this is html5 placeholder fix for inputs, inputs with placeholder-no-fix class will be skipped(e.g: we need this for password fields)
                $('input[placeholder]:not(.placeholder-no-fix), textarea[placeholder]:not(.placeholder-no-fix)').each(function () {
                    var input = $(this);
                    if (input.val() === '' && input.attr("placeholder") !== '') {
                        input.addClass("placeholder").val(input.attr('placeholder'));
                    }

                    input.focus(function () {
                        if (input.val() == input.attr('placeholder')) {
                            input.val('');
                        }
                    });
                    input.blur(function () {
                        if (input.val() === '' || input.val() == input.attr('placeholder')) {
                            input.val(input.attr('placeholder'));
                        }
                    });
                });
            }
        };
        // Handle Select2 Dropdowns
        var handleSelect2 = function () {
            if ($().select2) {
                $.fn.select2.defaults.set("theme", "bootstrap");
                $('.select2me').select2({
                    placeholder: "Select",
                    width: 'auto',
                    allowClear: true
                });
            }
        };
        // handle group element heights
        var handleHeight = function () {
            $('[data-auto-height]').each(function () {
                var parent = $(this);
                var items = $('[data-height]', parent);
                var height = 0;
                var mode = parent.attr('data-mode');
                var offset = parseInt(parent.attr('data-offset') ? parent.attr('data-offset') : 0);
                items.each(function () {
                    if ($(this).attr('data-height') == "height") {
                        $(this).css('height', '');
                    } else {
                        $(this).css('min-height', '');
                    }

                    var height_ = (mode == 'base-height' ? $(this).outerHeight() : $(this).outerHeight(true));
                    if (height_ > height) {
                        height = height_;
                    }
                });
                height = height + offset;
                items.each(function () {
                    if ($(this).attr('data-height') == "height") {
                        $(this).css('height', height);
                    } else {
                        $(this).css('min-height', height);
                    }
                });
                if (parent.attr('data-related')) {
                    $(parent.attr('data-related')).css('height', parent.height());
                }
            });
        }

//* END:CORE HANDLERS *//

        return {
//main function to initiate the theme
            init: function () {
//IMPORTANT!!!: Do not modify the core handlers call order.

//Core handlers
                handleInit(); // initialize core variables
                handleOnResize(); // set and handle responsive    

                //UI Component handlers     
                handleMaterialDesign(); // handle material design       
                handleiCheck(); // handles custom icheck radio and checkboxes
                handleBootstrapSwitch(); // handle bootstrap switch plugin
                handleScrollers(); // handles slim scrolling contents 
                handleFancybox(); // handle fancy box
                handleSelect2(); // handle custom Select2 dropdowns
                handlePortletTools(); // handles portlet action bar functionality(refresh, configure, toggle, remove)
                handleAlerts(); //handle closabled alerts
                handleDropdowns(); // handle dropdowns
                handleTabs(); // handle tabs
                handleTooltips(); // handle bootstrap tooltips
                handlePopovers(); // handles bootstrap popovers
                handleAccordions(); //handles accordions 
                handleModals(); // handle modals
                handleBootstrapConfirmation(); // handle bootstrap confirmations
                handleTextareaAutosize(); // handle autosize textareas
                handleCounterup(); // handle counterup instances

                //Handle group element heights
                this.addResizeHandler(handleHeight); // handle auto calculating height on window resize

                // Hacks
                handleFixInputPlaceholderForIE(); //IE8 & IE9 input placeholder issue fix
            },
            //main function to initiate core javascript after ajax complete
            initAjax: function () {
                //handleUniform(); // handles custom radio & checkboxes     
                handleiCheck(); // handles custom icheck radio and checkboxes
                handleBootstrapSwitch(); // handle bootstrap switch plugin
                handleScrollers(); // handles slim scrolling contents 
                handleSelect2(); // handle custom Select2 dropdowns
                handleFancybox(); // handle fancy box
                handleDropdowns(); // handle dropdowns
                handleTooltips(); // handle bootstrap tooltips
                handlePopovers(); // handles bootstrap popovers
                handleAccordions(); //handles accordions 
                handleBootstrapConfirmation(); // handle bootstrap confirmations
            },
            //init main components 
            initComponents: function () {
                this.initAjax();
            },
            //public function to remember last opened popover that needs to be closed on click
            setLastPopedPopover: function (el) {
                lastPopedPopover = el;
            },
            //public function to add callback a function which will be called on window resize
            addResizeHandler: function (func) {
                resizeHandlers.push(func);
            },
            //public functon to call _runresizeHandlers
            runResizeHandlers: function () {
                _runResizeHandlers();
            },
            // wrApper function to scroll(focus) to an element
            scrollTo: function (el, offeset) {
                var pos = (el && el.length > 0) ? el.offset().top : 0;
                if (el) {
                    if ($('body').hasClass('page-header-fixed')) {
                        pos = pos - $('.page-header').height();
                    } else if ($('body').hasClass('page-header-top-fixed')) {
                        pos = pos - $('.page-header-top').height();
                    } else if ($('body').hasClass('page-header-menu-fixed')) {
                        pos = pos - $('.page-header-menu').height();
                    }
                    pos = pos + (offeset ? offeset : -1 * el.height());
                }

                $('html,body').animate({
                    scrollTop: pos
                }, 'slow');
            },
            initSlimScroll: function (el) {
                if (!$().slimScroll) {
                    return;
                }

                $(el).each(function () {
                    if ($(this).attr("data-initialized")) {
                        return; // exit
                    }

                    var height;
                    if ($(this).attr("data-height")) {
                        height = $(this).attr("data-height");
                    } else {
                        height = $(this).css('height');
                    }

                    $(this).slimScroll({
                        allowPageScroll: true, // allow page scroll when the element scroll is ended
                        size: '7px',
                        color: ($(this).attr("data-handle-color") ? $(this).attr("data-handle-color") : '#bbb'),
                        wrapperClass: ($(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : 'slimScrollDiv'),
                        railColor: ($(this).attr("data-rail-color") ? $(this).attr("data-rail-color") : '#eaeaea'),
                        position: isRTL ? 'left' : 'right',
                        height: height,
                        alwaysVisible: ($(this).attr("data-always-visible") == "1" ? true : false),
                        railVisible: ($(this).attr("data-rail-visible") == "1" ? true : false),
                        disableFadeOut: true
                    });
                    $(this).attr("data-initialized", "1");
                });
            },
            destroySlimScroll: function (el) {
                if (!$().slimScroll) {
                    return;
                }

                $(el).each(function () {
                    if ($(this).attr("data-initialized") === "1") { // destroy existing instance before updating the height
                        $(this).removeAttr("data-initialized");
                        $(this).removeAttr("style");
                        var attrList = {};
                        // store the custom attribures so later we will reassign.
                        if ($(this).attr("data-handle-color")) {
                            attrList["data-handle-color"] = $(this).attr("data-handle-color");
                        }
                        if ($(this).attr("data-wrapper-class")) {
                            attrList["data-wrapper-class"] = $(this).attr("data-wrapper-class");
                        }
                        if ($(this).attr("data-rail-color")) {
                            attrList["data-rail-color"] = $(this).attr("data-rail-color");
                        }
                        if ($(this).attr("data-always-visible")) {
                            attrList["data-always-visible"] = $(this).attr("data-always-visible");
                        }
                        if ($(this).attr("data-rail-visible")) {
                            attrList["data-rail-visible"] = $(this).attr("data-rail-visible");
                        }

                        $(this).slimScroll({
                            wrapperClass: ($(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : 'slimScrollDiv'),
                            destroy: true
                        });
                        var the = $(this);
                        // reassign custom attributes
                        $.each(attrList, function (key, value) {
                            the.attr(key, value);
                        });
                    }
                });
            },
            // function to scroll to the top
            scrollTop: function () {
                App.scrollTo();
            },
            // wrApper function to  block element(indicate loading)
            blockUI: function (options) {
                options = $.extend(true, {}, options);
                var html = '';
                if (options.animate) {
                    html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '">' + '<div class="block-spinner-bar"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>' + '</div>';
                } else if (options.iconOnly) {
                    html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '"><img src="' + this.getGlobalImgPath() + 'loading-spinner-grey.gif" align=""></div>';
                } else if (options.textOnly) {
                    html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '"><span>&nbsp;&nbsp;' + (options.message ? options.message : 'LOADING...') + '</span></div>';
                } else {
                    html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '"><img src="' + this.getGlobalImgPath() + 'loading-spinner-grey.gif" align=""><span>&nbsp;&nbsp;' + (options.message ? options.message : 'LOADING...') + '</span></div>';
                }

                if (options.target) { // element blocking
                    var el = $(options.target);
                    if (el.height() <= ($(window).height())) {
                        options.cenrerY = true;
                    }
                    el.block({
                        message: html,
                        baseZ: options.zIndex ? options.zIndex : 1000,
                        centerY: options.cenrerY !== undefined ? options.cenrerY : false,
                        css: {
                            top: '10%',
                            border: '0',
                            padding: '0',
                            backgroundColor: 'none'
                        },
                        overlayCSS: {
                            backgroundColor: options.overlayColor ? options.overlayColor : '#555',
                            opacity: options.boxed ? 0.05 : 0.1,
                            cursor: 'wait'
                        }
                    });
                } else { // page blocking
                    $.blockUI({
                        message: html,
                        baseZ: options.zIndex ? options.zIndex : 1000,
                        css: {
                            border: '0',
                            padding: '0',
                            backgroundColor: 'none'
                        },
                        overlayCSS: {
                            backgroundColor: options.overlayColor ? options.overlayColor : '#555',
                            opacity: options.boxed ? 0.05 : 0.1,
                            cursor: 'wait'
                        }
                    });
                }
            },
            // wrApper function to  un-block element(finish loading)
            unblockUI: function (target) {
                if (target) {
                    $(target).unblock({
                        onUnblock: function () {
                            $(target).css('position', '');
                            $(target).css('zoom', '');
                        }
                    });
                } else {
                    $.unblockUI();
                }
            },
            startPageLoading: function (options) {
                if (options && options.animate) {
                    $('.page-spinner-bar').remove();
                    $('body').append('<div class="page-spinner-bar"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>');
                } else {
                    $('.page-loading').remove();
                    $('body').append('<div class="page-loading"><img src="' + this.getGlobalImgPath() + 'loading-spinner-grey.gif"/>&nbsp;&nbsp;<span>' + (options && options.message ? options.message : 'Loading...') + '</span></div>');
                }
            },
            stopPageLoading: function () {
                $('.page-loading, .page-spinner-bar').remove();
            },
            alert: function (options) {

                options = $.extend(true, {
                    container: "", // alerts parent container(by default placed after the page breadcrumbs)
                    place: "append", // "append" or "prepend" in container 
                    type: 'success', // alert's type
                    message: "", // alert's message
                    close: true, // make alert closable
                    reset: true, // close all previouse alerts first
                    focus: true, // auto scroll to the alert after shown
                    closeInSeconds: 0, // auto close after defined seconds
                    icon: "" // put icon before the message
                }, options);
                var id = App.getUniqueID("App_alert");
                var html = '<div id="' + id + '" class="custom-alerts alert alert-' + options.type + ' fade in">' + (options.close ? '<button type="button" class="close" data-dismiss="alert" aria-hidden="true"></button>' : '') + (options.icon !== "" ? '<i class="fa-lg fa fa-' + options.icon + '"></i>  ' : '') + options.message + '</div>';
                if (options.reset) {
                    $('.custom-alerts').remove();
                }

                if (!options.container) {
                    if ($('.page-fixed-main-content').length === 1) {
                        $('.page-fixed-main-content').prepend(html);
                    } else if (($('body').hasClass("page-container-bg-solid") || $('body').hasClass("page-content-white")) && $('.page-head').length === 0) {
                        $('.page-title').after(html);
                    } else {
                        if ($('.page-bar').length > 0) {
                            $('.page-bar').after(html);
                        } else {
                            $('.page-breadcrumb, .breadcrumbs').after(html);
                        }
                    }
                } else {
                    if (options.place == "append") {
                        $(options.container).append(html);
                    } else {
                        $(options.container).prepend(html);
                    }
                }

                if (options.focus) {
                    App.scrollTo($('#' + id));
                }

                if (options.closeInSeconds > 0) {
                    setTimeout(function () {
                        $('#' + id).remove();
                    }, options.closeInSeconds * 1000);
                }

                return id;
            },
            //public function to initialize the fancybox plugin
            initFancybox: function () {
                handleFancybox();
            },
            //public helper function to get actual input value(used in IE9 and IE8 due to placeholder attribute not supported)
            getActualVal: function (el) {
                el = $(el);
                if (el.val() === el.attr("placeholder")) {
                    return "";
                }
                return el.val();
            },
            //public function to get a paremeter by name from URL
            getURLParameter: function (paramName) {
                var searchString = window.location.search.substring(1),
                    i, val, params = searchString.split("&");
                for (i = 0; i < params.length; i++) {
                    val = params[i].split("=");
                    if (val[0] == paramName) {
                        return unescape(val[1]);
                    }
                }
                return null;
            },
            // check for device touch support
            isTouchDevice: function () {
                try {
                    document.createEvent("TouchEvent");
                    return true;
                } catch (e) {
                    return false;
                }
            },
            // To get the correct viewport width based on  http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
            getViewPort: function () {
                var e = window,
                    a = 'inner';
                if (!('innerWidth' in window)) {
                    a = 'client';
                    e = document.documentElement || document.body;
                }

                return {
                    width: e[a + 'Width'],
                    height: e[a + 'Height']
                };
            },
            getUniqueID: function (prefix) {
                return 'prefix_' + Math.floor(Math.random() * (new Date()).getTime());
            },
            // check IE8 mode
            isIE8: function () {
                return isIE8;
            },
            // check IE9 mode
            isIE9: function () {
                return isIE9;
            },
            //check RTL mode
            isRTL: function () {
                return isRTL;
            },
            // check IE8 mode
//            isAngularJsApp: function () {
//                return (typeof angular == 'undefined') ? false : true;
//            },
            getAssetsPath: function () {
                return assetsPath;
            },
            setAssetsPath: function (path) {
                assetsPath = path;
            },
            setGlobalImgPath: function (path) {
                globalImgPath = path;
            },
            getGlobalImgPath: function () {
                return assetsPath + globalImgPath;
            },
            setGlobalPluginsPath: function (path) {
                globalPluginsPath = path;
            },
            getGlobalPluginsPath: function () {
                return assetsPath + globalPluginsPath;
            },
            getGlobalCssPath: function () {
                return assetsPath + globalCssPath;
            },
            // get layout color code by color name
            getBrandColor: function (name) {
                if (brandColors[name]) {
                    return brandColors[name];
                } else {
                    return '';
                }
            },
            getResponsiveBreakpoint: function (size) {
                // bootstrap responsive breakpoints
                var sizes = {
                    'xs': 480, // extra small
                    'sm': 768, // small
                    'md': 992, // medium
                    'lg': 1200     // large
                };
                return sizes[size] ? sizes[size] : 0;
            }
        };
    }();
    /**
     * Layout.js
     Core script to handle the entire theme and core functions
     **/
    var Layout = function () {

        var layoutImgPath = '/assets/img/';
        var layoutCssPath = '/assets/css/';
        var resBreakpointMd = App.getResponsiveBreakpoint('md');
        var ajaxContentSuccessCallbacks = [];

        var ajaxContentErrorCallbacks = [];
        //* BEGIN:CORE HANDLERS *//
        // this function handles responsive layout on screen size resize or mobile device rotate.

        // Set proper height for sidebar and content. The content and sidebar height must be synced always.
        var handleSidebarAndContentHeight = function () {
            var content = $('.page-content');
            var sidebar = $('.page-sidebar');
            var body = $('body');
            var height;
            if (body.hasClass("page-footer-fixed") === true && body.hasClass("page-sidebar-fixed") === false) {
                var available_height = App.getViewPort().height - $('.page-footer').outerHeight() - $('.page-header').outerHeight();
                var sidebar_height = sidebar.outerHeight();
                if (sidebar_height > available_height) {
                    available_height = sidebar_height + $('.page-footer').outerHeight();
                }
                if (content.height() < available_height) {
                    content.css('min-height', available_height);
                }
            } else {
                if (body.hasClass('page-sidebar-fixed')) {
                    height = _calculateFixedSidebarViewportHeight();
                    if (body.hasClass('page-footer-fixed') === false) {
                        height = height - $('.page-footer').outerHeight();
                    }
                } else {
                    var headerHeight = $('.page-header').outerHeight();
                    var footerHeight = $('.page-footer').outerHeight();
                    if (App.getViewPort().width < resBreakpointMd) {
                        height = App.getViewPort().height - headerHeight - footerHeight;
                    } else {
                        height = sidebar.height() + 20;
                    }

                    if ((height + headerHeight + footerHeight) <= App.getViewPort().height) {
                        height = App.getViewPort().height - headerHeight - footerHeight;
                    }
                }
                content.css('min-height', height);
            }
        };
        // Handle sidebar menu links
        var handleSidebarMenuActiveLink = function (mode, el, $state) {
            var url = location.hash.toLowerCase();
            var menu = $('.page-sidebar-menu');
            if (mode === 'click' || mode === 'set') {
                el = $(el);
            } else if (mode === 'match') {
                menu.find('li > a').each(function () {
                    var state = $(this).attr('ui-sref');
                    if ($state && state) {
                        if ($state.is(state)) {
                            el = $(this);
                            return;
                        }
                    } else {
                        var path = $(this).attr('href');
                        if (path) {
                            // url match condition         
                            path = path.toLowerCase();
                            if (path.length > 1 && url.substr(1, path.length - 1) == path.substr(1)) {
                                el = $(this);
                                return;
                            }
                        }
                    }
                });
            }

            if (!el || el.length == 0) {
                return;
            }

            if (el.attr('href') == 'javascript:;' ||
                el.attr('ui-sref') == 'javascript:;' ||
                el.attr('href') == '#' ||
                el.attr('ui-sref') == '#'
            ) {
                return;
            }

            var slideSpeed = parseInt(menu.data('slide-speed'));
            var keepExpand = menu.data('keep-expanded');
            // begin: handle active state
            if (menu.hasClass('page-sidebar-menu-hover-submenu') === false) {
                menu.find('li.nav-item.open').each(function () {
                    var match = false;
                    $(this).find('li').each(function () {
                        var state = $(this).attr('ui-sref');
                        if ($state && state) {
                            if ($state.is(state)) {
                                match = true;
                                return;
                            }
                        } else if ($(this).find(' > a').attr('href') === el.attr('href')) {
                            match = true;
                            return;
                        }
                    });
                    if (match === true) {
                        return;
                    }

                    $(this).removeClass('open');
                    $(this).find('> a > .arrow.open').removeClass('open');
                    $(this).find('> .sub-menu').slideUp();
                });
            } else {
                menu.find('li.open').removeClass('open');
            }

            menu.find('li.active').removeClass('active');
            menu.find('li > a > .selected').remove();
            // end: handle active state

            el.parents('li').each(function () {
                $(this).addClass('active');
                $(this).find('> a > span.arrow').addClass('open');
                if ($(this).parent('ul.page-sidebar-menu').length === 1) {
                    $(this).find('> a').append('<span class="selected"></span>');
                }

                if ($(this).children('ul.sub-menu').length === 1) {
                    $(this).addClass('open');
                }
            });
            if (mode === 'click') {
                if (App.getViewPort().width < resBreakpointMd && $('.page-sidebar').hasClass('in')) { // close the menu on mobile view while laoding a page 
                    $('.page-header .responsive-toggler').click();
                }
            }
        };
        // Handle sidebar menu
        var handleSidebarMenu = function () {
            $(document).off('click', '.page-sidebar li > a').on('click', '.page-sidebar li > a', function (e) {

                if (App.getViewPort().width >= resBreakpointMd && $(this).parents('.page-sidebar-menu-hover-submenu').length === 1) { // exit of hover sidebar menu
                    return;
                }

                if ($(this).next().hasClass('sub-menu') === false) {
                    if (App.getViewPort().width < resBreakpointMd && $('.page-sidebar').hasClass("in")) { // close the menu on mobile view while laoding a page 
                        $('.page-header .responsive-toggler').click();
                    }
                    return;
                }

                var parent = $(this).parent().parent();
                var the = $(this);
                var menu = $('.page-sidebar-menu');
                var sub = $(this).next();
                var autoScroll = menu.data("auto-scroll");
                var slideSpeed = parseInt(menu.data("slide-speed"));
                var keepExpand = menu.data("keep-expanded");
                if (keepExpand !== true) {
                    parent.children('li.open').children('a').children('.arrow').removeClass('open');
                    parent.children('li.open').children('.sub-menu:not(.always-open)').slideUp(slideSpeed);
                    parent.children('li.open').removeClass('open');
                }

                var slideOffeset = -200;
                if (sub.is(":visible")) {
                    $('.arrow', $(this)).removeClass("open");
                    $(this).parent().removeClass("open");
                    sub.slideUp(slideSpeed, function () {
                        if (autoScroll === true && $('body').hasClass('page-sidebar-closed') === false) {
                            if ($('body').hasClass('page-sidebar-fixed')) {
                                menu.slimScroll({
                                    'scrollTo': (the.position()).top
                                });
                            } else {
                                App.scrollTo(the, slideOffeset);
                            }
                        }
                        handleSidebarAndContentHeight();
                    });
                } else {
                    $('.arrow', $(this)).addClass("open");
                    $(this).parent().addClass("open");
                    sub.slideDown(slideSpeed, function () {
                        if (autoScroll === true && $('body').hasClass('page-sidebar-closed') === false) {
                            if ($('body').hasClass('page-sidebar-fixed')) {
                                menu.slimScroll({
                                    'scrollTo': (the.position()).top
                                });
                            } else {
                                App.scrollTo(the, slideOffeset);
                            }
                        }
                        handleSidebarAndContentHeight();
                    });
                }

                e.preventDefault();
            });

            // handle scrolling to top on responsive menu toggler click when header is fixed for mobile view
            $(document).on('click', '.page-header-fixed-mobile .responsive-toggler', function () {
                App.scrollTop();
            });
        };
        var _calculateFixedSidebarViewportHeight = function () {
            var sidebarHeight = App.getViewPort().height - $('.page-header').outerHeight(true);
            if ($('body').hasClass("page-footer-fixed")) {
                sidebarHeight = sidebarHeight - $('.page-footer').outerHeight();
            }

            return sidebarHeight;
        };
        // Handles fixed sidebar
        var handleFixedSidebar = function () {
            var menu = $('.page-sidebar-menu');
            handleSidebarAndContentHeight();
            if ($('.page-sidebar-fixed').length === 0) {
                return;
            }

            if (App.getViewPort().width >= resBreakpointMd && !$('body').hasClass('page-sidebar-menu-not-fixed')) {
                menu.attr("data-height", _calculateFixedSidebarViewportHeight());
                App.destroySlimScroll(menu);
                App.initSlimScroll(menu);
                handleSidebarAndContentHeight();
            }
        };
        // Handles sidebar toggler to close/hide the sidebar.
        var handleFixedSidebarHoverEffect = function () {
            var body = $('body');
            if (body.hasClass('page-sidebar-fixed')) {
                $('.page-sidebar').on('mouseenter', function () {
                    if (body.hasClass('page-sidebar-closed')) {
                        $(this).find('.page-sidebar-menu').removeClass('page-sidebar-menu-closed');
                    }
                }).on('mouseleave', function () {
                    if (body.hasClass('page-sidebar-closed')) {
                        $(this).find('.page-sidebar-menu').addClass('page-sidebar-menu-closed');
                    }
                });
            }
        };
        // Hanles sidebar toggler
        var handleSidebarToggler = function () {
            var body = $('body');
            /**
             if (Cookies && Cookies.get('sidebar_closed') === '1' && App.getViewPort().width >= resBreakpointMd) {
             $('body').addClass('page-sidebar-closed');
             $('.page-sidebar-menu').addClass('page-sidebar-menu-closed');
             }
             */

            // handle sidebar show/hide
            // $('body').on('click', '.sidebar-toggler', function (e) {
            //     var sidebar = $('.page-sidebar');
            //     var sidebarMenu = $('.page-sidebar-menu');
            //     $(".sidebar-search", sidebar).removeClass("open");
            //     if (body.hasClass("page-sidebar-closed")) {
            //         body.removeClass("page-sidebar-closed");
            //         sidebarMenu.removeClass("page-sidebar-menu-closed");
            //         if (Cookies) {
            //             Cookies.set('sidebar_closed', '0');
            //         }
            //     } else {
            //         body.addClass("page-sidebar-closed");
            //         sidebarMenu.addClass("page-sidebar-menu-closed");
            //         if (body.hasClass("page-sidebar-fixed")) {
            //             sidebarMenu.trigger("mouseleave");
            //         }
            //         if (Cookies) {
            //             Cookies.set('sidebar_closed', '1');
            //         }
            //     }
            //
            //     $(window).trigger('resize');
            // });
            handleFixedSidebarHoverEffect();
            // handle the search bar close
//            $('.page-sidebar').on('click', '.sidebar-search .remove', function (e) {
//                e.preventDefault();
//                $('.sidebar-search').removeClass("open");
//            });
            // handle the search query submit on enter press
//            $('.page-sidebar .sidebar-search').on('keypress', 'input.form-control', function (e) {
//                if (e.which == 13) {
//                    $('.sidebar-search').submit();
//                    return false; //<---- Add this line
//                }
//            });
            // handle the search submit(for sidebar search and responsive mode of the header search)
//            $('.sidebar-search .submit').on('click', function (e) {
//                e.preventDefault();
//                if ($('body').hasClass("page-sidebar-closed")) {
//                    if ($('.sidebar-search').hasClass('open') === false) {
//                        if ($('.page-sidebar-fixed').length === 1) {
//                            $('.page-sidebar .sidebar-toggler').click(); //trigger sidebar toggle button
//                        }
//                        $('.sidebar-search').addClass("open");
//                    } else {
//                        $('.sidebar-search').submit();
//                    }
//                } else {
//                    $('.sidebar-search').submit();
//                }
//            });
            // handle close on body click
//            if ($('.sidebar-search').length !== 0) {
//                $('.sidebar-search .input-group').on('click', function (e) {
//                    e.stopPropagation();
//                });
//                $('body').on('click', function () {
//                    if ($('.sidebar-search').hasClass('open')) {
//                        $('.sidebar-search').removeClass("open");
//                    }
//                });
//            }
        };
        // Handles the horizontal menu
        var handleHeader = function () {
            // handle search box expand/collapse        
            $('.page-header').on('click', '.search-form', function (e) {
                $(this).addClass("open");
                $(this).find('.form-control').focus();
                $('.page-header .search-form .form-control').on('blur', function (e) {
                    $(this).closest('.search-form').removeClass("open");
                    $(this).unbind("blur");
                });
            });
            // handle hor menu search form on enter press
            $('.page-header').on('keypress', '.hor-menu .search-form .form-control', function (e) {
                if (e.which == 13) {
                    $(this).closest('.search-form').submit();
                    return false;
                }
            });
            // handle header search button click
            $('.page-header').on('mousedown', '.search-form.open .submit', function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).closest('.search-form').submit();
            });
        };
        // Handles the go to top button at the footer
        var handleGoTop = function () {
            var offset = 300;
            var duration = 500;
            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) { // ios supported
                $(window).bind("touchend touchcancel touchleave", function (e) {
                    if ($(this).scrollTop() > offset) {
                        $('.scroll-to-top').fadeIn(duration);
                    } else {
                        $('.scroll-to-top').fadeOut(duration);
                    }
                });
            } else { // general 
                $(window).scroll(function () {
                    if ($(this).scrollTop() > offset) {
                        $('.scroll-to-top').fadeIn(duration);
                    } else {
                        $('.scroll-to-top').fadeOut(duration);
                    }
                });
            }

            $('.scroll-to-top').click(function (e) {
                e.preventDefault();
                $('html, body').animate({
                    scrollTop: 0
                }, duration);
                return false;
            });
        };
        //* END:CORE HANDLERS *//

        return {
            // Main init methods to initialize the layout
            // IMPORTANT!!!: Do not modify the core handlers call order.

            initHeader: function () {
                handleHeader(); // handles horizontal menu    
            },
            setSidebarMenuActiveLink: function (mode, el) {
                handleSidebarMenuActiveLink(mode, el, null);
            },
//            setAngularJsSidebarMenuActiveLink: function (mode, el, $state) {
//                handleSidebarMenuActiveLink(mode, el, $state);
//            },
            initSidebar: function ($state) {
                //layout handlers
                handleFixedSidebar(); // handles fixed sidebar menu
                handleSidebarMenu(); // handles main menu
                handleSidebarToggler(); // handles sidebar hide/show

//            if (App.isAngularJsApp()) {
//                handleSidebarMenuActiveLink('match', null, $state); // init sidebar active links 
//            }

                App.addResizeHandler(handleFixedSidebar); // reinitialize fixed sidebar on window resize
            },
            initContent: function () {
                return;
            },
            initFooter: function () {
//                handleGoTop(); //handles scroll to top functionality in the footer
            },
            init: function () {
                this.initHeader();
                this.initSidebar(null);
                this.initContent();
                this.initFooter();
            },
            loadAjaxContent: function (url, sidebarMenuLink) {
                var pageContent = $('.page-content .page-content-body');
                App.startPageLoading({animate: true});
                $.ajax({
                    type: "GET",
                    cache: false,
                    url: url,
                    dataType: "html",
                    success: function (res) {
                        App.stopPageLoading();
                        for (var i = 0; i < ajaxContentSuccessCallbacks.length; i++) {
                            ajaxContentSuccessCallbacks[i].call(res);
                        }

                        if (sidebarMenuLink.length > 0 && sidebarMenuLink.parents('li.open').length === 0) {
                            $('.page-sidebar-menu > li.open > a').click();
                        }

                        pageContent.html(res);
                        Layout.fixContentHeight(); // fix content height
                        App.initAjax(); // initialize core stuff
                    },
                    error: function (res, ajaxOptions, thrownError) {
                        App.stopPageLoading();
                        pageContent.html('<h4>Could not load the requested content.</h4>');
                        for (var i = 0; i < ajaxContentErrorCallbacks.length; i++) {
                            ajaxContentSuccessCallbacks[i].call(res);
                        }
                    }
                });
            },
            addAjaxContentSuccessCallback: function (callback) {
                ajaxContentSuccessCallbacks.push(callback);
            },
            addAjaxContentErrorCallback: function (callback) {
                ajaxContentErrorCallbacks.push(callback);
            },
            //public function to fix the sidebar and content height accordingly
            fixContentHeight: function () {
                return;
            },
            initFixedSidebarHoverEffect: function () {
                handleFixedSidebarHoverEffect();
            },
            initFixedSidebar: function () {
                handleFixedSidebar();
            },
            getLayoutImgPath: function () {
                return App.getAssetsPath() + layoutImgPath;
            },
            getLayoutCssPath: function () {
                return App.getAssetsPath() + layoutCssPath;
            }
        };
    }();
    /**
     * quick-sidebar.js
     Core script to handle the entire theme and core functions
     **/
    var QuickSidebar = function () {

        // Handles quick sidebar toggler
        var handleQuickSidebarToggler = function () {
            // quick sidebar toggler
            // $('.dropdown-quick-sidebar-toggler a, .page-quick-sidebar-toggler, .quick-sidebar-toggler').click(function (e) {
            //     $('body').toggleClass('page-quick-sidebar-open');
            // });
        };
        // Handles quick sidebar chats
        var handleQuickSidebarChat = function () {
            var wrapper = $('.page-quick-sidebar-wrapper');
            var wrapperChat = wrapper.find('.page-quick-sidebar-chat');
            var initChatSlimScroll = function () {
                var chatUsers = wrapper.find('.page-quick-sidebar-chat-users');
                var chatUsersHeight;
                chatUsersHeight = wrapper.height() - wrapper.find('.nav-tabs').outerHeight(true);
                // chat user list 
                App.destroySlimScroll(chatUsers);
                chatUsers.attr("data-height", chatUsersHeight);
                App.initSlimScroll(chatUsers);
                var chatMessages = wrapperChat.find('.page-quick-sidebar-chat-user-messages');
                var chatMessagesHeight = chatUsersHeight - wrapperChat.find('.page-quick-sidebar-chat-user-form').outerHeight(true);
                chatMessagesHeight = chatMessagesHeight - wrapperChat.find('.page-quick-sidebar-nav').outerHeight(true);
                // user chat messages 
                App.destroySlimScroll(chatMessages);
                chatMessages.attr("data-height", chatMessagesHeight);
                App.initSlimScroll(chatMessages);
            };
            initChatSlimScroll();
            App.addResizeHandler(initChatSlimScroll); // reinitialize on window resize

            wrapper.find('.page-quick-sidebar-chat-users .media-list > .media').click(function () {
                wrapperChat.addClass("page-quick-sidebar-content-item-shown");
            });
            wrapper.find('.page-quick-sidebar-chat-user .page-quick-sidebar-back-to-list').click(function () {
                wrapperChat.removeClass("page-quick-sidebar-content-item-shown");
            });
            var handleChatMessagePost = function (e) {
                e.preventDefault();
                var chatContainer = wrapperChat.find(".page-quick-sidebar-chat-user-messages");
                var input = wrapperChat.find('.page-quick-sidebar-chat-user-form .form-control');
                var text = input.val();
                if (text.length === 0) {
                    return;
                }

                var preparePost = function (dir, time, name, avatar, message) {
                    var tpl = '';
                    tpl += '<div class="post ' + dir + '">';
                    tpl += '<img class="avatar" alt="" src="' + Layout.getLayoutImgPath() + avatar + '.jpg"/>';
                    tpl += '<div class="message">';
                    tpl += '<span class="arrow"></span>';
                    tpl += '<a href="#" class="name">Bob Nilson</a>&nbsp;';
                    tpl += '<span class="datetime">' + time + '</span>';
                    tpl += '<span class="body">';
                    tpl += message;
                    tpl += '</span>';
                    tpl += '</div>';
                    tpl += '</div>';
                    return tpl;
                };
                // handle post
                var time = new Date();
                var message = preparePost('out', (time.getHours() + ':' + time.getMinutes()), "Bob Nilson", 'avatar3', text);
                message = $(message);
                chatContainer.append(message);
                chatContainer.slimScroll({
                    scrollTo: '1000000px'
                });
                input.val("");
                // simulate reply
                setTimeout(function () {
                    var time = new Date();
                    var message = preparePost('in', (time.getHours() + ':' + time.getMinutes()), "Ella Wong", 'avatar2', 'Lorem ipsum doloriam nibh...');
                    message = $(message);
                    chatContainer.append(message);
                    chatContainer.slimScroll({
                        scrollTo: '1000000px'
                    });
                }, 3000);
            };
            wrapperChat.find('.page-quick-sidebar-chat-user-form .btn').click(handleChatMessagePost);
            wrapperChat.find('.page-quick-sidebar-chat-user-form .form-control').keypress(function (e) {
                if (e.which == 13) {
                    handleChatMessagePost(e);
                    return false;
                }
            });
        };
        // Handles quick sidebar tasks
        var handleQuickSidebarAlerts = function () {
            var wrapper = $('.page-quick-sidebar-wrapper');
            var initAlertsSlimScroll = function () {
                var alertList = wrapper.find('.page-quick-sidebar-alerts-list');
                var alertListHeight;
                alertListHeight = wrapper.height() - 80 - wrapper.find('.nav-justified > .nav-tabs').outerHeight();
                // alerts list 
                App.destroySlimScroll(alertList);
                alertList.attr("data-height", alertListHeight);
                App.initSlimScroll(alertList);
            };
            initAlertsSlimScroll();
            App.addResizeHandler(initAlertsSlimScroll); // reinitialize on window resize
        };
        // Handles quick sidebar settings
        var handleQuickSidebarSettings = function () {
            var wrapper = $('.page-quick-sidebar-wrapper');
            var initSettingsSlimScroll = function () {
                var settingsList = wrapper.find('.page-quick-sidebar-settings-list');
                var settingsListHeight;
                settingsListHeight = wrapper.height() - 80 - wrapper.find('.nav-justified > .nav-tabs').outerHeight();
                // alerts list 
                App.destroySlimScroll(settingsList);
                settingsList.attr("data-height", settingsListHeight);
                App.initSlimScroll(settingsList);
            };
            initSettingsSlimScroll();
            App.addResizeHandler(initSettingsSlimScroll); // reinitialize on window resize
        };
        return {
            init: function () {
                //layout handlers
                handleQuickSidebarToggler(); // handles quick sidebar's toggler
                handleQuickSidebarChat(); // handles quick sidebar's chats
                handleQuickSidebarAlerts(); // handles quick sidebar's alerts
                handleQuickSidebarSettings(); // handles quick sidebar's setting
            }
        };
    }();
    /*
     * quick-nav.js
     */
    var QuickNav = function () {

        return {
            init: function () {
                if ($('.quick-nav').length > 0) {
                    var stretchyNavs = $('.quick-nav');
                    stretchyNavs.each(function () {
                        var stretchyNav = $(this),
                            stretchyNavTrigger = stretchyNav.find('.quick-nav-trigger');
                        stretchyNavTrigger.on('click', function (event) {
                            event.preventDefault();
                            stretchyNav.toggleClass('nav-is-visible');
                        });
                    });
                    $(document).on('click', function (event) {
                        (!$(event.target).is('.quick-nav-trigger') && !$(event.target).is('.quick-nav-trigger span')) && stretchyNavs.removeClass('nav-is-visible');
                    });
                }
            }
        };
    }();

    var TemplateLayout = {
        init: function () {
            $(function () {
                App.init(); // init metronic core componets
                Layout.init(); // init metronic core componets
                QuickSidebar.init(); // init metronic core componets
            });
            QuickNav.init(); // init metronic core componets
        }
    };
    return TemplateLayout;
});