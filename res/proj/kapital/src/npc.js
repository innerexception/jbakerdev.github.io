define([], function(){
    var npc = function(sprite){
        this.sprite = sprite;
        this.sprite.tint = 0xff0000;
        this.sprite.direction = 'south';
    };

    npc.prototype = {
        update: function(){
            switch(this.sprite.direction){
                case 'south':
                    this.sprite.body.velocity.y = 2;
                    break;
                case 'north':
                    this.sprite.body.velocity.y = -2;
                    break;
                case 'east':
                    this.sprite.body.velocity.x = 2;
                    break;
                case 'west':
                    this.sprite.body.velocity.x = -2;
                    break;
            }
        }
    };

    return npc;
});