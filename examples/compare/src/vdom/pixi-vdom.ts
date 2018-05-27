
import { Component, Is } from '.'

export abstract class PIXIComponent<P = {}, Node = PIXI.DisplayObject> {
  abstract create(props: P | null): Node
  abstract update(node: Node, key: string, val: any, props: P): void | boolean
  isPIXIComponent() {
    return true
  }
}

export function h(vnode, attrs, ...children) {
  return [vnode, attrs, [].concat(...children)]
}

type VNode =
[typeof PIXIComponent | ((attrs: object, children: any[]) => any), null | object, [typeof PIXIComponent, null | object, any[]][]]

function createElement(vnode: VNode) {
  const node = vnode[0].prototype.create(vnode[1])
  const attrs = vnode[1] as { oncreate?: Function } | null
  if (attrs && attrs.oncreate) {
    attrs.oncreate(node)
  }
  return node
}

function removeElement(node: PIXI.Container, vnode: VNode, i: number) {
  const attrs = vnode[1] as { onremove?: Function } | null
  if (attrs && attrs.onremove) {
    attrs.onremove(node.children[i])
  }
  node.removeChildAt(i)
}

export default function patch<Node extends PIXI.Container>(node: Node, vnode: VNode) {
  let [Comp, attrs, children] = vnode
  if (
    !Is.fn(Comp.prototype.isPIXIComponent)
  ) {
    return patch(node, (Comp as any)(attrs, children))
  }
  if (attrs !== null) {
    let onupdate = attrs['onupdate']
    if (onupdate && onupdate(node, attrs)) {
      return
    }
    for (const key in attrs) {
      if (
        typeof attrs[key] === 'undefined' && (
        key[0] === 'onupdate' ||
        key[0] === 'oncreate' ||
        key[0] === 'onremove'
      )) {
        continue
      }
      Comp.prototype.update(node, key, attrs[key], attrs)
    }
  }
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    let childNode = node.children[i] as any
    if (typeof childNode === 'undefined') {
      childNode = createElement(child)
      node.addChild(childNode)
    } else if (childNode.constructor.name !== child[0].name) { // TODO
      childNode = createElement(child)
      removeElement(node, childNode, i)
      node.addChildAt(childNode, i)
    }
    patch(childNode, child)
  }
  for (
    let i = node.children.length - 1;
    i >= children.length;
    i--
  ) {
    removeElement(node, children[i], i)
  }
}
