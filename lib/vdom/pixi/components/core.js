"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var pixi = require("pixi.js");
var _1 = require("../../");
var updateMap = {
    scaleX: function (node, val) { return (node.scale.x = val); },
    scaleY: function (node, val) { return (node.scale.y = val); },
    pivotX: function (node, val) { return (node.pivot.x = val); },
    pivotY: function (node, val) { return (node.pivot.y = val); },
    skewX: function (node, val) { return (node.skew.x = val); },
    skewY: function (node, val) { return (node.skew.y = val); },
    worldTransform: function (node, val) { return node.worldTransform.fromArray(val); },
    localTransform: function (node, val) { return node.localTransform.fromArray(val); },
};
function addEvent(node, type, name, listener) {
    var eventsKey = "_" + type + "Events";
    if (!_1.Is.def(node[eventsKey])) {
        node[eventsKey] = {};
    }
    var events = node[eventsKey];
    if (!_1.Is.def(events[name])) {
        var lsns_1 = events[name] = [];
        node[type](name, function (e) {
            if (lsns_1.length > 0) {
                lsns_1[0](e);
            }
        });
    }
    if (events[name][0] !== listener) {
        events[name][0] = listener;
    }
}
function baseUpdate(node, key, val, props, _map) {
    if (typeof val === 'undefined') {
        return;
    }
    var update = updateMap[key] || (_map && _map[key]);
    if (typeof update !== 'undefined') {
        update(node, props[key]);
    }
    else if (key[0] === 'o' && key[1] === 'n') {
        if (key[2] === 'c' && key[3] === 'e') {
            addEvent(node, 'once', key[4].toLowerCase() + key.slice(5), val);
        }
        else {
            addEvent(node, 'on', key[2].toLowerCase() + key.slice(3), val);
        }
    }
    else if (node[key] !== val) {
        node[key] = val;
    }
}
exports.baseUpdate = baseUpdate;
function updateObjectProp(node, key, val, props) {
    for (var k in val) {
        var v = val[k];
        if (v !== node[key][k]) {
            node[key][k] = v;
        }
    }
}
var Container = /** @class */ (function (_super) {
    tslib_1.__extends(Container, _super);
    function Container() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Container.prototype.getRawClass = function () { return pixi.Container; };
    Container.prototype.create = function (props) {
        return new pixi.Container();
    };
    Container.prototype.update = function (node, key, val, props) {
        baseUpdate(node, key, val, props);
    };
    return Container;
}(_1.NativeWrapper));
exports.Container = Container;
var Sprite = /** @class */ (function (_super) {
    tslib_1.__extends(Sprite, _super);
    function Sprite() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Sprite.prototype.getRawClass = function () { return pixi.Sprite; };
    Sprite.prototype.create = function (props) {
        return new pixi.Sprite();
    };
    Sprite.prototype.update = function (node, key, val, props) {
        switch (key) {
            case 'anchorX':
                if (node.anchor.x !== val)
                    node.anchor.x = val;
                break;
            case 'anchorY':
                if (node.anchor.y !== val)
                    node.anchor.y = val;
                break;
            default:
                baseUpdate(node, key, val, props);
                break;
        }
    };
    return Sprite;
}(_1.NativeWrapper));
exports.Sprite = Sprite;
var Graphics = /** @class */ (function (_super) {
    tslib_1.__extends(Graphics, _super);
    function Graphics() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Graphics.prototype.getRawClass = function () { return pixi.Graphics; };
    Graphics.prototype.create = function (props) {
        return new pixi.Graphics();
    };
    Graphics.prototype.update = function (node, key, val, props) {
        baseUpdate(node, key, val, props);
        if (props.draw) {
            props.draw(node);
        }
    };
    return Graphics;
}(_1.NativeWrapper));
exports.Graphics = Graphics;
var Text = /** @class */ (function (_super) {
    tslib_1.__extends(Text, _super);
    function Text() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Text.prototype.getRawClass = function () { return pixi.Text; };
    Text.prototype.create = function (props) {
        return new pixi.Text();
    };
    Text.prototype.update = function (node, key, val, props) {
        if (Text._skipsSet.has(key)) {
            updateObjectProp(node, key, val, props);
        }
        else {
            baseUpdate(node, key, val, props);
        }
    };
    Text._skips = ['style'];
    Text._skipsSet = new Set(Text._skips);
    return Text;
}(_1.NativeWrapper));
exports.Text = Text;
//# sourceMappingURL=core.js.map