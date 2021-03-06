/*global Phaser, R, T, G, console, game, Utils, dynamicInvoke, stacks*/
"use strict";

var Dice = {};

Dice.add = function (assetName, group, numSides, yOffset) {
    var x = 100 + 80 * group.children.length;
    var y = yOffset;
    if (x >= 2000) {
        var t = Math.floor(x / 2000);
        x -= 2000 * t - 100;
        y += 100 * t;
    }
    if (y >= World.height - 100) {
        y = 100;
    }
    var dice = group.create(x, y, assetName);
    group.numSides = numSides;

    dice.animations.add('spin', R.range(0, numSides));

    // seed value
    dice.play('spin', 30);
    dice.animations.currentAnim.setFrame(0, true);
    dice.isDice = true;

    T.draggable(dice);
    T.stackable(dice);

    Dice.spinnable(dice);
    Cursor.reset(dice);
    T.setId(dice);
    T.networkAble(dice);

    return dice;
};

Dice.onSpinClicked = function onSpinClicked(tile) {
    console.log('onSpinClicked', tile);
    tile.dragTimeout = setTimeout(function() {
        tile.wasDragged = true;
    }, 300);
};

Dice.onSpinReleased = function onSpinReleased(tile) {
    console.log('onSpinReleased', tile);

    if (tile.wasDragged) {
        console.log('dice was dragged');
        delete tile.wasDragged;
        return;
    }
    clearTimeout(tile.dragTimeout);


    var selectedDice = R.compose(
        R.pluck('id'),
        R.filter(R.propEq('isDice', true))
    )(Controls.getSelected(tile));
    
    console.log('selectedDice', selectedDice);

    Network.server.spin(selectedDice, tile.parent.numSides);
};


Dice.spin = function spin(selectedDice, delays, values) {
    console.log('selectedDice', selectedDice);
    R.forEach.idx(function (diceId, index) {
        var dice = G.findTile(diceId),
            delay = delays[index],
            value = values[index];

        console.log('spin', diceId, value);
        dice.play('spin', 100, true);
        setTimeout(function () {
            console.log('dice stop spin');
            dice.animations.stop(null, false);
            dice.frame = value; // set dice to number of eyes
        }, delay - 200);

        game.add.tween(dice).to({
            rotation: delay / 20
        }, delay, Phaser.Easing.Cubic.Out, true, 0, false);
    })(selectedDice);
};



Dice.spinnable = function (tile) {
    tile.anchor.set(0.4);
    tile.events.onInputDown.add(Dice.onSpinClicked, this);
    tile.events.onInputUp.add(Dice.onSpinReleased, this);
};
