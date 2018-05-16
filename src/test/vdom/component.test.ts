import { render, domApi, h, Component, HyduxComponent } from '../../vdom'
import * as assert from 'assert'
import * as fs from 'fs'
import * as Utils from './utils'

const testTrees = Utils.testTrees

describe('component', () => {
  describe('lifecycles', () => {
    beforeEach(() => {
      document.body.innerHTML = ''
    })
    let mountCount = 0
    let unmountCount = 0
    let renderCount = 0
    let props = {
      text: 'init',
      children: null as any,
    }
    class SimpleComp extends Component<typeof props> {
      onMount() {
        mountCount++
        assert(this.rootElement, 'rootElementMounted')
      }
      onUnmount() {
        unmountCount++
      }
      render() {
        renderCount++
        return h('div', { 'class': 'SimpleComp' }, `SimpleComp:${props.text}`, this.props.children)
      }
    }
    testTrees('lifecycles', [{
      node: h(SimpleComp, props, 'children'),
      html: ''
    }])
  })

})
