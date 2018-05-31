"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Utils = require("./utils");
var assert = require("assert");
var core_1 = require("../../vdom/pixi/components/core");
var vdom_1 = require("../../vdom");
var _1 = require("../../vdom/pixi/");
var testTrees = Utils.testTrees;
describe('component', function () {
    describe('SimpleComp', function () {
        var mountCount = 0;
        var unmountCount = 0;
        var renderCount = 0;
        var initProps = {
            text: 'init',
        };
        var SimpleComp = /** @class */ (function (_super) {
            tslib_1.__extends(SimpleComp, _super);
            function SimpleComp() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SimpleComp.prototype.onDidMount = function () {
                mountCount++;
                assert(this.container, 'has container');
            };
            SimpleComp.prototype.onWillUnmount = function () {
                unmountCount++;
            };
            SimpleComp.prototype.render = function () {
                renderCount++;
                return vdom_1.h(core_1.Container, { x: 1 }, vdom_1.h(core_1.Text, { text: this.props.text }), this.props.children);
            };
            return SimpleComp;
        }(_1.PIXIComponent));
        testTrees('simple', [{
                node: vdom_1.h(SimpleComp, initProps, vdom_1.h(core_1.Text, { text: 'aa' })),
                pixidom: [
                    'Container', {},
                    ['Container', { x: 1 },
                        ['Text', { text: 'init' }],
                        ['Text', { text: 'aa' }],
                    ]
                ],
                assert: function () {
                    assert.equal(mountCount, 1);
                    assert.equal(renderCount, 1);
                    assert.equal(unmountCount, 0);
                }
            }, {
                node: vdom_1.h(SimpleComp, initProps, vdom_1.h(core_1.Text, { text: 'children' })),
                pixidom: [
                    'Container', {},
                    ['Container', { x: 1 },
                        ['Text', { text: 'init' }],
                        ['Text', { text: 'children' }],
                    ]
                ],
                assert: function () {
                    assert.equal(mountCount, 1);
                    assert.equal(renderCount, 2);
                    assert.equal(unmountCount, 0);
                }
            }, {
                node: vdom_1.h(SimpleComp, tslib_1.__assign({}, initProps, { text: '2' })),
                pixidom: [
                    'Container', {},
                    ['Container', { x: 1 },
                        ['Text', { text: '2' }],
                    ]
                ],
                assert: function () {
                    assert.equal(mountCount, 1);
                    assert.equal(renderCount, 3);
                    assert.equal(unmountCount, 0);
                }
            }, {
                node: vdom_1.h(core_1.Container, null),
                pixidom: ['Container', {}],
                assert: function () {
                    assert.equal(mountCount, 1, 'mountCount');
                    assert.equal(renderCount, 3, 'renderCount');
                    assert.equal(unmountCount, 1, 'unmountCount');
                }
            }]);
    });
    describe('NestComp', function () {
        var mountCount = 0;
        var unmountCount = 0;
        var renderCount = 0;
        var initProps = {
            a: 1,
        };
        function FnComp(props, children) {
            return vdom_1.h(core_1.Container, { x: 1 }, vdom_1.h(core_1.Text, { text: "FnComp: " + props.aa }), vdom_1.h(core_1.Container, { x: 2 }, children));
        }
        var NestComp = /** @class */ (function (_super) {
            tslib_1.__extends(NestComp, _super);
            function NestComp() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            NestComp.prototype.onDidMount = function () {
                mountCount++;
                assert(this.container, 'rootElementMounted');
            };
            NestComp.prototype.onWillUnmount = function () {
                unmountCount++;
            };
            NestComp.prototype.render = function () {
                renderCount++;
                return vdom_1.h(core_1.Container, { x: 3 }, vdom_1.h(core_1.Text, { text: "NestComp: " + this.props.a }), this.props.children);
            };
            return NestComp;
        }(_1.PIXIComponent));
        testTrees('NestedComp', [{
                node: vdom_1.h(core_1.Container, null, vdom_1.h(NestComp, { a: 1 }, vdom_1.h(FnComp, { aa: 2 }, vdom_1.h(NestComp, { a: 3 })))),
                pixidom: [
                    'Container', {},
                    ['Container', {},
                        ['Container', { x: 3 },
                            ['Text', { text: 'NestComp: 1' }],
                            ['Container', { x: 1 },
                                ['Text', { text: "FnComp: 2" }],
                                ['Container', { x: 2 },
                                    ['Container', {},
                                        ['Container', { x: 3 },
                                            ['Text', { text: 'NestComp: 3' }],
                                        ]
                                    ]
                                ],
                            ]
                        ]
                    ]
                ],
                assert: function () {
                    assert.equal(mountCount, 2, 'mountCount');
                    assert.equal(renderCount, 2, 'renderCount');
                    assert.equal(unmountCount, 0, 'unmountCount');
                }
            }, {
                node: vdom_1.h(core_1.Container, null, vdom_1.h(NestComp, {
                    a: 2,
                }, vdom_1.h(FnComp, { aa: 2 }, vdom_1.h(NestComp, { a: 3 })))),
                pixidom: [
                    'Container', {},
                    ['Container', {},
                        ['Container', { x: 3 },
                            ['Text', { text: 'NestComp: 2' }],
                            ['Container', { x: 1 },
                                ['Text', { text: "FnComp: 2" }],
                                ['Container', { x: 2 },
                                    ['Container', {},
                                        ['Container', { x: 3 },
                                            ['Text', { text: 'NestComp: 3' }],
                                        ]
                                    ]
                                ],
                            ]
                        ]
                    ]
                ],
                assert: function () {
                    assert.equal(mountCount, 2, 'mountCount');
                    assert.equal(renderCount, 4, 'renderCount');
                    assert.equal(unmountCount, 0, 'unmountCount');
                }
            }, {
                node: vdom_1.h(core_1.Container, null, vdom_1.h(NestComp, {
                    a: 2,
                }, vdom_1.h(FnComp, { aa: 2 }, vdom_1.h(NestComp, { a: 4 })))),
                pixidom: [
                    'Container', {},
                    ['Container', {},
                        ['Container', { x: 3 },
                            ['Text', { text: 'NestComp: 2' }],
                            ['Container', { x: 1 },
                                ['Text', { text: "FnComp: 2" }],
                                ['Container', { x: 2 },
                                    ['Container', {},
                                        ['Container', { x: 3 },
                                            ['Text', { text: 'NestComp: 4' }],
                                        ]
                                    ]
                                ],
                            ]
                        ]
                    ]
                ],
                assert: function () {
                    assert.equal(mountCount, 2, 'mountCount');
                    assert.equal(renderCount, 6, 'renderCount');
                    assert.equal(unmountCount, 0, 'unmountCount');
                }
            }, {
                node: vdom_1.h(core_1.Container, null),
                pixidom: ['Container', {}],
                assert: function () {
                    assert.equal(mountCount, 2, 'mountCount');
                    assert.equal(renderCount, 6, 'renderCount');
                    assert.equal(unmountCount, 2, 'unmountCount');
                }
            }]);
    });
});
//# sourceMappingURL=component.test.js.map