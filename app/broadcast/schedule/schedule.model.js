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
    });
    return ScheduleModel;
});
