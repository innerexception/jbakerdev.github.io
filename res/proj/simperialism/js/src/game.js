define(['phaser', 'lodash', 'candy', 'worldmap', 'provinceData'], function(Phaser, _, Candy, WorldMap, ProvinceData){

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

    var SimperialismApp = function(h, w, mode, targetElement){
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

    SimperialismApp.prototype = {

        preload: function () {
            //Load all assets here
            this.load.image('mapBackground', 'res/sprite/mapBG.png');
            this.load.image('bullet', 'res/sprite/bullet.png');
            this.load.spritesheet('fight', 'res/sprite/fight.png', 16, 16);
            this.load.spritesheet('intelligencia_surface_unit', 'res/sprite/intelligencia_surface_unit.png', 16, 16);
            this.load.spritesheet('military_surface_unit', 'res/sprite/military_surface_unit.png', 16, 16);
            this.load.spritesheet('oligarch_surface_unit', 'res/sprite/oligarch_surface_unit.png', 16, 16);

            _.each(ProvinceData, function(province){
                this.load.tilemap(province.name+'_map', 'res/tilemaps/'+province.name+'_map.json', null, Phaser.Tilemap.TILED_JSON);
            }, this);
            this.load.spritesheet('base', 'res/sprite/base.png', 55, 55);
            this.load.image('surface_plains', 'res/sprite/surface_plains.png');
            this.load.image('sightBox', 'res/sprite/sightBox.png');
            //  Load the Google WebFont Loader script
            this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        },

        phaserLoad: function () {
            //1st time load
            this.world.setBounds(0, 0, 1024, 768);
            //Camera init
            this.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
            this.physics.startSystem(Phaser.Physics.ARCADE);
            //  Enable the QuadTree
            //this.physics.arcade.skipQuadTree = false;
            this.loadComplete.dispatch();
        },

        appLoad: function(){
            var that = this;
            this.fontInterval = window.setInterval(function(){
                if(window.fontLibraryReady)that.setUpIntro();
            }, 500);
        },

        update: function () {
            if (this.game.worldMap) this.game.worldMap.update();
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
        },

        runVictory: function () {

        },

        runLoss: function () {

        }

    };

    return SimperialismApp;
});

