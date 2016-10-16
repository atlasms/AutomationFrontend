define(["jquery", "underscore", "backbone", "config"
], function ($, _, Backbone, Config) {
    var ScheduleModel = Backbone.Model.extend({
        defaults: {
            query: ""
        }
        , initialize: function (options) {
            this.query = (options && options.query) ? '?' + options.query : '';
        }
        , url: function () {
            return Config.api.schedule + this.query;
        }
        , parse: function (data) {
            data = _.map(data, _.identity);
            return data;
        }
        , navigate: function (data) {
            var win = window.open(Config.api.url + Config.api.schedule + '?' + data, '_blank');
            if (win) {
                //Browser has allowed it to be opened
                win.focus();
            } else {
                //Browser has blocked it
                alert('Please allow popups for this website');
            }

        }
    });
    return ScheduleModel;
});
