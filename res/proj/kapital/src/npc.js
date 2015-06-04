define([], function(){
    var npc = function(sprite, phaserInstance){
        this.sprite = sprite;
        this.sprite.tint = 0xff0000;
        this.phaserInstance = phaserInstance;
        this.resetTargetPoint();
    };

    npc.prototype = {
        update: function(){
            this.travelInterval--;
            if(this.travelInterval <= 0){
                this.resetTargetPoint();
            }
        },
        stop: function(){
            this.sprite.body.velocity.setTo(0);
        },
        resetTargetPoint: function() {
            var targetPoint = {x: this.phaserInstance.world.randomX/2, y: this.phaserInstance.world.randomY/2};

            this.phaserInstance.physics.arcade.accelerateToXY(this.sprite, targetPoint.x, targetPoint.y, 20, 20, 20);

            this.travelInterval = 500;
        }
    };

    return npc;
});