define({
    "title": "Automation",
//    "codename": window.location.host.replace(/\./g, ''),
    "env": "dev",
    "settings": {},
    "api": {
        url: 'localhost/misc/fakeapi'
    },
    "dependencies": [
        {
            "name": "jQuery",
            "version": "3.1.1",
            "folder": "vendor",
            "type": "min",
            "bundled": false,
            "map": true
        },
        {
            "name": "modernizr",
            "version": "2.8.3",
            "folder": "vendor",
            "type": "min",
            "bundled": true,
            "map": false
        },
        {
            "name": "respondJS",
            "version": "1.4.2",
            "folder": "vendor",
            "type": "min",
            "bundled": true,
            "map": false
        },
        {
            "name": "BackboneJS",
            "version": "1.3.3",
            "folder": "vendor",
            "type": "min",
            "bundled": false,
            "map": true
        },
        {
            "name": "requireJS",
            "version": "2.3.2",
            "folder": "vendor",
            "type": "min",
            "bundled": false,
            "map": false
        },
        {
            "name": "UnderscoreJS",
            "version": "1.8.3",
            "folder": "vendor",
            "type": "min",
            "bundled": false,
            "map": true
        },
        {
            "name": "handlebars",
            "version": "4.0.5",
            "folder": "vendor",
            "type": "min",
            "bundled": false,
            "map": false
        }
    ]
});