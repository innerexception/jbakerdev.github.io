define(['planet', 'player', 'ship', 'fleet'], function(Planet, Player, Ship, Fleet){
   var galaxy = function(gameInstance, signal){
        this.dom = document.getElementById('center-panel');
        this.planets = [];
        this.homeWorlds = [];
        this.players = [];
        this.ships = [];
        this.finishedSignal = signal;
        this.gameInstance = gameInstance;
        this.StarField = {
            star: [this.gameInstance.make.sprite(0, 0, 'tinystar'),
                this.gameInstance.make.sprite(0, 0, 'star'),
                this.gameInstance.make.sprite(0, 0, 'bigstar')],
            stars: []
        };
       this.gameInstance.shipPathContext = this.gameInstance.add.graphics(0,0, this.gameInstance.stageGroup);
   };

   galaxy.prototype = {
       update: function() {
           var fleet = this.gameInstance.planetDragFleet;
           if(this.gameInstance.dragSessionId){
               this.drawLine(fleet.location.sprites[2].world.x, fleet.location.sprites[2].world.y,
                             this.gameInstance.input.worldX, this.gameInstance.input.worldY,
                             this.gameInstance.shipPathContext, true, fleet.range);
           }
           if(this.StarField.stars.length > 0){
               for (var i = 0; i < 300; i++)
               {
                   //  Update the stars y position based on its speed
                   this.StarField.stars[i].y += this.StarField.stars[i].speed;

                   if (this.StarField.stars[i].y > this.gameInstance.world.height)
                   {
                       //  Off the bottom of the screen? Then wrap around to the top
                       this.StarField.stars[i].x = this.gameInstance.world.randomX;
                       this.StarField.stars[i].y = -32;
                   }

                   if (i == 0 || i == 100 || i == 200)
                   {
                       //  If it's the first star of the layer then we clear the texture
                       this.StarField.stars[i].texture.renderXY(this.StarField.star[0], this.StarField.stars[i].x, this.StarField.stars[i].y, true);
                   }
                   else
                   {
                       //  Otherwise just draw the star sprite where we need it
                       this.StarField.stars[i].texture.renderXY(this.StarField.star[0], this.StarField.stars[i].x, this.StarField.stars[i].y, false);
                   }
               }
           }
       },
       drawLine: function(x1, y1, x2, y2, context, clear, range){

           var pos = this.getTransformedCoords(x1, y1, context);
           var pos2 = this.getTransformedCoords(x2, y2, context);

           x1 = pos.x;
           y1 = pos.y;
           x2 = pos2.x;
           y2 = pos2.y;

           var color = 0x00ff00;
           if(Math.sqrt(Math.pow((x2-x1), 2)+Math.pow((y2-y1), 2)) > range){
               color = 0xff0000;
               context.fleetOutOfRange = true;
           }
           else{
               context.fleetOutOfRange = false;
           }

           if(clear) context.clear();
           context.lineStyle(3, color, 0.5);
           context.moveTo(x1, y1);
           context.lineTo(x2, y2);

           context.lineStyle(3, 0xFFFFFF, 0.3);
           context.beginFill(0x00FF00, 0.1);
           context.drawCircle(x1, y1, range*2);
           context.endFill();

       },
       getTransformedCoords: function(x, y, context){
           var pos = context.toLocal({x:x, y:y});
           var scaleCoef = 1/this.gameInstance.stageGroup.scale.x;

           x = pos.x - (scaleCoef*this.gameInstance.camera.x);
           y = pos.y - (scaleCoef*this.gameInstance.camera.y);

           return {x:x, y:y};
       },
       removeShip: function(shipObj){
           this.ships = _.filter(this.ships, function(ship){
               return ship.id !== shipObj.id;
           });
       },
       endShipDrag: function() {
           if(!this.gameInstance.shipPathContext.fleetOutOfRange){
               var destinationPlanet = _.filter(this.planets, function(planet){
                   return planet.sprites[2].getBounds().contains(
                       this.gameInstance.input.mousePointer.position.x,
                       this.gameInstance.input.mousePointer.position.y);
               }, this)[0];
               if(destinationPlanet){
                   if(destinationPlanet.id != this.gameInstance.planetDragFleet.location.id) {
                       this.gameInstance.planetDragFleet.setDestination(destinationPlanet);
                   }
               }
               else {
                   this.gameInstance.planetDragFleet.queuedForTravel = false;
                   this.gameInstance.planetDragFleet.unSetDestination();
               }
           }
           else {
               this.gameInstance.planetDragFleet.queuedForTravel = false;
               this.gameInstance.planetDragFleet.unSetDestination();
           }
           this.gameInstance.shipPathContext.clear();
           this.gameInstance.dragSessionId = null;
       },
       onEndTurn: function(panel) {
           if(panel==='end'){
               this.clientPlayer.getIncomeAndResearch();
               this.runAITurns();
               this.updateFleets();
           }
       },
       runAITurns: function(){
           var aiPlayers = _.filter(this.players, function(player){
               return player.isAi;
           });
           _.each(aiPlayers, function(aiPlayer){
               aiPlayer.runTurn();
           });
       },
       updateFleets: function(){
           _.each(this.planets, function(planet){
               _.each(planet.fleets, function(fleet){
                   if(fleet.destination) fleet.distanceToDestination -= fleet.speed;
                   if(fleet.destination && fleet.distanceToDestination <= 0){
                       fleet.setLocation(fleet.destination);
                   }
                   _.each(fleet.ships, function (ship) {

                       var nextX = fleet.location.getCenterPoint().x;
                       var nextY = fleet.location.getCenterPoint().y;
                       if(fleet.destination){
                           var x2 = fleet.location.getCenterPoint().x;
                           var x1 = fleet.destination.getCenterPoint().x;
                           var y2 = fleet.location.getCenterPoint().y;
                           var y1 = fleet.destination.getCenterPoint().y;
                           var d = fleet.distanceToDestination;
                           var dp = fleet.totalDistanceToTravel;

                           //get latest point between destination and origin
                           nextX = x1 + (((d*x2) - (d*x1))/dp);
                           nextY = y1 + (((d*y2) - (d*y1))/dp);
                       }
                       ship.drawAtLocation(nextX, nextY,
                                           {orbit: !fleet.destination || fleet.distanceToDestination <= 0,
                                            warpIn: fleet.destination && fleet.distanceToDestination <= 0,
                                            move: fleet.distanceToDestination > 0,
                                            warpOut: fleet.queuedForTravel});
                   });
                   if(fleet.queuedForTravel){
                       //Just left planet
                       fleet.inTransit = true;
                   }
                   fleet.queuedForTravel = false;
                   this.gameInstance.planetUpdatedSignal.dispatch(fleet.location);
               }, this);
           }, this);
       },
       initializePlayer: function(name, isAi, difficulty){

           //set homeworld. each homeworld should be mapSize/numPlayers away from other homeworlds
           var homeWorld;
           if(this.homeWorlds.length === 0){
               //Pick a random one.
               homeWorld = this.planets[Math.round(Math.random()*this.planets.length-1)];
           }
           else{
               //Pick one an appropriate distance away
               homeWorld = _.filter(this.planets, function(planet){
                   return _.filter(this.homeWorlds, function(homeworldPlanet){
                       return this.gameInstance.physics.arcade.distanceBetween(homeworldPlanet.sprites[0], planet.sprites[0]) >= 600
                           && !planet.owner;
                   }, this).length === this.homeWorlds.length;
               }, this)[0];
           }
           if(!homeWorld){
               homeWorld = _.filter(this.planets, function(planet){
                   return !planet.owner;
               })[0];
           }

           this.homeWorlds.push(homeWorld);
           homeWorld.gravity = 1;
           homeWorld.temp = 72;
           var player = new Player(homeWorld, name, isAi, difficulty, this);

           //get initial ships
           player.fleets.push(this._getInitialFleet(homeWorld, player, difficulty));
           return player;
       },
       generatePlanets: function(shape, size, spread){
           this._positions = this._generatePositions(shape, size, spread);
           for(var i=0; i<this.Constants.Size[size]; i++){
               this.planets.push(this._getRandomPlanet());
           }
       },

       onPlanetClicked: function(planet){
           //move selection halo to planet.
           if(this._selectionHaloSprite){
               this._selectionHaloSprite.y = planet.position.y+(40*planet.sprites[0].scale.x);
               this._selectionHaloSprite.x = planet.position.x+(40*planet.sprites[0].scale.x);
           }
           else{
               this._selectionHaloSprite = this.gameInstance.add.sprite(planet.position.x+(40*planet.sprites[0].scale.x), planet.position.y+(40*planet.sprites[0].scale.x), 'halo', null, this.gameInstance.stageGroup);
               this._selectionHaloSprite.scale.setTo(0.5);
               this._selectionHaloSprite.anchor.setTo(0.5);
               this._selectionHaloSprite.tween = this.gameInstance.add.tween(this._selectionHaloSprite.scale)
                   .to({x:0.25, y:0.25}, 2000)
                   .to({x:0.5, y:0.5}, 2000)
                   .loop();
               this._selectionHaloSprite.tween.start();
           }
       },

       initGalaxy: function(size, shape, other_players, difficulty, handicap, spread){
           console.log('making galaxy with '+size+', '+shape+', '+other_players+', '+difficulty+', '+handicap+', '+spread);
           this._initStarField();
           this.generatePlanets(shape, size, spread);
           this.players = [];
           this.players.push(this.initializePlayer(this._getNextPlayerName(), false, difficulty));
           this.clientPlayer = this.players[0];
           for(var i=0; i<other_players; i++){
               this.players.push(this.initializePlayer(this._getNextPlayerName(), true, difficulty));
           }
           this.finishedSignal.dispatch();
       },
       _initStarField: function(){
           this.gameInstance.add.sprite(0, 0, this.StarField.texture, null, this.gameInstance.stageGroup);

           var texture1 = this.gameInstance.add.renderTexture(this.gameInstance.world.width, this.gameInstance.world.height, 'texture1');
           var texture2 = this.gameInstance.add.renderTexture(this.gameInstance.world.width, this.gameInstance.world.height, 'texture2');
           var texture3 = this.gameInstance.add.renderTexture(this.gameInstance.world.width, this.gameInstance.world.height, 'texture3');

           this.gameInstance.add.sprite(0, 0, texture1, null, this.gameInstance.stageGroup);
           this.gameInstance.add.sprite(0, 0, texture2, null, this.gameInstance.stageGroup);
           this.gameInstance.add.sprite(0, 0, texture3, null, this.gameInstance.stageGroup);

           var t = texture1;
           var s = 0.05;

           //  100 sprites per layer
           for (var i = 0; i < 300; i++)
           {
               if (i == 100)
               {
                   //  With each 100 stars we ramp up the speed a little and swap to the next texture
                   s = 0.1;
                   t = texture2;
               }
               else if (i == 200)
               {
                   s = 0.2;
                   t = texture3;
               }

               this.StarField.stars.push( { x: Math.random()*this.gameInstance.world.width, y: Math.random()*this.gameInstance.world.height+125, speed: s, texture: t });
           }
       },
       _getRandomPlanet: function(shape, spread){
           var temp = this._getRandomPlanetTemp().toFixed(2);
           var gravity = this._getRandomPlanetGravity().toFixed(2);
           var metal = this._getRandomPlanetMetal().toFixed(0);
           console.log('made planet of '+temp+'f, '+gravity + 'g '+metal+' metal');
           return new Planet(
               this.gameInstance,
               this._getRandomPlanetName(),
               temp, gravity, metal,
               this._getNextPlanetPosition());
       },
       _getInitialFleet: function(homeworld, player, difficulty){
           var ships = [];
           switch(difficulty){
               case 0:
                   ships.push(new Ship(homeworld, player, 'scout', 1, 1, 1, 1, 0, this.gameInstance, true));
                   ships.push(new Ship(homeworld, player, 'scout', 1, 1, 1, 1, 0, this.gameInstance));
                   ships.push(new Ship(homeworld, player, 'colony', 1, 1, 1, 1, 0, this.gameInstance, true));
                   break;
               case 1:
                   ships.push(new Ship(homeworld, player, 'scout', 1, 1, 1, 1, 0, this.gameInstance, true));
                   ships.push(new Ship(homeworld, player, 'scout', 1, 1, 1, 1, 0, this.gameInstance));
                   break;
               case 2:
                   ships.push(new Ship(homeworld, player, 'scout', 1, 1, 1, 1, 0, this.gameInstance, true));
                   break;
           }
           return new Fleet(ships, homeworld, this);
       },

       _getNextPlanetPosition: function(){
           console.log('remaining positions: '+ this._positions.length);
           return this._positions.shift();
       },
       _getRandomPlanetTemp: function(){
           return (Math.random() * this.Constants.Temp.max) + this.Constants.Temp.min;
       },
       _getRandomPlanetGravity: function(){
           return (Math.random() * this.Constants.Gravity.max) + this.Constants.Gravity.min;
       },
       _getRandomPlanetMetal: function(){
           return (Math.random() * this.Constants.Metal.max) + this.Constants.Metal.min;
       },
       _getNextPlayerName: function(){
           this.Constants.nextNameIndex++;
           return this.Constants.PlayerNames[this.Constants.nextNameIndex-1];
       },
       _getRandomPlanetName: function(){
           return this.Constants.PlanetNames[Math.round(Math.random() * (this.Constants.PlanetNames.length-1))];
       },
       _generatePositions: function(shape, size, spread){
           console.log('making positions for '+ shape);
           var centerX = this.gameInstance.world.width/2;
           var centerY = this.gameInstance.world.height/3;
           switch(shape){
               case this.Constants.Shape.Circle:
                   return this._getCirclePoints(centerX, centerY, centerX/2, this.Constants.Size[size]);
                   break;
               case this.Constants.Shape.Spiral:
                   return this._getSpiralPoints(centerX, centerY, centerX/2, size);
                   break;
               case this.Constants.Shape.Ring:
                   return this._getRingPoints(centerX, centerY, centerX/2, size);
                   break;
           }
       },
       _getCirclePoints: function(centerx, centery, r, size){
           var x, y, points = [];
           var step = 2*Math.PI/size;  //If size is greater than something, need to make concentric rings here

           for(var theta=0;  theta < 2*Math.PI;  theta+=step)
           {
               x = centerx + r*Math.cos(theta);
               y = centery - r*Math.sin(theta);
               points.push({x:x,y:y});
           }

           return points;
       },
       _getSpiralPoints: function(centerX, centerY, r, spread){
           var x, y, points = [];
           var d;//detail
           //r alters the distance between different tracks of spiral
           var pi = 3.14159265; //more or less
           for(d=0; d<=8*pi; d+=spread) //you can play with the value to be added to d
           {
               x=centerX+(Math.sin(d)*d)*r;
               y=centerY+(Math.sin(d+(pi/2))*(d+(pi/2)))*r;
               points.push({x:x,y:y});
           }
           return points;
       },
       _getRingPoints: function(centerX, centerY, r, spread){
           var x, y, thickness=10, points=[];
           for(x=centerX-r; x<=centerX+r; x+=spread){
               for(y=centerY-r; y<=centerY+r; y+=spread){
                   if ( (((x*x)+(y*y))>(r*r)-(thickness/2)) && (((x*x)+(y*y))<(r*r)+(thickness/2)) ) points.push({x:x,y:y});
               }
           }
           return points;
       }
   };

   galaxy.prototype.Constants = {
        Size: {
            Small: 20,
            Medium: 30,
            Large: 40
        },
        Shape: {
            Spiral: 'Spiral',
            Circle: 'Circle',
            Ring: 'Ring'
        },
        Temp: {
            min: -100,
            max: 200
        },
        Gravity: {
            min: 0.1,
            max: 4.0
        },
        Metal: {
            min: 0,
            max: 20000
        },
        PlayerNames: [
            'office',
            'lol'
        ],
        nextNameIndex: 0,
        PlanetNames: [
            'Phil',
            'Murray',
            'Catnip',
            'Catfood',
            'Snuggles',
            'Purrs',
            'Pile'
        ]
   };

   return galaxy;
});