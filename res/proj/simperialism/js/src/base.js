define(['unitData'], function(UnitTypes){
   var Base = function(x,y,phaserInstance, signal, isFriendly){
       this.phaserInstance = phaserInstance;
       this.spawnSignal = signal;
       this.x = x;
       this.y = y;
       this.isFriendly = isFriendly;
       this.spawnDelay = 100;
       this.intRate = {};
       this.milRate = {};
       this.oliRate = {};
   };

   Base.prototype = {
       update: function(){
           if(!this.sprite){
               this.sprite = this.phaserInstance.add.sprite(this.x,this.y,'base');
               this.sprite.anchor.setTo(0.5, 0.5);
               this.sprite.scale.x = 0.0001;
               this.sprite.scale.y = 0.0001;
               this.sprite.appear = this.phaserInstance.add.tween(this.sprite.scale)
                   .to({x:1, y:1}, 1000, Phaser.Easing.Bounce.Out);
               this.sprite.appear.start();
               this.sprite.animations.add('spawn', [1,2,3,4,5,6], 5, false);
               this.phaserInstance.physics.enable(this.sprite);
               this.sprite.body.immovable = true;
           }
           if(this.spawnDelay >= 0){
               this.spawnDelay -= 1;
           }
           else{
               var seed = Math.random();
               var nextType;

               if(seed <= this.intRate.max){
                   nextType = UnitTypes.Intelligencia;
               }
               else if(seed <= this.milRate.max){
                   nextType = UnitTypes.Miltary;
               }
               else{
                   nextType = UnitTypes.Oligarch;
               }

               console.log('spawning a '+nextType.type);
               this.spawnSignal.dispatch(this.sprite.x, this.sprite.y, nextType, this.isFriendly);
           }
       },
       setSpawnDistribution: function(rawInt, rawMil, rawOli){
           var total = rawInt + rawMil + rawOli;
           this.intRate.min = 0;
           this.intRate.max = rawInt/total;
           this.milRate.min = this.intRate.max;
           this.milRate.max = (rawMil/total)+this.intRate.max;
           this.oliRate.max = (rawOli/total) + this.intRate.max + this.milRate.max;
           this.oliRate.min = this.milRate.min;
       }
   };

   return Base;
});