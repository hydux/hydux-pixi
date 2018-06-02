"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
function h(name, attrs) {
    var children = [];
    var rest = [];
    var len = arguments.length;
    while (len-- > 2)
        rest.push(arguments[len]);
    while (rest.length) {
        var child = rest.pop();
        if (exports.Is.array(child)) {
            if (exports.Is.array(child[0])) {
                for (var len_1 = child.length; len_1--;) {
                    rest.push(child[len_1]);
                }
            }
            else if (child.length === 3) {
                children.push(child);
            }
        }
    }
    return [name, attrs, children];
}
exports.h = h;
/**
 * RawObjectWrapper is used for wrap raw pixi objects,
 * we only use it as class.prototype in diff function,
 * the constructor/class field won't work.
 */
var NativeWrapper = /** @class */ (function () {
    function NativeWrapper() {
    }
    NativeWrapper.prototype.updateAll = function (node, attrs) {
        for (var key in attrs) {
            if (typeof attrs[key] === 'undefined' ||
                key[0] === 'onupdate' ||
                key[0] === 'oncreate') {
                continue;
            }
            this.update(node, key, attrs[key], attrs);
        }
    };
    return NativeWrapper;
}());
exports.NativeWrapper = NativeWrapper;
var CompKey = '@gl-vdom/comp';
var Component = /** @class */ (function () {
    function Component(props) {
        this.props = {};
        this.state = {};
        this._rafId = 0;
        this._lastUpdate = 0;
        this.props = props;
    }
    Component.prototype.shouldUpdate = function (nextProps, nextState) {
        return true;
    };
    Component.prototype.updateState = function () {
        this.setState();
    };
    Component.prototype.setState = function (state, cb) {
        var _this = this;
        if (!this.shouldUpdate(this.props, tslib_1.__assign({}, this.state, state))) {
            return;
        }
        if (Date.now() - this._lastUpdate >= 16) {
            this.setStateImmdiately(state, cb);
            return;
        }
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
        }
        requestAnimationFrame(function () {
            _this.setStateImmdiately(state, cb);
        });
    };
    Component.prototype.setStateImmdiately = function (state, cb) {
        if (exports.Is.def(state)) {
            if (exports.Is.fn(state)) {
                state = state(this.state);
            }
            for (var key in state) {
                this.state[key] = state[key];
            }
        }
        this.forceUpdate();
        exports.Is.def(cb) && cb();
        this._lastUpdate = Date.now();
    };
    Component.prototype.forceUpdate = function () {
        var view = this.render();
        if (view != null && typeof (view) !== 'boolean') {
            patch(this.container, 0, view, this._api);
        }
    };
    Component.prototype.onDidMount = function () {
        // ignore
    };
    Component.prototype.onWillUnmount = function () {
        // ignore
    };
    Component.prototype.render = function () {
        return null;
    };
    return Component;
}());
exports.Component = Component;
exports.Is = {
    array: function (v) {
        return v && v.pop;
    },
    fn: function (v) {
        return typeof v === 'function';
    },
    str: function (v) {
        return typeof v === 'string';
    },
    def: function (v) {
        return typeof v !== 'undefined';
    },
};
function createElement(vnode) {
    var node = vnode[0].prototype.create(vnode[1]);
    var attrs = vnode[1];
    if (attrs && attrs.oncreate) {
        attrs.oncreate(node);
    }
    return node;
}
function mountComponent(parent, i, api) {
    var node = api.getChildAt(parent, i);
    if (exports.Is.def(node) && exports.Is.def(node[CompKey])) {
        try {
            node[CompKey].onDidMount();
        }
        catch (error) {
            console.error(error);
        }
    }
}
function unmountComponent(node, api) {
    if (exports.Is.def(node[CompKey])) {
        try {
            node[CompKey].onWillUnmount();
        }
        catch (error) {
            console.error(error);
        }
    }
    for (var i = 0; i < api.getChildrenCount(node); i++) {
        unmountComponent(api.getChildAt(node, i), api);
    }
}
function update(node, attrs, proto) {
    if (attrs !== null) {
        var onupdate = attrs['onupdate'];
        if (onupdate && onupdate(node, attrs)) {
            return;
        }
        proto.updateAll(node, attrs);
    }
}
function patch(parent, i, vnode, api) {
    var Comp = vnode[0], attrs = vnode[1], children = vnode[2];
    var node = api.getChildAt(parent, i);
    var proto = Comp.prototype;
    var isComponent = false;
    var isCreate = false;
    if (exports.Is.def(proto.getRawClass)) {
        // ignore
    }
    else if (exports.Is.def(proto.getBuiltin)) { // stateful component
        vnode[0] = proto.getBuiltin();
        proto = vnode[0].prototype;
        vnode[1] = attrs = attrs || {};
        attrs['children'] = children;
        isComponent = true;
    }
    else {
        return patch(parent, i, Comp(attrs, children), api);
    }
    if (typeof node === 'undefined') {
        node = createElement(vnode);
        api.addChild(parent, node);
        mountComponent(parent, api.getChildrenCount(parent) - 1, api);
        isCreate = true;
    }
    else {
        var isNotSameNode = node.constructor !== proto.getRawClass();
        var isNotSameComp = (!exports.Is.def(node[CompKey]) && isComponent) ||
            (exports.Is.def(node[CompKey]) && (!isComponent ||
                node[CompKey]).constructor !== Comp);
        if (isNotSameNode || isNotSameComp) {
            node = createElement(vnode);
            unmountComponent(api.getChildAt(parent, i), api);
            api.replaceChildAt(parent, i, node);
            mountComponent(parent, i, api);
            isCreate = true;
        }
    }
    if (!isComponent || !isCreate) {
        update(node, attrs, proto);
    }
    if (!isComponent) {
        patchChildren(node, children, api);
    }
}
exports.patch = patch;
function patchChildren(node, children, api) {
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        patch(node, i, child, api);
    }
    for (var i = api.getChildrenCount(node) - 1; i >= children.length; i--) {
        unmountComponent(node, api);
        api.removeChildAt(node, i);
    }
}
//# sourceMappingURL=index.js.map