"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Vdom = require("./vdom");
var pixi_1 = require("./vdom/pixi");
var React = { createElement: Vdom.h };
exports.React = React;
var h = Vdom.h;
exports.h = h;
var __HYDUX_RENDER_NODE__ = '__HYDUX_RENDER_NODE__';
function withPixi(container, options) {
    if (options === void 0) { options = {}; }
    var rafId;
    var _options = tslib_1.__assign({}, options);
    return function (app) { return function (props) { return app(tslib_1.__assign({}, props, { view: function (s, a) {
            return [props.view, s, a];
        }, onRender: function (view) {
            props.onRender && props.onRender(view);
            if (rafId) {
                window.cancelAnimationFrame(rafId);
            }
            // fix duplicate node in hmr
            var render = function () {
                if (typeof options.stats !== 'undefined') {
                    options.stats.begin();
                    pixi_1.render(container, view[0](view[1], view[2]));
                    options.stats.end();
                }
                else {
                    pixi_1.render(container, view[0](view[1], view[2]));
                }
            };
            rafId = window.requestAnimationFrame(render);
        } })); }; };
}
exports.default = withPixi;
//# sourceMappingURL=index.js.map