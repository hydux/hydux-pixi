"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Hydux = require("hydux");
var Component = /** @class */ (function () {
    function Component(props) {
        var _this = this;
        this.actions = {
            aa: function (a) { return function (s, a) { return s; }; },
        };
        this._ctx = Hydux.app({
            init: function () { return _this.init(props); },
            actions: this.actions,
            view: function (s, a) { return _this.view(props, s, a); },
            onRender: function (view) {
                // diff any apply the view
            }
        });
    }
    Component.prototype.init = function (props) {
        return tslib_1.__assign({}, props);
    };
    Component.prototype.view = function (props, state, actions) {
        return null;
    };
    return Component;
}());
exports.Component = Component;
//# sourceMappingURL=types.js.map