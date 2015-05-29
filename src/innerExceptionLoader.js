require.config({
    baseUrl: 'src/',
    paths: {
        //Framework
        'amd-loader': '../vendor/requirejs-ractive/amd-loader',
        'css': '../vendor/require-css/css',
        'rv': '../vendor/requirejs-ractive/rv',
        'ractive': '../vendor/ractive/ractive',

        //App pieces
        'innerExceptionApp': 'innerException/innerExceptionApp'
    },
    map: {
        '*': {
            'css': '../vendor/require-css/css'
        }
    }
});

require(['innerExceptionApp'], function(InnerExceptionApp){
    new InnerExceptionApp(document.getElementById('appHost'));
});