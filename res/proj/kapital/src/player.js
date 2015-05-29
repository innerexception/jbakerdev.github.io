define([], function(){
   var player = function(phaserInstance, x, y){
       this.phaserInstance = phaserInstance;
       this.sprite = this.phaserInstance.add.sprite(x, y, 'player');
       this.sprite.bringToTop();
       this.phaserInstance.physics.enable(this.sprite);
       this.hp = 100;
       this.maxHp = 100;
   };

   player.prototype = {
       update: function(){
           if(this.phaserInstance.input.activePointer.isDown){
               this.phaserInstance.physics.arcade.accelerateToPointer(this.sprite, null, 60, 60, 60);
               this.hp-=0.1;
           }
           else{
               this.sprite.body.velocity.x = 0;
               this.sprite.body.velocity.y = 0;
           }
       }
   };

   return player;
});