define(['jquery', 'underscore', 'backbone', 'template', 'config', 'website.model'
], function ($, _, Backbone, Template, Config, WebsiteModel) {
    var WebsiteService = {
        serviceUrl: 'https://services.iktv.ir/pl/',
        getUserItems: function (callback) {
            var url = WebsiteService.serviceUrl + 'contents.svc/box/-100';
            WebsiteService.getToken(function (token) {
                $.ajax({
                    url: url,
                    headers: {"Authorization": token},
                    success: function(res) {
                        if (typeof callback === 'function') {
                            callback(res);
                        }
                    }
                })
            });
        },
        getItem: function (id, callback) {
            var url = WebsiteService.serviceUrl + 'contents.svc/' + id;
            WebsiteService.getToken(function (token) {
                $.ajax({
                    url: url,
                    headers: {"Authorization": token},
                    success: function(res) {
                        if (typeof callback === 'function') {
                            callback(res);
                        }
                    }
                })
            });
        },
        setToken: function (token) {
            if (token) {
                STORAGE.setItem('website_token', token);
                return true;
            }
            return false;
        },
        getToken: function (callback) {
            var currentToken = STORAGE.getItem('website_token');
            if (!currentToken) {
                WebsiteService.authenticate(function (data) {
                    WebsiteService.setToken(data.SessionKey);
                    if (typeof callback === 'function') {
                        callback(data.SessionKey);
                    }
                });
            } else {
                return callback(currentToken);
            }
        },
        authenticate: function (callback) {
            var url = WebsiteService.serviceUrl + 'users.svc/login';
            $.ajax({
                url: url,
                type: 'post',
                data: {username: 'admin', password: ''},
                success: function (data) {
                    if (typeof callback === 'function') {
                        callback(data);
                    }
                }
            });
        },

    };
    return WebsiteService;
});
