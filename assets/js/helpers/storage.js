define(['jquery', 'underscore', 'backbone', 'config'], function ($, _, Backbone, Config) {
    var Storage = function(key, type) {
        var storage = JSON.parse(STORAGE.getItem(Config.storageKey));
        var type = (typeof type !== "undefined") ? type : 'data';
        if (typeof key !== "undefined")
            return storage[type][key];
        return storage;
    };
    return Storage;
});