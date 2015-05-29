define(['phaser'], function(Phaser){
    var Candy = {};
    Candy.tooltips = {};
    Candy.gameBoyPalette = {
        lightBrown: '#e6d69c',
        mediumBrown: '#b4a56a',
        darkBrown: '#7b7162',
        extraDarkBrown: '#393829',
        extraDarkBlueGreen: '#183030',
        darkBlueGreen: '#507868',
        blueGreen: '#a8c0b0',
        lightBlueGreen: '#e0f0e8',
        lightGreen: '#d7e894',
        green: '#aec440',
        darkGreen: '#527f39',
        extraDarkGreen: '#204631',
        lightBrownHex: 0xe6d69c,
        mediumBrownHex: 0xb4a56a,
        darkBrownHex: 0x7b7162,
        extraDarkBrownHex: 0x393829,
        extraDarkBlueGreenHex: 0x183030,
        darkBlueGreenHex: 0x507868,
        blueGreenHex: 0xa8c0b0,
        lightBlueGreenHex: 0xe0f0e8,
        lightGreenHex: 0xd7e894,
        greenHex: 0xaec440,
        darkGreenHex: 0x527f39,
        extraDarkGreenHex: 0x204631
    };
    Candy.drawTooltip = function (phaserInstance, x, y, text, fontSiez, delay) {
        if (!Candy.tooltips[text]) {
            Candy.tooltips[text] = phaserInstance.add.text(x, y, text);
            Candy.setTextProps(Candy.tooltips[text], {fontSiez: fontSiez});
            Candy.tooltips[text].bounce = phaserInstance.add.tween(Candy.tooltips[text].scale)
                .to({x: 1.1, y: 1.1}, 500, Phaser.Easing.Linear.None)
                .to({x: 1, y: 1}, 500, Phaser.Easing.Linear.None)
                .loop();
            Candy.tooltips[text].bounce.start();
        }
        var that = Candy;
        window.setTimeout(function () {
            that.killTooltip(text);
        }, delay ? delay : 1000);
    };

    Candy.setTextProps = function(textObj, props){
        textObj.anchor.setTo(0.5);
        textObj.wordWrap = true;
        textObj.wordWrapWidth = 700;
        textObj.font = 'Press Start 2P';
        textObj.fontSize = props.fontSiez ? props.fontSiez : 8;
        textObj.fill = props.fill ? props.fill : '#FFFFFF';
        textObj.align = 'center';
        textObj.stroke = props.stroke ? props.stroke : '#000000';
        textObj.strokeThickness = 2;
        textObj.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
    };

    Candy.killTooltip = function (text) {
        if (Candy.tooltips[text]) {
            Candy.tooltips[text].destroy();
            delete Candy.tooltips[text];
        }
    };

    Candy.drawBannerMessage = function (phaserInstance, text, fontSiez, delay, callBack, context, wait) {
        if (!Candy.tooltips[text]) {
            Candy.tooltips[text] = phaserInstance.add.text(-800, 300, text);
            Candy.setTextProps(Candy.tooltips[text], {fontSiez:fontSiez});
            Candy.tooltips[text].bounce = phaserInstance.add.tween(Candy.tooltips[text])
                .to({x: 400}, 500, Phaser.Easing.Linear.None)
                .to({x: 420}, delay ? delay : 3000)
                .to({x: 1600}, 500, Phaser.Easing.Linear.None);
            wait ? Candy.tooltips[text].bounce.delay(wait).start() : Candy.tooltips[text].bounce.start();

            if(!Candy.messageBackgroundSprite){
                var bmp = phaserInstance.add.bitmapData(1024, 768);
                bmp.ctx.beginPath();
                bmp.ctx.lineWidth = '300';
                bmp.ctx.strokeStyle = 'rgba(55,55,55,0.5)';
                bmp.ctx.moveTo(0, 384);
                bmp.ctx.lineTo(1024, 384);
                bmp.ctx.stroke();
                bmp.ctx.closePath();
                Candy.messageBackgroundSprite = phaserInstance.add.sprite(-800, 300, bmp);
            }

            Candy.messageBackgroundSprite.x = -800;
            Candy.messageBackgroundSprite.y = 0;
            Candy.messageBackgroundSprite.bringToTop();
            phaserInstance.world.bringToTop(Candy.tooltips[text]);

            Candy.messageBackgroundSprite.bounce = phaserInstance.add.tween(Candy.messageBackgroundSprite)
                .to({x: 0}, 500, Phaser.Easing.Linear.None)
                .to({x: 0}, delay ? delay : 3000)
                .to({x: 1600}, 500, Phaser.Easing.Linear.None);
            if (callBack) {
                Candy.messageBackgroundSprite.bounce._lastChild.onComplete.addOnce(callBack, context);
            }
            wait ? Candy.messageBackgroundSprite.bounce.delay(wait).start() : Candy.messageBackgroundSprite.bounce.start();
        }
        var that = Candy;
        window.setTimeout(function () {
            that.killTooltip(text);
        }, delay ? delay + 1000 : 4000);
    };

    Candy.drawIntro = function(phaserInstance){
        Candy.logo = phaserInstance.add.text(400, 0, "sImperialism");
        Candy.setTextProps(Candy.logo, {fontSiez:48});

        Candy.logo.bounce = phaserInstance.add.tween(Candy.logo);
        Candy.logo.bounce.to({y: phaserInstance.world.height / 4}, 3500, Phaser.Easing.Linear.None);
        Candy.logo.bounce.start();

        Candy.logoSub = phaserInstance.add.text(400, 40, "CLICK TO START");
        Candy.setTextProps(Candy.logoSub, {fontSiez: 32});

        Candy.logoSub.bounce = phaserInstance.add.tween(Candy.logoSub);
        Candy.logoSub.bounce.to({y: phaserInstance.world.height / 3}, 3500, Phaser.Easing.Linear.None);
        Candy.logoSub.bounce.start();
    };

    Candy.clearIntro = function (phaserInstance) {
        Candy.logo.flicker = phaserInstance.add.tween(this.logo);
        Candy.logo.flicker.to({alpha: 0}, 50, Phaser.Easing.Linear.None, true, 0, 40);
        Candy.logo.flicker.start();
        Candy.logoSub.flicker = phaserInstance.add.tween(this.logoSub);
        Candy.logoSub.flicker.to({alpha: 0}, 50, Phaser.Easing.Linear.None, true, 0, 40);
        Candy.logoSub.flicker.start();
    };

    Candy.getObjectFromSprite = function(sprite, collection) {
        return _.find(collection, function(unit){
            return unit.sprite === sprite;
        }, this);
    };

    return Candy;

});