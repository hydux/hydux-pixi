import { VNode, render } from '../../vdom'
import domApi from '../../vdom/dom-api'
import * as assert from 'assert'

const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM(`<!DOCTYPE html><head></head><body></body>`)
export const document = dom.window.document
global['document'] = document

export interface RenderTree {
  node: VNode
  html: string
  assert?: () => void
}

export function testTrees(name: string, trees: RenderTree[]) {
  it(name, done => {
    trees.map(tree => {
      console.log(tree.html)
      render(tree.node, document.body, domApi)
      assert.equal(document.body.innerHTML, tree.html.replace(/\s{2,}/g, ''))
      tree.assert && tree.assert()
    })
    done()
  })
}
