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
        "loginMessage": "ورود به سامانه اتوماسیون",
        "channel": "ایران‌کالا",
        "storageKey": "automation" + '_' + window.location.host.replace(/\./g, '').split(":")[0],
        "siteUrl": "http://localhost",
        "env": "dev",
        "placeholderImage": "/assets/img/placeholder.png",
        "transitionSpedd": 200,
        "notificationsInterval": 60000,
        "tickerInterval": 5000,
        "tickerUpdateInterval": 60000,
        "notificationsCount": 10,
        "schedulePageLimit": 100,
        "characterLimit": 130, 
        "wordLimit": 15,
        "defalutMediaListLimit": 25,
        "mediaScheduleGroupItems": 1,
        "loginMode": "default",
        "initialRedirect": "/resources/media2",
        "epgMediaPath": "http://172.16.16.69/archive/list2.m3u8?c={channel}&start={start}&end={end}",
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
            },
            "bootstrapTable": {
                icons: {
                    paginationSwitchDown: 'fa fa-arrow-down',
                    paginationSwitchUp: 'fa fa-arrow-up',
                    refresh: 'fa fa-refresh',
                    toggle: 'fa fa-list',
                    columns: 'fa fa-th',
                    detailOpen: 'fa fa-plus',
                    detailClose: 'fa fa-minus'
                }
                , pagination: true
                , pageSize: 50
                , search: true
                , showPaginationSwitch: true
                , locale: 'fa-IR'
            },
            "bootpag": {
                leaps: true,
                firstLastUse: true,
                first: '→',
                last: '←',
                wrapClass: 'pagination',
                activeClass: 'active',
                disabledClass: 'disabled',
                nextClass: 'next',
                prevClass: 'prev',
                lastClass: 'last',
                firstClass: 'first'
            },
            "cropper": {
                aspectRatio: 16 / 9
                , movable: false
                , rotatable: false
                , scalable: false
                , zoomable: false
                , checkCrossOrigin: false
                , data: {
                    width: 1024
                    , height: 576
                    , x: 0
                    , y: 0
                }
                , crop: function (e) {
                    $("#crop-x").length && $("#crop-x").val(Math.round(e.x));
                    $("#crop-y").length && $("#crop-y").val(Math.round(e.y));
                    $("#crop-width").length && $("#crop-width").val(Math.round(e.width));
                    $("#crop-height").length && $("#crop-height").val(Math.round(e.height));
                }
            },
            "crawlEditor": {
                colorsEnabled: false,
                stylesEnabled: false
            }
        },
        "routes": {
            "/": {"private": true, "access": null, "action": "DashboardView", "file": "dashboard/dashboard.view"}
            , "broadcast": {"private": true, "access": null, "action": "BroadcastView", "file": "app/broadcast/broadcast.view"}
            , "broadcast/schedule": {"private": true, "access": null, "action": "ScheduleView", "file": "app/broadcast/schedule/schedule.view"}
            , "broadcast/schedule2": {"private": true, "access": null, "action": "ScheduleView2", "file": "app/broadcast/schedule/schedule2.view"}
            , "broadcast/prices": {"private": true, "access": null, "action": "PricesView", "file": "app/broadcast/prices/prices.view"}
            , "broadcast/scheduleprint": {"private": false, "access": null, "skipLayout": true, "action": "ScheduleView", "file": "app/broadcast/schedule/schedule.view"}
            , "broadcast/crawl": {"private": true, "access": null, "action": "CrawlView", "file": "app/broadcast/crawl/crawl.view"}
            , "broadcast/photos": {"private": true, "access": null, "action": "BroadcastPhotosView", "file": "app/broadcast/photos/photos.view"}
            , "resources/ingest": {"private": true, "access": null, "action": "IngestView", "file": "app/resources/ingest/ingest.view"}
            , "resources/batchingest": {"private": true, "access": null, "action": "BatchIngestView", "file": "app/resources/batchingest/batchingest.view"}
//            , "resources/shotlist": {"private": true, "access": null, "action": "ShotlistView", "file": "app/resources/shotlist/shotlist.view"}
            , "resources/shotlist": {"private": true, "access": null, "action": "ShotlistView2", "file": "app/resources/shotlist/shotlist2.view"}
            , "resources/ottingest": {"private": true, "access": null, "action": "OTTIngestView", "file": "app/resources/ingest/ottingest.view"}
            , "resources/epgdata": {"private": true, "access": null, "action": "EPGDataView", "file": "app/resources/epgdata/epgdata.view"}
            , "resources/photos": {"private": true, "access": null, "action": "PhotosView", "file": "app/resources/photos/photos.view"}
            , "resources/media": {"private": true, "access": null, "action": "MediaView", "file": "app/resources/media/media.view"}
            , "resources/media2": {"private": true, "access": null, "action": "MediaView2", "file": "app/resources/media/media2.view"}
            , "resources/media2print": {"private": true, "access": null, "skipLayout": true, "action": "Media2PrintView", "file": "app/resources/media/media2print.view"}
            , "resources/mediaprint": {"private": true, "access": null, "skipLayout": true, "action": "MediaPrintView", "file": "app/resources/media/mediaprint.view"}
            , "resources/categories": {"private": true, "access": null, "action": "CategoriesView", "file": "app/resources/categories/categories.view"}
            , "resources/review": {"private": true, "access": null, "action": "ReviewView", "file": "app/resources/review/review.view"}
            , "resources/returnees": {"private": true, "access": null, "action": "ReturneesView", "file": "app/resources/returnees/returnees.view"}
            , "resources/mediaitem": {"private": true, "access": null, "action": "MediaitemView", "file": "app/resources/mediaitem/mediaitem.view"}
            , "resources/broadcastprint": {"private": true, "access": null, "skipLayout": true, "action": "BroadcastprintView", "file": "app/resources/mediaitem/broadcastprint.view"}
            , "resources/persons": {"private": true, "access": null, "skipLayout": false, "action": "PersonsView", "file": "app/resources/persons/persons.view"}
            , "resources/live": {"private": true, "access": null, "action": "LiveView", "file": "app/resources/live/live.view"}
            , "resources/editor": {"private": true, "access": null, "action": "MediaEditorView", "file": "app/resources/editor/editor.view"}
            , "users": {"private": true, "access": null, "action": "UsersView", "file": "app/users/users.view"}
            , "users/manage": {"private": true, "access": null, "action": "UsersManageView", "file": "app/users/manage.view"}
            , "user/messages": {"private": true, "access": null, "action": "InboxView", "file": "app/user/messages/inbox.view"}
            , "user/profile": {"private": true, "access": null, "action": "ProfileView", "file": "app/user/profile/profile.view"}
            , "user/notifications": {"private": true, "access": null, "action": "NotificationsView", "file": "app/user/notifications/notifications.view"}
            , "user/acl": {"private": true, "access": null, "action": "UserACLView", "file": "app/user/acl/acl.view"}
            , "pr": {"private": true, "access": null, "action": "PRView", "file": "app/pr/pr.view"}
            , "pr/sms": {"private": true, "access": null, "action": "PRSMSView", "file": "app/pr/sms/sms.view"}
            , "pr/recordings": {"private": true, "access": null, "action": "PRRecordingsView", "file": "app/pr/recordings/recordings.view"}
            , "basic/subjects": {"private": true, "access": null, "action": "SubjectsView", "file": "app/basic/subjects/subjects.view"}
            , "basic/tags": {"private": true, "access": null, "action": "TagsView", "file": "app/basic/tags/tags.view"}
            , "monitoring/schedule": {"private": true, "access": null, "action": "MonitoringScheduleView", "file": "app/monitoring/schedule/schedule.view"}
            , "monitoring/schedulefiles": {"private": true, "access": null, "action": "MonitoringScheduleFilesView", "file": "app/monitoring/schedulefiles/schedulefiles.view"}
            , "monitoring/schedulepdf": {"private": true, "access": null, "action": "MonitoringSchedulePDFView", "file": "app/monitoring/schedulepdf/schedulepdf.view"}
            , "monitoring/ingest": {"private": true, "access": null, "action": "MonitoringIngestView", "file": "app/monitoring/ingest/ingest.view"}
            , "monitoring/playlist": {"private": true, "access": null, "action": "MonitoringPlaylistView", "file": "app/monitoring/playlist/playlist.view"}
            , "monitoring/ualogs": {"private": true, "access": null, "action": "UserActivityLogsView", "file": "app/monitoring/ualogs/ualogs.view"}
            , "monitoring/prices": {"private": true, "access": null, "action": "PricesLogsView", "file": "app/monitoring/prices/prices.view"}
            , "monitoring/crawl": {"private": true, "access": null, "action": "CrawlLogsView", "file": "app/monitoring/crawl/crawl.view"}
            , "stats/broadcast": {"private": true, "access": null, "action": "StatsBroadcastView", "file": "app/stats/broadcast/broadcast.view"}
            , "stats/broadcastprint": {"private": true, "access": null, "skipLayout": true, "action": "StatsBroadcastView", "file": "app/stats/broadcast/broadcast.view"}
            , "stats/ingest": {"private": true, "access": null, "action": "StatsIngestView", "file": "app/stats/ingest/ingest.view"}
            , "stats/ingestprint": {"private": true, "access": null, "skipLayout": true, "action": "StatsIngestView", "file": "app/stats/ingest/ingest.view"}
            , "stats/schedule": {"private": true, "access": null, "action": "StatsScheduleView", "file": "app/stats/schedule/schedule.view"}
            , "stats/scheduleprint": {"private": true, "access": null, "skipLayout": true, "action": "StatsSchedulePrintView", "file": "app/stats/schedule/scheduleprint.view"}
            , "newsroom": {"private": true, "access": null, "action": "NewsroomView", "file": "app/newsroom/newsroom.view"}
            , "newsroom/news": {"private": true, "access": null, "action": "NewsroomNewsView", "file": "app/newsroom/news/news.view"}
            , "newsroom/workspace": {"private": true, "access": null, "action": "NewsroomWorkspaceView", "file": "app/newsroom/workspace/workspace.view"}
            , "newsroom/itemprint": {"private": true, "access": null, "skipLayout": true, "action": "NewsroomItemPrintView", "file": "app/newsroom/item/itemprint.view"}
        },
        "positions": {
            "wrapper": "body"
            , "sidebar": "#sidebar"
            , "main": "#main"
            , "toolbar": "#toolbar"
            , "status": "#status-items"
        },
        "api": {
            "url": (location.href.indexOf('localhost') !== -1) ? 'http://au.iktv.ir/services/api/' : "/services/api/"
//            "url": "http://46.225.139.98:8080/api/"
            , "login": "login"
            , "schedule": "conductor"
            , "crawl": "crawl"
            , "crawlRep": "crawlRep"
            , "tree": "metacategories"
            , "ingest": "ingest"
            , "metadata": "metadata"
            , "media": "media"
            , "media2": "media/list2"
            , "mediaversions": "media/history"
            , "versionsbypid": "media/historybypid"
//            , "review": "metadata?categoryid=11"
            , "definitions": "dfn"
            , "comments": "comments"
            , "users": "accounts"
            , "acl": "accounts/access"
            , "sms": "pr/sms"
            , "lantv": "share/lantv/"
            , "hsm": "hsm"
            , "social": "social"
            , "newsroom": "newssource"
            , "tags": "share/tags/"
            , "subjects": "share/subjects"
            , "shotlist": "shotlist"
            , "economy": "economy"
            , "broadcastphotos": "conductormedia"
            , "persons": "share/persons"
            , "mediapersons": "metadata/person"
        },
        "channels": {
            'tv1': {
                title: 'یک',
                id: 'tv1'
            },
            'tv2': {
                title: 'دو',
                id: 'tv2'
            },
            'tv3': {
                title: 'سه',
                id: 'tv3'
            },
            'tv4': {
                title: 'چهار',
                id: 'tv4'
            },
            'tehran': {
                title: 'تهران',
                id: 'tehran'
            },
//        'irinn': {
//            title: 'خبر',
//            id: 'irinn'
//        },
            'ofogh': {
                title: 'افق',
                id: 'ofogh'
            },
            'quran': {
                title: 'قرآن',
                id: 'quran'
            },
            'pooya': {
                title: 'پویا',
                id: 'pooya'
            },
            'omid': {
                title: 'امید',
                id: 'omid'
            },
            'namayesh': {
                title: 'نمایش',
                id: 'namayesh'
            },
            'tamasha': {
                title: 'تماشا',
                id: 'tamasha'
            },
            'doctv': {
                title: 'مستند',
                id: 'mostanad'
            },
            'amouzesh': {
                title: 'آموزش',
                id: 'amouzesh'
            },
            'salamat': {
                title: 'سلامت',
                id: 'salamat'
            },
            'varzesh': {
                title: 'ورزش',
                id: 'varzesh'
            },
            'nasim': {
                title: 'نسیم',
                id: 'nasim'
            }
        },
        "mediaOptions": [
            {text: "تغییر وضعیت", access: 4, source: "dfn", items: 2, task: null, value: null},
            {text: "گزینه تستی", access: 8388608, icon: 'github', color: 'warning', items: [
                {text: "فرزند 1", task: 'test', value: '1', icon: 'twitter'},
                {text: "فرزند 2", task: 'test', value: '2'}
            ]}
        ],
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