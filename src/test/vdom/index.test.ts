import { h } from '../../vdom'
import * as Utils from './utils'
import * as assert from 'assert'
import { Container, Sprite, Text, Graphics } from '../../components/core'
import * as fs from 'fs'

const testTrees = Utils.testTrees

describe('desc', () => {
  it('skip null and boolean children', () => {
    const expected = [Container, {}, []]
    assert.deepEqual(h(Container, {}, null), expected)
    assert.deepEqual(h(Container, {}, undefined), expected)
  })
  it('nested children', () => {
    const expected = [Container, {}, [
      [Container, null, []],
      [Container, null, []],
    ]]
    assert.deepEqual(
      h(Container, {}, [
        h(Container, null),
        undefined,
        null,
        h(Container, null)
      ]), expected)
  })
  testTrees('replace element', [
    { node: h(Container, {}), pixidom: ['Container', {}] },
    { node: h(Sprite, {}), pixidom: ['Sprite', {}] },
  ])
  testTrees('insert children on top', [
    {
      node: h(Container, {}, [h(Sprite, { x: 1 }, h(Text, { text: 'A' }))]),
      pixidom: ['Container', {},
        ['Sprite', { x: 1 },
          ['Text', { text: 'A' }]
        ]
      ],
    },
    {
      node: h(Container, {},
        h(Sprite, { x: 2 }, h(Text, { text: 'B' })),
        h(Sprite, { x: 1 }, h(Text, { text: 'A' })),
      ),
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
      node: h(Container, {},
        h(Sprite, { x: 3 }, h(Text, { text: 'C' })),
        h(Sprite, { x: 2 }, h(Text, { text: 'B' })),
        h(Sprite, { x: 1 }, h(Text, { text: 'A' })),
      ),
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
  ])
  testTrees('remove text node', [
    {
      node: h(Container, {}, [
        h(Sprite, {}, [h(Text, { text: 'foo' })]),
        h(Text, { text: 'bar' }),
      ]),
      pixidom: ['Container', {},
        ['Sprite', { },
          ['Text', { text: 'foo' }]
        ],
        ['Text', { text: 'bar' }],
      ],
    },
    {
      node: h(Container, {}, [
        h(Sprite, {}, [h(Text, { text: 'foo' })]),
      ]),
      pixidom: ['Container', {},
        ['Sprite', { },
          ['Text', { text: 'foo' }]
        ],
      ],
    },
  ])
  testTrees('sort', [
    {
      node: h(Container, {},
        h(Sprite, { x: 1 }, h(Text, { text: 'A' })),
        h(Sprite, { x: 2 }, h(Text, { text: 'B' })),
        h(Sprite, { x: 3 }, h(Text, { text: 'C' })),
        h(Sprite, { x: 4 }, h(Text, { text: 'D' })),
        h(Sprite, { x: 5 }, h(Text, { text: 'E' })),
      ),
      pixidom: ['Container', {},
        ['Sprite', { x: 1 }, ['Text', { text: 'A' }]],
        ['Sprite', { x: 2 }, ['Text', { text: 'B' }]],
        ['Sprite', { x: 3 }, ['Text', { text: 'C' }]],
        ['Sprite', { x: 4 }, ['Text', { text: 'D' }]],
        ['Sprite', { x: 5 }, ['Text', { text: 'E' }]],
      ],
    },
    {
      node: h(Container, {},
        h(Sprite, { x: 1 }, h(Text, { text: 'A' })),
        h(Sprite, { x: 3 }, h(Text, { text: 'C' })),
        h(Sprite, { x: 4 }, h(Text, { text: 'D' })),
      ),
      pixidom: ['Container', {},
        ['Sprite', { x: 1 }, ['Text', { text: 'A' }]],
        ['Sprite', { x: 3 }, ['Text', { text: 'C' }]],
        ['Sprite', { x: 4 }, ['Text', { text: 'D' }]],
      ],
    },
    {
      node: h(Container, {},
        h(Sprite, { x: 4 }, h(Text, { text: 'D' })),
      ),
      pixidom: ['Container', {},
        ['Sprite', { x: 4 }, ['Text', { text: 'D' }]],
      ],
    },
    {
      node: h(Container, {},
        h(Sprite, { x: 1 }, h(Text, { text: 'A' })),
        h(Sprite, { x: 2 }, h(Text, { text: 'B' })),
        h(Sprite, { x: 3 }, h(Text, { text: 'C' })),
        h(Sprite, { x: 4 }, h(Text, { text: 'D' })),
        h(Sprite, { x: 5 }, h(Text, { text: 'E' })),
      ),
      pixidom: ['Container', {},
        ['Sprite', { x: 1 }, ['Text', { text: 'A' }]],
        ['Sprite', { x: 2 }, ['Text', { text: 'B' }]],
        ['Sprite', { x: 3 }, ['Text', { text: 'C' }]],
        ['Sprite', { x: 4 }, ['Text', { text: 'D' }]],
        ['Sprite', { x: 5 }, ['Text', { text: 'E' }]],
      ]
    },
    {
      node: h(Container, {},
        h(Sprite, { x: 1 }, h(Text, { text: 'A' })),
        h(Sprite, { x: 3 }, h(Text, { text: 'C' })),
        h(Sprite, { x: 2 }, h(Text, { text: 'B' })),
        h(Sprite, { x: 4 }, h(Text, { text: 'D' })),
        h(Sprite, { x: 5 }, h(Text, { text: 'E' })),
      ),
      pixidom: ['Container', {},
        ['Sprite', { x: 1 }, ['Text', { text: 'A' }]],
        ['Sprite', { x: 3 }, ['Text', { text: 'C' }]],
        ['Sprite', { x: 2 }, ['Text', { text: 'B' }]],
        ['Sprite', { x: 4 }, ['Text', { text: 'D' }]],
        ['Sprite', { x: 5 }, ['Text', { text: 'E' }]],
      ],
    },
    {
      node: h(Container, {},
        h(Sprite, { x: 1 }, h(Text, { text: 'A' })),
        h(Sprite, { x: 3 }, h(Text, { text: 'C' })),
        h(Sprite, { x: 2 }, h(Text, { text: 'B' })),
        h(Sprite, { x: 4 }, h(Text, { text: 'D' })),
        h(Sprite, { x: 5 }, h(Text, { text: 'E' })),
      ),
      pixidom: ['Container', {},
        ['Sprite', { x: 1 }, ['Text', { text: 'A' }]],
        ['Sprite', { x: 3 }, ['Text', { text: 'C' }]],
        ['Sprite', { x: 2 }, ['Text', { text: 'B' }]],
        ['Sprite', { x: 4 }, ['Text', { text: 'D' }]],
        ['Sprite', { x: 5 }, ['Text', { text: 'E' }]],
      ],
    },
    {
      node: h(Container, {},
        h(Sprite, { x: 4 }, h(Text, { text: 'D' })),
        h(Sprite, { x: 3 }, h(Text, { text: 'C' })),
        h(Sprite, { x: 2 }, h(Text, { text: 'B' })),
        h(Sprite, { x: 1 }, h(Text, { text: 'A' })),
      ),
      pixidom: ['Container', {},
        ['Sprite', { x: 4 }, ['Text', { text: 'D' }]],
        ['Sprite', { x: 3 }, ['Text', { text: 'C' }]],
        ['Sprite', { x: 2 }, ['Text', { text: 'B' }]],
        ['Sprite', { x: 1 }, ['Text', { text: 'A' }]],
      ],
    },
  ])
})
