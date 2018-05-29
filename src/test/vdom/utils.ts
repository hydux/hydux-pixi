const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM(`<!DOCTYPE html><head></head><body></body>`)
export const document = dom.window.document
global['document'] = document
global['window'] = dom.window
global['navigator'] = dom.window.navigator

import { h, VNode } from '../../vdom'
import { render } from '../../vdom/pixi'
import * as assert from 'assert'
import * as pixi from 'pixi.js'

export interface RenderTree {
  node: VNode
  pixidom: any[]
  assert?: () => void
}

export function serializePixiDom(root: pixi.Container | pixi.DisplayObject, attrKeys: string[]) {
  let name = root.constructor.name
  const attrs = {}
  for (const key of attrKeys) {
    const subKeys = key.split('.')
    let subAttr = attrs
    let pixiAttr = root
    for (let i = 0; i < subKeys.length; i++) {
      const k = subKeys[i]
      if (i === subKeys.length - 1) {
        if (pixiAttr[k] !== void 0 && pixiAttr[k] !== 0) {
          subAttr[k] = pixiAttr[k]
        }
      } else {
        subAttr = subAttr[k] = {}
        pixiAttr = pixiAttr[k]
      }
    }
  }
  return [name, attrs, ...(root['children'] || []).map(child => serializePixiDom(child, attrKeys))]
}

export function testTrees(name: string, trees: RenderTree[], attrKeys = ['x', 'y', 'text']) {
  it(name, done => {
    const app = new pixi.Application({
      width: 256,
      height: 256,
    })
    trees.map(tree => {
      render(app.stage, tree.node)
      assert.deepEqual(serializePixiDom(app.stage.children[0], attrKeys), tree.pixidom)
      tree.assert && tree.assert()
    })
    app.destroy(true)
    done()
  })
}
