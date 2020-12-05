define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'newsroom.model', 'user.helper'
], function ($, _, Backbone, Template, Config, Global, NewsroomModel, UserHelper) {
    var NewsroomSchedulePrintView = Backbone.View.extend({
        data: {}
        , events: {}
        , render: function () {
            this.loadItem();
            return this;
        }
        , loadItem: function (e) {
            var self = this;
            var id = this.getId();
            var template = Template.template.load('newsroom/schedule', 'schedule-print');
            var stylesTemplate = Template.template.load('newsroom/schedule', 'schedule-stylesheet');
            var params = self.getParams();
            var detailParams = {query: $.param(params), overrideUrl: Config.api.newsSchedule};

            new NewsroomModel(detailParams).fetch({
                success: function (items) {
                    items = self.prepareItems(items.toJSON(), detailParams);
                    items = Object.entries(items).map(function (e) {
                        return e[1];
                    });
                    var output = '';
                    stylesTemplate.done(function (data) {
                        output += Template.handlebars.compile(data)({});
                        $.each(items, function (i) {
                            var item = this;
                            item.path = Global.getQuery('path').replace('$', '/');
                            var compiled = $.extend(
                                {},
                                item,
                                {_created: Global.createDate() + 'T' + Global.createTime(), id: item.id},
                                {user: UserHelper.getUser()}
                            );
                            new NewsroomModel({overrideUrl: Config.api.newsSchedule, id: 'print/' + item.id}).fetch();
                            template.done(function (data) {
                                var handlebarsTemplate = Template.handlebars.compile(data);
                                output += handlebarsTemplate(compiled);
                                if (i === items.length - 1) {
                                    $(Config.positions.wrapper).html(output);
                                }
                            });
                        });
                    });
                }
            });
        }
        , getParams: function () {
            return {
                date: Global.getQuery('date'),
                cid: Global.getQuery('cid')
            }
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

    return NewsroomSchedulePrintView;
});
