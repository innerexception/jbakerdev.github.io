define(['ractive', 'rv!/spacedout/js/src/ui/planetPanel/planetPanel.html', 'css!/spacedout/js/src/ui/planetPanel/planetPanel'],
    function(Ractive, planetPanelTemplate){
        var planetPanel = function(galaxy){
            var targetDiv = document.createElement('div');
            targetDiv.id = 'planetPanel';
            targetDiv.className = 'container planet-panel planetPanelOut';
            targetDiv.style.height = galaxy.gameInstance.height/2;
            var parent = document.getElementById('left-panel');
            parent.appendChild(targetDiv);

            this.galaxy = galaxy;
            this._dom = targetDiv;

            this._ractive = new Ractive({
                el: this._dom.id,
                template: planetPanelTemplate,
                data: {
                    planet: {}
                }
            });

            var self = this;

            this._ractive.on({
                onPlanetGrowthChanged: function(event){
                    self._ractive.get('planet').setTerraformPercent(event.node.value);
                },
                onFleetSelected: function(event){
                    if(event.context.ships[0].owner === self.galaxy.clientPlayer) self._ractive.get('planet').setSelectedFleet(event.context);
                },
                onFleetEdit: function(event){
                    self.galaxy.gameInstance.fleetEditSignal.dispatch(self._ractive.get('planet'));
                }
            })
        };

        planetPanel.prototype = {
            transitionFrom: function(){
                //animate this component away
                this._dom.className = this._dom.className.replace('planetPanelIn', '');
                this._dom.className = [this._dom.className, 'planetPanelOut'].join(' ');
                this.isVisible = false;
            },
            transitionTo: function(){
                //animate this component in
                this._dom.className = this._dom.className.replace('planetPanelOut', '');
                this._dom.className = [this._dom.className, 'planetPanelIn'].join(' ');
                this.isVisible = true;
            },
            toggle: function(panel){
                if(panel==='planet'){
                    if(this.isVisible) this.transitionFrom();
                    else this.transitionTo();
                }
            },
            onPlanetClicked: function(planet){
                if(planet.isExplored)this._ractive.set('planet', planet);
                else this._ractive.set('planet', this._emptyPlanet);
                if(!this.isVisible) this.transitionTo();
            },
            refreshPanel: function(planet){
                if(this._ractive.get('planet') === planet) this._ractive.set('planet', planet);
            },
            _emptyPlanet: {
                name: '?',
                gravity: '?',
                temp: '?',
                popualtion: '?',
                income: '?',
                metal: '?',
                miningChange: '?',
                incomeGrowth: '?',
                tempChange: '?',
                populationGrowth: '?',
                surfaceImagePath: './js/res/img/unexploredMask.png'
            }
        };

        return planetPanel;
    });