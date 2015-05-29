define(['phaser', 'lodash', 'candy', 'budgetPanel',
    'gameSetupModal', 'messagePanel', 'planetPanel', 'techPanel', 'galaxy', 'taskBar', 'shipBuilder', 'battleModal', 'fleetManagerModal'],
    function(Phaser, _, Candy, BudgetPanel, GameSetupModal, MessagePanel, PlanetPanel, TechPanel, Galaxy,
             TaskBarPanel, ShipBuilderPanel, BattleModal, FleetManagerModal){

    var OutSpacedApp = function(h, w, mode, targetElement){
        var loadingSignal = new Phaser.Signal();
        loadingSignal.add(this.appLoad, this);

        var updateSignal = new Phaser.Signal();
        updateSignal.add(this.appUpdate, this);

        //context in these functions is the PHASER OBJECT not our object
        this.gameInstance = new Phaser.Game(h, w, mode, targetElement,{
            preload: this.preload,
            create: this.phaserLoad,
            update: this.update,
            loadComplete: loadingSignal,
            updateSignal: updateSignal
        });
    };

    OutSpacedApp.prototype = {

        preload: function () {
            //Load all assets here
            this.load.image('alphaMask', 'js/res/img/alphaMask.png');
            this.load.image('tinystar', 'js/res/img/tinyStar.png');
            this.load.image('unexploredMask', 'js/res/img/unexploredMask.png');
            this.load.image('lazerShot', 'js/res/img/lazerShot.png');
            this.load.image('explosion', 'js/res/img/explosion.png');
            this.load.image('office_banner', 'js/res/img/red-shield.png');
            this.load.image('lol_banner', 'js/res/img/blue-shield.png');
            this.load.image('player3_banner', 'js/res/img/yellow-shield.png');
            this.load.image('player4_banner', 'js/res/img/green-shield.png');
            this.load.image('player5_banner', 'js/res/img/orange-shield.png');
            this.load.image('halo', 'js/res/img/halo.png');
            _.times(10, function(i){
                i++;
                this.load.image('common_shield_'+i, 'js/res/img/ship/common2/common_shield_'+i+'.png');
                this.load.image('common_range_'+i, 'js/res/img/ship/common2/common_range_'+i+'.png');
                this.load.image('lol_weapon_'+i, 'js/res/img/ship/lol/lol_weapon_'+i+'.png');
                this.load.image('office_weapon_'+i, 'js/res/img/ship/office/office_weapon_'+i+'.png');
            }, this);
            this.load.image('common_head', 'js/res/img/ship/common2/common_head.png');
            this.load.image('common_colony_module', 'js/res/img/ship/common2/common_colony_module.png');
            this.load.image('common_tanker_module', 'js/res/img/ship/common2/common_tanker_module.png');
        },

        phaserLoad: function () {
            //1st time load
            this.world.setBounds(0, 0, 2000, 2000);
            //Camera init
            this.physics.startSystem(Phaser.Physics.ARCADE);
            //Fire off our signal so we can change to our app context
            this.loadComplete.dispatch();
        },

        appLoad: function(){
            var that = this;
            window.setTimeout(function(){
                that.setUpIntro();}, 1000);
        },

        update: function () {
            this.updateSignal.dispatch();
        },

        appUpdate: function(){
            if(this.galaxy) {
                this.galaxy.update();
                if(!this.isInCombat) {
                    var pointerPosition = this.gameInstance.input.mousePointer.position;
                    var camera = this.gameInstance.camera;

                    if (pointerPosition.x >= (this.gameInstance.camera.view.width - 100) && camera.x <= this.gameInstance.stageGroup.width / 2) {
                        camera.x += 5;
                    }
                    if (pointerPosition.y >= (this.gameInstance.camera.view.height - 100) && camera.y <= this.gameInstance.stageGroup.height / 2) {
                        camera.y += 5;
                    }
                    if (pointerPosition.x < (35) && camera.x > 0) {
                        camera.x -= 5;
                    }
                    if (pointerPosition.y < (35) && camera.y > 0) {
                        camera.y -= 5;
                    }
                }
            }
        },

        setUpIntro: function () {

            var galaxyInitFinishedSignal = new Phaser.Signal();
            galaxyInitFinishedSignal.add(this.galaxyInitFinished, this);

            this.gameInstance.stageGroup = this.gameInstance.add.group();
            this.gameInstance.stageGroup.bounds = Phaser.Rectangle.clone(this.gameInstance.world.bounds);

            this.galaxy = new Galaxy(this.gameInstance, galaxyInitFinishedSignal);
            this.gameSetupModal = new GameSetupModal(this.galaxy);

            Candy.drawIntro(this.gameInstance);
            this.gameInstance.camera.focusOnXY(0, 0);
            this.gameInstance.input.onDown.addOnce(this.startNewGame, this);
        },

        mousePanStart: function(){
            this.startMapDrag = true;
        },

        mousePanStop: function(){
            if(this.dragSessionId) this.planetDragDoneSignal.dispatch();
        },

        mousePan: function(){
            //console.log(this.input.x + 'x '+ this.input.y + 'y');
        },

        mouseZoom: function(){
            if(!this.isInCombat){
                if(this.input.mouse.wheelDelta === 1 && this.stageGroup.scale.x < 2){
                    this.stageGroup.scale.x += 0.005;
                    this.stageGroup.scale.y += 0.005;
                }
                else if(this.stageGroup.scale.x > 0.5){
                    this.stageGroup.scale.x -= 0.005;
                    this.stageGroup.scale.y -= 0.005;
                }
            }
        },

        galaxyInitFinished: function(){
            console.log('init panels...');
            this.gameInstance.input.mouse.mouseWheelCallback = this.mouseZoom;
            this.gameInstance.input.mouse.mouseDownCallback = this.mousePanStart;
            this.gameInstance.input.mouse.mouseUpCallback = this.mousePanStop;
            this.gameInstance.input.mouse.mouseOutCallback = this.mousePanStop;
            this.gameInstance.input.mouse.mouseMoveCallback = this.mousePan;
            this.planetPanel = new PlanetPanel(this.galaxy);
            this.budgetPanel = new BudgetPanel(this.galaxy);
            this.techPanel = new TechPanel(this.galaxy);
            this.messagePanel = new MessagePanel(this.galaxy);
            this.shipBuilderPanel = new ShipBuilderPanel(this.galaxy);
            this.taskBarPanel = new TaskBarPanel(this.galaxy);
            this.battleModal = new BattleModal(this.galaxy);
            this.fleetManagerModal = new FleetManagerModal(this.galaxy);
            this.gameInstance.planetClickedSignal = new Phaser.Signal();
            this.gameInstance.planetClickedSignal.add(this.planetPanel.onPlanetClicked, this.planetPanel);
            this.gameInstance.planetClickedSignal.add(this.galaxy.onPlanetClicked, this.galaxy);
            this.gameInstance.fleetEditSignal = new Phaser.Signal();
            this.gameInstance.fleetEditSignal.add(this.fleetManagerModal.transitionTo, this.fleetManagerModal);
            this.gameInstance.panelToggleSignal = new Phaser.Signal();
            this.gameInstance.panelToggleSignal.add(this.planetPanel.toggle, this.planetPanel);
            this.gameInstance.panelToggleSignal.add(this.techPanel.toggle, this.techPanel);
            this.gameInstance.panelToggleSignal.add(this.budgetPanel.toggle, this.budgetPanel);
            this.gameInstance.panelToggleSignal.add(this.messagePanel.toggle, this.messagePanel);
            this.gameInstance.panelToggleSignal.add(this.shipBuilderPanel.toggle, this.shipBuilderPanel);
            this.gameInstance.panelToggleSignal.add(this.galaxy.onEndTurn, this.galaxy);
            this.gameInstance.messageSignal = new Phaser.Signal();
            this.gameInstance.messageSignal.add(this.messagePanel.onMessageRecieved, this.messagePanel);
            this.gameInstance.planetUpdatedSignal = new Phaser.Signal();
            this.gameInstance.planetUpdatedSignal.add(this.planetPanel.refreshPanel, this.planetPanel);
            this.gameInstance.budgetUpdatedSignal = new Phaser.Signal();
            this.gameInstance.budgetUpdatedSignal.add(this.budgetPanel.refreshPlayer, this.budgetPanel);
            this.gameInstance.planetDragDoneSignal = new Phaser.Signal();
            this.gameInstance.planetDragDoneSignal.add(this.galaxy.endShipDrag, this.galaxy);
            this.gameInstance.battleModalSignal = new Phaser.Signal();
            this.gameInstance.battleModalSignal.add(this.battleModal.startBattle, this.battleModal);
            console.log('init panels done.');
            this.inGame = true;
            this.gameInstance.camera.focusOnXY(0,0);
            this.taskBarPanel._dom.children[1].style.display = 'inherit';
        },

        startNewGame: function () {
            Candy.clearIntro(this.gameInstance);
            this.gameSetupModal.transitionTo();
        },

        runVictory: function () {

        },

        runLoss: function () {

        }

    };

    return OutSpacedApp;
});

