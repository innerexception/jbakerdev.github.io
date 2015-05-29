define(['ractive', 'rv!/spacedout/js/src/ui/techPanel/techPanel.html', 'css!/spacedout/js/src/ui/techPanel/techPanel'],
    function(Ractive, techPanelTemplate){
        var techPanel = function(galaxy){
            var targetDiv = document.createElement('div');
            targetDiv.id = 'techPanel';
            targetDiv.className = 'container tech-panel techPanelOut';
            targetDiv.style.top = galaxy.gameInstance.height - 160 + 'px';
            var parent = document.getElementById('bottom-panel');
            parent.appendChild(targetDiv);
            this.galaxy = galaxy;
            this._dom = targetDiv;

            this._ractive = new Ractive({
                el: this._dom.id,
                template: techPanelTemplate,
                data: {
                    player: galaxy.clientPlayer
                }
            });

            var self = this;

            this._ractive.on({
                onTechSpendingChanged: function(event){
                    self.setTechValue(event.node.attributes['data-type'].value, event.node.value);
                },
                onLockTechClick: function(event){
                    self.lockTechValue(event.node.attributes['data-type'].value, event.node.value);
                    self.toggleLocked(document.getElementsByClassName(event.node.attributes['data-type'].value + '-slider')[0]);
                }
            })
        };

        techPanel.prototype = {
            transitionFrom: function(){
                this.isVisible = false;
                //animate this component away
                this._dom.className = this._dom.className.replace('techPanelIn', '');
                this._dom.className = [this._dom.className, 'techPanelOut'].join(' ');

            },
            transitionTo: function(){
                this.isVisible = true;
                //animate this component in
                this._dom.className = this._dom.className.replace('techPanelOut', '');
                this._dom.className = [this._dom.className, 'techPanelIn'].join(' ');
            },
            toggleLocked: function(domNode){
                if(domNode.className.indexOf('locked') !== -1) {
                    domNode.className = domNode.className.replace('locked', '');
                }
                else {
                    domNode.className = [domNode.className, 'locked'].join(' ');
                }
            },
            toggle: function(panel){
                if(panel === 'tech'){
                    if(!this.isVisible) this.transitionTo();
                    else this.transitionFrom();
                }
            },
            setTechValue: function(type, val){
                this._ractive.get('player').setIndividualTechRate(type, val);
                this._ractive.set('player', this.galaxy.clientPlayer);
            },
            lockTechValue: function(type, val){
                this._ractive.get('player').lockTechValue(type, val);
            }
        };

        return techPanel;
    });