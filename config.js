define({
    "title": "اتوماسیون تولید و پخش",
    "env": "dev",
    "settings": {
        "datepicker": {
            "format": 'YYYY-MM-DD hh:mm:ss'
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
    "routes": [
        {"path": "broadcast", "action": "BroadcastView", "file": "app/broadcast/broadcast.view.js"}
        , {"path": "broadcast/schedule", "action": "ScheduleView", "file": "app/broadcast/schedule/schedule.view.js"}
    ],
    "positions": {
        "wrapper": "body"
        , "main": "#main"
        , "toolbar": "#toolbar"
    },
    "api": {
        "url": "http://93.190.24.246:81/api/"
        , "login": "http://93.190.24.246:81/token"
        , "schedule": "conductor"
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