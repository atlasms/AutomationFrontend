require.config({
    waitSeconds: 300,
    shim: {
        enforceDefine: true
        , "underscore": {exports: "_"}
        , "backbone": {deps: ["underscore", "jquery", "handlebars"], exports: "Backbone"}
        , "moment": {deps: ["jquery"], exports: "moment"}
        , "moment-hijri": {deps: ["jquery", "moment", "moment-with-locales"], exports: "moment"}
        , "cookie": {deps: ["jquery"], exports: "Cookies"}
        , "mask": {deps: ["jquery"], exports: "mask"}
        , "toastr": {deps: ["jquery"], exports: "toastr"}
        , "pdate": {deps: ["jquery"], exports: "pdate"}
        , "pdatepicker": {deps: ["jquery", "pdate"], exports: "pdatepicker"}
        , "bootstrap/affix": {deps: ["jquery"], exports: "$.fn.affix"}
        , "bootstrap/alert": {deps: ["jquery"], exports: "$.fn.alert"}
        , "bootstrap/button": {deps: ["jquery"], exports: "$.fn.button"}
        , "bootstrap/collapse": {deps: ["jquery"], exports: "$.fn.collapse"}
        , "bootstrap/dropdown": {deps: ["jquery"], exports: "$.fn.dropdown"}
        , "bootstrap/modal": {deps: ["jquery"], exports: "$.fn.modal"}
        , "bootstrap/scrollspy": {deps: ["jquery"], exports: "$.fn.scrollspy"}
        , "bootstrap/tab": {deps: ["jquery"], exports: "$.fn.tab"}
        , "bootstrap/tooltip": {deps: ["jquery"], exports: "$.fn.tooltip"}
        , "bootstrap/popover": {deps: ["jquery", "bootstrap/tooltip"], exports: "$.fn.popover"}
        , "bootstrap/transition": {deps: ["jquery"], exports: "$.fn.transition"}
        , "bootstrap-table": {deps: ["jquery"], exports: "$.fn.bootstrapTable"}
        , "x-editable": {deps: ["jquery", "bootstrap/tooltip", "bootstrap/popover"], exports: "jQuery"}
        , "hotkeys": {deps: ["jquery"], exports: "jQuery"}
        , "jwplayer": {exports: "jwplayer"}
        , "flowplayer": {exports: "flowplayer"}
        , "ladda": {deps: ["spin"]}
        , "wysihtml5": {deps: ["jquery", "vendor/wysihtml5-0.3.0"], exports: "jQuery"}
        , "cropper": {deps: ["jquery"]}
        , "pace": {deps: ["jquery"]}
        , "bootpag": {deps: ["jquery"]}
        , "waypoints": {deps: ["jquery"]}
        , "counterup2": {deps: ["waypoints"]}
//        , "select2": {deps: ["jquery", "vendor/select2.i18n.fa"], exports: "jQuery"}
    }
    , urlArgs: "_=" + (new Date()).getTime()
    , paths: {
        // Library Dependencies
        jquery: ["vendor/jquery-3.1.1.min"]
        , "jquery-ui": ["vendor/jquery-ui.min"]
        , "underscore": ["vendor/underscore-min"]
        , "backbone": ["vendor/backbone-min"]
        , "handlebars": ["vendor/handlebars-v4.0.11"]
        , "moment": ["vendor/moment.min"]
        , "moment-with-locales": ["vendor/moment-with-locales.min"]
        , "moment-hijri": ["vendor/moment-hijri"]
        , "bootstrap": ["vendor/bootstrap"]
        , "toastr": ["vendor/toastr.min"]
        , "pdate": ["vendor/persian-date"]
        , "pdatepicker": ["vendor/persian-datepicker-0.4.5.min"]
        , "jdate": ["vendor/jdate.min"]
        , "mousetrap": ["vendor/mousetrap.min"]
        , "hotkeys": ["vendor/jquery.hotkeys"]
        , "jstree": ["vendor/jstree.min"]
        , "tus": ["vendor/tus"]
        , "jwplayer": ["vendor/jwplayer/jwplayer"]
        , "flowplayer": ["vendor/flowplayer/flowplayer.min"]
        , "hlsjs": ["vendor/flowplayer/flowplayer.hlsjs.min"]
        , "bootbox": ["vendor/bootbox.min"]
        , "spin": ["vendor/spin.min"]
        , "ladda": ["vendor/ladda.min"]
        , "x-editable": ["vendor/bootstrap-editable.min"]
        , "wysihtml5": ["vendor/bootstrap-wysihtml5"]
        , "select2": ["vendor/select2.full.min"]
        , "cropper": ["vendor/cropper.min"]
        , "notifications": ["helpers/notifications"]
        , "tasks": ["helpers/tasks"]
        , "ticker": ["helpers/ticker"]
        , "bootstrap-table": ["vendor/bootstrap-table.min"]
        , "pace": ["vendor/pace.min"]
        , "clusterize": ["vendor/clusterize.min"]
        , "typeahead": ["vendor/typeahead.jquery"]
        , "bloodhound": ["vendor/bloodhound.min"]
        , "bootpag": ["vendor/jquery.bootpag.min"]
        , "rangeslider": ["vendor/ion.rangeslider/js/ion.rangeSlider.min"]
        , "waypoints": ["vendor/waypoints.min"]
        , "counterup2": ["vendor/jquery.counterup2.min"]
        , "count-to": ["vendor/jquery.countTo"]
        , "easy-pie-chart": ["vendor/jquery.easypiechart.min"]
        , "axios": ["vendor/axios/axios.min"]
        , "file-download": ["vendor/file-download"]
        , "persian-rex": ["vendor/persian-rex/persian-rex.min"]

        // Static files
        , "menu": ["json!../../app/menu"]

        // Application Dependencies
//        , "app": ["app/app"]
        , "router": ["app/router"]

        // Config
        , "defines": ["app/defines"]
        , "config": ["../../config"]

        , "website.service": ["../../app/website/website.service"]

        // Models
        , "dashboard.model": ["../../app/dashboard/dashboard.model"]
        , "user": ["../../app/user/user.model"]
        , "definitions": ["../../app/shared/definitions.model"]
        , "broadcast.model": ["../../app/broadcast/broadcast.model"]
        , "broadcast.schedule.model": ["../../app/broadcast/schedule/schedule.model"]
        , "broadcast.crawl.model": ["../../app/broadcast/crawl/crawl.model"]
        , "economy.model": ["../../app/shared/economy.model"]
        , "resources.ingest.model": ["../../app/resources/ingest/ingest.model"]
        , "resources.check-info.model": ["../../app/resources/ingest/check-info.model"]
        , "resources.media.model": ["../../app/resources/media/media.model"]
        , "resources.media2.model": ["../../app/resources/media/media2.model"]
        , "resources.metadata.model": ["../../app/resources/metadata/metadata.model"]
        , "resources.categories.model": ["../../app/resources/categories/categories.model"]
        , "resources.review.model": ["../../app/resources/review/review.model"]
        , "resources.mediaitem.model": ["../../app/resources/mediaitem/mediaitem.model"]
        , "resources.persons.model": ["../../app/resources/persons/persons.model"]
        , "users.model": ["../../app/users/users.model"]
        , "users.manage.model": ["../../app/users/manage/manage.model"]
        , "inbox.model": ["../../app/user/messages/inbox.model"]
        , "pr.model": ["../../app/pr/pr.model"]
        , "live.model": ["../../app/resources/live/live.model"]
        , "monitoring.model": ["../../app/monitoring/monitoring.model"]
        , "newsroom.model": ["../../app/newsroom/newsroom.model"]
        , "shared.model": ["../../app/shared/shared.model"]
        , "basic.model": ["../../app/basic/basic.model"]
        , "website.model": ["../../app/website/website.model"]
        , "tasks.model": ["../../app/user/tasks/tasks.model"]

        // Views
        , "app.view": ["../../app/app.view"]
        , "login.view": ["../../app/user/login.view"]
        , "user.helper": ["../../app/user/user.helper"]
        , "dashboard.view": ["../../app/dashboard/dashboard.view"]
        , "broadcast.view": ["../../app/broadcast/broadcast.view"]
        , "broadcast.schedule.view": ["../../app/broadcast/schedule/schedule.view"]
        , "broadcast.schedule2.view": ["../../app/broadcast/schedule/schedule2.view"]
        , "broadcast.scheduleprint.view": ["../../app/broadcast/schedule/scheduleprint.view"]
        , "broadcast.crawl.view": ["../../app/broadcast/crawl/crawl.view"]
        , "broadcast.prices.view": ["../../app/broadcast/prices/prices.view"]
        , "broadcast.photos.view": ["../../app/broadcast/photos/photos.view"]
        , "resources.ingest.view": ["../../app/resources/ingest/ingest.view"]
        , "resources.batchingest.view": ["../../app/resources/batchingest/batchingest.view"]
        , "resources.shotlist.view": ["../../app/resources/shotlist/shotlist.view"]
//        , "resources.shotlist2.view": ["../../app/resources/shotlist/shotlist2.view"]
        , "resources.ottingest.view": ["../../app/resources/ingest/ottingest.view"]
        , "resources.epgdata.view": ["../../app/resources/epgdata/epgdata.view"]
        , "resources.photos.view": ["../../app/resources/photos/photos.view"]
        , "resources.media.view": ["../../app/resources/media/media.view"]
        , "resources.media2.view": ["../../app/resources/media/media2.view"]
        , "resources.media2print.view": ["../../app/resources/media/media2print.view"]
        , "resources.media-options.helper": ["../../app/resources/media/media-options.helper"]
        , "resources.mediaprint.view": ["../../app/resources/media/mediaprint.view"]
        , "resources.categories.view": ["../../app/resources/categories/categories.view"]
        , "resources.review.view": ["../../app/resources/review/review.view"]
        , "resources.returnees.view": ["../../app/resources/returnees/returnees.view"]
        , "resources.mediaitem.view": ["../../app/resources/mediaitem/mediaitem.view"]
        , "resources.broadcastprint.view": ["../../app/resources/mediaitem/broadcastprint.view"]
        , "resources.persons.view": ["../../app/resources/persons/persons.view"]
        , "resources.live.view": ["../../app/resources/live/live.view"]
        , "resources.editor.view": ["../../app/resources/editor/editor.view"]
        , "users.view": ["../../app/users/users.view"]
        , "users.manage.view": ["../../app/users/manage/manage.view"]
        , "user.messages.view": ["../../app/user/messages/inbox.view"]
        , "user.profile.view": ["../../app/user/profile/profile.view"]
        , "user.notifications.view": ["../../app/user/notifications/notifications.view"]
        , "user.acl.view": ["../../app/user/acl/acl.view"]
        , "pr.view": ["../../app/pr/pr.view"]
        , "pr.sms.view": ["../../app/pr/sms/sms.view"]
        , "pr.recordings.view": ["../../app/pr/recordings/recordings.view"]
        , "basic.subjects.view": ["../../app/basic/subjects/subjects.view"]
        , "basic.tags.view": ["../../app/basic/tags/tags.view"]
        , "monitoring.schedule.view": ["../../app/monitoring/schedule/schedule.view"]
        , "monitoring.schedulefiles.view": ["../../app/monitoring/schedulefiles/schedulefiles.view"]
        , "monitoring.schedulepdf.view": ["../../app/monitoring/schedulepdf/schedulepdf.view"]
        , "monitoring.ingest.view": ["../../app/monitoring/ingest/ingest.view"]
        , "monitoring.playlist.view": ["../../app/monitoring/playlist/playlist.view"]
        , "monitoring.ualogs.view": ["../../app/monitoring/ualogs/ualogs.view"]
        , "monitoring.prices.view": ["../../app/monitoring/prices/prices.view"]
        , "monitoring.crawl.view": ["../../app/monitoring/crawl/crawl.view"]
        , "stats.broadcast.view": ["../../app/stats/broadcast/broadcast.view"]
        , "stats.broadcastprint.view": ["../../app/stats/broadcast/broadcastprint.view"]
        , "stats.ingest.view": ["../../app/stats/ingest/ingest.view"]
        , "stats.crawl.view": ["../../app/stats/crawl/crawl.view"]
        , "stats.crawlprint.view": ["../../app/stats/crawl/crawlprint.view"]
        , "stats.ingestprint.view": ["../../app/stats/ingest/ingestprint.view"]
        , "stats.schedule.view": ["../../app/stats/schedule/schedule.view"]
        , "stats.scheduleprint.view": ["../../app/stats/schedule/scheduleprint.view"]
        , "newsroom.view": ["../../app/newsroom/newsroom.view"]
        , "newsroom.news.view": ["../../app/newsroom/news/news.view"]
        , "newsroom.workspace.view": ["../../app/newsroom/workspace/workspace.view"]
        , "newsroom.itemprint.view": ["../../app/newsroom/item/itemprint.view"]
        , "newsroom.schedule.view": ["../../app/newsroom/schedule/schedule.view"]
        , "newsroom.schedule.itemprint.view": ["../../app/newsroom/schedule/schedule-itemprint.view"]
        , "newsroom.schedule.print.view": ["../../app/newsroom/schedule/schedule-print.view"]
        , "website.view": ["../../app/website/website.view"]
        , "website.dashboard.view": ["../../app/website/dashboard/dashboard.view"]
        , "website.items.view": ["../../app/website/items/items.view"]
        , "website.item.view": ["../../app/website/item/item.view"]
        , "website.edit.view": ["../../app/website/item/edit.view"]
        , "website.stats.view": ["../../app/website/stats/stats.view"]
        , "website.workspace.view": ["../../app/website/workspace/workspace.view"]
        , "user.tasks.view": ["../../app/user/tasks/tasks.view"]

        // Helpers
        , "toolbar": ["helpers/toolbar"]
        , "statusbar": ["helpers/statusbar"]
        , "layout": ["app/layout"]
        , "cookie": ["helpers/cookie"]
        , "localstorage": ["helpers/localstorage"]
        , "template": ["helpers/template"]
        , "global": ["helpers/global"]
        , "mask": ["vendor/jquery.mask.min"]
        , "scheduleHelper": ["../../app/broadcast/schedule/schedule.helper"]
        , "scheduleHelper2": ["../../app/broadcast/schedule/schedule2.helper"]
        , "crawlHelper": ["../../app/broadcast/crawl/crawl.helper"]
        , "ingestHelper": ["../../app/resources/ingest/ingest.helper"]
        , "photosHelper": ["../../app/resources/photos/photos.helper"]
        , "reviewHelper": ["../../app/resources/review/review.helper"]
//        , "metadataHelper": ["../../app/resources/ingest/metadata.helper"]
//        , "metadataHelper": ["../../app/resources/ingest/categories.helper"]
        , "tree.helper": ["helpers/tree"]
        , "news-tree.helper": ["helpers/news-tree"]
        , "storage.helper": ["helpers/storage"]
        , "player.helper": ["helpers/player"]
        , "flowplayer.helper": ["helpers/flowplayer"]
        , "editable.helper": ["helpers/editable"]
        , "timeline.helper": ["helpers/timeline"]
        , "mediaitem-timeline.helper": ["helpers/mediaitem-timeline"]
        , "authorization": ["helpers/authorization"]
    }
});

require(["jquery", "underscore", "backbone", 'defines', 'router', 'pace'], function ($, _, Backbone, Defines, Router, pace) {
    Defines.initialize(pace) && new Router();
});
