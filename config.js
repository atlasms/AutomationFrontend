define(['jquery', 'underscore', 'backbone', 'global', 'definitions'], function ($, _, Backbone, Global, DefinitionsModel) {
    /*
     * Check localStorage for any pre-processed and cached configurations
     */
    /*
     * Use following configurations
     */
    window.Config = {
        "title": "اتوماسیون تولید و پخش",
        "channel": "ایران‌کالا",
        "siteUrl": "http://localhost",
        "env": "dev",
        "placeholderImage": "/assets/img/placeholder.png",
        "settings": {
            "datepicker": {
                "format": 'YYYY-MM-DD'
                , "autoClose": true
                , "observer": true
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
            , "resources/ingest": {"private": true, "access": null, "action": "IngestView", "file": "app/resources/ingest/ingest.view"}
            , "resources/metadata": {"private": true, "access": null, "action": "MetadataView", "file": "app/resources/metadata/metadata.view"}
            , "resources/categories": {"private": true, "access": null, "action": "CategoriesView", "file": "app/resources/categories/categories.view"}
            , "resources/review": {"private": true, "access": null, "action": "ReviewView", "file": "app/resources/review/review.view"}
        },
        "positions": {
            "wrapper": "body"
            , "main": "#main"
            , "toolbar": "#toolbar"
            , "status": "#status-items"
        },
        "api": {
            "url": "http://93.190.24.246:81/api/"
            , "login": "http://93.190.24.246:81/token"
            , "schedule": "conductor"
            , "tree": "metacategories"
            , "storagefiles": "storagefiles"
            , "metadata": "metadata"
//            , "review": "metadata?categoryid=11"
            , "definitions": "dfn"
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
            for (var prop in Config)
                delete items[prop];
//            var items = $.map(items, function (value, index) {
//                return [value];
//            });
            Config.definitions = items.Children;
        }
    });

    return Config;
});