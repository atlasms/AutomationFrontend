define(['jquery', 'underscore', 'backbone', 'template', 'config', 'user', 'toolbar', 'statusbar', 'website.service'
], function ($, _, Backbone, Template, Config, User, Toolbar, Statusbar, WebsiteService) {

    var WebsiteItemEditView = Backbone.View.extend({
        data: {}
        , events: {
            'click [data-task="edit"]': 'loadEditPage'
        }
        , toolbar: [
            {'button': {cssClass: 'btn blue pull-left', text: 'ذخیره و جدید', type: 'button', task: 'submitAndNew', icon: 'fa fa-plus'}}
            , {'button': {cssClass: 'btn green-jungle pull-left', text: 'ذخیره', type: 'submit', task: 'submit', icon: 'fa fa-check'}}
            , {'button': {cssClass: 'btn btn-default pull-right', text: 'انصراف', type: 'button', task: 'edit'}}
        ]
        , render: function () {
            var self = this;
            var id = this.getId();
            this.renderToolbar();
            if (id) {
                WebsiteService.getItem(id, function (item) {
                    self.renderTemplate(item);
                });
            } else {
                this.renderTemplate({});
            }
            return this;
        }
        , renderTemplate: function(item) {
            var self = this;
            var template = Template.template.load('website/item', 'item-form');
            template.done(function (data) {
                var handlebarsTemplate = Template.handlebars.compile(data);
                var output = handlebarsTemplate(item);
                $(Config.positions.main).html(output).promise().done(function () {
                    self.afterRender();
                });
            });
        }
        , getId: function () {
            var lastPart = Backbone.history.getFragment().split("/").pop().split("?")[0];
            return isNaN(parseInt(lastPart)) ? null : lastPart;
        }
        , loadEditPage: function (e) {
            e.preventDefault();
            var id = this.getId();
            !Backbone.History.started && Backbone.history.start({pushState: true});
            new Backbone.Router().navigate('website/edit/' + id, {trigger: true});
        }
        , afterRender: function () {

        }
        , renderToolbar: function () {
            var self = this;
            var toolbar = new Toolbar();
            $.each(self.toolbar, function () {
                var method = Object.getOwnPropertyNames(this);
                toolbar[method](this[method]);
            });
            toolbar.render();
        }
        , prepareContent: function () {

        }
    });

    return WebsiteItemEditView;

});
