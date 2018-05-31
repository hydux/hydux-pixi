"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var pixi = require("pixi.js");
var _1 = require("../../");
var core = require("./core");
var Mesh = /** @class */ (function (_super) {
    tslib_1.__extends(Mesh, _super);
    function Mesh() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Mesh.prototype.getRawClass = function () {
        return pixi.mesh.Mesh;
    };
    Mesh.prototype.create = function (props) {
        return new pixi.mesh.Mesh(props.texture);
    };
    Mesh.prototype.update = function (node, key, val, props) {
        core.baseUpdate(node, key, val, props);
    };
    return Mesh;
}(_1.NativeWrapper));
exports.Mesh = Mesh;
var Plane = /** @class */ (function (_super) {
    tslib_1.__extends(Plane, _super);
    function Plane() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Plane.prototype.getRawClass = function () {
        return pixi.mesh.Plane;
    };
    Plane.prototype.create = function (props) {
        return new pixi.mesh.Plane(props.texture);
    };
    Plane.prototype.update = function (node, key, val, props) {
        core.baseUpdate(node, key, val, props);
    };
    return Plane;
}(_1.NativeWrapper));
exports.Plane = Plane;
var NineSlicePlane = /** @class */ (function (_super) {
    tslib_1.__extends(NineSlicePlane, _super);
    function NineSlicePlane() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NineSlicePlane.prototype.getRawClass = function () {
        return pixi.mesh.NineSlicePlane;
    };
    NineSlicePlane.prototype.create = function (props) {
        return new pixi.mesh.NineSlicePlane(props.texture);
    };
    NineSlicePlane.prototype.update = function (node, key, val, props) {
        core.baseUpdate(node, key, val, props);
    };
    return NineSlicePlane;
}(_1.NativeWrapper));
exports.NineSlicePlane = NineSlicePlane;
var Rope = /** @class */ (function (_super) {
    tslib_1.__extends(Rope, _super);
    function Rope() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rope.prototype.getRawClass = function () {
        return pixi.mesh.Rope;
    };
    Rope.prototype.create = function (props) {
        return new pixi.mesh.Rope(props.texture, props.points);
    };
    Rope.prototype.update = function (node, key, val, props) {
        core.baseUpdate(node, key, val, props);
    };
    return Rope;
}(_1.NativeWrapper));
exports.Rope = Rope;
//# sourceMappingURL=mesh.js.map