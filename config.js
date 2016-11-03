define({
    "title": "اتوماسیون تولید و پخش",
    "channel": "ایران‌کالا",
    "env": "dev",
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
        , "review": "metadata?categoryid=11"
    },
    "dependencies": [
        {
            "name": "jQuery",
            "version": "3.1.1",
            "folder": "vendor",
            "type": "min",
            "bundled": false,
            "map": true
        },
        {
            "name": "modernizr",
            "version": "2.8.3",
            "folder": "vendor",
            "type": "min",
            "bundled": true,
            "map": false
        },
        {
            "name": "respondJS",
            "version": "1.4.2",
            "folder": "vendor",
            "type": "min",
            "bundled": true,
            "map": false
        },
        {
            "name": "BackboneJS",
            "version": "1.3.3",
            "folder": "vendor",
            "type": "min",
            "bundled": false,
            "map": true
        },
        {
            "name": "requireJS",
            "version": "2.3.2",
            "folder": "vendor",
            "type": "min",
            "bundled": false,
            "map": false
        },
        {
            "name": "UnderscoreJS",
            "version": "1.8.3",
            "folder": "vendor",
            "type": "min",
            "bundled": false,
            "map": true
        },
        {
            "name": "Handlebars",
            "version": "4.0.5",
            "folder": "vendor",
            "type": "min",
            "bundled": false,
            "map": false
        },
        {
            "name": "MomentJS",
            "version": "2.15.1",
            "folder": "vendor",
            "type": "min",
            "bundled": false,
            "map": false
        },
        {
            "name": "MomentJS with Locales",
            "version": "2.15.1",
            "folder": "vendor",
            "type": "min",
            "bundled": false,
            "map": false
        }
    ]
});