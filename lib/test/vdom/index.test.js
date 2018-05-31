"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vdom_1 = require("../../vdom");
var Utils = require("./utils");
var assert = require("assert");
var core_1 = require("../../vdom/pixi/components/core");
var testTrees = Utils.testTrees;
describe('desc', function () {
    it('skip null and boolean children', function () {
        var expected = [core_1.Container, {}, []];
        assert.deepEqual(vdom_1.h(core_1.Container, {}, null), expected);
        assert.deepEqual(vdom_1.h(core_1.Container, {}, undefined), expected);
    });
    it('nested children', function () {
        var expected = [core_1.Container, {}, [
                [core_1.Container, null, []],
                [core_1.Container, null, []],
            ]];
        assert.deepEqual(vdom_1.h(core_1.Container, {}, [
            vdom_1.h(core_1.Container, null),
            undefined,
            null,
            vdom_1.h(core_1.Container, null)
        ]), expected);
    });
    testTrees('replace element', [
        { node: vdom_1.h(core_1.Container, {}), pixidom: ['Container', {}] },
        { node: vdom_1.h(core_1.Sprite, {}), pixidom: ['Sprite', {}] },
    ]);
    testTrees('insert children on top', [
        {
            node: vdom_1.h(core_1.Container, {}, [vdom_1.h(core_1.Sprite, { x: 1 }, vdom_1.h(core_1.Text, { text: 'A' }))]),
            pixidom: ['Container', {},
                ['Sprite', { x: 1 },
                    ['Text', { text: 'A' }]
                ]
            ],
        },
        {
            node: vdom_1.h(core_1.Container, {}, vdom_1.h(core_1.Sprite, { x: 2 }, vdom_1.h(core_1.Text, { text: 'B' })), vdom_1.h(core_1.Sprite, { x: 1 }, vdom_1.h(core_1.Text, { text: 'A' }))),
            pixidom: ['Container', {},
                ['Sprite', { x: 2 },
                    ['Text', { text: 'B' }]
                ],
                ['Sprite', { x: 1 },
                    ['Text', { text: 'A' }]
                ]
            ],
        },
        {
            node: vdom_1.h(core_1.Container, {}, vdom_1.h(core_1.Sprite, { x: 3 }, vdom_1.h(core_1.Text, { text: 'C' })), vdom_1.h(core_1.Sprite, { x: 2 }, vdom_1.h(core_1.Text, { text: 'B' })), vdom_1.h(core_1.Sprite, { x: 1 }, vdom_1.h(core_1.Text, { text: 'A' }))),
            pixidom: ['Container', {},
                ['Sprite', { x: 3 },
                    ['Text', { text: 'C' }]
                ],
                ['Sprite', { x: 2 },
                    ['Text', { text: 'B' }]
                ],
                ['Sprite', { x: 1 },
                    ['Text', { text: 'A' }]
                ]
            ],
        },
    ]);
    testTrees('remove text node', [
        {
            node: vdom_1.h(core_1.Container, {}, [
                vdom_1.h(core_1.Sprite, {}, [vdom_1.h(core_1.Text, { text: 'foo' })]),
                vdom_1.h(core_1.Text, { text: 'bar' }),
            ]),
            pixidom: ['Container', {},
                ['Sprite', {},
                    ['Text', { text: 'foo' }]
                ],
                ['Text', { text: 'bar' }],
            ],
        },
        {
            node: vdom_1.h(core_1.Container, {}, [
                vdom_1.h(core_1.Sprite, {}, [vdom_1.h(core_1.Text, { text: 'foo' })]),
            ]),
            pixidom: ['Container', {},
                ['Sprite', {},
                    ['Text', { text: 'foo' }]
                ],
            ],
        },
    ]);
    testTrees('sort', [
        {
            node: vdom_1.h(core_1.Container, {}, vdom_1.h(core_1.Sprite, { x: 1 }, vdom_1.h(core_1.Text, { text: 'A' })), vdom_1.h(core_1.Sprite, { x: 2 }, vdom_1.h(core_1.Text, { text: 'B' })), vdom_1.h(core_1.Sprite, { x: 3 }, vdom_1.h(core_1.Text, { text: 'C' })), vdom_1.h(core_1.Sprite, { x: 4 }, vdom_1.h(core_1.Text, { text: 'D' })), vdom_1.h(core_1.Sprite, { x: 5 }, vdom_1.h(core_1.Text, { text: 'E' }))),
            pixidom: ['Container', {},
                ['Sprite', { x: 1 }, ['Text', { text: 'A' }]],
                ['Sprite', { x: 2 }, ['Text', { text: 'B' }]],
                ['Sprite', { x: 3 }, ['Text', { text: 'C' }]],
                ['Sprite', { x: 4 }, ['Text', { text: 'D' }]],
                ['Sprite', { x: 5 }, ['Text', { text: 'E' }]],
            ],
        },
        {
            node: vdom_1.h(core_1.Container, {}, vdom_1.h(core_1.Sprite, { x: 1 }, vdom_1.h(core_1.Text, { text: 'A' })), vdom_1.h(core_1.Sprite, { x: 3 }, vdom_1.h(core_1.Text, { text: 'C' })), vdom_1.h(core_1.Sprite, { x: 4 }, vdom_1.h(core_1.Text, { text: 'D' }))),
            pixidom: ['Container', {},
                ['Sprite', { x: 1 }, ['Text', { text: 'A' }]],
                ['Sprite', { x: 3 }, ['Text', { text: 'C' }]],
                ['Sprite', { x: 4 }, ['Text', { text: 'D' }]],
            ],
        },
        {
            node: vdom_1.h(core_1.Container, {}, vdom_1.h(core_1.Sprite, { x: 4 }, vdom_1.h(core_1.Text, { text: 'D' }))),
            pixidom: ['Container', {},
                ['Sprite', { x: 4 }, ['Text', { text: 'D' }]],
            ],
        },
        {
            node: vdom_1.h(core_1.Container, {}, vdom_1.h(core_1.Sprite, { x: 1 }, vdom_1.h(core_1.Text, { text: 'A' })), vdom_1.h(core_1.Sprite, { x: 2 }, vdom_1.h(core_1.Text, { text: 'B' })), vdom_1.h(core_1.Sprite, { x: 3 }, vdom_1.h(core_1.Text, { text: 'C' })), vdom_1.h(core_1.Sprite, { x: 4 }, vdom_1.h(core_1.Text, { text: 'D' })), vdom_1.h(core_1.Sprite, { x: 5 }, vdom_1.h(core_1.Text, { text: 'E' }))),
            pixidom: ['Container', {},
                ['Sprite', { x: 1 }, ['Text', { text: 'A' }]],
                ['Sprite', { x: 2 }, ['Text', { text: 'B' }]],
                ['Sprite', { x: 3 }, ['Text', { text: 'C' }]],
                ['Sprite', { x: 4 }, ['Text', { text: 'D' }]],
                ['Sprite', { x: 5 }, ['Text', { text: 'E' }]],
            ]
        },
        {
            node: vdom_1.h(core_1.Container, {}, vdom_1.h(core_1.Sprite, { x: 1 }, vdom_1.h(core_1.Text, { text: 'A' })), vdom_1.h(core_1.Sprite, { x: 3 }, vdom_1.h(core_1.Text, { text: 'C' })), vdom_1.h(core_1.Sprite, { x: 2 }, vdom_1.h(core_1.Text, { text: 'B' })), vdom_1.h(core_1.Sprite, { x: 4 }, vdom_1.h(core_1.Text, { text: 'D' })), vdom_1.h(core_1.Sprite, { x: 5 }, vdom_1.h(core_1.Text, { text: 'E' }))),
            pixidom: ['Container', {},
                ['Sprite', { x: 1 }, ['Text', { text: 'A' }]],
                ['Sprite', { x: 3 }, ['Text', { text: 'C' }]],
                ['Sprite', { x: 2 }, ['Text', { text: 'B' }]],
                ['Sprite', { x: 4 }, ['Text', { text: 'D' }]],
                ['Sprite', { x: 5 }, ['Text', { text: 'E' }]],
            ],
        },
        {
            node: vdom_1.h(core_1.Container, {}, vdom_1.h(core_1.Sprite, { x: 1 }, vdom_1.h(core_1.Text, { text: 'A' })), vdom_1.h(core_1.Sprite, { x: 3 }, vdom_1.h(core_1.Text, { text: 'C' })), vdom_1.h(core_1.Sprite, { x: 2 }, vdom_1.h(core_1.Text, { text: 'B' })), vdom_1.h(core_1.Sprite, { x: 4 }, vdom_1.h(core_1.Text, { text: 'D' })), vdom_1.h(core_1.Sprite, { x: 5 }, vdom_1.h(core_1.Text, { text: 'E' }))),
            pixidom: ['Container', {},
                ['Sprite', { x: 1 }, ['Text', { text: 'A' }]],
                ['Sprite', { x: 3 }, ['Text', { text: 'C' }]],
                ['Sprite', { x: 2 }, ['Text', { text: 'B' }]],
                ['Sprite', { x: 4 }, ['Text', { text: 'D' }]],
                ['Sprite', { x: 5 }, ['Text', { text: 'E' }]],
            ],
        },
        {
            node: vdom_1.h(core_1.Container, {}, vdom_1.h(core_1.Sprite, { x: 4 }, vdom_1.h(core_1.Text, { text: 'D' })), vdom_1.h(core_1.Sprite, { x: 3 }, vdom_1.h(core_1.Text, { text: 'C' })), vdom_1.h(core_1.Sprite, { x: 2 }, vdom_1.h(core_1.Text, { text: 'B' })), vdom_1.h(core_1.Sprite, { x: 1 }, vdom_1.h(core_1.Text, { text: 'A' }))),
            pixidom: ['Container', {},
                ['Sprite', { x: 4 }, ['Text', { text: 'D' }]],
                ['Sprite', { x: 3 }, ['Text', { text: 'C' }]],
                ['Sprite', { x: 2 }, ['Text', { text: 'B' }]],
                ['Sprite', { x: 1 }, ['Text', { text: 'A' }]],
            ],
        },
    ]);
});
//# sourceMappingURL=index.test.js.map