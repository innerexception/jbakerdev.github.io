define(['player', 'room', 'lodash', 'candy'], function(Player, Room, _, Candy){
   var worldMap = function(phaserInstance){
       this.rooms = [];
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
       this.player = new Player(phaserInstance, 100, 100);
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
       //this.demon = new Demon(phaserInstance, 200, 200);

       this.overlayCtx = phaserInstance.add.graphics(0,0);

       this.phaserInstance.camera.viewTween = {};

       this.shakeCamera(50, 2, 10);
   };

   worldMap.prototype = {
       update: function(){

           //this.demon.update();
           if(!this.player.inRoom){
               this.phaserInstance.physics.arcade.overlap(this.player.sprite, this.doorwaysLayer, this.playerEnteredDoor, null, this);
               this.phaserInstance.physics.arcade.overlap(this.player.sprite, this.items, this.playerHitItem, null, this);
               this.phaserInstance.physics.arcade.collide(this.player.sprite, this.doodadsLayer);
               this.phaserInstance.physics.arcade.collide(this.player.sprite, this.groundLayer);
               this.player.update();
               if(this.player.hp != this.drawCtx.hp){

               }
           }

           this.drawOverlay();
           if(this.isRunning){
               this.drawHealth();

               _.each(this.rooms, function(room){
                   room.update();
               });

               this.updateCamera();
           }
       },
       shakeCamera: function(frequency, strength, duration){
           if(!this.phaserInstance.camera.viewTween.isRunning){
               console.log('shakin');
               this.phaserInstance.camera.viewTween = this.phaserInstance.add.tween(this.phaserInstance.camera)
                   .to({x:this.phaserInstance.camera.x+strength, y:this.phaserInstance.camera.y+strength}, frequency, Phaser.Easing.Linear.None)
                   .to({x:this.phaserInstance.camera.x-strength, y:this.phaserInstance.camera.y-strength}, frequency, Phaser.Easing.Linear.None)
                   .repeat(duration);
               this.phaserInstance.camera.viewTween.start();
           }
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

       updateCamera: function(){
           var pointerPosition = this.phaserInstance.input.mousePointer.position;
           var camera = this.phaserInstance.camera;

           if(pointerPosition.x >= 600 && camera.x <= 900){
               camera.x+=5;
           }
           if(pointerPosition.y >= 420 && camera.y <= 900){
               camera.y+=5;
           }
           if(pointerPosition.x < 25 && camera.x > 0){
               camera.x-=5;
           }
           if(pointerPosition.y < 25 && camera.y > 0) {
               camera.y -= 5;
           }

       },
       drawHealth: function(){
           if(this.player.hp != this.drawCtx.hp){
               this.drawCtx.clear();
               this.drawCtx.beginFill(Candy.gameBoyPalette.lightBrownHex, 1);
               this.drawCtx.drawRoundedRect(this.phaserInstance.camera.view.x+22, this.phaserInstance.camera.view.y + 415, this.player.maxHp+10, 35, 5);
               this.drawCtx.endFill();
               this.drawCtx.beginFill(Candy.gameBoyPalette.darkBrownHex, 0.5);
               this.drawCtx.drawRect(this.phaserInstance.camera.view.x+25, this.phaserInstance.camera.view.y + 420, this.drawCtx.hp, 25);
               this.drawCtx.endFill();
               this.player.hp > this.drawCtx.hp ? this.drawCtx.hp++ : this.drawCtx.hp--;
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
           nextTransitionDelegate.apply(context);
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
                   console.log('got red pill');
                   break;
               case 2:
                   console.log('got bluePill');
                   break;
               case 3:
                   console.log('got ramen');
                   this.player.hp += Math.min(hpDifference, 10);
                   break;
               case 4:
                   console.log('got netfix');
                   this.player.hp += Math.min(hpDifference, 20);
                   break;
           }
           itemSprite.kill();
       },
       spawnInitialItems: function(){
           for(var i=0; i<10; i++){
               var newItemData = this.getRandomItemData();
               var item = this.items.create(newItemData.x, newItemData.y, newItemData.sprite);
               item.itemType = newItemData.itemType;
               item.scale.x = 0.5;
               item.scale.y = 0.5;
           }
           this.items.transitionTo.start();
       },
       getRandomItemData: function(){
           var itemData = {};
           itemData.itemType = Math.round(Math.random() * 4);
           switch(itemData.itemType){
               case 1:
                   itemData.sprite = 'redPill';
                   break;
               case 2:
                   itemData.sprite = 'bluePill';
                   break;
               case 3:
                   itemData.sprite = 'ramen';
                   break;
               case 4:
                   itemData.sprite = 'netfix';
                   break;
               case 5:
                   itemData.sprite = 'dolla';
                   break;
               case 6:
                   itemData.sprite = 'controller';
                   break;
               case 7:
                   itemData.sprite = 'coffee';
                   break;
               case 8:
                   itemData.sprite = 'energyDrink';
                   break;
               case 9:
                   if(!this.brassRingExists){
                       itemData.sprite = 'brassRing';
                       this.brassRingExists = true;
                   }
                   else {
                       itemData.sprite = 'coffee';
                       itemData.itemType = 7;
                   }
                   break;
               case 10:
                   if(!this.whiteKeyExists){
                       itemData.sprite = 'whiteKey';
                       this.whiteKeyExists = true;
                   }
                   else{
                       itemData.sprite = 'dolla';
                       itemData.itemType = 5;
                   }
                   break;
               case 11:
                   if(!this.blackKeyExists){
                       itemData.sprite = 'blackKey';
                       this.blackKeyExists = true;
                   }
                   else{
                       itemData.sprite = 'controller';
                       itemData.itemType = 6;
                   }
                   break;
               case 12:
                   if(!this.tomeExists){
                       itemData.sprite = 'tome';
                       this.tomeExists = true;
                   }
                   else{
                       itemData.sprite = 'ramen';
                       itemData.itemType = 3;
                   }
                   break;
           }
           itemData.x = Math.round(Math.random() * 500);
           itemData.y = Math.round(Math.random() * 500);
           return itemData;
       }
   };

   return worldMap;
});