"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsdom = require('jsdom');
var JSDOM = jsdom.JSDOM;
var dom = new JSDOM("<!DOCTYPE html><head></head><body></body>");
exports.document = dom.window.document;
global['document'] = exports.document;
global['window'] = dom.window;
global['navigator'] = dom.window.navigator;
var pixi_1 = require("../../vdom/pixi");
var assert = require("assert");
var pixi = require("pixi.js");
function serializePixiDom(root, attrKeys) {
    var name = root.constructor.name;
    var attrs = {};
    for (var _i = 0, attrKeys_1 = attrKeys; _i < attrKeys_1.length; _i++) {
        var key = attrKeys_1[_i];
        var subKeys = key.split('.');
        var subAttr = attrs;
        var pixiAttr = root;
        for (var i = 0; i < subKeys.length; i++) {
            var k = subKeys[i];
            if (i === subKeys.length - 1) {
                if (pixiAttr[k] !== void 0 && pixiAttr[k] !== 0) {
                    subAttr[k] = pixiAttr[k];
                }
            }
            else {
                subAttr = subAttr[k] = {};
                pixiAttr = pixiAttr[k];
            }
        }
    }
    return [name, attrs].concat((root['children'] || []).map(function (child) { return serializePixiDom(child, attrKeys); }));
}
exports.serializePixiDom = serializePixiDom;
function testTrees(name, trees, attrKeys) {
    if (attrKeys === void 0) { attrKeys = ['x', 'y', 'text']; }
    it(name, function (done) {
        var app = new pixi.Application({
            width: 256,
            height: 256,
        });
        trees.map(function (tree) {
            pixi_1.render(app.stage, tree.node);
            assert.deepEqual(serializePixiDom(app.stage.children[0], attrKeys), tree.pixidom);
            tree.assert && tree.assert();
        });
        app.destroy(true);
        done();
    });
}
exports.testTrees = testTrees;
//# sourceMappingURL=utils.js.map