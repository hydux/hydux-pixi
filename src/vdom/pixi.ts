
import { BuiltinWrapper, Is, patch, Component, VNode, ICustomAPI } from '.'
import * as pixi from 'pixi.js'

const CompKey = '@gl-vdom/comp'
function makeComponentRoot<T extends typeof PIXIComponent>(CompClass: T) {
  return class PIXIComponentRoot extends BuiltinWrapper {
    getRawClass() { return PIXI.Container }
    update<P>(node: pixi.Container, key: string, val: any, props: P) {
      node[CompKey].props[key] = val
    }
    updateAll<P>(node: pixi.Container, props: P) {
      const comp = node[CompKey] as Component
      if (!comp.shouldUpdate(comp.state, props)) {
        return
      }
      super.updateAll(node, props)
      comp.forceUpdate()
    }
    create<P>(props: P | null) {
      const comp = new CompClass()
      const el: PIXI.Container = new PIXI.Container()
      el[CompKey] = comp
      comp.container = el
      comp.forceUpdate()
      el.on('added', () => comp.onDidMount())
      el.on('removed', () => comp.onDidUnmount())
      return el
    }
  }
}
export class PIXIComponent<P = {}, S = {}> extends Component {
  container: PIXI.Container
  _builtin: any
  _api = api
  getBuiltin() {
    if (!this._builtin) {
      this._builtin = makeComponentRoot(this.constructor as typeof PIXIComponent)
    }
    return this._builtin
  }
}

export const api: ICustomAPI<PIXI.Container> = {
  getChildAt(parent, i) {
    return parent.children[i] as PIXI.Container
  },
  getChildrenCount(parent) {
    return parent.children.length
  },
  replaceChildAt(parent, i, node) {
    parent.removeChildAt(i)
    parent.addChildAt(node, i)
  },
  removeChildAt(parent, i) {
    parent.removeChildAt(i)
  },
  addChild(parent, node) {
    parent.addChild(node)
  }
}

export function render<Node extends PIXI.Container>(parent: Node, vnode: VNode) {
  return patch(parent, 0, vnode, api)
}
