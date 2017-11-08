define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'moment-with-locales', 'resources.media.model', 'resources.mediaitem.model', 'mask', 'toastr', 'toolbar', 'statusbar', 'pdatepicker', 'tree.helper', 'player.helper', 'resources.ingest.model', 'resources.review.model', 'resources.metadata.model'
], function ($, _, Backbone, Template, Config, Global, moment, MediaModel, MediaitemModel, Mask, toastr, Toolbar, Statusbar, pDatepicker, Tree, player, IngestModel, ReviewModel, MetadataModel) {
    var BroadcastprintView = Backbone.View.extend({
//        el: $(Config.positions.wrapper)
        model: 'MediaitemModel'
        , playerInstance: {}
        , player: null
        , modal_storage: '#storage-modal'
        , modal_tree: '#tree-modal'
        , treeInstance: {}
        , toolbar: [
            {'button': {cssClass: 'btn green-jungle pull-right', text: 'ذخیره', type: 'submit', task: 'save'}}
        ]
        , statusbar: []
        , flags: {}
        , events: {

        }
        , getId: function () {
            return $_GET['id'];
//            return Backbone.history.getFragment().split("/").pop().split("?")[0];
        }
        , render: function (params) {
            var self = this;

            var masterTemplate = Template.template.load('resources/mediaitem', 'broadcastprint');
            masterTemplate.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate({});
                var $container = $(Config.positions.wrapper);
                $container.html(output).promise().done(function () {
                    var params = {
                        overrideUrl: Config.api.schedule + '/mediausecount?id=' + self.getId()
                    };
                    model = new MediaitemModel(params);
                    model.fetch({
                        success: function (items) {
                            items = self.prepareItems(items.toJSON(), params);
                            var template = Template.template.load('resources/mediaitem', 'broadcast.partial');
                            template.done(function (data) {
                                var handlebarsTemplate = Template.handlebars.compile(data);
                                var output = handlebarsTemplate(items);
                                $("#broadcast-place").html(output);
                            });
                        }
                    });
                });
            });


        }
        , prepareItems: function (items, params) {
            if (typeof items.query !== "undefined")
                delete items.query;
            if (typeof params !== "undefined") {
                for (var prop in params) {
                    delete items[prop];
                }
            }
            $.each(items, function () {
                if (typeof this.Data === "string" && this.Data !== "")
                    this.Data = JSON.parse(this.Data);
            });
            return items;
        }
        , prepareContent: function () {
            this.renderToolbar();
        }
        , renderToolbar: function () {
        }
    });
    return BroadcastprintView;
});