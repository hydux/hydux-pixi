import * as Utils from './utils'
import * as assert from 'assert'
import { Container, Sprite, Text, Graphics } from '../../vdom/pixi/components/core'
import { h } from '../../vdom'
import { PIXIComponent } from '../../vdom/pixi/'
import * as fs from 'fs'

const testTrees = Utils.testTrees

describe('component', () => {
  describe('SimpleComp', () => {
    let mountCount = 0
    let unmountCount = 0
    let renderCount = 0
    let initProps = {
      text: 'init',
    }
    class SimpleComp extends PIXIComponent<typeof initProps> {
      onDidMount() {
        mountCount++
        assert(this.container, 'has container')
      }
      onWillUnmount() {
        unmountCount++
      }
      render() {
        renderCount++
        return h(Container, { x: 1 },
          h(Text, { text: this.props.text }),
          this.props.children,
        )
      }
    }
    testTrees('simple', [{
      node: h(SimpleComp, initProps, h(Text, { text: 'aa' })),
      pixidom: [
        'Container', {},
        ['Container', { x: 1 },
          ['Text', { text: 'init' }],
          ['Text', { text: 'aa' }],
        ]
      ],
      assert: () => {
        assert.equal(mountCount, 1)
        assert.equal(renderCount, 1)
        assert.equal(unmountCount, 0)
      }
    }, {
      node: h(SimpleComp, initProps, h(Text, { text: 'children' })),
      pixidom: [
        'Container', {},
        ['Container', { x: 1 },
          ['Text', { text: 'init' }],
          ['Text', { text: 'children' }],
        ]
      ],
      assert: () => {
        assert.equal(mountCount, 1)
        assert.equal(renderCount, 2)
        assert.equal(unmountCount, 0)
      }
    }, {
      node: h(SimpleComp, { ...initProps, text: '2' }),
      pixidom: [
        'Container', {},
        ['Container', { x: 1 },
          ['Text', { text: '2' }],
        ]
      ],
      assert: () => {
        assert.equal(mountCount, 1)
        assert.equal(renderCount, 3)
        assert.equal(unmountCount, 0)
      }
    }, {
      node: h(Container, null),
      pixidom: ['Container', {}],
      assert: () => {
        assert.equal(mountCount, 1, 'mountCount')
        assert.equal(renderCount, 3, 'renderCount')
        assert.equal(unmountCount, 1, 'unmountCount')
      }
    }])
  })

  describe('NestComp', () => {
    let mountCount = 0
    let unmountCount = 0
    let renderCount = 0
    let initProps = {
      a: 1,
    }
    function FnComp(props: any, children) {
      return h(
        Container,
        { x: 1 },
        h(
          Text,
          { text: `FnComp: ${props.aa}` },
        ),
        h(Container, { x: 2 }, children)
      )
    }
    class NestComp extends PIXIComponent<typeof initProps> {
      onDidMount() {
        mountCount++
        assert(this.container, 'rootElementMounted')
      }
      onWillUnmount() {
        unmountCount++
      }
      render() {
        renderCount++
        return h(Container, { x: 3 },
          h(Text, { text: `NestComp: ${this.props.a}` }),
          this.props.children)
      }
    }

    testTrees('NestedComp', [{
      node: h(Container, null,
        h(NestComp, { a: 1 },
        h(FnComp, { aa: 2 }, h(NestComp, { a: 3 })))
      ),
      pixidom: [
        'Container', {},
        ['Container', {}, // NestComp
          ['Container', { x: 3 },
            ['Text', { text: 'NestComp: 1' }],
            ['Container', { x: 1 }, // FnComp
              ['Text', { text: `FnComp: 2` }],
              ['Container', { x: 2 },
                ['Container', {}, // NestComp
                  ['Container', { x: 3 },
                    ['Text', { text: 'NestComp: 3' }],
                  ]
                ]
              ],
            ]
          ]
        ]
      ],
      assert: () => {
        assert.equal(mountCount, 2, 'mountCount')
        assert.equal(renderCount, 2, 'renderCount')
        assert.equal(unmountCount, 0, 'unmountCount')
      }
    }, {
      node: h(Container, null,
        h(NestComp, {
          a: 2,
        },
        h(FnComp, { aa: 2 }, h(NestComp, { a: 3 })))
      ),
      pixidom: [
        'Container', {},
        ['Container', {}, // NestComp
          ['Container', { x: 3 },
            ['Text', { text: 'NestComp: 2' }],
            ['Container', { x: 1 }, // FnComp
              ['Text', { text: `FnComp: 2` }],
              ['Container', { x: 2 },
                ['Container', {}, // NestComp
                  ['Container', { x: 3 },
                    ['Text', { text: 'NestComp: 3' }],
                  ]
                ]
              ],
            ]
          ]
        ]
      ],
      assert: () => {
        assert.equal(mountCount, 2, 'mountCount')
        assert.equal(renderCount, 4, 'renderCount')
        assert.equal(unmountCount, 0, 'unmountCount')
      }
    }, {
      node: h(Container, null,
        h(NestComp, {
          a: 2,
        },
        h(FnComp, { aa: 2 }, h(NestComp, { a: 4 })))
      ),
      pixidom: [
        'Container', {},
        ['Container', {}, // NestComp
          ['Container', { x: 3 },
            ['Text', { text: 'NestComp: 2' }],
            ['Container', { x: 1 }, // FnComp
              ['Text', { text: `FnComp: 2` }],
              ['Container', { x: 2 },
                ['Container', {}, // NestComp
                  ['Container', { x: 3 },
                    ['Text', { text: 'NestComp: 4' }],
                  ]
                ]
              ],
            ]
          ]
        ]
      ],
      assert: () => {
        assert.equal(mountCount, 2, 'mountCount')
        assert.equal(renderCount, 6, 'renderCount')
        assert.equal(unmountCount, 0, 'unmountCount')
      }
    }, {
      node: h(Container, null),
      pixidom: ['Container', {}],
      assert: () => {
        assert.equal(mountCount, 2, 'mountCount')
        assert.equal(renderCount, 6, 'renderCount')
        assert.equal(unmountCount, 2, 'unmountCount')
      }
    }])
  })

})
