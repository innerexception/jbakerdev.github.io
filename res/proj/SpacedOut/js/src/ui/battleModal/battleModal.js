define(['phaser', 'ractive', 'rv!/spacedout/js/src/ui/battleModal/battleModal.html', 'css!/spacedout/js/src/ui/battleModal/battleModal'],
    function(Phaser, Ractive, battleModalTemplate){
        var battleModal = function(galaxy){
            var targetDiv = document.createElement('div');
            targetDiv.id = 'battleModalContainer';
            targetDiv.className = 'container battle-modal-panel battleModalOut';
            this.galaxy = galaxy;
            galaxy.dom.appendChild(targetDiv);
            this._dom = targetDiv;

            this._ractive = new Ractive({
                el: this._dom.id,
                template: battleModalTemplate,
                data: {
                    planets: []
                }
            });

            this.gameInstance = new Phaser.Game(749, 496, Phaser.AUTO, 'battleModal',{
                preload: this.preload,
                create: this.phaserLoad,
                update: this.update
            });
            this.gameInstance.shipHitSignal = new Phaser.Signal();
            this.gameInstance.shipHitSignal.add(this._salvo, this);
        };

        battleModal.prototype = {
            update: function() {
                if(this.StarField && this.StarField.stars.length > 0){
                    for (var i = 0; i < 200; i++)
                    {
                        //  Update the stars y position based on its speed
                        this.StarField.stars[i].y += this.StarField.stars[i].speed;

                        if (this.StarField.stars[i].y > this.world.height)
                        {
                            //  Off the bottom of the screen? Then wrap around to the top
                            this.StarField.stars[i].x = this.world.randomX;
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
            transitionFrom: function(){
                this.isVisible = false;
                //animate this component away
                this._dom.className = this._dom.className.replace('battleModalIn', '');
                this._dom.className = [this._dom.className, 'battleModalOut'].join(" ");

            },
            transitionTo: function(){
                this.isVisible = true;
                //animate this component in
                this._dom.className = this._dom.className.replace('battleModalOut', '');
                this._dom.className = [this._dom.className, 'battleModalIn'].join(" ");
            },
            startBattle: function(fleets){
                this.transitionTo();
                var location = fleets[0].location;
                this._generatePlanetImage(location);
                this._marshallFleets(fleets);
            },
            _marshallFleets: function(fleets){

                console.log('arranging ships...');

                var friendlyFleets = _.filter(fleets, function(fleet){
                    return fleet.ships[0].owner === this.galaxy.clientPlayer;
                }, this);
                var friendlyShips=[];
                _.each(friendlyFleets, function(fleet){
                    friendlyShips = friendlyShips.concat(fleet.ships);
                });
                var enemyFleets = _.filter(fleets, function(fleet){
                    return fleet.ships[0].owner !== this.galaxy.clientPlayer;
                }, this);
                var enemyShips=[];
                _.each(enemyFleets, function(fleet){
                    enemyShips = enemyShips.concat(fleet.ships);
                });

                //line up fleets
                _.each(friendlyShips, function(ship, i){
                    ship.battleSpriteGroup = ship._createShipSpriteGroup(0,100+(i*40), 1, this.gameInstance);
                    var tween = this.gameInstance.add.tween(ship.battleSpriteGroup)
                        .to({x: 40}, 1000);
                    tween.start();
                }, this);
                _.each(enemyShips, function(ship, i){
                    ship.battleSpriteGroup = ship._createShipSpriteGroup(this.gameInstance.world.width, 100+i*40, 1, this.gameInstance);
                    var tween = this.gameInstance.add.tween(ship.battleSpriteGroup)
                        .to({x: this.gameInstance.world.width - 100}, 1000);
                    tween.start();
                }, this);

                var planetShip = {battleSpriteGroup: {x: 600, y:700}, planetData:friendlyFleets[0].location};
                friendlyFleets[0].location.owner === friendlyShips[0].owner ? friendlyShips.push(planetShip) : enemyShips.push(planetShip);

                var combatGroups = {
                    friendly: friendlyShips,
                    enemy: enemyShips,
                    planet: friendlyFleets[0].location,
                    friendlyIndex: 0,
                    friendlyTurn: true,
                    enemyIndex: 0,
                    galaxy: this.galaxy
                };
                //This will be re-called each time a hit is completed.
                this._salvo(combatGroups);
            },
            _salvo: function(combatGroups){
                if(combatGroups.friendly.length > 0 && combatGroups.enemy.length > 0){
                    if(combatGroups.friendlyIndex < combatGroups.friendly.length && combatGroups.friendlyTurn){
                        console.log('friendly is firing');
                        this._fireLazerAt(combatGroups.friendly[combatGroups.friendlyIndex], combatGroups.enemy[0], combatGroups); //ships should move to top when destroyed
                        combatGroups.friendlyIndex++;
                        return;
                    }
                    else if(combatGroups.friendlyIndex >= combatGroups.friendly.length){
                        combatGroups.friendlyIndex = 0;
                        combatGroups.friendlyTurn = false;
                        this._salvo(combatGroups);
                        return;
                    }

                    if(combatGroups.enemyIndex < combatGroups.enemy.length && !combatGroups.friendlyTurn){
                        console.log('enemy is firing');
                        this._fireLazerAt(combatGroups.enemy[combatGroups.enemyIndex], combatGroups.friendly[0], combatGroups, 180);
                        combatGroups.enemyIndex++;
                        return;
                    }
                    else if(combatGroups.enemyIndex >= combatGroups.enemy.length){
                        combatGroups.friendlyTurn = true;
                        combatGroups.enemyIndex = 0;
                        this._salvo(combatGroups);
                        return;
                    }
                }
                else if(combatGroups.friendly.length <= 0){
                    //TODO run loss event
                    //this.gameInstance.combatLostSignal.dispatch();
                    console.log('u mad?');
                    combatGroups.planet.fleets = _.filter(combatGroups.planet.fleets, function(fleet){
                        if(fleet.ships[0].owner !== combatGroups.enemy[0].owner){
                            _.each(fleet.ships, function(ship){
                                ship._destroySpritesAndGroup();
                                this.galaxy.removeShip(ship)
                            }, this);
                        }
                        return fleet.ships[0].owner === combatGroups.enemy[0].owner;
                    }, this);
                    _.each(combatGroups.planet.fleets, function(enemyFleet){
                        enemyFleet._checkForColonization();
                    });
                    this.galaxy.gameInstance.planetUpdatedSignal.dispatch(combatGroups.planet);
                    this.galaxy.gameInstance.budgetUpdatedSignal.dispatch();
                    this.transitionFrom();
                }
                else if(combatGroups.enemy.length <= 0){
                    //TODO run victory event
                    //this.gameInstance.combatWonSignal.dispatch();
                    console.log('a winner is you');
                    combatGroups.planet.fleets = _.filter(combatGroups.planet.fleets, function(fleet){
                        if(fleet.ships[0].owner !== combatGroups.friendly[0].owner){
                            _.each(fleet.ships, function(ship){
                                ship._destroySpritesAndGroup();
                                this.galaxy.removeShip(ship)
                            }, this);
                        }
                        return fleet.ships[0].owner === combatGroups.friendly[0].owner;
                    }, this);
                    _.each(combatGroups.planet.fleets, function(friendlyFleet){
                        friendlyFleet._checkForColonization();
                    });
                    this.galaxy.gameInstance.planetUpdatedSignal.dispatch(combatGroups.planet);
                    this.galaxy.gameInstance.budgetUpdatedSignal.dispatch();
                    this.transitionFrom();
                }
            },
            _fireLazerAt: function(sourceShip, targetShip, combatGroups, rotate){
                if(!sourceShip.laserGroup) sourceShip.laserGroup = this.gameInstance.add.group(this.gameInstance.stageGroup);
                var laser = sourceShip.laserGroup.create(sourceShip.battleSpriteGroup.x, sourceShip.battleSpriteGroup.y, 'lazerShot');
                if(rotate) laser.angle = rotate;
                var shotTween = this.gameInstance.add.tween(laser)
                    .to({x: targetShip.battleSpriteGroup.x, y: targetShip.battleSpriteGroup.y}, 1000, Phaser.Easing.Linear.None);
                sourceShip._combatGroups = combatGroups;
                sourceShip._targetShip = targetShip;
                sourceShip._laserSprite = laser;
                sourceShip._phaserInstance = this.gameInstance;
                shotTween.onComplete.addOnce(this._hitShip, sourceShip);
                shotTween.start();
            },
            _hitShip: function(){
                //THIS == souce ship instance
                this._laserSprite.destroy();
                //var explosion = this._targetShip.battleSpriteGroup.create(this._targetShip.battleSpriteGroup.x, this._targetShip.battleSpriteGroup.y, 'explosion');
                //var explosionTween = this._phaserInstance.add.tween(explosion)
                //    .to({x: this._targetShip.battleSpriteGroup.x+20, y: this._targetShip.battleSpriteGroup.y+10});
                //explosionTween.onComplete.addOnce(function(){ console.log('clean up explosion'); this.destroy();}, explosion);
                if(this._targetShip.planetData){
                    this._targetShip.planetData._setPopulation(this._targetShip.population -= 1000);
                }
                else{
                    this._targetShip.hp -= 1;
                }

                if(this._targetShip.hp <= 0 || (this._targetShip.planetData && this._targetShip.planetData.population <= 0)){
                    //remove from combatGroup list
                    if(this._combatGroups.friendlyTurn){
                        //this must be from the enemy list
                        this._combatGroups.enemy = _.filter(this._combatGroups.enemy, function(shipObj){
                            return shipObj !== this._targetShip;
                        }, this);
                    }
                    else{
                        //must be in friendly group
                        this._combatGroups.friendly = _.filter(this._combatGroups.friendly, function(shipObj){
                            return shipObj !== this._targetShip;
                        }, this);
                    }
                    if(!this._targetShip.planetData){
                        this._targetShip._destroySpritesAndGroup();
                        this._combatGroups.galaxy.removeShip(this._targetShip);
                        this._targetShip._explodeAndDestroy(this._targetShip.battleSpriteGroup, this._phaserInstance);
                    }
                }

                this._phaserInstance.shipHitSignal.dispatch(this._combatGroups);
            },
            _generatePlanetImage: function(location){

                var position = {x:0, y:200};
                if(this.spriteGroup) this.spriteGroup.destroy(true);
                var spriteGroup = this.gameInstance.add.group(this.gameInstance.stageGroup);
                this.spriteGroup = spriteGroup;

                var bmd = this.gameInstance.add.bitmapData(100,100);

                var img = new Image();
                img.src = location.surfaceImagePath;
                bmd.canvas.getContext('2d').drawImage(img, 0, 0);

                var scaleFactor = 5;

                var sprite = this.gameInstance.add.sprite(position.x, position.y, bmd, null, spriteGroup);
                sprite.scale.setTo(scaleFactor);

                var sprite2 = this.gameInstance.add.sprite(position.x-(100*scaleFactor), position.y, bmd, null, spriteGroup);
                sprite2.scale.setTo(scaleFactor);

                //Add 'light' source
                var lightSprite = this.gameInstance.add.sprite(position.x, position.y, 'alphaMask', null, spriteGroup);
                lightSprite.scale.setTo(scaleFactor);

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

                //Setup tweens for sprite behind mask
                sprite.tween = this.gameInstance.add.tween(sprite)
                    .to({x: position.x + (100*scaleFactor)}, 20000, Phaser.Easing.Linear.None)
                    .to({x: position.x}, 10, Phaser.Easing.Linear.None)
                    .loop();
                sprite.tween.start();
                sprite2.tween = this.gameInstance.add.tween(sprite2)
                    .to({x: position.x}, 20000, Phaser.Easing.Linear.None)
                    .to({x: position.x-(100*scaleFactor)}, 10, Phaser.Easing.Linear.None)
                    .loop();
                sprite2.tween.start();
            },
            preload: function () {
                //Load all assets here
                this.load.image('lazerShot', 'js/res/img/lazerShot.png');
                this.load.image('explosion', 'js/res/img/explosion.png');
                this.load.image('alphaMask', 'js/res/img/alphaMask.png');
                this.load.image('tinystar', 'js/res/img/tinyStar.png');
            },
            phaserLoad: function () {
                //1st time load
                this.stageGroup = this.add.group();
                this.StarField = {
                    star: [this.make.sprite(0, 0, 'tinystar'),
                        this.make.sprite(0, 0, 'star'),
                        this.make.sprite(0, 0, 'bigstar')],
                    stars: []
                };
                this.add.sprite(0, 0, this.StarField.texture, null, this.stageGroup);

                var texture1 = this.add.renderTexture(this.world.width, this.world.height, 'texture1');
                var texture2 = this.add.renderTexture(this.world.width, this.world.height, 'texture2');
                var texture3 = this.add.renderTexture(this.world.width, this.world.height, 'texture3');

                this.add.sprite(0, 0, texture1, null, this.stageGroup);
                this.add.sprite(0, 0, texture2, null, this.stageGroup);
                this.add.sprite(0, 0, texture3, null, this.stageGroup);

                var t = texture1;
                var s = 0.05;

                //  100 sprites per layer
                for (var i = 0; i < 200; i++)
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

                    this.StarField.stars.push( { x: Math.random()*this.world.width, y: Math.random()*this.world.height, speed: s, texture: t });
                }
            }

        };

        return battleModal;
    });