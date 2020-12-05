define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'newsroom.model', 'user.helper'
], function ($, _, Backbone, Template, Config, Global, NewsroomModel, UserHelper) {
    var NewsroomScheduleItemPrintView = Backbone.View.extend({
        data: {}
        , events: {}
        , render: function () {
            this.loadItem();
            return this;
        }
        , loadItem: function (e) {
            var self = this;
            var id = this.getId();
            var template = Template.template.load('newsroom/schedule', 'schedule-itemprint');
            var detailParams = {id: id, overrideUrl: 'nws/conductor'};
            new NewsroomModel(detailParams).fetch({
                success: function (metadata) {
                    metadata = self.prepareItems(metadata.toJSON(), detailParams);
                    metadata.path = Global.getQuery('path').replace('$', '/');
                    var compiled = $.extend(
                        {},
                        metadata,
                        {_created: Global.createDate() + 'T' + Global.createTime(), id: id},
                        {user: UserHelper.getUser()}
                    );
                    new NewsroomModel({overrideUrl: Config.api.newsSchedule, id: 'print/' + id}).fetch();
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(compiled);
                        $(Config.positions.wrapper).html(output);
                    });
                }
            });
        }
        , getId: function () {
            return Backbone.history.getFragment().split("/").pop().split("?")[0];
        }
        , prepareItems: function (items, params) {
            if (typeof items.query !== "undefined")
                delete items.query;
            if (typeof params !== "undefined")
                for (var prop in params)
                    delete items[prop];
            return items;
        }
    });

    return NewsroomScheduleItemPrintView;
});
