define(['jquery', 'underscore', 'backbone', 'global', 'definitions'], function ($, _, Backbone, Global, DefinitionsModel) {
    /*
     * Check localStorage for any pre-processed and cached configurations
     */
    // TODO
    /*
     * Use following configurations
     */
    window.Config = {
        "title": "اتوماسیون تولید و پخش",
        "channel": "ایران‌کالا",
        "storageKey": "automation" + '_' + window.location.host.replace(/\./g, '').split(":")[0],
        "siteUrl": "http://localhost",
        "env": "dev",
        "placeholderImage": "/assets/img/placeholder.png",
        "transitionSpedd": 200,
        "notificationsInterval": 10000,
        "settings": {
            "datepicker": {
                "format": 'YYYY-MM-DD'
                , "autoClose": true
                , "observer": true
                , "persianDigit": false
                , "navigator": {
                    "enabled": true
                    , "text": {
                        "btnNextText": ">"
                        , "btnPrevText": "<"
                    }
                }
            }
        },
        "routes": {
            "/": {"private": true, "access": null, "action": "DashboardView", "file": "dashboard/dashboard.view"}
            , "broadcast": {"private": true, "access": null, "action": "BroadcastView", "file": "app/broadcast/broadcast.view"}
            , "broadcast/schedule": {"private": true, "access": null, "action": "ScheduleView", "file": "app/broadcast/schedule/schedule.view"}
            , "broadcast/scheduleprint": {"private": false, "access": null, "skipLayout": true, "action": "ScheduleView", "file": "app/broadcast/schedule/schedule.view"}
            , "broadcast/crawl": {"private": true, "access": null, "action": "CrawlView", "file": "app/broadcast/crawl/crawl.view"}
            , "resources/ingest": {"private": true, "access": null, "action": "IngestView", "file": "app/resources/ingest/ingest.view"}
            , "resources/metadata": {"private": true, "access": null, "action": "MetadataView", "file": "app/resources/metadata/metadata.view"}
            , "resources/categories": {"private": true, "access": null, "action": "CategoriesView", "file": "app/resources/categories/categories.view"}
            , "resources/review": {"private": true, "access": null, "action": "ReviewView", "file": "app/resources/review/review.view"}
            , "resources/returnees": {"private": true, "access": null, "action": "ReturneesView", "file": "app/resources/returnees/returnees.view"}
            , "resources/mediaitem": {"private": true, "access": null, "action": "MediaitemView", "file": "app/resources/mediaitem/mediaitem.view"}
            , "resources/live": {"private": true, "access": null, "action": "LiveView", "file": "app/resources/live/live.view"}
            , "users": {"private": true, "access": null, "action": "UsersView", "file": "app/users/users.view"}
            , "users/manage": {"private": true, "access": null, "action": "UsersManageView", "file": "app/users/manage.view"}
            , "user/messages": {"private": true, "access": null, "action": "InboxView", "file": "app/user/messages/inbox.view"}
            , "user/notifications": {"private": true, "access": null, "action": "NotificationsView", "file": "app/user/notifications/notifications.view"}
        },
        "positions": {
            "wrapper": "body"
            , "sidebar": "#sidebar"
            , "main": "#main"
            , "toolbar": "#toolbar"
            , "status": "#status-items"
        },
        "api": {
            "url": "http://au.iktv.ir:8080/api/"
            , "login": "login"
            , "schedule": "conductor"
            , "crawl": "conductor"
            , "tree": "metacategories"
            , "storagefiles": "storagefiles"
            , "metadata": "metadata"
            , "mediaversions": "metadata/history"
//            , "review": "metadata?categoryid=11"
            , "definitions": "dfn"
            , "comments": "comments"
            , "users": "accounts"
        },
        "temp": {
            "titleTypes": {Key: "titletypes", Value: "subtitle_type", Children: [
                    {Id: "2", Key: "دو خطی", Value: "2"},
                    {Id: "1", Key: "تک خط", Value: "1"},
                    {Id: "3", Key: "سه خطی", Value: "3"}
                ]
            }
        }
    };

    /*
     * Adding server-side definition params to main Config object
     */
    var model = new DefinitionsModel(Config);
    model.fetch({
        async: false
        , success: function (items) {
            items = items.toJSON();
            Config.definitions = items.Children;
        }
    });

    return Config;
});