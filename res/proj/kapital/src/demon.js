define(['lodash', 'candy'], function(_, Candy){
    var demon = function(spriteGroup, player, phaserInstance){
        this.spriteGroup = spriteGroup;
        this.player = player;
        this.playerSprite = player.sprite;
        this.phaserInstance = phaserInstance;
        this.hp = 10;
        this.resetTargetPoint();
    };

    demon.prototype = {
        update: function(){
            if(this.phaserInstance.physics.arcade.distanceBetween(this.spriteGroup.children[0], this.playerSprite) < 100 && !this.player.inRoom){
                _.each(this.spriteGroup.children, function(sprite){
                    sprite.tint = 0xff0000;
                }, this);
                this.phaserInstance.physics.arcade.accelerateToObject(this.spriteGroup.children[0], this.playerSprite, 60, 60, 60);
                this.player.hp-=0.5;
                Candy.shakeCamera(50, 2, 2, this.player, this.phaserInstance);
            }
            else if(this.phaserInstance.physics.arcade.distanceBetween(this.spriteGroup.children[0], this.playerSprite) < 200 && !this.player.inRoom){
                Candy.shakeCamera(25, 1, 2, this.player, this.phaserInstance);
            }
            else if(this.travelInterval <= 0){
                this.resetTargetPoint();
            }
            else{
                this.travelInterval--;
            }
            _.each(this.spriteGroup.children, function(sprite){
                if(sprite !== this.spriteGroup.children[0]){
                    this.phaserInstance.physics.arcade.accelerateToXY(sprite, this.spriteGroup.children[0].x, this.spriteGroup.children[0].y, 60, 60, 60);
                }
            }, this);
        },
        resetTargetPoint: function(){
            var targetPoint = {x: this.phaserInstance.world.randomX, y: this.phaserInstance.world.randomY};

            this.phaserInstance.physics.arcade.accelerateToXY(this.spriteGroup.children[0], targetPoint.x, targetPoint.y, 20, 20, 20);

            this.travelInterval = 500;
            if(this.spriteGroup.children[0].tint = 0xff0000) {
                _.each(this.spriteGroup.children, function(sprite){
                    this.tweenTint(sprite, 0xff0000, 0xffffff, (Math.random()*5000)+500);
                }, this);
            }
            else{
                _.each(this.spriteGroup.children, function(sprite){
                    this.tweenTint(sprite, 0xffffff, 0xff0000, (Math.random()*5000)+500)
                }, this);
            }
        },
        tweenTint: function(obj, startColor, endColor, time) {
            // create an object to tween with our step value at 0
            var colorBlend = {step: 0};

            // create the tween on this object and tween its step property to 100
            var colorTween = this.phaserInstance.add.tween(colorBlend).to({step: 100}, time);

            // run the interpolateColor function every time the tween updates, feeding it the
            // updated value of our tween each time, and set the result as our tint
            colorTween.onUpdateCallback(function() {
                obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);
            });

            // set the object to the start color straight away
            obj.tint = startColor;

            // start the tween
            colorTween.start();
        }
    };

    return demon;
});