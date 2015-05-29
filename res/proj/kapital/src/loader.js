require.config({
    baseUrl: '',
    paths:{
        'phaser': 'lib/phaser',
        'lodash': 'lib/lodash.min',
        'candy': 'lib/candy',
        'kapitalApp': 'src/game',
        'worldMap': 'src/worldMap',
        'player': 'src/player',
        'room': 'src/room',
        'npc': 'src/npc'
    },
    shim: {
        'phaser': {
            exports: 'Phaser'
        }
    }
});

require(['phaser', 'kapitalApp'], function(Phaser, KapitalApp){
    new KapitalApp(640, 480, Phaser.AUTO, 'appRoot');
});





