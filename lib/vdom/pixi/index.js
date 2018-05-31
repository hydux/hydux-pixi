"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var _1 = require("../");
var CompKey = '@gl-vdom/comp';
function makeComponentRoot(CompClass) {
    return /** @class */ (function (_super) {
        tslib_1.__extends(PIXIComponentRoot, _super);
        function PIXIComponentRoot() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PIXIComponentRoot.prototype.getRawClass = function () { return PIXI.Container; };
        PIXIComponentRoot.prototype.update = function (node, key, val, props) {
            node[CompKey].props[key] = val;
        };
        PIXIComponentRoot.prototype.updateAll = function (node, props) {
            var comp = node[CompKey];
            if (!comp.shouldUpdate(props, comp.state)) {
                return;
            }
            comp.props = props;
            comp.forceUpdate();
        };
        PIXIComponentRoot.prototype.create = function (props) {
            var comp = new CompClass(props);
            var el = new PIXI.Container();
            el[CompKey] = comp;
            comp.container = el;
            comp.forceUpdate();
            return el;
        };
        return PIXIComponentRoot;
    }(_1.NativeWrapper));
}
var PIXIComponent = /** @class */ (function (_super) {
    tslib_1.__extends(PIXIComponent, _super);
    function PIXIComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._api = exports.api;
        return _this;
    }
    PIXIComponent.prototype.getBuiltin = function () {
        if (!this._builtin) {
            this._builtin = makeComponentRoot(this.constructor);
        }
        return this._builtin;
    };
    return PIXIComponent;
}(_1.Component));
exports.PIXIComponent = PIXIComponent;
exports.api = {
    getChildAt: function (parent, i) {
        return parent.children[i];
    },
    getChildrenCount: function (parent) {
        return parent.children.length;
    },
    replaceChildAt: function (parent, i, node) {
        parent.removeChildAt(i);
        parent.addChildAt(node, i);
    },
    removeChildAt: function (parent, i) {
        parent.removeChildAt(i);
    },
    addChild: function (parent, node) {
        parent.addChild(node);
    }
};
function render(parent, vnode) {
    return _1.patch(parent, 0, vnode, exports.api);
}
exports.render = render;
//# sourceMappingURL=index.js.map