define([], function(){
    var demon = function(sprite, playerSprite, phaserInstance){
        this.sprite = sprite;
        phaserInstance.physics.arcade.enableBody(this.sprite);
        this.sprite.tint = 0xFF0000;
        this.playerSprite = playerSprite;
        this.phaserInstance = phaserInstance;
        this.resetTargetPoint();
    };

    demon.prototype = {
        update: function(){
            if(this.phaserInstance.physics.arcade.distanceBetween(this.sprite, this.playerSprite) < 100){
                this.phaserInstance.physics.arcade.accelerateToObject(this.sprite, this.playerSprite, 60, 60, 60);
            }
            else if(this.travelInterval <= 0){
                this.resetTargetPoint();
            }
            else{
                this.travelInterval--;
            }
        },
        resetTargetPoint: function(){
            var targetPoint = {x: Math.round(Math.random()*200), y: Math.round(Math.random()*200)};
            this.phaserInstance.physics.arcade.accelerateToXY(this.sprite, targetPoint.x, targetPoint.y, 20, 20, 20);
            this.travelInterval = 500;
        }
    };

    return demon;
});