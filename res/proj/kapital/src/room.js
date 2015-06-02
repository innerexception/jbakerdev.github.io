define([], function(){
    var room = function(phaserInstance, player, enteredFrom){
        this.phaserInstance = phaserInstance;
        this.enteredFrom = enteredFrom;
        this.npcs = phaserInstance.add.group();
        this.items = phaserInstance.add.group();
        this.items.transitionTo = phaserInstance.add.tween(this.items)
            .to({alpha:1}, 2000, Phaser.Easing.Linear.None);
        this.items.transitionFrom = phaserInstance.add.tween(this.items)
            .to({alpha:0}, 2000, Phaser.Easing.Linear.None);
        this.items.enableBody = true;
        this.groundTileSet = phaserInstance.add.tilemap('room_tiles', 16, 16);
        this.groundTileSet.addTilesetImage('indoor_basic_tiles', 'indoor_basic_tiles');
        this.groundTileSet.addTilesetImage('indoor_doodads', 'indoor_doodads');
        this.groundLayer = this.groundTileSet.createLayer('floor');
        this.groundLayer.transitionTo = this.phaserInstance.add.tween(this.groundLayer)
            .to({alpha: 1}, 2000, Phaser.Easing.Linear.None);
        this.doodadsLayer = this.groundTileSet.createLayer('doodads');
        this.doodadsLayer.transitionTo = this.phaserInstance.add.tween(this.doodadsLayer)
            .to({alpha: 1}, 2000, Phaser.Easing.Linear.None);
        this.doorwaysLayer = this.groundTileSet.createLayer('doors');
        this.doorwaysLayer.transitionTo = this.phaserInstance.add.tween(this.doorwaysLayer)
            .to({alpha: 1}, 2000, Phaser.Easing.Linear.None);

        this.groundLayer.transitionFrom = this.phaserInstance.add.tween(this.groundLayer)
            .to({alpha: 0}, 2000, Phaser.Easing.Linear.None);
        this.doodadsLayer.transitionFrom = this.phaserInstance.add.tween(this.doodadsLayer)
            .to({alpha: 0}, 2000, Phaser.Easing.Linear.None);
        this.doorwaysLayer.transitionFrom = this.phaserInstance.add.tween(this.doorwaysLayer)
            .to({alpha: 0}, 2000, Phaser.Easing.Linear.None);

        this.groundTileSet.setCollisionBetween(16,24, true, 'doodads', true);
        this.groundTileSet.setCollisionBetween(28,28, true, 'doors', true);

        this.player = player;
        this.player.originalX = this.player.sprite.x-25;
        this.player.originalY = this.player.sprite.y-25;
        this.player.sprite.x = 100;
        this.player.sprite.y = 100;
        this.player.sprite.bringToTop();

        this.spawnItem();
        this.spawnNpcs();
    };

    room.prototype = {
        transitionTo: function(){
            this.groundLayer.transitionTo.start();
            this.doodadsLayer.transitionTo.start();
            this.doorwaysLayer.transitionTo.start();
            this.items.transitionTo.start();
        },
        transitionFrom: function(nextTransitionDelegate, context){
            this.player.inRoom = false;
            this.groundLayer.transitionFrom.start();
            this.doodadsLayer.transitionFrom.start();
            this.doorwaysLayer.transitionFrom.start();
            this.items.transitionFrom.start();
            this.player.sprite.x = this.player.originalX;
            this.player.sprite.y = this.player.originalY;

            nextTransitionDelegate.apply(context);
        },
        update: function(){
            if(this.player.inRoom === this){
                this.player.update();
                //this.phaserInstance.physics.arcade.collide(this.player.sprite, this.npcs, this.playerHitConsumer, null, this);
                this.phaserInstance.physics.arcade.overlap(this.player.sprite, this.doorwaysLayer, this.playerHitDoor, null, this);
                this.phaserInstance.physics.arcade.collide(this.player.sprite, this.doodadsLayer);
            }

        },
        playerHitConsumer: function(playerSprite, consumerSprite){

        },
        playerHitDoor: function(playerSprite, doorSprite){
            this.transitionFrom(this.enteredFrom.transitionTo, this.enteredFrom);
        },
        spawnItem: function(){

        },
        spawnNpcs: function(){

        }
    };

    return room;
});