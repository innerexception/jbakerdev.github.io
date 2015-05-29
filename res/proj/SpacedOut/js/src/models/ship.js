define(['lodash'], function(_){
   var ship = function(planet, player, type, range, speed, weapon, shield, mini, gameInstance, isPrototype){
        this.type = type;
        if(type === this.Constants.ShipTypes.Colony && planet.population > 7500){
            this.colonists = 7500;
            planet._setPopulation(planet.population - 7500);
        }
        this.id = 'ship_'+Math.random();
        this.range = ((range * 0.3) * this.Constants.TechStats.rangeBase) + this.Constants.TechStats.rangeBase;
        this.rangeLevel = range;
        this.speed = ((speed * 0.3) * this.Constants.TechStats.speedBase) + this.Constants.TechStats.speedBase;
        this.speedLevel = speed;
        this.weapon = weapon;
        this.shield = shield;
        this.mini = mini;
        this.prototypeCost = 0;
        this.updateProductionCost();
        this.updateMetalCost();
        this.number = 0;
        this.spriteGroup = null;
        this.owner = player;
        this.gameInstance = gameInstance;
        this.hp = 3;
        this.drawAtLocation(planet.getCenterPoint().x, planet.getCenterPoint().y, {orbit: true, create: true});
        if(isPrototype){
           player.designs.push(this);
        }
   };

   ship.prototype = {
       updatePrototypeCost: function(){
           this.prototypeCost= (parseInt(this.rangeLevel) + parseInt(this.speedLevel) + this.shield + this.weapon + this.mini) * 1000;
       },
       updateProductionCost: function(){
           this.productionCost= (parseInt(this.rangeLevel) + parseInt(this.speedLevel) + this.shield + this.weapon + this.mini) * 100;
       },
       updateMetalCost: function(){
           this.metalCost = (parseInt(this.rangeLevel) + parseInt(this.speedLevel) + this.shield + this.weapon - this.mini) * 100;
       },
       drawAtLocation: function(x, y, options){
           if(options.create){
               this._destroySpritesAndGroup();
               this.spriteGroup = this._createShipSpriteGroup(x-40,
                   y+(Math.random()*-40), 0.2, this.gameInstance);
           }
           if(options.warpIn && options.orbit){
               this._playWarpInAndOrbit(this.spriteGroup, x, y);
           }
           else if(options.warpOut){
               this._playWarpOut(this.spriteGroup, x, y);
           }
           else if(options.orbit){
               this._playOrbit(this.spriteGroup, x, y);
           }
           else if(options.move){
               this._playMove(this.spriteGroup, x, y);
           }
       },
       updateShipSprites: function(){
           this.drawAtLocation(0, 0, {orbit: true, create: true});
       },
       _createShipSpriteGroup: function(x, y, scale, phaserInstance){
           var spriteGroup = phaserInstance.add.group(phaserInstance.stageGroup);
           spriteGroup.create(0,0,'common_range_'+this.rangeLevel);
           spriteGroup.create(65,10,'common_shield_'+this.shield);
           spriteGroup.create(165,0,'common_head');
           spriteGroup.create(225,0,this.owner.name+'_weapon_'+this.weapon);

           if(scale){
               spriteGroup.scale.y = scale;
               spriteGroup.scale.x = scale;
           }
           spriteGroup.x = x;
           spriteGroup.y = y;

           spriteGroup.explode = this._explodeAndDestroy;

           var bmd = this.gameInstance.make.bitmapData(300,65);
           bmd.draw(spriteGroup.children[0], 0, 0);
           bmd.draw(spriteGroup.children[1], 65, 10);
           bmd.draw(spriteGroup.children[2], 165, 0);
           bmd.draw(spriteGroup.children[3], 225, 0);
           switch(this.type){
               case 'colony':
                   spriteGroup.create(75,20,'common_colony_module');
                   bmd.draw(spriteGroup.children[4], 75, 20);
                   break;
               case 'tanker':
                   spriteGroup.create(65,15,'common_tanker_module');
                   bmd.draw(spriteGroup.children[4], 75, 20);
                   break;
           }

           spriteGroup.thumbnailPath = bmd.canvas.toDataURL();

           return spriteGroup;
       },
       _explodeAndDestroy: function(spriteGroup, phaserInstance){
           var explodeSprite = phaserInstance.add.sprite(spriteGroup.x, spriteGroup.y, 'explosion', null, phaserInstance.stageGroup);
           explodeSprite.alpha = 0;
           explodeSprite.tween = phaserInstance.add.tween(explodeSprite)
               .to({alpha: 1}, 500)
               .to({alpha: 0}, 500);
           explodeSprite.tween.start();
           spriteGroup.destroy(true);
       },
       _destroySpritesAndGroup: function(){
           if(this.spriteGroup){
               if(this.spriteGroup.orbitTween) delete this.spriteGroup.orbitTween;
               this.spriteGroup.destroy(true);
           }
       },
       _onOrbitComplete: function(target, tween){
           if(this.orbitIn){
               this.orbitIn = false;
               this.gameInstance.stageGroup.sendToBack(target);
           }
           else{
               this.orbitIn = true;
               this.gameInstance.stageGroup.bringToTop(target);
           }
       },
       _playOrbit: function(spriteGroup, x, y){
           spriteGroup.orbitTween && spriteGroup.orbitTween.stop();
           spriteGroup.orbitTween = this.gameInstance.add.tween(spriteGroup)
               .to({x: x, y: y+(Math.random()*-40) }, 5000, Phaser.Easing.Linear.None)
               .to({x: x-40, y: y+(Math.random()*-40) }, 5000, Phaser.Easing.Linear.None)
               .to({x: x, y: y }, 5000, Phaser.Easing.Linear.None)
               .loop();
           spriteGroup.orbitTween.onChildComplete.add(this._onOrbitComplete, this);
           spriteGroup.orbitTween.start();
           this.orbitIn = true;
           console.log('running orbit animation on a ship');
       },
       _playWarpInAndOrbit: function(spriteGroup, x, y){
            //TODO
           console.log('running warp in & orbit animation on a ship');
       },
       _playWarpOut: function(spriteGroup, x, y){
           //TODO
           console.log('running warp out animation on a ship');
       },
       _playMove: function(spriteGroup, x, y){
           //TODO
           console.log('running move animation on a ship');
           spriteGroup.orbitTween && spriteGroup.orbitTween.stop();
           spriteGroup.moveTween && spriteGroup.moveTween.stop();
           spriteGroup.moveTween = this.gameInstance.add.tween(spriteGroup)
               .to({x: x, y: y}, 1000, Phaser.Easing.Linear.None);
           spriteGroup.moveTween.start();
       }
   };

   ship.prototype.Constants= {
       TechStats: {
           rangeBase: 150,
           speedBase: 30
       },
       ShipTypes: {
           Colony: 'colony',
           Scout: 'scout',
           Fighter: 'fighter',
           Tanker: 'tanker',
           Dreadnaught: 'dreadnaught',
           Platform: 'platform'
       }
   };

   return ship;
});