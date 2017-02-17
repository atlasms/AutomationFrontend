define(["jquery", "underscore", "backbone", "login.view", 'template', 'config', 'global', "layout", "user.helper", "notifications"
], function ($, _, Backbone, Login, Template, Config, Global, Layout, UserHelper, Notifications) {
    var Router = Backbone.Router.extend({
        routes: {
            'login': 'Login'
            , '*actions': 'app' // Other routes
        }
        , Login: function () {
            var loginView = new Login();
            loginView.render();
        }
        , map: Config.routes
        , current: function () {
            var Router = this,
                    fragment = Backbone.history.fragment,
                    routes = _.pairs(Router.routes),
                    route = null, params = null, matched;

            matched = _.find(routes, function (handler) {
                route = _.isRegExp(handler[0]) ? handler[0] : Router._routeToRegExp(handler[0]);
                return route.test(fragment);
            });

            if (matched) {
                // NEW: Extracts the params using the internal
                // function _extractParameters 
                params = Router._extractParameters(route, fragment);
                route = matched[1];
            }

            return {
                route: route,
                fragment: fragment,
                params: params
            };
        }
        , initialize: function (user) {
            var self = this;
            var map = self.map;
            // TODO: make routig more dynamic by supporting url parameters, ids, etc.
            self.on("route:app", function (actions) {
                actions = (actions === null) ? "/" : actions;
                // Sanitization of actions
                var appAction = actions.replace(/\/+/g, '/').split('/').slice(0, 2).join('/').replace(/\/+$/, '');
                appAction = (appAction === '') ? '/' : appAction;
                if (typeof map[appAction] === "undefined") { /// show 404
                    this.throwNotFound();
                    return false;
                }
                if (UserHelper.authorize(appAction, map)) { // Page needs access, redirecting to login page
                    if (typeof map[appAction].skipLayout !== "undefined" && map[appAction].skipLayout === true) { // Page doesn't need master layout
                        if (/print$/.test(appAction))
                            $("head link").length && $("head link").remove();
                        self.loadLayout(appAction, true);
                    } else { // Normal Routing
                        self.loadLayout(appAction);
                    }
                } else {
                    this.throwForbidden();
                }
            });
            $(document).on("click", 'a[href^="/"]:not([target="_blank"])', function (evt) {
                var href = {prop: $(this).prop("href"), attr: $(this).attr("href")};
                var root = location.protocol + "//" + location.host + Backbone.history.options.root;

                if (href.prop && href.prop.slice(0, root.length) === root) {
                    evt.preventDefault();
                    Backbone.history.navigate(href.attr, true);
                }
            });
            Backbone.history.start({pushState: true});
        }
        , getMenu: function () {
            return $.ajax({url: '/assets/js/app/menu.json'});
        }
        , loadLayout: function (actions, clean) {
            var self = this;
            if (typeof clean !== "undefined" && clean === true) {
                self.loadPage(actions);
                return;
            }
            if ($("body").hasClass("has-master-layout")) {
                self.loadPage(actions);
                Layout.init();
                return;
            }
            $("body").addClass("has-master-layout page-container-bg-solid page-sidebar-closed-hide-logo page-footer-fixed page-header-fixed-mobile");
            var template = Template.template.load('', 'app');
            var user = UserHelper.getUser();
            this.getMenu().done(function (rawMenu) {
                Global.Cache.saveMenu(rawMenu);
                var menu = self.prepareMenu(rawMenu);
                ///
                template.done(function (data) {
                    var handlebarsTemplate = Template.handlebars.compile($(data).wrap('<p/>').parent().html());
                    var output = handlebarsTemplate(user);
                    $(Config.positions.wrapper).html(output);
                    self.loadMenu(menu);
                    self.loadPage(actions);
                    // Initialize Layout helpers
                    Layout.init();

                    // TODO: to replace current method with socket.io
                    new Notifications(user);
                });
            });
        }
        , prepareMenu: function (data) {
            data = $.grep(data, function (item, i) {
                if (!UserHelper.Authorize('menu', item.alias))
                    return false;
                return true;
            });
            $.each(data, function () {
                if (this.items.length) {
                    this.items = $.grep(this.items, function (item) {
                        if (!UserHelper.Authorize('menu', item.alias))
                            return false;
                        return true;
                    });
                }
            });
            return data;
        }
        , loadPage: function (actions) {
            var self = this;
            if (typeof actions === "undefined" || actions === 404) {
                self.throwNotFound();
                return false;
            }
            // Cleaning up last view
//            self.view && (self.view.close ? self.view.close() : self.view.remove());
            self.view && self.view.close();

            var request = (actions === '' || actions === '/') ? 'dashboard.view' : (actions.replace(/\$/, '') + '.view').replace(/\//g, '.');
            requirejs([request], function (View) {

                // Instantiating new view
                if (typeof View === "undefined") {
                    self.throwError(undefined, Config.positions.main);
                    return false;
                }
                var view = new View({actions: actions});
                self.view = view;

                var content = (typeof view.prepareContent !== "undefined") ? view.prepareContent() : null;
                self.loadContents(view, content);

                // Setting active menu
                var $sidebarMenu = $(Config.positions.sidebar).find("ul:first");
                $sidebarMenu.find("li").removeClass("active open");
                $sidebarMenu.find('a[href="/' + actions + '"]').parents("li").addClass("active open");
            });
        }
        , loadMenu: function (menu) {
            var template = Template.template.load('shared', 'menu');
            template.done(function (tmpl) {
                var handlebarsTemplate = Template.handlebars.compile($(tmpl).wrap('<p/>').parent().html());
                var output = handlebarsTemplate(menu);
                $(Config.positions.sidebar).html(output);
            });
        }
        , loadContents: function (view, content, actionArray) {
            // Render view
            view.render(content, actionArray);
            return this;
        }
        , throwNotFound: function (message) {
            var message = typeof message !== "undefined" ? message : 'متاسفانه صفحه مورد نظر شما وجود ندارد.';
            $("body").attr('class', 'page-404-full-page');
            $(Config.positions.wrapper).html('<div class="page-404"><div class="number font-red"> 404 </div><div class="details"><h3>پیدا نشد!</h3><p>' + message + '<br><a href="/"> بازگشت به داشبورد </a></p></div></div></div>');
        }
        , throwForbidden: function (message) {
            var message = typeof message !== "undefined" ? message : 'شما دسترسی مشاهده این صفحه را ندارید';
            $("body").attr('class', 'page-500-full-page');
            $(Config.positions.wrapper).html('<div class="page-500"><div class="number font-red"> 403 </div><div class="details"><h3>عدم دسترسی!</h3><p>' + message + '<br><a href="/"> بازگشت به داشبورد </a></p></div></div></div>');
        }
        , throwError: function (message, position) {
            var message = typeof message !== "undefined" ? message : 'مشکلی پیش آمده است';
            var position = typeof position === "undefined" ? Config.positions.wrapper : position;
            if (position === Config.positions.wrapper)
                $("body").attr('class', 'page-500-full-page');
            $(position).html('<div class="page-500"><div class="number font-red"> 500 </div><div class="details"><h3>خطا در درخواست!</h3><p>' + message + '<br></p></div></div></div>');
        }
    });

    return Router;
});