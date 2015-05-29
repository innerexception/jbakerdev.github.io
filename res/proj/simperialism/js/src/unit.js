define(['candy'], function(Candy){
   var Unit = function(x, y, unitData, phaserInstance, sprite, isFriendly, bulletCollisionGroup, bulletSignal){
       this.unitData = unitData;
       this.isFriendly = isFriendly;
       this.bulletCollisionGroup = bulletCollisionGroup;
       this.isFighting = false;
       this.isTweening = true;
       this.bulletSignal = bulletSignal;
       this.sprite = sprite;
       this.sightBox = phaserInstance.add.sprite(this.sprite.x, this.sprite.y, 'sightBox');
       phaserInstance.physics.enable(this.sightBox, Phaser.Physics.ARCADE);
       this.phaserInstance = phaserInstance;
       if(unitData.type === 'military'){
           this.bullets = this.phaserInstance.add.group();
           this.bullets.enableBody = true;
           this.bullets.outOfBoundsKill = true;
           this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
           this.bulletInterval = 200;
       }
       this.sprite.spawnTween = this.phaserInstance.add.tween(this.sprite)
           .to({x:this.sprite.x-10, y:this.sprite.y + 40}, 1000, Phaser.Easing.Linear.None);
       this.sprite.spawnTween.onComplete.add(function(){this.isTweening = false;}, this);
       this.sprite.spawnTween.start();
   };

   Unit.prototype = {
       update: function() {

           if(!this.isFighting && !this.isTweening && !this.isDying){
               if (this.bullets) {
                   if (this.bulletInterval <= 0) {
                       //Fire gun, reset cooldown
                       var bullet = this.bullets.create(this.sprite.x, this.sprite.y, 'bullet');
                       bullet.anchor.setTo(0.5);
                       bullet.tint = Candy.gameBoyPalette.extraDarkGreen;
                       var bulX, bulY;
                       if(this.facing === 'right'){
                           bulX = this.sprite.x+100;
                           bulY = this.sprite.y;
                       }
                       if(this.facing === 'left'){
                           bulX = this.sprite.x-100;
                           bulY = this.sprite.y;
                       }
                       if(this.facing === 'up'){
                           bulX = this.sprite.x;
                           bulY = this.sprite.y-100;
                       }
                       if(this.facing === 'down'){
                           bulX = this.sprite.x;
                           bulY = this.sprite.y+100;
                       }
                       this.phaserInstance.physics.arcade.accelerateToXY(bullet,bulX,bulY, 150, 150, 150);
                       this.bulletInterval = 200;
                   }
                   else{
                       this.bulletInterval -= 1;
                   }
                   this.phaserInstance.physics.arcade.overlap(this.bullets, this.bulletCollisionGroup, this.unitBulletCollision, null, this);
               }
               //Run unit AI:
               //move aimlessly
               //Move towards enemy if in sight range
               //Unless near unique unit under orders, then stay near him until dismissed
               if(!this.isLeader){
                   if(this.leader){
                       this.followLeader();
                   }
                   else if(this.phaserInstance.physics.arcade.overlap(this.bulletCollisionGroup, this.sightBox, this.accelerateToEnemy, null, this)){
                   }
                   else{
                       this.wander();
                   }
                   this.sightBox.x = this.sprite.x;
                   this.sightBox.y = this.sprite.y;

                   if(this.sprite.body.velocity.x > 0){
                       if(this.sprite.body.velocity.y < 20 && this.sprite.body.velocity.y > 0){
                           this.sprite.animations.play('right');
                           this.facing = 'right';
                       }
                       else if(this.sprite.body.velocity.y > 20){
                           this.sprite.animations.play('down');
                           this.facing = 'down';
                       }
                       else if(this.sprite.body.velocity.y < -20){
                           this.sprite.animations.play('up');
                           this.facing = 'up';
                       }
                   }
                   else{
                       if(this.sprite.body.velocity.y < 20 && this.sprite.body.velocity.y > 0){
                           this.sprite.animations.play('left');
                           this.facing = 'left';
                       }
                       else if(this.sprite.body.velocity.y > 20){
                           this.sprite.animations.play('down');
                           this.facing = 'down';
                       }
                       else if(this.sprite.body.velocity.y < -20){
                           this.sprite.animations.play('up');
                           this.facing = 'up';
                       }
                   }
               }
               else{
                   this.sprite.scale.x = 2;
                   this.sprite.scale.y = 2;
                   if(this.phaserInstance.input.mousePointer.isDown){
                       this.phaserInstance.physics.arcade.accelerateToPointer(this.sprite, null, 100,100,100);
                   }
               }

           }

       },
       unitBulletCollision: function(bulletSprite, unitSprite){
           this.bulletSignal.dispatch(bulletSprite, unitSprite);
       },
       die: function(){
           if(!this.isDying){
               this.isDying = true;
               //U dead. Bodies stay for 30 secs
               this.sprite.body.velocity.x = 0;
               this.sprite.body.velocity.y = 0;
               this.sprite.body.acceleration.x = 0;
               this.sprite.body.acceleration.y = 0;
               this.sprite.animations.play('die');
               var that = this;
               window.setTimeout(function(){
                   console.log('removing a body');
                   that.sprite.kill();
                   that.sprite.destroy();
                   delete that.sprite;
               }, 30000);
           }
       },
       accelerateToEnemy: function(thisSprite, enemySprite){
           this.phaserInstance.physics.arcade.accelerateToObject(this.sprite, enemySprite, 60, 60,60);
           //use special here
           this.specialAttack(enemySprite.obj);
       },
       wander: function(){
            if(this.directionTimer >=0){
                this.directionTimer -= 1;
            }
           else{
                this.directionTimer = 100;
                this.phaserInstance.physics.arcade.accelerateToXY(this.sprite, Math.random()*this.phaserInstance.world.width,
                    Math.random()*this.phaserInstance.world.height, 30, 30, 30);
            }
       },
       followLeader: function(){
           if(this.leader && !this.leader.isFighting){
               console.log('following some asshole');
               this.phaserInstance.physics.arcade.accelerateToObject(this.sprite, this.leader.sprite, 30, 30, 30);
           }
       },
       specialAttack: function(targetObj){
           if(this.unitData.type === 'intelligencia' && targetObj.unitData.type === 'oligarch'){
               //Oratory
               //Play animation, 50% chance to remove
           }
           if(this.unitData.type === 'oligarch' && targetObj.unitData.type === 'military'){
               //Bribe
               //Play animation, 50% chance to remove
           }
       }
   };

   return Unit;
});