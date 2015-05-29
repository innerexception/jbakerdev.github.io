require.config({
    baseUrl: 'js',
    paths:{
        //Framework
        'phaser': 'lib/vendor/phaser2.2.2',
        'lodash': 'lib/vendor/lodash.min',
        'candy': 'lib/candy',
        'amd-loader': 'lib/vendor/amd-loader',
        'css': 'lib/vendor/css.min',
        'rv': 'lib/vendor/rv',
        'ractive': 'lib/vendor/ractive.min',
        'worldGen': 'lib/vendor/worldGen',
        'illuminated': 'lib/vendor/illuminated',

        'outSpacedApp': 'src/models/game',
        'planet': 'src/models/planet',
        'player': 'src/models/player',
        'ship': 'src/models/ship',
        'galaxy': 'src/models/galaxy',
        'fleet': 'src/models/fleet',

        'gameSetupModal': 'src/ui/gameSetupModal/gameSetupModal',
        'messagePanel': 'src/ui/messagePanel/messagePanel',
        'planetPanel' : 'src/ui/planetPanel/planetPanel',
        'techPanel': 'src/ui/techPanel/techPanel',
        'budgetPanel': 'src/ui/budgetPanel/budgetPanel',
        'taskBar': 'src/ui/taskBar/taskBar',
        'shipBuilder' : 'src/ui/shipBuilder/shipBuilder',
        'battleModal' : 'src/ui/battleModal/battleModal',
        'fleetManagerModal' : 'src/ui/fleetManagerModal/fleetManagerModal'
    },
    map: {
        '*': {
            'css': 'lib/vendor/css.min'
        }
    },
    shim: {
        'phaser': {
            exports: 'Phaser'
        }
    }
});

require(['phaser', 'outSpacedApp'], function(Phaser, OutSpacedApp){
    new OutSpacedApp(1024, 768, Phaser.AUTO, 'center-panel');
});





