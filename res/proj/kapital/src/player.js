define([], function(){
   var player = function(phaserInstance, x, y){
       this.phaserInstance = phaserInstance;
       this.sprite = this.phaserInstance.add.sprite(x, y, 'player');
       this.sprite.bringToTop();
       this.phaserInstance.physics.enable(this.sprite);
       this.hp = 100;
       this.maxHp = 100;
       this.itemSprites = [];
       this.narrativeStart = 0;
   };

   player.prototype = {
       update: function(){
           if(this.phaserInstance.input.activePointer.isDown){
               this.phaserInstance.physics.arcade.accelerateToPointer(this.sprite, null, 60, 60, 60);
               if(!this.inRoom) this.hp-=0.007;
           }
           else{
               this.sprite.body.velocity.x = 0;
               this.sprite.body.velocity.y = 0;
           }
           if(this.phaserInstance.input.activePointer.justReleased() && this.bullets){
               var bullet = this.bullets.create(this.sprite.x, this.sprite.y, this.getRandomItemData().sprite);
               bullet.outOfBoundsKill = true;
               this.phaserInstance.physics.arcade.accelerateToPointer(bullet, null, 30,30,30);
           }
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

   return player;
});