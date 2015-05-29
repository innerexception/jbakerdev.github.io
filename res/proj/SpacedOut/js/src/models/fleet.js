define(['lodash'], function(_){
    var fleet = function(ships, planet, galaxy){
        this.ships = ships;
        this.speed = this._getMaxFleetSpeed();
        this.range = this._getMaxFleetRange();
        this.id = 'fleet_'+Math.random();
        this.name = this._getNextFleetName();
        this.location = planet;
        this.inTransit = false;
        this.queuedForTravel = false;
        planet && planet.fleets.push(this);
        if(galaxy){
            this.galaxy = galaxy;
            galaxy.ships = galaxy.ships.concat(this.ships);
        }
    };
    fleet.prototype = {
        addShip: function(ship){
            this.ships.push(ship);
            this.speed = this._getMaxFleetSpeed();
            this.range = this._getMaxFleetRange();
        },
        removeShip: function(shipObj){
            this.ships = _.filter(this.ships, function(ship){
                return ship.id !== shipObj.id;
            });
            this.speed = this._getMaxFleetSpeed();
            this.range = this._getMaxFleetRange();
        },
        containsShip: function(shipObj){
            return _.filter(this.ships, function(ship){
                return ship === shipObj;
            }).length > 0;
        },
        setDestination: function(planet){
            this.distanceToDestination = this.galaxy.gameInstance.physics.arcade.distanceBetween(this.location.sprites[2], planet.sprites[2]);
            this.totalDistanceToTravel = this.distanceToDestination;
            this.destination = planet;
            this.queuedForTravel = true;
            this.galaxy.gameInstance.planetUpdatedSignal.dispatch(this.location);
            console.log('fleet '+this.name + ' set destination '+planet.name + ' of distance '+ this.distanceToDestination);
        },
        unSetDestination: function(){
            this.distanceToDestination = null;
            this.destination = null;
            this.queuedForTravel = false;
            this.galaxy.gameInstance.planetUpdatedSignal.dispatch(this.location);
        },
        setLocation: function(planet){
            this.location.selectedFleet = null;
            this.location.removeFleet(this);
            this.location = planet;
            if(this.ships[0].owner === this.galaxy.clientPlayer) planet.setIsExplored(true);
            this.inTransit = false;
            this.destination = null;
            this.distanceToDestination = null;
            this.isSelected = false;
            this.queuedForTravel = false;
            planet.fleets.push(this);

            var hasCombat = false;
            _.each(planet.fleets, function(fleet){
                if(fleet.ships[0].owner != this.galaxy.clientPlayer){
                    hasCombat = true;
                }
            }, this);
            if(hasCombat) this.galaxy.gameInstance.battleModalSignal.dispatch(planet.fleets);
            else this._checkForColonization();
            this.galaxy.gameInstance.planetUpdatedSignal && this.galaxy.gameInstance.planetUpdatedSignal.dispatch(this.location);
            this.galaxy.gameInstance.budgetUpdatedSignal && this.galaxy.gameInstance.budgetUpdatedSignal.dispatch();
        },
        _checkForColonization: function(){
            var colonyShip = _.filter(this.ships, function(ship){
                return ship.type === ship.Constants.ShipTypes.Colony;
            })[0];
            if(colonyShip && !this.location.owner){
                this.location.setNewOwner(colonyShip.owner, colonyShip.colonists, this.galaxy.clientPlayer);
                colonyShip.colonists = 0;
            }
        },
        _getNextFleetName: function(){
            return this.Constants.FleetNames[Math.round(Math.random()*(this.Constants.FleetNames.length-1))];
        },
        _getMaxFleetSpeed: function(){
            var fleetSpeed = 0;
            _.each(this.ships, function(ship){
                if(ship.speed > fleetSpeed) fleetSpeed = ship.speed;
            });
            return fleetSpeed;
        },
        _getMaxFleetRange: function(){
            var fleetRange = 0;
            _.each(this.ships, function(ship){
                if(ship.range > fleetRange) fleetRange = ship.range;
            });
            return fleetRange;
        }
    };

    fleet.prototype.Constants = {
        FleetNames: [
            'Alpha', 'Beta', 'Gamma'
        ]
    };

    return fleet;
});