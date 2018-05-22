import {
  VNodeType, ICustomAPI, mountComp, h,
  Is as _Is, flatten1, Component,
  setComponent, getComponent,
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

export abstract class PIXIComponent<P = any, Node = pixi.DisplayObject> extends Component<P> {
  rootElement: Node
  abstract create(props: P): Node
  abstract update(node: Node, props: P): void

  isPIXIComponent() {
    return true
  }

  render() {
    this.props['@rootElement'] = this.rootElement
    return h('builtin', this.props, this.props['children'])
  }
}

export const domApi: ICustomAPI<pixi.DisplayObject> = {
  createElement(node) {
    if (!Is.def(node)) {
      return new pixi.Container()
    }
    switch (node.type) {
      case VNodeType.text:
        return new pixi.Text(node.name)
      case VNodeType.element:
        if (node.name === 'builtin') {
          const { '@rootElement': rootEl, ...attrs } = node.attributes as any
          domApi.setAttributes(rootEl, node)
          flatten1(
            node.children
            .map(domApi.createElement)
          )
          .forEach(child => {
            domApi.insertAt(rootEl, child, domApi.getChildCount(rootEl))
          })
          return rootEl
        } else {
          throw new Error(`unimplemented: ${node.name}`)
        }
      case VNodeType.component:
        let rootEl
        if (Is.pixiComp(node.name)) {
          rootEl = node.name.prototype.create(node.attributes)
          node.name.prototype.update(rootEl, node.attributes)
        }
        return mountComp(node, domApi, rootEl)
      default:
        return Hydux.never(node)
    }
  },
  setAttributes(node, attrs) {
    const comp = getComponent(node) as PIXIComponent
    comp.update(node, attrs || {})
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
  setTextContent(node: pixi.Container, text) {
    let child = node.getChildAt(0)
    if (child instanceof pixi.Text) {
      child.text = text
    } else {
      node.removeChildren(0, node.children.length)
      node.addChild(new pixi.Text(text))
    }
  }
}
