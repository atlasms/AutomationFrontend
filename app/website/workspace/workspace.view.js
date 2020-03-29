define(['jquery', 'underscore', 'backbone', 'template', 'config', 'user', 'toolbar', 'statusbar', 'website.service'
], function ($, _, Backbone, Template, Config, User, Toolbar, Statusbar, WebsiteService) {

    var WebsitWorkspacedView = Backbone.View.extend({
        data: {}
        , events: {
            'click #items-table tbody tr': 'loadItem'
            , 'click .inbox-nav a[data-type]': 'loadItemsByType'
        }
        , render: function () {
            var self = this;
            var template = Template.template.load('website/workspace', 'workspace');
            template.done(function (data) {
                new Toolbar().render();
                new Statusbar().render();
                var html = $(data).wrap('<p/>').parent().html();
                var handlebarsTemplate = Template.handlebars.compile(html);
                var output = handlebarsTemplate(this.data);
                $(Config.positions.main).html(output).promise().done(function () {
                    self.loadDraftItems();
                });
            });
            return this;
        }
        , loadItemsByType: function (e) {
            e.preventDefault();
            var $item = $(e.target);
            $item.parents('.inbox-nav').find('li.active').removeClass('active');
            $item.parent().addClass('active');
            switch ($item.data('type')) {
                case 'draft':
                    this.loadDraftItems();
                    break;
                case 'sent':
                    this.loadSentItems();
                    break;
                case 'inbox':
                    this.loadInboxItems();
                    break;
            }
        }
        , loadDraftItems: function () {
            WebsiteService.getUserItems(function (items) {
                var template = Template.template.load('website/workspace', 'workspace-draft.partial');
                template.done(function (data) {
                    var handlebarsTemplate = Template.handlebars.compile(data);
                    var output = handlebarsTemplate(items);
                    $('#items').html(output);
                });
            });
        }
        , loadSentItems: function () {
            WebsiteService.getSentItems(function (items) {
                var template = Template.template.load('website/workspace', 'workspace-sent.partial');
                template.done(function (data) {
                    var handlebarsTemplate = Template.handlebars.compile(data);
                    var output = handlebarsTemplate(items);
                    $('#items').html(output);
                });
            });
        }
        , loadInboxItems: function () {
            WebsiteService.getInboxItems(function (items) {
                var template = Template.template.load('website/workspace', 'workspace-inbox.partial');
                template.done(function (data) {
                    var handlebarsTemplate = Template.handlebars.compile(data);
                    console.log(items);
                    var output = handlebarsTemplate(items);
                    $('#items').html(output);
                });
            });
        }
        , loadItem: function (e) {
            e.preventDefault();
            var $el = $(e.target);
            var id = $el.is('tr') ? $el.attr('data-id') : $el.parents('tr:first').attr('data-id');
            !Backbone.History.started && Backbone.history.start({pushState: true});
            new Backbone.Router().navigate('website/item/' + id, {trigger: true});
        }
    });

    return WebsitWorkspacedView;

});
