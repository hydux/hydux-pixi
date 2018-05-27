import {
  VNodeType, ICustomAPI, h,
  Is as _Is, flatten1, Component,
  setComponent, getComponent, RenderReturn
} from './'
import * as Hydux from 'hydux'
import * as pixi from 'pixi.js'

const Is = {
  ..._Is,
  pixiComp(v: any): v is PIXIComponentClass {
    if (!Is.def(v)) return false
    let proto: PIXIComponent = v.prototype
    return Is.def(proto.isPIXIComponent) && proto.isPIXIComponent()
  }
}

export type PIXIComponentClass = typeof PIXIComponent
const RootElementPropKey = '@rootElement'
export abstract class PIXIComponent<P = {}, Node = pixi.DisplayObject> extends Component<P> implements Component<P> {
  rootElement: Node
  constructor(props) {
    super(props)
    this.rootElement = this.create(props)
    setComponent(this.rootElement, this)
    const keys = Object.keys(props)
    let i = keys.length
    while (i--) {
      let key = keys[i]
      if (
        key !== 'children' &&
        key !== RootElementPropKey
      ) {
        this.update(this.rootElement, key, props[key], props)
      }
    }
  }
  abstract create(props: P): Node
  abstract update(node: Node, key: string, val: any, props: P): void

  isPIXIComponent() {
    return true
  }

  render() {
    const attrs = this.props
    attrs[RootElementPropKey] = this.rootElement
    let children = attrs['children']
    attrs['children'] = void 0
    return h('builtin', attrs, ...children)
  }
}

export const api: ICustomAPI<pixi.DisplayObject> = {
  createElement(node) {
    if (!Is.def(node)) {
      return new pixi.Container()
    }
    switch (node.type) {
      case VNodeType.text:
        return new pixi.Text(node.name)
      case VNodeType.element:
        if (node.name === 'builtin') {
          return node.attributes!['@rootElement']
        } else {
          throw new Error(`unimplemented: ${node.name}`)
        }
      default:
        return Hydux.never(node)
    }
  },
  setAttribute(node, key, val, attrs) {
    const comp = getComponent(node) as PIXIComponent
    comp.update(node, key, val, attrs)
  },
  insertAt(parentNode: pixi.Container, newNode: pixi.Container, i) {
    parentNode.addChildAt(newNode, i)
    return 1
  },
  replaceChild(parentNode: pixi.Container, newNode: pixi.Container, node) {
    const i = parentNode.getChildIndex(node)
    parentNode.removeChildAt(i)
    parentNode.addChildAt(newNode, i)
  },
  getChildAt(node: pixi.Container, i) {
    if (node.children.length <= i) {
      return undefined
    }
    return node.getChildAt(i)
  },
  getChildCount(node: pixi.Container) {
    return node.children.length
  },
  getParent(node) {
    return node.parent
  },
  removeChildAt(node: pixi.Container, i) {
    return node.removeChildAt(i)
  },
  setTextContent(node: pixi.Text, text) {
    node.text = text
  }
}

export default api
