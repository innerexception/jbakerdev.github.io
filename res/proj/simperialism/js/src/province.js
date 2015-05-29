define(['lodash', 'candy', 'unit', 'base'], function(_, Candy, Unit, Base){
   var Province = function(provinceData, phaserInstance){
       this.units = [];
       this.phaserInstance = phaserInstance;

       this.friendlyUnitsGroup = this.phaserInstance.add.group();
       this.friendlyUnitsGroup.enableBody = true;
       this.friendlyUnitsGroup.physicsBodyType = Phaser.Physics.ARCADE;
       this.friendlyUnitsGroup.collideWorldBounds = true;

       this.enemyUnitsGroup = this.phaserInstance.add.group();
       this.enemyUnitsGroup.enableBody = true;
       this.enemyUnitsGroup.physicsBodyType = Phaser.Physics.ARCADE;
       this.enemyUnitsGroup.collideWorldBounds = true;

       this.fights = [];
       this.name = provinceData.name;
       this.edges = provinceData.edges;
       this.nameText = phaserInstance.add.text(-100, -100, provinceData.name);
       Candy.setTextProps(this.nameText, {fontSiez:24, fill:Candy.gameBoyPalette.darkBlueGreen});
       this.nameText.nameTextTween = this.phaserInstance.add.tween(this.nameText)
           .to({x:300, y:200}, 2000, Phaser.Easing.Bounce.Out)
           .to({x:305, y:205}, 2000, Phaser.Easing.Linear.None)
           .to({x:-100, y:-100}, 500, Phaser.Easing.Linear.None);
       this.nameText.nameTextTween._lastChild.onComplete.add(function(){
           this.enableUI = true;
           this.updateUI();
       }, this);

       this.spawnSignal = new Phaser.Signal();
       this.spawnSignal.add(this.spawnUnit, this);

       this.bulletSignal = new Phaser.Signal();
       this.bulletSignal.add(this.unitBulletCollision, this);

       this.UICtx = this.phaserInstance.add.graphics(0,0);
       this.spawnerHandleCtx = this.phaserInstance.add.graphics(0,0);

       this.enemyUnitCount = 0;
       this.friendlyUnitCount = 0;
       this.bottomLeftPoint = {x:this.phaserInstance.camera.view.width/2, y:this.phaserInstance.camera.view.height - 20};
       var triangle = new Phaser.Polygon([this.bottomLeftPoint,
           {x:this.bottomLeftPoint.x+75, y:this.bottomLeftPoint.y},
           {x:this.bottomLeftPoint.x+37, y:this.bottomLeftPoint.y-75}]);
       this.spawnerHandle = {x:this.bottomLeftPoint.x, y:this.bottomLeftPoint.y, isDragging: false, triangle: triangle};
       this.spawnerHandle.int = 94;
       this.spawnerHandle.mil = 3;
       this.spawnerHandle.oli = 3;

       this.intelligenciaCount ={friendly:0, enemy:0};
       this.militaryCount = {friendly:0, enemy:0};
       this.oligarchCount ={friendly:0, enemy:0};

   };

   Province.prototype = {
       update: function(){
           if(this.enableUI){
               //Update bases
               this.enemyBase.update();
               this.friendlyBase.update();

               this.phaserInstance.physics.arcade.overlap(this.friendlyUnitsGroup, this.enemyUnitsGroup, this.unitMeleeCollision, null, this);
               this.phaserInstance.physics.arcade.collide(this.friendlyUnitsGroup, this.layer);
               this.phaserInstance.physics.arcade.collide(this.enemyUnitsGroup, this.layer);
               this.phaserInstance.physics.arcade.collide(this.enemyUnitsGroup, this.friendlyBase, this.enemySpawnInFriendlyBase, null, this);
               this.phaserInstance.physics.arcade.collide(this.friendlyUnitsGroup, this.enemyBase, this.tryEnterEnemyBase, null, this);
               this.phaserInstance.physics.arcade.collide(this.enemyUnitsGroup, this.enemyBase, this.enemySpawnInEnemyBase, null, this);
               this.phaserInstance.physics.arcade.collide(this.friendlyBase, this.friendlyBase, this.friendlySpawnInFriendlyBase, null, this);
           }
           _.each(this.units, function(unit){
               if(unit && unit.sprite){
                   unit.update();
               }
               else{
                   this.units.splice(this.units.indexOf(unit), 1);
               }
           }, this);

           this.updateFights();

           if(this.spawnerHandle.isDragging){
               var position = this.phaserInstance.input.activePointer.position;
               if(this.spawnerHandle.triangle.contains(position.x, position.y)){
                   this.spawnerHandle.x = this.phaserInstance.input.activePointer.position.x;
                   this.spawnerHandle.y = this.phaserInstance.input.activePointer.position.y;
                   this.spawnerHandle.int = 80-Phaser.Math.distance(this.spawnerHandle.triangle._points[0].x, this.spawnerHandle.triangle._points[0].y, this.spawnerHandle.x, this.spawnerHandle.y);
                   this.spawnerHandle.mil = 80-Phaser.Math.distance(this.spawnerHandle.triangle._points[1].x, this.spawnerHandle.triangle._points[1].y, this.spawnerHandle.x, this.spawnerHandle.y);
                   this.spawnerHandle.oli = 80-Phaser.Math.distance(this.spawnerHandle.triangle._points[2].x, this.spawnerHandle.triangle._points[2].y, this.spawnerHandle.x, this.spawnerHandle.y);
                   console.log(this.spawnerHandle.int + ' int, '+ this.spawnerHandle.mil + ' mil, '+ this.spawnerHandle.oli + ' oli, ');
                   this.friendlyBase.setSpawnDistribution(this.spawnerHandle.int, this.spawnerHandle.mil, this.spawnerHandle.oli);
                   this.updateSpawnerHandle();
               }
           }
       },
       updateUI: function(){
           this.UICtx.clear();

           //push-pull bar
           this.UICtx.beginFill(Candy.gameBoyPalette.blueGreenHex, 0.7);
           this.UICtx.drawRect(this.bottomLeftPoint.x-200,
               this.bottomLeftPoint.y - 20,
               this.friendlyUnitPercentage*100, 20);
           this.UICtx.endFill();
           this.UICtx.beginFill(Candy.gameBoyPalette.darkBlueGreenHex, 0.7);
           this.UICtx.drawRect(this.bottomLeftPoint.x-200 + (this.friendlyUnitPercentage * 100),
               this.bottomLeftPoint.y - 20,
               this.enemyUnitPercentage*100, 20);
           this.UICtx.endFill();

           //unique unit status: rectangle with copy of sprite in it with infinite walk animation, bg color changes if fighting or any enemy in base

           this.updateSpawnerHandle();
       },
       updateSpawnerHandle: function(){
           this.spawnerHandleCtx.clear();
           //Spawner control triangle
           this.spawnerHandleCtx.beginFill(Candy.gameBoyPalette.lightBlueGreenHex, 0.7);
           this.spawnerHandleCtx.drawTriangle([this.bottomLeftPoint,
               {x:this.bottomLeftPoint.x+75, y:this.bottomLeftPoint.y},
               {x:this.bottomLeftPoint.x+37, y:this.bottomLeftPoint.y-75}]);
           this.spawnerHandleCtx.endFill();

           if(!this.spawnerIntLabel){
               this.spawnerIntLabel = this.phaserInstance.add.sprite(this.bottomLeftPoint.x, this.bottomLeftPoint.y, 'intelligencia_surface_unit');
               this.spawnerIntLabel.anchor.setTo(0.5);
           }
           else {
               this.spawnerIntLabel.y = this.bottomLeftPoint.y;
               this.spawnerIntLabel.x = this.bottomLeftPoint.x;
               this.spawnerIntLabel.scale.x = this.spawnerHandle.int/30;
               this.spawnerIntLabel.scale.y = this.spawnerHandle.int/30;
           }

           if(!this.spawnerMilLabel){
               this.spawnerMilLabel = this.phaserInstance.add.sprite(this.bottomLeftPoint.x+75, this.bottomLeftPoint.y, 'military_surface_unit');
               this.spawnerMilLabel.anchor.setTo(0.5);
           }
           else {
               this.spawnerMilLabel.y = this.bottomLeftPoint.y;
               this.spawnerMilLabel.x = this.bottomLeftPoint.x+75;
               this.spawnerMilLabel.scale.x = this.spawnerHandle.mil/30;
               this.spawnerMilLabel.scale.y = this.spawnerHandle.mil/30;
           }

           if(!this.spawnerOliLabel){
               this.spawnerOliLabel = this.phaserInstance.add.sprite(this.bottomLeftPoint.x+37, this.bottomLeftPoint.y-75, 'oligarch_surface_unit');
               this.spawnerOliLabel.anchor.setTo(0.5);
           }
           else {
               this.spawnerOliLabel.y = this.bottomLeftPoint.y-75;
               this.spawnerOliLabel.x = this.bottomLeftPoint.x+37;
               this.spawnerOliLabel.scale.x = this.spawnerHandle.oli/30;
               this.spawnerOliLabel.scale.y = this.spawnerHandle.oli/30;
           }

           //Spawner control draggable indicator
           this.spawnerHandleCtx.beginFill(Candy.gameBoyPalette.darkGreenHex, 0.7);
           this.spawnerHandleCtx.drawCircle(this.spawnerHandle.x, this.spawnerHandle.y, 10);
           this.spawnerHandleCtx.endFill();
       },
       enemySpawnInFriendlyBase: function(){

       },
       tryEnterEnemyBase: function(){

       },
       enemySpawnInEnemyBase: function(){

       },
       friendlySpawnInFriendlyBase: function(){

       },
       transitionTo: function(){
           this.polyDrawer.beginFill(0xFFFFFF, 0.5);
           this.polyDrawer.drawPolygon(this.polygon);
           this.phaserInstance.world.bringToTop(this.nameText);
           this.polygonTween.start();
           this.polygonSizeTween.start();
           this.nameText.nameTextTween.start();
           this.createSurfaceView();
       },
       createSurfaceView: function(){
           this.resetDrawingContext();

           this.tileMap = this.phaserInstance.add.tilemap(this.name+'_map');
           this.tileMap.addTilesetImage('surface_plains', 'surface_plains');
           this.layer = this.tileMap.createLayer('surface');
           this.phaserInstance.world.sendToBack(this.layer);

           this.enemyBase = new Base(this.phaserInstance.world.width - (this.phaserInstance.world.width/4),
               this.phaserInstance.world.height/2, this.phaserInstance, this.spawnSignal, false);
           this.friendlyBase = new Base(this.phaserInstance.world.width/4,
               this.phaserInstance.world.height/2, this.phaserInstance, this.spawnSignal, true);

           this.layer.alpha = 0;
           this.layer.resizeWorld();
           this.tileMap.setCollisionBetween(9, 11, true, 'surface', true);

           var layerTween = this.phaserInstance.add.tween(this.layer)
               .to({alpha: 1}, 2000, Phaser.Easing.Linear.None);
           layerTween.start();

           this.layer.inputEnabled = true;
           this.layer.events.onInputDown.add(this.onProvinceClick, this);
           this.layer.events.onInputUp.add(this.onProvinceDragEnd, this);

       },
       onProvinceClick: function(){
            var position = this.phaserInstance.input.activePointer.position;
            if(Phaser.Circle.contains(new Phaser.Circle(this.spawnerHandle.x, this.spawnerHandle.y, 10), position.x, position.y)){
                console.log('started dragging spawn handle');
                this.spawnerHandle.isDragging = true;
            }
       },
       onProvinceDragEnd: function(){
            this.spawnerHandle.isDragging = false;
       },
       createBaseView: function(){
           this.resetDrawingContext();

           this.tileMap = this.phaserInstance.add.tilemap('base_map');
           this.tileMap.addTilesetImage('base_tiles', 'base_tiles');
           this.layer = this.tileMap.createLayer('base');
           this.layer.resizeWorld();
           this.tileMap.setCollision(1,2);
           this.phaserInstance.physics.p2.convertTilemap(this.tileMap, this.layer);

       },
       unitBulletCollision: function(bulletSprite, unitSprite) {
           var unit = Candy.getObjectFromSprite(unitSprite, this.units);
           if (unit){
               this.updateUnitCount(-1, unit.isFriendly);
               unit.die();
           }
           bulletSprite.kill();
       },
       spawnUnit: function(x, y, unitType, isFriendly){
           var unit = isFriendly ? this.friendlyUnitsGroup.create(x, y, unitType.sprite) : this.enemyUnitsGroup.create(x, y, unitType.sprite);
           unit.animations.add('right', [0,1,2], 5, true);
           unit.animations.add('left', [3,4,5], 5, true);
           unit.animations.add('down', [6,7,8], 5, true);
           unit.animations.add('up', [9,10,11], 5, true);
           unit.animations.add('die', [12,13,14], 5, false);

           var targetCollisionGroup = isFriendly ? this.enemyUnitsGroup : this.friendlyUnitsGroup;
           var newUnit = new Unit(x, y, unitType, this.phaserInstance, unit, isFriendly, targetCollisionGroup, this.bulletSignal);
           if(this.friendlyLeader && isFriendly)newUnit.leader = this.friendlyLeader;
           this.units.push(newUnit);

           switch(unitType.type){
               case 'military':
                   isFriendly ? this.militaryCount.friendly++ : this.militaryCount.enemy++;
                   break;
               case 'intelligencia':
                   isFriendly ? this.intelligenciaCount.friendly++ : this.intelligenciaCount.enemy++;
                   break;
               case 'oligarch':
                   isFriendly ? this.oligarchCount.friendly++ : this.oligarchCount.enemy++;
                   break;
           }

           if(isFriendly){
               this.friendlyBase.sprite.animations.play('spawn');
               this.friendlyBase.spawnDelay = 1000 - (this.intelligenciaCount.friendly + (this.oligarchCount.friendly*1.5));
           }
           else{
               this.enemyBase.sprite.animations.play('spawn');
               this.enemyBase.spawnDelay = 1000 - (this.intelligenciaCount.enemy + (this.oligarchCount.enemy*1.5));
           }
           unit.inputEnabled = true;
           unit.events.onInputDown.add(this.onLeaderSelect, this);

           this.updateUnitCount(1, isFriendly);
           this.updateUI();
       },
       updateUnitCount: function(amount, isFriendly){
           if(isFriendly){
               this.friendlyUnitCount+=amount;
               this.friendlyUnitPercentage = this.friendlyUnitCount / (this.friendlyUnitCount + this.enemyUnitCount);
           }
           else{
               this.enemyUnitCount+=amount;
               this.enemyUnitPercentage = this.enemyUnitCount / (this.friendlyUnitCount + this.enemyUnitCount);
           }
       },
       onLeaderSelect: function(unitSprite){
           var object = Candy.getObjectFromSprite(unitSprite, this.units);
           if(!object){console.log('clicked sprite with NO unit object!!'); return;}
           if(object.isFriendly && !this.friendlyLeader){
               this.friendlyLeader = object;
               object.isLeader = true;
               _.each(this.units, function(unit){
                   if(!unit.isLeader && unit.isFriendly)unit.leader = object;
               });
           }
       },
       unitMeleeCollision: function(attackerSprite, defenderSprite){
           //Put these two in the fight list so they can't collide with each other anymore
           var attacker=Candy.getObjectFromSprite(attackerSprite, this.units);
           var defender=Candy.getObjectFromSprite(defenderSprite, this.units);
           if(attacker && !attacker.isFighting && defender && !defender.isFighting){
            var fight = {
                attacker:attacker,
                defender:defender,
                sprite:this.phaserInstance.add.sprite(attackerSprite.x, attackerSprite.y, 'fight'),
                timeLeft: 300
            };
            console.log('fight started.');
            fight.attacker.isFighting = true;
            fight.attacker.sprite.body.velocity.x = 0;
            fight.attacker.sprite.body.velocity.y = 0;
            fight.attacker.sprite.body.acceleration.x = 0;
            fight.attacker.sprite.body.acceleration.y = 0;
            fight.defender.isFighting = true;
            fight.defender.sprite.body.velocity.x = 0;
            fight.defender.sprite.body.velocity.y = 0;
            fight.defender.sprite.body.acceleration.x = 0;
            fight.defender.sprite.body.acceleration.y = 0;

            fight.sprite.scale.x = 2;
            fight.sprite.scale.y = 2;
            fight.sprite.animations.add('fight', [1,2,3,4,5],5, true);
            fight.sprite.animations.play('fight');
            this.fights.push(fight);
           }
       },
       resetDrawingContext: function(){
           if(this.tileMap){
               this.tileMap.destroy();
               this.layer.destroy();
           }
       },
       updateFights: function(){
           var deleteIndexes = [];
           _.each(this.fights, function(fight){
               if(fight.timeLeft >= 0){
                   fight.timeLeft-=1;
               }
               else{
                   console.log('garbage collecting a fight.');
                   if(fight.sprite.alive){
                       fight.sprite.kill();
                       fight.sprite.destroy();
                   }

                   if(Math.random() * 100 > 50){
                       //Attacker wins
                       fight.attacker.isFighting = false;
                       if(fight.defender.isLeader){
                           _.each(this.units, function(unit){
                               delete unit.leader;
                           });
                           delete this.friendlyLeader;
                       }
                       fight.defender.die();
                       this.updateUnitCount(-1, fight.defender.isFriendly);
                       console.log('attacker won a fight.');
                   }
                   else{
                       //Defender wins
                       fight.defender.isFighting = false;
                       if(fight.attacker.isLeader){
                           _.each(this.units, function(unit){
                               delete unit.leader;
                           });
                           delete this.friendlyLeader;
                       }
                       fight.attacker.die();
                       this.updateUnitCount(-1, fight.attacker.isFriendly);
                       console.log('defender won a fight.');
                   }
                   deleteIndexes.push(this.fights.indexOf(fight));
               }
           }, this);
           _.each(deleteIndexes, function(index){
               this.fights.splice(index, 1);
           },this);
       }
   };

   return Province;
});