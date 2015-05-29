define(['candy', 'worldMap'], function(Candy, WorldMap){
    //Shitty Globals for Google WebFonts
    //  The Google WebFont Loader will look for this object, so create it before loading the script.
    WebFontConfig = {
        //  'active' means all requested fonts have finished loading
        //  We set a 1 second delay before calling 'createText'.
        //  For some reason if we don't the browser cannot render the text the first time it's created.
        active: function () {
            window.setTimeout(function(){window.fontLibraryReady = true; console.log('fonts loaded!')}, 1000);
        },

        //  The Google Fonts we want to load (specify as many as you like in the array)
        google: {
            families: ['Press Start 2P']
        }
    };

    var KapitalApp = function(h, w, mode, targetElement){
        var loadingSignal = new Phaser.Signal();
        loadingSignal.add(this.appLoad, this);
        //context in these functions is the PHASER OBJECT not our object
        this.gameInstance = new Phaser.Game(h, w, mode, targetElement,{
            preload: this.preload,
            create: this.phaserLoad,
            update: this.update,
            loadComplete: loadingSignal
        });
    };

    KapitalApp.prototype = {
        preload: function () {
            //Load all assets here
            this.load.image('coffee', 'res/sprite/coffee.png');
            this.load.image('bluePill', 'res/sprite/bluepill.png');
            this.load.image('redPill', 'res/sprite/redpill.png');
            this.load.image('netfix', 'res/sprite/netflix.png');
            this.load.image('dolla', 'res/sprite/dolla.png');
            this.load.image('energyDrink', 'res/sprite/energydrink.png');
            this.load.image('ramen', 'res/sprite/ramen.png');
            this.load.image('tome', 'res/sprite/tome.png');
            this.load.image('whiteKey', 'res/sprite/white_key.png');
            this.load.image('blackKey', 'res/sprite/black_key.png');
            this.load.image('brassRing', 'res/sprite/brassring.png');
            this.load.image('controller', 'res/sprite/controller.png');
            this.load.image('ground', 'res/sprite/basic_ground_tiles.png');
            this.load.image('doodads', 'res/sprite/outdoors_doodads.png');
            this.load.image('terrain_sprites', 'res/sprite/terrain_sprites.png');
            this.load.image('indoor_basic_tiles', 'res/sprite/indoor_basic_tiles.png');
            this.load.image('indoor_doodads', 'res/sprite/indoor_doodads.png');
            this.load.image('rain', 'res/sprite/rain.png');

            this.load.tilemap('ground_tiles', 'res/map/testLevel.json', null, Phaser.Tilemap.TILED_JSON);
            this.load.tilemap('room_tiles', 'res/map/testInterior.json', null, Phaser.Tilemap.TILED_JSON);

            this.load.spritesheet('player', 'res/sprite/player_sprites.png', 16, 16);
            //  Load the Google WebFont Loader script
            this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        },

        phaserLoad: function () {
            //1st time load
            this.world.setBounds(0, 0, 1000, 1000);
            //Camera init
            this.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
            this.camera.view = new Phaser.Rectangle(150, 150, 500, 300);
            this.physics.startSystem(Phaser.Physics.ARCADE);
            this.loadComplete.dispatch();
        },

        appLoad: function(){
            var that = this;
            this.fontInterval = window.setInterval(function(){
                if(window.fontLibraryReady)that.setUpIntro();
            }, 500);
        },

        update: function(){
            if(this.game.worldMap)this.game.worldMap.update();
        },

        setUpIntro: function () {
            this.gameInstance.worldMap = new WorldMap(this.gameInstance);

            //Keyboard init
            //this.cursors = this.gameInstance.input.keyboard.createCursorKeys();

            window.clearInterval(this.fontInterval);
            Candy.drawIntro(this.gameInstance);
            this.gameInstance.camera.focusOnXY(0, 0);
            this.gameInstance.input.onDown.addOnce(this.startNewGame, this);
        },

        startNewGame: function () {
            Candy.clearIntro(this.gameInstance);
            this.gameInstance.worldMap.transitionTo();
        }
    };
    return KapitalApp;
});