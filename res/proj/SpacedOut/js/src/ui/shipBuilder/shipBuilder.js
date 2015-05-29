define(['fleet', 'ship', 'ractive', 'rv!/spacedout/js/src/ui/shipBuilder/shipBuilder.html', 'css!/spacedout/js/src/ui/shipBuilder/shipBuilder'],
    function(Fleet, Ship, Ractive, shipBuilderTemplate){
        var shipBuilder = function(galaxy){
            var targetDiv = document.createElement('div');
            targetDiv.id = 'shipBuilder';
            targetDiv.className = 'container ship-builder-panel shipBuilderOut';
            galaxy.dom.appendChild(targetDiv);
            this.galaxy = galaxy;
            this._dom = targetDiv;

            this._ractive = new Ractive({
                el: this._dom.id,
                template: shipBuilderTemplate,
                data: {
                    player: {},
                    selectedDesign: {},
                    selectedPlanet: this.galaxy.gameInstance.selectedPlanet
                }
            });

            var self = this;

            this._ractive.on({
                onStatChanged: function(event){
                    //Once a stat changes, the design gets a non zero prototype cost.
                    self.updatePrototypeCost(event.node.attributes['data-id'].value, event.node.value);
                },
                onNumberChanged: function(event){
                    self._ractive.set('selectedDesign.number', event.node.value);
                },
                onDesignClick: function(event){
                    _.each(self._ractive.get('player.designs'), function(design){
                        design.isSelected = false;
                        design.prototypeCost = 0;
                    });
                    event.context.isSelected = true;
                    self._ractive.set('player.designs', self._ractive.get('player.designs'));
                    self._ractive.set('selectedDesign', event.context);
                },
                onDoneClicked: function(event){
                    self.transitionFrom();
                },
                onTypeSelected: function(event){
                    self.createNewDesign(event.node.value);
                }
            });
        };

        shipBuilder.prototype = {
            transitionFrom: function(){
                this.isVisible = false;
                //animate this component away
                this._dom.className = this._dom.className.replace('shipBuilderIn', '');
                this._dom.className = [this._dom.className, 'shipBuilderOut'].join(" ");
                this.saveShips();
            },
            transitionTo: function(player){
                this.isVisible = true;
                //animate this component in
                this._dom.className = this._dom.className.replace('shipBuilderOut', '');
                this._dom.className = [this._dom.className, 'shipBuilderIn'].join(" ");
                this._ractive.set('player', player);
                player.designs[0].isSelected = true;
                this._ractive.set('selectedDesign', player.designs[0]);
            },
            toggle: function(panel){
                if(panel==='builder'){
                    if(!this.isVisible) this.transitionTo(this.galaxy.clientPlayer);
                    else this.transitionFrom();
                }
            },
            updatePrototypeCost: function(field, value){
                this._ractive.set('selectedDesign.'+field, value);
                this.createNewDesign(this._ractive.get('selectedDesign.type'));
            },
            createNewDesign: function(type){
                var designToCopy = this._ractive.get('selectedDesign');
                var designCopy = new Ship(this.galaxy.gameInstance.selectedPlanet ? this.galaxy.gameInstance.selectedPlanet : this._ractive.get('player.homeWorld'), this._ractive.get('player'), type,
                    designToCopy.rangeLevel, designToCopy.speedLevel, designToCopy.weapon, designToCopy.shield, designToCopy.mini, this.galaxy.gameInstance);
                designCopy.isPrototype = true;
                designCopy.updatePrototypeCost();
                designCopy.updateProductionCost();
                this._ractive.set('selectedDesign', designCopy);
            },
            saveShips: function(){
                var planet = this.galaxy.gameInstance.selectedPlanet ? this.galaxy.gameInstance.selectedPlanet : this._ractive.get('player.homeWorld');
                var fleet = new Fleet([], planet, this.galaxy);
                var design = this._ractive.get('selectedDesign');
                if(design.number > 0){
                    if(design.isPrototype)
                        this._ractive.get('player').designs.push(design);
                    _.times(design.number, function(){
                        fleet.addShip(new Ship(planet, this._ractive.get('player'), design.type, design.rangeLevel, design.speedLevel, design.weapon, design.shield, design.mini, this.galaxy.gameInstance));
                    }, this);
                    var player = this._ractive.get('player');
                    player.fleets.push(fleet);
                    player.money -= design.number * design.productionCost;
                    if(design.isPrototype) player.money -= design.prototypeCost;
                    this.galaxy.gameInstance.planetUpdatedSignal.dispatch(planet);
                }
            }
        };

        return shipBuilder;
    });