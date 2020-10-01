define(['jquery', 'underscore', 'backbone', 'global', 'definitions'], function ($, _, Backbone, Global, DefinitionsModel) {
    window.Config = {
        "title": "اتوماسیون تولید و پخش اطلس",
        "version": "1.200920.0028",
        "loginMessage": "ورود به سامانه اتوماسیون شبکه قرآن",
        "channel": "قرآن",
        "channelLogo": "assets/data/qurantv.png",
        "storageKey": "automation" + '_' + window.location.host.replace(/\./g, '').split(":")[0],
        "siteUrl": "http://localhost",
        "vendorLink": "http://atlasms.ir",
        "vendorLinkEnabled": false,
        "env": "dev",
		hqVideoFormat: 'mxf',
        showDashboardWorkspaceInbox: false,
        showDashboardTasks: true,
        "placeholderImage": "/assets/img/placeholder.png",
        "transitionSpedd": 200,
        "notificationsInterval": 60000,
        "tickerInterval": 5000,
        "tickerUpdateInterval": 60000,
        "notificationsCount": 10,
        "schedulePageLimit": 100,
        "characterLimit": 130, 
        "wordLimit": 15,
		defaultEditorFontSize: 18,
        "defalutMediaListLimit": 25,
        "mediaScheduleGroupItems": 1,
        "loginMode": "default",
		mediaLinkTarget: '_self',
		assignUserAccess: 'all', // 'all' or 'access'
        groupsFilterId: 14, // 166: iktv or 14: qtv
		HDPlayback: false,
        newsTicker: false,
        // "initialRedirect": "/resources/media2",
        "epgMediaPath": "http://172.16.16.69/archive/list2.m3u8?c={channel}&start={start}&end={end}",
		minimumRequiredPersons: 1,
		inputPolicies: {
            'ingest.Title': {uid: 'title', required: true, show: true, validation: 'text', min: 4},
            'ingest.EpisodeNumber': {uid: 'episode', required: true, show: true, validation: 'text', min: 0},
            'ingest.Description': {uid: 'description', required: true, show: true, validation: 'text', min: 9},
            'ingest.Tags': {uid: 'tags', required: true, show: true, validation: 'select', min: 1},
            'ingest.Subjects': {uid: 'subjects', required: true, show: true, validation: 'select', min: 1},
            'ingest.SiteTitle': {uid: 'website_title', required: false, show: true, validation: 'text', min: 0},
            'ingest.SiteSummary': {uid: 'website_summary', required: false, show: true, validation: 'text', min: 0},
            'ingest.SiteDescr': {uid: 'website_desc', required: false, show: true, validation: 'text', min: 0},
			'ingest.AllowedBroadcastCount': {uid: 'allowed_broadcast_count', required: false, show: true, validation: 'text', min: 0},
            'ingest.AudioChannels': {uid: 'audio_channels', required: false, show: true, validation: 'text', min: 0},
            'ingest.RecommendedBroadcastDate': {uid: 'recommended_broadcast_date', required: false, show: true, validation: 'text', min: 0},
            'ingest.RecommendedSubtitleTime': {uid: 'recommended_subtitle_time', required: false, show: true, validation: 'text', min: 0},
            'ingest.ArchiveDescr': {uid: 'archive_description', required: false, show: true, validation: 'text', min: 0},
            'persons': {
                required: true, show: true, validation: 'text', min: 1, items: {
                    '1': {title: 'تهیه کننده', required: true},
                    '2': {title: 'کارگردان', required: false},
                    '3': {title: 'صدابردار', required: false},
                    '4': {title: 'تصویربردار', required: false},
                    '5': {title: 'تدوین گر', required: false},
                    '6': {title: 'مجری', required: false},
                    '7': {title: 'گزارشگر', required: false},
                    '8': {title: 'بازیگر', required: false},
                    '9': {title: 'گرافیست', required: false},
                    '10': {title: 'عکاس', required: false},
                    '11': {title: 'گوینده', required: false},
                    '12': {title: 'هماهنگی', required: false},
                    '13': {title: 'نویسنده', required: false},
                    '14': {title: 'دبیر مجری', required: false},
                    '15': {title: 'سردبیر', required: false},
                    '16': {title: 'دبیر زیرنویس', required: false},
                    '17': {title: 'تصویریاب', required: false},
                    '18': {title: 'آرشیو', required: false}
                }
            },
        },
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
        routes: {
            "/": {"private": true, "view": "dashboard.view", "action": "DashboardView", "file": "dashboard/dashboard.view"}
            , "dashboard": {"private": true, "view": "dashboard.view", "action": "DashboardView", "file": "dashboard/dashboard.view"}
            , "broadcast": {"private": true, "view": "broadcast.view", "action": "BroadcastView", "file": "app/broadcast/broadcast.view"}
            , "broadcast/schedule": {"private": true, "view": "broadcast.schedule.view", "action": "ScheduleView", "file": "app/broadcast/schedule/schedule.view"}
            , "broadcast/schedule2": {"private": true, "view": "broadcast.schedule2.view", "action": "ScheduleView2", "file": "app/broadcast/schedule/schedule2.view"}
            , "broadcast/prices": {"private": true, "view": "broadcast.prices.view", "action": "PricesView", "file": "app/broadcast/prices/prices.view"}
            , "broadcast/scheduleprint": {"private": false, "view": "broadcast.scheduleprint.view", "skipLayout": true, "action": "ScheduleView", "file": "app/broadcast/schedule/schedule.view"}
            , "broadcast/crawl": {"private": true, "view": "broadcast.crawl.view", "action": "CrawlView", "file": "app/broadcast/crawl/crawl.view"}
            , "broadcast/photos": {"private": true, "view": "broadcast.photos.view", "action": "BroadcastPhotosView", "file": "app/broadcast/photos/photos.view"}
            , "resources/ingest": {"private": true, "view": "resources.ingest.view", "action": "IngestView", "file": "app/resources/ingest/ingest.view"}
            , "resources/batchingest": {"private": true, "view": "resources.batchingest.view", "action": "BatchIngestView", "file": "app/resources/batchingest/batchingest.view"}
//            , "resources/shotlist": {"private": true, "view": "", "action": "ShotlistView", "file": "app/resources/shotlist/shotlist.view"}
            , "resources/shotlist": {"private": true, "view": "resources.shotlist.view", "action": "ShotlistView2", "file": "app/resources/shotlist/shotlist2.view"}
            , "resources/ottingest": {"private": true, "view": "resources.ottingest.view", "action": "OTTIngestView", "file": "app/resources/ingest/ottingest.view"}
            , "resources/epgdata": {"private": true, "view": "resources.epgdata.view", "action": "EPGDataView", "file": "app/resources/epgdata/epgdata.view"}
            , "resources/photos": {"private": true, "view": "resources.photos.view", "action": "PhotosView", "file": "app/resources/photos/photos.view"}
            , "resources/media": {"private": true, "view": "resources.media.view", "action": "MediaView", "file": "app/resources/media/media.view"}
            , "resources/media2": {"private": true, "view": "resources.media2.view", "action": "MediaView2", "file": "app/resources/media/media2.view"}
            , "resources/media2print": {"private": true, "view": "resources.media2print.view", "skipLayout": true, "action": "Media2PrintView", "file": "app/resources/media/media2print.view"}
            , "resources/mediaprint": {"private": true, "view": "resources.mediaprint.view", "skipLayout": true, "action": "MediaPrintView", "file": "app/resources/media/mediaprint.view"}
            , "resources/categories": {"private": true, "view": "resources.categories.view", "action": "CategoriesView", "file": "app/resources/categories/categories.view"}
            , "resources/review": {"private": true, "view": "resources.review.view", "action": "ReviewView", "file": "app/resources/review/review.view"}
            , "resources/returnees": {"private": true, "view": "resources.returnees.view", "action": "ReturneesView", "file": "app/resources/returnees/returnees.view"}
            , "resources/mediaitem": {"private": true, "view": "resources.mediaitem.view", "action": "MediaitemView", "file": "app/resources/mediaitem/mediaitem.view"}
            , "resources/broadcastprint": {"private": true, "view": "resources.broadcastprint.view", "skipLayout": true, "action": "BroadcastPrintView", "file": "app/resources/mediaitem/broadcastprint.view"}
            , "resources/persons": {"private": true, "view": "resources.persons.view", "skipLayout": false, "action": "PersonsView", "file": "app/resources/persons/persons.view"}
            , "resources/live": {"private": true, "view": "resources.live.view", "action": "LiveView", "file": "app/resources/live/live.view"}
            , "resources/editor": {"private": true, "view": "resources.editor.view", "action": "MediaEditorView", "file": "app/resources/editor/editor.view"}
            , "users": {"private": true, "view": "users.view", "action": "UsersView", "file": "app/users/users.view"}
            , "users/manage": {"private": true, "view": "users.manage.view", "action": "UsersManageView", "file": "app/users/manage.view"}
            , "user/messages": {"private": true, "view": "user.messages.view", "action": "InboxView", "file": "app/user/messages/inbox.view"}
            , "user/profile": {"private": true, "view": "user.profile.view", "action": "ProfileView", "file": "app/user/profile/profile.view"}
            , "user/notifications": {"private": true, "view": "user.notifications.view", "action": "NotificationsView", "file": "app/user/notifications/notifications.view"}
            , "user/acl": {"private": true, "view": "user.acl.view", "action": "UserACLView", "file": "app/user/acl/acl.view"}
			, "user/tasks": {"private": true, "view": "user.tasks.view", "action": "UserTasksView", "file": "app/user/tasks/tasks.view"}
            , "pr": {"private": true, "view": "pr.view", "action": "PRView", "file": "app/pr/pr.view"}
            , "pr/sms": {"private": true, "view": "pr.sms.view", "action": "PRSMSView", "file": "app/pr/sms/sms.view"}
            , "pr/recordings": {"private": true, "view": "pr.recordings.view", "action": "PRRecordingsView", "file": "app/pr/recordings/recordings.view"}
            , "basic/subjects": {"private": true, "view": "basic.subjects.view", "action": "SubjectsView", "file": "app/basic/subjects/subjects.view"}
            , "basic/tags": {"private": true, "view": "basic.tags.view", "action": "TagsView", "file": "app/basic/tags/tags.view"}
            , "monitoring/schedule": {"private": true, "view": "monitoring.schedule.view", "action": "MonitoringScheduleView", "file": "app/monitoring/schedule/schedule.view"}
            , "monitoring/schedulefiles": {"private": true, "view": "monitoring.schedulefiles.view", "action": "MonitoringScheduleFilesView", "file": "app/monitoring/schedulefiles/schedulefiles.view"}
            , "monitoring/schedulepdf": {"private": true, "view": "monitoring.schedulepdf.view", "action": "MonitoringSchedulePDFView", "file": "app/monitoring/schedulepdf/schedulepdf.view"}
            , "monitoring/ingest": {"private": true, "view": "monitoring.ingest.view", "action": "MonitoringIngestView", "file": "app/monitoring/ingest/ingest.view"}
            , "monitoring/playlist": {"private": true, "view": "monitoring.playlist.view", "action": "MonitoringPlaylistView", "file": "app/monitoring/playlist/playlist.view"}
            , "monitoring/ualogs": {"private": true, "view": "monitoring.ualogs.view", "action": "UserActivityLogsView", "file": "app/monitoring/ualogs/ualogs.view"}
            , "monitoring/prices": {"private": true, "view": "monitoring.prices.view", "action": "PricesLogsView", "file": "app/monitoring/prices/prices.view"}
            , "monitoring/crawl": {"private": true, "view": "monitoring.crawl.view", "action": "CrawlLogsView", "file": "app/monitoring/crawl/crawl.view"}
            , "stats/broadcast": {"private": true, "view": "stats.broadcast.view", "action": "StatsBroadcastView", "file": "app/stats/broadcast/broadcast.view"}
            , "stats/broadcastprint": {"private": true, "view": "stats.broadcastprint.view", "skipLayout": true, "action": "StatsBroadcastView", "file": "app/stats/broadcast/broadcast.view"}
            , "stats/crawl": {"private": true, "view": "stats.crawl.view", "action": "StatsCrawlView", "file": "app/stats/crawl/crawl.view"}
            , "stats/crawlprint": {"private": true, "view": "stats.crawlprint.view", "skipLayout": true, "action": "StatsCrawlPrintView", "file": "app/stats/crawl/crawlprint.view"}
            , "stats/ingest": {"private": true, "view": "stats.ingest.view", "action": "StatsIngestView", "file": "app/stats/ingest/ingest.view"}
            , "stats/ingestprint": {"private": true, "view": "stats.ingestprint.view", "skipLayout": true, "action": "StatsIngestView", "file": "app/stats/ingest/ingest.view"}
            , "stats/schedule": {"private": true, "view": "stats.schedule.view", "action": "StatsScheduleView", "file": "app/stats/schedule/schedule.view"}
            , "stats/scheduleprint": {"private": true, "view": "stats.scheduleprint.view", "skipLayout": true, "action": "StatsSchedulePrintView", "file": "app/stats/schedule/scheduleprint.view"}
            , "newsroom": {"private": true, "view": "newsroom.view", "action": "NewsroomView", "file": "app/newsroom/newsroom.view"}
            , "newsroom/news": {"private": true, "view": "newsroom.news.view", "action": "NewsroomNewsView", "file": "app/newsroom/news/news.view"}
            , "newsroom/workspace": {"private": true, "view": "newsroom.workspace.view", "action": "NewsroomWorkspaceView", "file": "app/newsroom/workspace/workspace.view"}
            , "newsroom/itemprint": {"private": true, "view": "newsroom.itemprint.view", "skipLayout": true, "action": "NewsroomItemPrintView", "file": "app/newsroom/item/itemprint.view"}
            , "newsroom/scheduleitemprint": {"private": true, "view": "newsroom.schedule.itemprint.view", "skipLayout": true, "action": "NewsroomScheduleItemPrintView", "file": "app/newsroom/schedule/schedule-itemprint.view"}
            , "newsroom/schedule": {"private": true, "view": "newsroom.schedule.view", "skipLayout": false, "action": "NewsroomScheduleView", "file": "app/newsroom/schedule/schedule.view"}
            , "newsroom/conductor": {"private": true, "view": "newsroom.schedule.view", "skipLayout": false, "action": "NewsroomScheduleView", "file": "app/newsroom/schedule/schedule.view"}
            , "website": {"private": true, "view": "website.view", "action": "WebsiteView", "file": "app/website/website.view"}
            , "website/dashboard": {"private": true, "view": "website.dashboard.view", "action": "WebsiteDashboardView", "file": "app/website/dashboard/dashboard.view"}
            , "website/items": {"private": true, "view": "website.items.view", "action": "WebsiteItemsView", "file": "app/website/items/items.view"}
            , "website/item": {"private": true, "view": "website.item.view", "action": "WebsiteItemView", "file": "app/website/item/item.view"}
            , "website/edit": {"private": true, "view": "website.edit.view", "action": "WebsiteItemEditView", "file": "app/website/item/edit.view"}
            , "website/stats": {"private": true, "view": "website.stats.view", "action": "WebsiteStatsView", "file": "app/website/stats/stats.view"}
            , "website/workspace": {"private": true, "view": "website.workspace.view", "action": "WebsiteWorkspaceView", "file": "app/website/workspace/workspace.view"}
        },
        positions: {
            wrapper: "body"
            , sidebar: "#sidebar"
            , main: "#main"
            , toolbar: "#toolbar"
            , status: "#status-items"
        },
        api: {
            url: (location.href.indexOf('localhost') !== -1) ? 'http://172.16.138.175/services/api/' : "/services/api/"
//            url": "http://46.225.139.98:8080/api/"
            , login: "login"
            , schedule: "conductor"
            , crawl: "crawl"
            , crawlRep: "crawlRep"
            , tree: "metacategories"
            , newsTree: "nws/conductor/tree"
            , ingest: "ingest"
            , metadata: "metadata"
            , media: "media"
            , media2: "media/list2"
            , mediaversions: "media/history"
            , versionsbypid: "media/historybypid"
//            , "review": "metadata?categoryid=11"
            , definitions: "dfn"
            , comments: "comments"
            , users: "accounts"
            , acl: "accounts/access"
            , sms: "pr/sms"
            , lantv: "share/lantv/"
            , hsm: "hsm"
            , social: "social"
            , newsroom: "newssource"
            , newsSchedule: "nws/conductor"
            , newsScheduleState: "nws/conductorstate"
            , tags: "share/tags/"
            , subjects: "share/subjects"
            , shotlist: "shotlist"
            , economy: "economy"
            , broadcastphotos: "conductormedia"
            , persons: "share/persons"
            , mediapersons: "metadata/person"
            , dashboardSystem: "share/dashboard/system"
            , dashboardUser: "share/dashboard/user"
			, tasks: 'task'
            , website: 'https://services.iktv.ir/pl/'
			, checkInfo: 'media/checkinfo'
        },
        channels: {
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
        mediaOptions: [
            {text: "تغییر وضعیت", access: 4, source: "dfn", items: 2, task: null, value: null},
            {
                text: "گزینه تستی", access: 8388608, icon: 'github', color: 'warning', items: [
                    {text: "فرزند 1", task: 'test', value: '1', icon: 'twitter'},
                    {text: "فرزند 2", task: 'test', value: '2'}
                ]
            }
        ],
        temp: {
            titleTypes: {
                Key: "titletypes", Value: "subtitle_type", Children: [
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
