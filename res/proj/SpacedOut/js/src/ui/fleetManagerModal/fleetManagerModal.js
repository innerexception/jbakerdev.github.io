define(['lodash', 'fleet', 'ractive', 'rv!/spacedout/js/src/ui/fleetManagerModal/fleetManagerModal.html', 'css!/spacedout/js/src/ui/fleetManagerModal/fleetManagerModal'],
    function(_, Fleet, Ractive, fleetModalTemplate) {
        var fleetModal = function (galaxy) {
            var targetDiv = document.createElement('div');
            targetDiv.id = 'fleetModalContainer';
            targetDiv.className = 'container fleet-modal-panel fleetModalOut';
            this.galaxy = galaxy;
            galaxy.dom.appendChild(targetDiv);
            this._dom = targetDiv;

            this._ractive = new Ractive({
                el: this._dom.id,
                template: fleetModalTemplate,
                data: {
                    planet: {},
                    newFleets: []
                }
            });

            var self = this;
            this._ractive.on({
                onShipSelected: function(event){
                    self.dragShip = event.context;
                    var allFleets = self._ractive.get('planet.fleets');
                    if(allFleets) allFleets = allFleets.concat(self._ractive.get('newFleets'));
                    _.each(allFleets, function(fleet){
                        _.each(fleet.ships, function(ship){
                            if(ship === self.dragShip) self.dragShip.fleet = fleet;
                        });
                    });
                },
                onFleetDrop: function(event){
                    if(self.dragShip &&
                        self.dragShip.fleet !== event.context &&
                        !event.context.containsShip(self.dragShip)){

                        event.context.addShip(self.dragShip);

                        var fleet = self.dragShip.fleet;
                        fleet.removeShip(self.dragShip);
                        self.synchStores(fleet);
                        self.galaxy.gameInstance.planetUpdatedSignal.dispatch(self._ractive.get('planet'));
                        delete self.dragShip;
                        console.log('ship dropped on fleet');
                    }

                },
                onNewFleetDrop: function(event){
                    var newFleet= new Fleet([self.dragShip], null, null);
                    self._ractive.get('newFleets').push(newFleet);
                    var fleet = self.dragShip.fleet;
                    fleet.removeShip(self.dragShip);
                    self.synchStores(fleet);
                    self.galaxy.gameInstance.planetUpdatedSignal.dispatch(self._ractive.get('planet'));
                    delete self.dragShip;

                    console.log('ship dropped on new fleet');
                },
                allowDrop: function(event) {
                    event.original.preventDefault();
                },
                onCloseClick: function(event){
                    self.transitionFrom();
                }
            });
        };
        fleetModal.prototype = {
            transitionFrom: function(){
                this.isVisible = false;
                //animate this component away
                this._dom.className = this._dom.className.replace('fleetModalIn', '');
                this._dom.className = [this._dom.className, 'fleetModalOut'].join(" ");
                this.saveNewFleets();
            },
            transitionTo: function(planet){
                this.isVisible = true;
                //animate this component in
                this._dom.className = this._dom.className.replace('fleetModalOut', '');
                this._dom.className = [this._dom.className, 'fleetModalIn'].join(" ");
                this._ractive.set('planet', planet);
            },
            saveNewFleets: function(){
                _.each(this._ractive.get('newFleets'), function(fleet){
                    fleet.location = this._ractive.get('planet');
                    fleet.galaxy = this.galaxy;
                    fleet.galaxy.ships = fleet.galaxy.ships.concat(fleet.ships);
                }, this);
                this._ractive.set('planet.fleets', this._ractive.get('planet.fleets').concat(this._ractive.get('newFleets')));
                this.galaxy.gameInstance.planetUpdatedSignal.dispatch(this._ractive.get('planet'));
                this._ractive.set('newFleets', []);
            },
            synchStores: function(fleet){
                var newFleets = this._ractive.get('newFleets');
                if(fleet.ships.length <= 0){
                    if(fleet.location){
                        fleet.location.removeFleet(fleet);
                    }
                    else {
                        newFleets = newFleets.splice(newFleets.indexOf(fleet), 1);
                    }
                }
                this._ractive.set('newFleets', newFleets);
                if(fleet.location) this._ractive.set('planet', fleet.location);
            }
        };
        return fleetModal;
});