define(['ractive', 'rv!/spacedout/js/src/ui/gameSetupModal/gameSetupModal.html', 'css!/spacedout/js/src/ui/gameSetupModal/gameSetupModal'],
    function(Ractive, gameSetupTemplate){
        var gameSetupModal = function(galaxy){

            this.size = 'Small';
            this.shape = 'Circle';
            this.handicap = 0;
            this.spread = 100;
            this.otherPlayers = 1;
            this.difficulty = 0;

            var targetDiv = document.createElement('div');
            targetDiv.id = 'gameSetupModal';
            targetDiv.className = 'container-fluid game-setup gameSetupOut';
            galaxy.dom.appendChild(targetDiv);
            this.galaxy = galaxy;
            this._dom = targetDiv;

            this._ractive = new Ractive({
                el: this._dom.id,
                template: gameSetupTemplate,
                data: {
                    size : ['Small', 'Medium', 'Large'],
                    spread: ['Dense', 'Sparse'],
                    ai_players: 1,
                    ai_difficulty: 0,
                    shape: ['Spiral', 'Circle', 'Ring'],
                    handicap: 0
                }
            });

            var self = this;

            this._ractive.on({
                handicapSelected: function(event){

                },
                startClicked: function(event){
                    self.transitionFrom();
                    self.galaxy.initGalaxy(self.size, self.shape, self.otherPlayers, self.difficulty, self.handicap, self.spread);
                },
                sizeSelected: function(event){

                },
                spreadSelected: function(event){

                },
                playersSelected: function(event){

                },
                difficultySelected: function(event){

                }
            })
        };

        gameSetupModal.prototype = {
            transitionFrom: function(){
                //animate this component away
                this._dom.className = this._dom.className.replace('gameSetupIn', '');
                if (!this._dom.className.indexOf('gameSetupOut') > -1) {
                    this._dom.className = [this._dom.className, 'gameSetupOut'].join(" ");
                }
            },
            transitionTo: function(){
                //animate this component in
                this._dom.className = this._dom.className.replace('gameSetupOut', '');
                if (!this._dom.className.indexOf('gameSetupIn') > -1) {
                    this._dom.className = [this._dom.className, 'gameSetupIn'].join(" ");
                }

            }
        };

    return gameSetupModal;
});