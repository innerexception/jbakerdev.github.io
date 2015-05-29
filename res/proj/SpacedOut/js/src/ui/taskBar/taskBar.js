define(['ractive', 'rv!/spacedout/js/src/ui/taskBar/taskBar.html', 'css!/spacedout/js/src/ui/taskBar/taskBar'],
    function(Ractive, taskBarTemplate) {
        var taskBar = function (galaxy) {
            var targetDiv = document.createElement('div');
            targetDiv.id = 'taskBar';
            targetDiv.className = 'taskBarOut';
            galaxy.dom.appendChild(targetDiv);
            this.galaxy = galaxy;
            this._dom = targetDiv;

            this._ractive = new Ractive({
                el: this._dom.id,
                template: taskBarTemplate
            });

            var self = this;

            this._ractive.on({
                onBudgetClicked: function (event) {
                    self.galaxy.gameInstance.panelToggleSignal.dispatch('budget');
                },
                onTechClicked: function(event){
                    self.galaxy.gameInstance.panelToggleSignal.dispatch('tech');
                },
                onMessagesClicked: function(event){
                    self.galaxy.gameInstance.panelToggleSignal.dispatch('messages');
                },
                onBuilderClicked: function(event){
                    self.galaxy.gameInstance.panelToggleSignal.dispatch('builder');
                },
                onPlanetClicked: function(event){
                    self.galaxy.gameInstance.panelToggleSignal.dispatch('planet');
                },
                onEndTurnClicked: function(event){
                    self.galaxy.gameInstance.panelToggleSignal.dispatch('end');
                },
                onZoomClicked: function(event){
                    self.galaxy.gameInstance.panelToggleSignal.dispatch('zoom');
                }
            })
        };
        taskBar.prototype = {

        };
        return taskBar;
    });