"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var pixi = require("pixi.js");
var _1 = require("../../");
var core = require("./core");
var BitmapText = /** @class */ (function (_super) {
    tslib_1.__extends(BitmapText, _super);
    function BitmapText() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BitmapText.prototype.getRawClass = function () {
        return pixi.Sprite;
    };
    BitmapText.prototype.create = function (props) {
        return new pixi.extras.BitmapText(props.text);
    };
    BitmapText.prototype.update = function (node, key, val, props) {
        core.baseUpdate(node, key, val, props);
    };
    return BitmapText;
}(_1.NativeWrapper));
exports.BitmapText = BitmapText;
var AnimatedSprite = /** @class */ (function (_super) {
    tslib_1.__extends(AnimatedSprite, _super);
    function AnimatedSprite() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AnimatedSprite.prototype.getRawClass = function () {
        return pixi.Sprite;
    };
    AnimatedSprite.prototype.create = function (props) {
        return new pixi.extras.AnimatedSprite(props.textures, props.autoUpdate);
    };
    AnimatedSprite.prototype.update = function (node, key, val, props) {
        if (key === 'playing' && val !== node.playing) {
            if (val) {
                node.play();
            }
            else {
                node.stop();
            }
        }
        core.baseUpdate(node, key, val, props);
    };
    return AnimatedSprite;
}(_1.NativeWrapper));
exports.AnimatedSprite = AnimatedSprite;
var TilingSprite = /** @class */ (function (_super) {
    tslib_1.__extends(TilingSprite, _super);
    function TilingSprite() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TilingSprite.prototype.getRawClass = function () {
        return pixi.Sprite;
    };
    TilingSprite.prototype.create = function (props) {
        return new pixi.extras.TilingSprite(props.texture);
    };
    TilingSprite.prototype.update = function (node, key, val, props) {
        core.baseUpdate(node, key, val, props, TilingSprite._updateMap);
    };
    TilingSprite._updateMap = {
        tileScaleX: function (node, val) { return (node.tileScale.x = val); },
        tileScaleY: function (node, val) { return (node.tileScale.y = val); },
        tilePositionX: function (node, val) { return (node.tilePosition.x = val); },
        tilePositionY: function (node, val) { return (node.tilePosition.y = val); },
    };
    return TilingSprite;
}(_1.NativeWrapper));
exports.TilingSprite = TilingSprite;
//# sourceMappingURL=extras.js.map