define(['jquery', 'underscore', 'backbone', 'template', 'config', 'global', 'newsroom.model', 'user.helper'
], function ($, _, Backbone, Template, Config, Global, NewsroomModel, UserHelper) {

    var NewsroomScheduleItemPrintView = Backbone.View.extend({
        data: {}
        , events: {}
//        , el: 
        , render: function () {
            this.loadItem();
            return this;
        }
        , loadItem: function (e) {
            var self = this;
            var id = this.getId();
            // var params = {id: id, overrideUrl: 'nws'};
            // var params = {id: id, overrideUrl: 'nws/conductor'};
            var template = Template.template.load('newsroom/schedule', 'schedule-itemprint');
            // new NewsroomModel(params).fetch({
            //     success: function (item) {
            //         item = self.prepareItems(item.toJSON(), params);
            //         console.log(item);
            // load item details
            var detailParams = {id: id, overrideUrl: 'nws/conductor'};
            new NewsroomModel(detailParams).fetch({
                success: function (metadata) {
                    metadata = self.prepareItems(metadata.toJSON(), detailParams);
                    var compiled = $.extend({}, metadata, {_created: Global.createDate() + 'T' + Global.createTime()}, {user: UserHelper.getUser()});
                    console.log(compiled);
                    // delete compiled.summary;
//                            console.log(compiled);
                    template.done(function (data) {
                        var handlebarsTemplate = Template.handlebars.compile(data);
                        var output = handlebarsTemplate(compiled);
                        $(Config.positions.wrapper).html(output).promise().done(function () {

                        });
                    });
                }
            });

            // }
            // });
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
