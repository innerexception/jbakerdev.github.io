define(['lodash', 'npc'], function(_, Npc){
    var room = function(phaserInstance, player, enteredFrom){
        this.phaserInstance = phaserInstance;
        this.enteredFrom = enteredFrom;
        this.npcObjects = [];

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

        this.groundTileSet.setCollisionBetween(16,22, true, 'doodads', true);
        this.groundTileSet.setCollisionBetween(25,35, true, 'floor', true);
        this.groundTileSet.setCollisionBetween(28,28, true, 'doors', true);

        this.player = player;
        this.player.originalX = this.player.sprite.x;
        this.player.originalY = this.player.sprite.y+15;
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
            this.npcs.transitionTo.start();
        },
        transitionFrom: function(nextTransitionDelegate, context){
            this.player.inRoom = false;
            this.groundLayer.transitionFrom.start();
            this.doodadsLayer.transitionFrom.start();
            this.doorwaysLayer.transitionFrom.start();
            this.npcs.transitionFrom.start();
            this.player.sprite.x = this.player.originalX;
            this.player.sprite.y = this.player.originalY;

            nextTransitionDelegate.apply(context);
        },
        update: function(){
            if(this.player.inRoom === this){
                this.player.update();
                _.each(this.npcObjects, function(npcObject){
                    npcObject.update();
                });
                this.phaserInstance.physics.arcade.collide(this.player.sprite, this.npcs, this.playerHitConsumer, null, this);
                this.phaserInstance.physics.arcade.overlap(this.player.sprite, this.doorwaysLayer, this.playerHitDoor, null, this);
                this.phaserInstance.physics.arcade.collide(this.player.sprite, this.doodadsLayer);
                this.phaserInstance.physics.arcade.collide(this.player.sprite, this.groundLayer);
                this.phaserInstance.physics.arcade.overlap(this.npcs, this.doodadsLayer, this.hitWall, null, this);
                this.phaserInstance.physics.arcade.overlap(this.npcs, this.groundLayer, this.hitWall, null, this);
            }
        },
        hitWall: function(npcSprite){
            console.log('npc wall hit');
            switch(npcSprite.direction){
                case 'south':
                    npcSprite.direction = 'east';
                    break;
                case 'north':
                    npcSprite.direction = 'west';
                    break;
                case 'east':
                    npcSprite.direction = 'north';
                    break;
                case 'west':
                    npcSprite.direction = 'south';
                    break;
            }
        },
        playerHitConsumer: function(playerSprite, consumerSprite){
            console.log('npc player hit');
        },
        playerHitDoor: function(playerSprite, doorSprite){
            this.transitionFrom(this.enteredFrom.transitionTo, this.enteredFrom);
        },
        spawnItem: function(){

        },
        spawnNpcs: function(){
            this.npcs = this.phaserInstance.add.group();
            this.npcs.enableBody = true;
            this.npcs.alpha = 0;
            this.npcs.transitionTo = this.phaserInstance.add.tween(this.npcs)
                .to({alpha:1}, 2000, Phaser.Easing.Linear.None);
            this.npcs.transitionFrom = this.phaserInstance.add.tween(this.npcs)
                .to({alpha:0}, 2000, Phaser.Easing.Linear.None);

            _.times(3, function(){
                var npcSprite = this.npcs.create(Math.round(Math.random() * 100), Math.round(Math.random() * 100), 'player');
                this.npcObjects.push(new Npc(npcSprite));
            }, this);
        }
    };

    return room;
});