define(['worldGen'], function(worldGen){
   var planet = function(gameInstance, name, temp, gravity, metal, position){
       this.position = position;
       this.id = 'planet_'+Math.random();
       this.name = name;
       this.temp = parseInt(temp);
       this.tempChange = 0;
       this.population = 0;
       this.populationGrowth = 0;
       this.income = 0;
       this.incomeGrowth = 0;
       this.isExplored = false;
       this.gravity = parseFloat(gravity);
       this.owner = null;
       this.metal = parseInt(metal);
       this.miningChange = 0;
       this.gameInstance = gameInstance;
       this.sprites = this._getPlanetSprites(temp, gravity, metal, position);
       this.bannerSprite = null;
       this.miningPercent = 50;
       this.terraformPercent = 50;
       this.budgetPercent = 0;
       this.budgetAmount = 0;
       this.fleets = [];
       this.selectedFleet = null;
   };
   planet.prototype = {
       setNewOwner: function(player, population, clientPlayer, isHumanHomeworld){
           if(!population) console.log("WARNING! NO POPULATION SENT TO setNewOwner!");
           if(this.bannerSprite)this.bannerSprite.destroy();
           if((clientPlayer && player === clientPlayer) || isHumanHomeworld){
               this.setIsExplored(true);
           }
           //draw the player banner on the planet top left
           this.owner = player;
           if(this.population === 0) this._setPopulation(population);
           this.setTerraformPercent(50);
           this.bannerSprite = this.gameInstance.add.sprite(this.position.x-10, this.position.y-10, player.name+'_banner', null, this.gameInstance.stageGroup);
           //TODO: colonization animation here
           this.gameInstance.planetUpdatedSignal && this.gameInstance.planetUpdatedSignal.dispatch(this);
           this.gameInstance.budgetUpdatedSignal && this.gameInstance.budgetUpdatedSignal.dispatch();
           return this;
       },
       setIsExplored: function(value){
           this.isExplored = value;
           this.sprites = this._getPlanetSprites(this.temp, this.gravity, this.metal, this.position);
       },
       setTerraformPercent: function(percent){
           this.terraformPercent = percent;
           this.tempChange = parseFloat((((this.terraformPercent/100) * ((this.budgetPercent/100) * this.owner.moneyIncome)) /1000).toFixed(1)); // = Total terra cash / cash per degree of change
           if(this.tempChange > 72) this.tempChange = -this.tempChange;
           this.miningPercent = 100-percent;
           this.miningChange = Math.round((this.miningPercent/100) * ((this.budgetPercent/100) * this.owner.moneyIncome) / 100);
           this._setPopulationGrowth();
           this.gameInstance.planetUpdatedSignal && this.gameInstance.planetUpdatedSignal.dispatch(this);
       },
       refreshTerraformNumbers: function(){
           this.tempChange = parseFloat((((this.terraformPercent/100) * ((this.budgetPercent/100) * this.owner.moneyIncome)) /1000).toFixed(1)); // = Total terra cash / cash per degree of change
           if(this.tempChange > 72) this.tempChange = -this.tempChange;
           this.miningPercent = 100-this.terraformPercent;
           this.miningChange = Math.round((this.miningPercent/100) * ((this.budgetPercent/100) * this.owner.moneyIncome) / 100);
           this._setPopulationGrowth();
           this.gameInstance.planetUpdatedSignal.dispatch(this);
       },
       setSelectedFleet: function(fleetObj){
           this.selectedFleet = _.filter(this.fleets, function(fleet){
               if(fleet.id !== fleetObj.id) fleet.isSelected = false;
               return fleet.id === fleetObj.id;
           })[0];
           this.selectedFleet.isSelected = true;
           this.gameInstance.planetUpdatedSignal.dispatch(this);
       },
       removeFleet: function(fleetObj){
           this.fleets = _.filter(this.fleets, function(fleet){
               return fleet.id !== fleetObj.id;
           });
           this.gameInstance.planetUpdatedSignal.dispatch(this);
       },
       extractResources: function(){
           this.temp = parseFloat((this.tempChange + this.temp).toFixed(1));
           this.metal -= this.miningChange;
           this.population += this.populationGrowth;
           this._setPopulation(this.population);
           this.gameInstance.planetUpdatedSignal.dispatch(this);
       },
       getCenterPoint: function(){
           return {x: this.position.x + this.sprites[2].width/2, y:this.position.y+ this.sprites[2].height/2}
       },
       _setPopulation: function(number){
           this.population = number;
           var oldIncome = this.income;
           this.income = number * 0.1;
           this.incomeGrowth = Math.round(oldIncome === 0 ? 0 : (this.income / oldIncome));
           this._setPopulationGrowth();
       },
       _onPlanetClick: function(){
           this.gameInstance.planetClickedSignal.dispatch(this);
           this.gameInstance.selectedPlanet = this;
           if(this.selectedFleet) {
               this.gameInstance.dragSessionId = Math.random() + '_drag';
               this.gameInstance.planetDragFleet = this.selectedFleet;
           }
       },
       _getPlanetSprites: function(temp, gravity, metal, position){

           if(this.spriteGroup) this.spriteGroup.destroy(true);
           var spriteGroup = this.gameInstance.add.group(this.gameInstance.stageGroup);
           this.spriteGroup = spriteGroup;

           var bmd = this.gameInstance.add.bitmapData(100,100);

           worldGen.generateWorldCanvas(bmd.canvas, temp, gravity, metal, 100);
           this.surfaceImagePath = bmd.canvas.toDataURL();

           var scaleFactor = (this.isExplored ? Math.max(gravity/6, 0.2) : 0.5);

           var sprite = this.gameInstance.add.sprite(position.x, position.y, bmd, null, spriteGroup);
           sprite.scale.setTo(scaleFactor);

           var sprite2 = this.gameInstance.add.sprite(position.x-(100*scaleFactor), position.y, bmd, null, spriteGroup);
           sprite2.scale.setTo(scaleFactor);

           //Add 'light' source
           var lightSprite = this.gameInstance.add.sprite(position.x, position.y, this.isExplored ? 'alphaMask' : 'unexploredMask', null, spriteGroup);
           lightSprite.scale.setTo(scaleFactor);

           lightSprite.inputEnabled = true;
           lightSprite.events.onInputDown.add(this._onPlanetClick, this);
           lightSprite.events.onInputOver.add(this._onPlanetDragOver, this);
           lightSprite.events.onInputOut.add(this._onPlanetDragOut, this);

           //Create sprite mask
           if(this.mask) {
               delete this.mask;
           }
           this.mask = this.gameInstance.add.graphics(position.x, position.y, this.gameInstance.stageGroup);
           //	Shapes drawn to the Graphics object must be filled.
           this.mask.beginFill(0xffffff);
           //	Here we'll draw a circle
           this.mask.drawCircle(50*scaleFactor, 50*scaleFactor, 100*scaleFactor);
           //	And apply it to the Sprite
           spriteGroup.mask = this.mask;

           var rotationalPeriod = (Math.random()*20000)+10000;
           //Setup tweens for sprite behind mask
           sprite.tween = this.gameInstance.add.tween(sprite)
               .to({x: position.x + (100*scaleFactor)}, rotationalPeriod, Phaser.Easing.Linear.None)
               .to({x: position.x}, 10, Phaser.Easing.Linear.None)
               .loop();
           sprite.tween.start();
           sprite2.tween = this.gameInstance.add.tween(sprite2)
               .to({x: position.x}, rotationalPeriod, Phaser.Easing.Linear.None)
               .to({x: position.x-(100*scaleFactor)}, 10, Phaser.Easing.Linear.None)
               .loop();
           sprite2.tween.start();

           return [sprite, sprite2, lightSprite];
       },
       _onPlanetDragOver: function(){
           if(this.gameInstance.planetDragFleet){
               //TODO draw halo over targeted planet
           }
       },
       _onPlanetDragOut: function() {
           if (this.gameInstance.planetDragFleet) {
               //TODO hide halo
           }
       },
       _setPopulationGrowth: function(){
           this.populationGrowth = Math.round((this.temp <= 72 ? (this.temp/72) * 100 : (72/this.temp)*100));
       }
   };
   return planet;
});