define(['player', 'room', 'lodash', 'candy', 'demon'], function(Player, Room, _, Candy, Demon){
   var worldMap = function(phaserInstance){
       this.rooms = [];
       this.heldItems = [];
       this.phaserInstance = phaserInstance;
       this.groundTileSet = phaserInstance.add.tilemap('ground_tiles', 16, 16);
       this.groundTileSet.addTilesetImage('ground', 'ground');
       this.groundTileSet.addTilesetImage('terrain_sprites', 'terrain_sprites');
       this.groundTileSet.addTilesetImage('doodads', 'doodads');
       this.groundLayer = this.groundTileSet.createLayer('ground');
       this.doodadsLayer = this.groundTileSet.createLayer('ground_doodads');
       this.doorwaysLayer = this.groundTileSet.createLayer('doors');

       this.groundLayer.transitionTo = this.phaserInstance.add.tween(this.groundLayer)
           .to({alpha: 1}, 2000, Phaser.Easing.Linear.None);
       this.doodadsLayer.transitionTo = this.phaserInstance.add.tween(this.doodadsLayer)
           .to({alpha: 1}, 2000, Phaser.Easing.Linear.None);
       this.doorwaysLayer.transitionTo = this.phaserInstance.add.tween(this.doorwaysLayer)
           .to({alpha: 1}, 2000, Phaser.Easing.Linear.None);

       this.groundLayer.transitionFrom = this.phaserInstance.add.tween(this.groundLayer)
           .to({alpha: 0}, 2000, Phaser.Easing.Linear.None);
       this.doodadsLayer.transitionFrom = this.phaserInstance.add.tween(this.doodadsLayer)
           .to({alpha: 0}, 2000, Phaser.Easing.Linear.None);
       this.doorwaysLayer.transitionFrom = this.phaserInstance.add.tween(this.doorwaysLayer)
           .to({alpha: 0}, 2000, Phaser.Easing.Linear.None);
       //Collision indexes are consecutive across all tileset layers
       this.groundTileSet.setCollisionBetween(81,99, true, 'ground_doodads', true);
       this.groundTileSet.setCollisionBetween(15,16, true, 'ground', true);
       this.groundTileSet.setCollisionBetween(81,99, true, 'doors', true);
       this.player = new Player(phaserInstance, 200, 200);
       this.items = phaserInstance.add.group();
       this.items.alpha = 0;
       this.items.transitionTo = phaserInstance.add.tween(this.items)
           .to({alpha:1}, 2000, Phaser.Easing.Linear.None);
       this.items.transitionFrom = phaserInstance.add.tween(this.items)
           .to({alpha:0}, 2000, Phaser.Easing.Linear.None);
       this.items.enableBody = true;
       this.spawnInitialItems();
       this.drawCtx = phaserInstance.add.graphics(0,0);
       this.drawCtx.hp = 0;

       this.rainEmitter = phaserInstance.add.emitter(phaserInstance.world.centerX, 0, 1000);
       this.rainEmitter.makeParticles('rain');
       this.rainEmitter.width = phaserInstance.world.width;
       this.rainEmitter.minParticleScale = 0.5;
       this.rainEmitter.maxParticleScale = 1;

       this.rainEmitter.setYSpeed(300, 500);
       this.rainEmitter.setXSpeed(-5, 5);

       this.rainEmitter.minRotation = 0;
       this.rainEmitter.maxRotation = 0;
       this.rainEmitter.particleBringToTop = true;
       this.rainEmitter.start(false, 1500, 1);

       this.spawnDemon(300, 300);

       this.overlayCtx = phaserInstance.add.graphics(0,0);

       this.phaserInstance.camera.viewTween = {};

       Candy.shakeCamera(50, 2, 10, this.player, this.phaserInstance);
   };

   worldMap.prototype = {
       update: function(){

           if(!this.player.inRoom){
               this.demon.update();
               if(this.demon.hp <= 0){
                   this.runVictory();
               }
               if(this.items.children.length === 0 && this.player.hasBrassRing){
                   this.runTransformation();
                   this.player.hasBrassRing = false;
               }
               if(this.player.hasTome){
                   this.activateProjectiles();
                   this.player.hasTome = false;
               }
               this.phaserInstance.physics.arcade.overlap(this.player.sprite, this.doorwaysLayer, this.playerEnteredDoor, null, this);
               this.phaserInstance.physics.arcade.overlap(this.player.sprite, this.items, this.playerHitItem, null, this);
               this.phaserInstance.physics.arcade.collide(this.player.sprite, this.doodadsLayer);
               this.phaserInstance.physics.arcade.collide(this.player.sprite, this.groundLayer);
               this.phaserInstance.physics.arcade.overlap(this.player.bullets, this.demon, this.demonHit, null, this);
               this.player.update();
               if(this.player.hp <= 0){
                   this.runLoss();
               }
           }
           else{
               _.each(this.rooms, function(room){
                   room.update();
               });
           }

           this.drawOverlay();
           if(this.isRunning){
               if(this.player.inRoom){
                   this.drawHeldItems();
               }
               else{
                   this.drawHeldItems();
                   this.drawHealth();
               }
           }
       },
       runLoss: function(){
           this.transitionFrom();
           this.isRunning = false;
       },
       runVictory: function(){
           this.transitionFrom();
           this.isRunning = false;
       },
       runTransformation: function(){
           this.spawnDemon(this.player.sprite.x, this.player.sprite.y);
           this.player.sprite.kill();
       },
       activateProjectiles: function(){
           this.player.bullets = this.phaserInstance.add.group();
       },
       demonHit: function(bulletSprite, demonSprite){
           bulletSprite.kill();
           this.demon.hp-=1;
           Candy.shakeCamera(50, 2, 10, this.player, this.phaserInstance);
       },
       spawnDemon: function(x,y){
           var demonStartPoint = {x: x, y:y};
           var demonOffset = 2;
           var demonSpriteGroup = this.phaserInstance.add.group();
           demonSpriteGroup.enableBody = true;
           demonSpriteGroup.add(this.phaserInstance.add.sprite(demonStartPoint.x, demonStartPoint.y, 'player'));

           var temp = this.phaserInstance.add.sprite(demonStartPoint.x, demonStartPoint.y, 'player');
           temp.tween = this.getTweenWithOffset(temp);
           demonSpriteGroup.add(temp);
           temp.tween.start();

           temp = this.phaserInstance.add.sprite(demonStartPoint.x+demonOffset, demonStartPoint.y-demonOffset, 'player');
           temp.tween = this.getTweenWithOffset(temp);
           demonSpriteGroup.add(temp);
           temp.tween.start();

           temp = this.phaserInstance.add.sprite(demonStartPoint.x-demonOffset, demonStartPoint.y+demonOffset, 'player');
           temp.tween = this.getTweenWithOffset(temp);
           demonSpriteGroup.add(temp);
           temp.tween.start();

           temp = this.phaserInstance.add.sprite(demonStartPoint.x-demonOffset, demonStartPoint.y-demonOffset, 'player');
           temp.tween = this.getTweenWithOffset(temp);
           demonSpriteGroup.add(temp);
           temp.tween.start();

           this.demon = new Demon(demonSpriteGroup, this.player, this.phaserInstance);
       },
       getTweenWithOffset: function(sprite){
           return this.phaserInstance.add.tween(sprite)
               .to({alpha: 0}, 3000)
               .to({alpha: 1}, 3000)
               .loop();
       },
       drawOverlay: function(){
           this.overlayCtx.clear();
           this.overlayCtx.beginFill(Candy.gameBoyPalette.extraDarkBlueGreenHex, 0.5);
           for(var i=0; i<(1-this.player.hp/this.player.maxHp)*10000; i++){
               this.overlayCtx.drawRect(Math.random()*this.phaserInstance.world.width, Math.random()*this.phaserInstance.world.height,2,2);
           }
           this.overlayCtx.endFill();
           this.overlayCtx.beginFill(Candy.gameBoyPalette.extraDarkBlueGreenHex, Math.max(1-this.player.hp/this.player.maxHp, 0.2));
           this.overlayCtx.drawRect(0,0,this.phaserInstance.world.width*2, this.phaserInstance.world.height*2);
           this.overlayCtx.endFill();
       },
       drawHealth: function(){
           if(this.player.hp != this.drawCtx.hp){
               this.drawCtx.clear();
               this.drawCtx.beginFill(Candy.gameBoyPalette.lightBrownHex, 1);
               this.drawCtx.drawRoundedRect(this.phaserInstance.camera.view.x+20, this.phaserInstance.camera.view.y + this.phaserInstance.camera.view.height-25 , this.player.maxHp+10, 15, 3);
               this.drawCtx.endFill();
               this.drawCtx.beginFill(Candy.gameBoyPalette.darkBrownHex, 0.5);
               this.drawCtx.drawRect(this.phaserInstance.camera.view.x+25, this.phaserInstance.camera.view.y + this.phaserInstance.camera.view.height-20, this.drawCtx.hp, 5);
               this.drawCtx.endFill();
               this.player.hp > this.drawCtx.hp ? this.drawCtx.hp++ : this.drawCtx.hp--;
           }
       },
       drawHeldItems: function(){
           if(this.player.itemSpritesDirty){
               _.each(this.heldItems, function(item){
                   item.kill();
               });
               var i=0;
               _.each(this.player.itemSprites, function(spriteKey){
                   var itemSprite=this.phaserInstance.add.sprite(this.phaserInstance.camera.view.x+150 + (i*20), this.phaserInstance.camera.view.y + this.phaserInstance.camera.view.height-30, spriteKey);
                   itemSprite.scale.setTo(0.5);
                   this.heldItems.push(itemSprite);
                   i++;
               }, this);

               this.player.itemSpritesDirty = false;
           }
           else{
               var i=0;
               _.each(this.heldItems, function(item){
                   item.x = this.phaserInstance.camera.view.x+150 + (i*20);
                   item.y = this.phaserInstance.camera.view.y + this.phaserInstance.camera.view.height-30;
                   i++;
               }, this);
           }
       },
       transitionTo: function(){
           this.groundLayer.transitionTo.start();
           this.doodadsLayer.transitionTo.start();
           this.doorwaysLayer.transitionTo.start();
           this.items.transitionTo.start();
       },
       transitionFrom: function(nextTransitionDelegate, context){
           this.groundLayer.transitionFrom.start();
           this.doodadsLayer.transitionFrom.start();
           this.doorwaysLayer.transitionFrom.start();
           this.items.transitionFrom.start();
           if(nextTransitionDelegate) nextTransitionDelegate.apply(context);
       },
       playerEnteredDoor:function(playerSprite, doorSprite){
           console.log('door collide');
           if(!doorSprite.roomObj) {
               doorSprite.roomObj = new Room(this.phaserInstance, this.player, this);
               this.rooms.push(doorSprite.roomObj);
           }
           this.transitionFrom(doorSprite.roomObj.transitionTo, doorSprite.roomObj);
           this.player.inRoom = doorSprite.roomObj;
       },
       playerHitItem: function(playerSprite, itemSprite){
           var hpDifference = this.player.maxHp - this.player.hp;
           switch(itemSprite.itemType){
               case 1:
                   console.log('got blue pill');
                   this.player.hp += Math.min(hpDifference, 10);
                   break;
               case 2:
                   console.log('got ramen');
                   this.player.hp += Math.min(hpDifference, 10);
                   break;
               case 3:
                   console.log('got netfix');
                   this.player.hp += Math.min(hpDifference, 10);
                   break;
               case 4:
                   console.log('got dolla');
                   this.player.hp += Math.min(hpDifference, 20);
                   break;
               case 5:
                   this.player.hp += Math.min(hpDifference, 20);
                   break;
               case 6:
                   this.player.hp += Math.min(hpDifference, 20);
                   break;
               case 7:
                   this.player.hp += Math.min(hpDifference, 20);
                   break;
           }
           itemSprite.kill();
       },
       spawnInitialItems: function(){
           _.times(10, function(){
               var newItemData = this.getRandomItemData();
               var item = this.items.create(newItemData.x, newItemData.y, newItemData.sprite);
               item.itemType = newItemData.itemType;
               item.scale.x = 0.4;
               item.scale.y = 0.4;
           }, this);
           this.items.transitionTo.start();
       },
       getRandomItemData: function(){
           var itemData = {};
           itemData.itemType = Math.round(Math.random() * 4);
           switch(itemData.itemType){
               case 1:
                   itemData.sprite = 'bluePill';
                   break;
               case 2:
                   itemData.sprite = 'ramen';
                   break;
               case 3:
                   itemData.sprite = 'netfix';
                   break;
               case 4:
                   itemData.sprite = 'dolla';
                   break;
               case 5:
                   itemData.sprite = 'controller';
                   break;
               case 6:
                   itemData.sprite = 'coffee';
                   break;
               case 7:
                   itemData.sprite = 'energyDrink';
                   break;
           }
           itemData.x = this.phaserInstance.world.randomX;
           itemData.y = this.phaserInstance.world.randomY;
           return itemData;
       }
   };

   return worldMap;
});