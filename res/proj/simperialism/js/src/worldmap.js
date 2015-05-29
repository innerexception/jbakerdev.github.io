define(['lodash', 'provinceData', 'candy', 'province'], function(_, ProvinceData, Candy, Province){
    var worldMap = function(phaserInstance){
        this.provinces = [];
        _.each(ProvinceData, function(province){
            this.provinces.push(new Province(province, phaserInstance));
        }, this);
        this.phaserInstance = phaserInstance;

        //Base sprite
        this.groundSprite = this.phaserInstance.add.sprite(0, 0, 'mapBackground');
        this.groundSprite.alpha = 0;
        this.groundSprite.fadeIn = this.phaserInstance.add.tween(this.groundSprite)
            .to({alpha: 0.75}, 2000, Phaser.Easing.Linear.None);
        //this.groundSprite.fadeIn.onComplete.addOnce(function () {
        //    this.transitionTo();
        //}, this);
        this.groundSprite.fadeOut = this.phaserInstance.add.tween(this.groundSprite)
            .to({alpha:0}, 2000, Phaser.Easing.Linear.None);

        this.logo = phaserInstance.add.text(phaserInstance.world.width-200, 100,'PANAMANISTAN');
        this.logo.scale.x = 0.0001;
        this.logo.scale.y = 0.0001;
        Candy.setTextProps(this.logo, {fontSiez: 24,
            fill: Candy.gameBoyPalette.darkBlueGreen,
            stroke: Candy.gameBoyPalette.darkBlueGreen});
        this.logo.appearTween = phaserInstance.add.tween(this.logo.scale)
            .to({x:1.2, y:1.2}, 500, Phaser.Easing.Linear.None)
            .to({x:1, y:1}, 500, Phaser.Easing.Bounce.Out);
        this.logo.dissapearTween = phaserInstance.add.tween(this.logo.scale)
            .to({x:0.0001, y:0.0001}, 500, Phaser.Easing.Bounce.Out);

        this.mapBmp = this.phaserInstance.add.bitmapData(1024, 768);

        this.phaserInstance.input.onDown.add(this.worldMapMouseDown, this);

        this.updateMap = true;

    };
    worldMap.prototype = {
        update: function(){
            if(this.updateMap){
                _.each(this.provinces, function(province){
                    if(province.polygon ? province.polygon.contains(this.phaserInstance.input.x, this.phaserInstance.input.y) : false){
                        //Draw fill polygon
                        console.log('drawing fill poly');
                        province.polyDrawer.beginFill(0xFFFFFF, 0.5);
                        province.polyDrawer.drawPolygon(province.polygon);
                        province.polyDrawer.endFill();
                    }
                    else{
                        //Clear polygon
                        province.polyDrawer ? province.polyDrawer.clear() : false;
                    }
                }, this);
            }
            if(this.activeProvince){
                this.activeProvince.update();
            }
        },
        worldMapMouseDown: function(){
            var position = this.phaserInstance.input.activePointer.position;
            _.each(this.provinces, function(province){
                if(province.polygon ? province.polygon.contains(position.x, position.y): false){
                    //Transition to this province
                    this.transitionFrom(province.transitionTo, province);
                    this.activeProvince = province;
                }
            }, this);
        },
        transitionFrom: function(nextTransitionDelegate, context){
            this.logo.dissapearTween.onComplete.addOnce(function(){
                nextTransitionDelegate.apply(context);
            }, this);
            this.logo.dissapearTween.start();
            this.groundSprite.fadeOut.start();
            this.mapSprite.fadeOut.start();
            this.clearMap();
            this.updateMap = false;
            this.phaserInstance.input.onDown.remove(this.worldMapMouseDown, this);
            console.log('leaving map');
        },
        transitionTo: function(){
            console.log('drawing map');
            this.drawMap();
            this.logo.appearTween.start();
            this.groundSprite.fadeIn.start();
            this.mapSprite.fadeIn.start();
            this.phaserInstance.input.onDown.add(this.worldMapMouseDown, this);
        },
        drawMap: function(){
            _.each(this.provinces, function(province){
               this.drawProvince(province);
            }, this);
            if(this.mapSprite) this.mapSprite.destroy();
            this.mapSprite = this.phaserInstance.add.sprite(0,0,this.mapBmp);
            this.mapSprite.alpha = 0;
            this.mapSprite.fadeIn = this.phaserInstance.add.tween(this.mapSprite)
                .to({alpha: 1.0}, 2000, Phaser.Easing.Linear.None);
            this.mapSprite.fadeOut = this.phaserInstance.add.tween(this.mapSprite)
                .to({alpha: 0}, 2000, Phaser.Easing.Linear.None);
            this.mapSprite.fadeOut.start();
        },
        drawProvince: function(province){
            var polygonPoints = [];
            var maxX = 0, maxY = 0;
            _.each(province.edges, function(edge){
                this.mapBmp.ctx.beginPath();
                this.mapBmp.ctx.lineWidth = edge.lineWidth;
                this.mapBmp.ctx.strokeStyle = edge.color;//'rgb(239,237,79)';
                this.mapBmp.ctx.setLineDash(edge.lineDash);//[2,3]);
                this.mapBmp.ctx.moveTo(edge.startX,edge.startY);
                this.mapBmp.ctx.lineTo(edge.endX, edge.endY);
                polygonPoints.push({x:edge.endX, y:edge.endY});
                if(edge.endX > maxX)maxX=edge.endX;
                if(edge.endY > maxY)maxY=edge.endY;
                this.mapBmp.ctx.closePath();
                this.mapBmp.ctx.stroke();
            }, this);

            province.polyDrawer = this.phaserInstance.add.graphics(0,0);
            province.polygon = new Phaser.Polygon(polygonPoints);
            province.polygonTween = this.phaserInstance.add.tween(province.polyDrawer)
                .to({x:-(maxX/2)+ 100, y:-(maxY/2)+ 100}, 1000, Phaser.Easing.Linear.None)
                .to({x:-(maxX/2)+ 110, y:-(maxY/2)+ 110}, 3000, Phaser.Easing.Linear.None)
                .to({x:-1000, y:-1000}, 1000, Phaser.Easing.Linear.None);
            province.polygonSizeTween = this.phaserInstance.add.tween(province.polyDrawer.scale)
                .to({x:2, y:2}, 1000, Phaser.Easing.Linear.None);

        },
        clearMap: function(){
            this.mapSprite.destroy();
        }
    };
    return worldMap;
});