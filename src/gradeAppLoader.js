require.config({
    baseUrl: 'src/',
    paths: {
        //Framework
        'amd-loader': '../vendor/requirejs-ractive/amd-loader',
        'css': '../vendor/require-css/css',
        'rv': '../vendor/requirejs-ractive/rv',
        'ractive': '../vendor/ractive/ractive',

        //App pieces
        'gradeApp': 'gradeApp/gradeApp'
    },
    map: {
        '*': {
            'css': '../vendor/require-css/css'
        }
    }
});

require(['gradeApp'], function(GradeApp){

    var app = new GradeApp(document.getElementById('appHost'));

});