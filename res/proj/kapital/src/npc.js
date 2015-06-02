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
                    this.sprite.y += 0.1;
                    break;
                case 'north':
                    this.sprite.y -= 0.1;
                    break;
                case 'east':
                    this.sprite.x += 0.1;
                    break;
                case 'west':
                    this.sprite.x -= 0.1;
                    break;
            }
        }
    };

    return npc;
});