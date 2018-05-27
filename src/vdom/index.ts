export function h(vnode, attrs, ...children)
export function h(vnode, attrs) {
  let children: VNode[] = []
  let rest: (VNode | VNode[])[] = []
  let len = arguments.length
  while (len-- > 2) rest.push(arguments[len])
  while (rest.length) {
    const child = rest.pop()
    if (Is.array(child)) {
      if (Is.array(child[0])) {
        for (let len = child.length; len--;) {
          rest.push(child[len] as any)
        }
      } else if (child.length === 3) {
        children.push(child as any)
      }
    }
  }

  return [vnode, attrs, children]
}
export abstract class BuiltinWrapper<P = {}> {
  props: any
  abstract getRawClass(): any
  abstract create(props: P | null): any
  abstract update(node: any, key: string, val: any, props: P): void
  updateAll(node: any, attrs: P) {
    for (const key in attrs) {
      if (
        typeof attrs[key] === 'undefined' ||
        key[0] === 'onupdate' ||
        key[0] === 'oncreate' ||
        key[0] === 'onremove'
      ) {
        continue
      }
      this.update(node, key, attrs[key], attrs)
    }
  }
}

const CompKey = '@gl-vdom/comp'
export abstract class Component<P = {}, S = {}> {
  props: P = {} as P
  state: S = {} as S
  container: any
  private _rafId = 0
  abstract getBuiltin(): typeof BuiltinWrapper
  shouldUpdate(nextState, nextProps) {
    return true
  }
  updateState() {
    this.setState()
  }
  setState(state?: Partial<S> | ((s: S) => Partial<S>)) {
    if (!this.shouldUpdate(state, this.props)) {
      return
    }
    if (this._rafId) {
      cancelAnimationFrame(this._rafId)
    }
    requestAnimationFrame(() => {
      if (Is.def(state)) {
        if (Is.fn(state)) {
          state = state(this.state)
        }
        for (const key in state) {
          this.state[key] = state[key]!
        }
      }
      this.forceUpdate()
    })
  }
  forceUpdate() {
    const view = this.render()
    if (view !== null && typeof (view) !== 'boolean') {
      patchChildren(
        this.container,
        [view],
      )
    }
  }
  onDidMount() {
    // ignore
  }
  onDidUnmount() {
    // ignore
  }
  render(): null | VNode | boolean {
    return null
  }
}

export const Is = {
  array(v: any): v is any[] {
    return v && v.pop
  },
  fn(v: any): v is Function {
    return typeof v === 'function'
  },
  str(v: any): v is string {
    return typeof v === 'string'
  },
  def<T>(v: T | undefined): v is T {
    return typeof v !== 'undefined'
  },
}

type VNode =
[typeof BuiltinWrapper | ((attrs: object, children: any[]) => any), null | object, [typeof BuiltinWrapper, null | object, any[]][]]

function createElement<Node>(vnode: VNode): Node {
  const node = vnode[0].prototype.create(vnode[1])
  const attrs = vnode[1] as { oncreate?: Function } | null
  if (attrs && attrs.oncreate) {
    attrs.oncreate(node)
  }
  return node
}
export function patch<Node extends PIXI.Container>(parent: Node, i: number, vnode: VNode) {
  let [Comp, attrs, children] = vnode
  let node = parent.children[i] as Node | undefined
  let proto = Comp.prototype
  if (Is.def((proto as BuiltinWrapper).getRawClass())) {
    // ignore
  } else if (Is.def((proto as Component).getBuiltin)) { // stateful component
    Comp = (proto as Component).getBuiltin()
    attrs = attrs || {}
    attrs['children'] = children
  } else {
    return patch(parent, i, (Comp as any)(attrs, children))
  }
  if (typeof node === 'undefined') {
    node = createElement<Node>(vnode)
    parent.addChild(node!)
  } else if (node.constructor !== (Comp.prototype as BuiltinWrapper).getRawClass()) {
    node = createElement(vnode)
    parent.removeChildAt(i)
    parent.addChildAt(node!, i)
  }
  if (attrs !== null) {
    let onupdate = attrs['onupdate']
    if (onupdate && onupdate(node, attrs)) {
      return
    }
    (proto as BuiltinWrapper).updateAll(node, attrs)
  }
  patchChildren(node!, children)
}

function patchChildren<Node extends PIXI.Container>(node: Node, children: VNode[]) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    let childNode = node.children[i] as any
    patch(node, childNode, child)
  }
  for (
    let i = node.children.length - 1;
    i >= children.length;
    i--
  ) {
    node.removeChildAt(i)
  }
}

import pixi from 'pixi.js'

export function render<Node extends PIXI.Container>(parent: Node, vnode: VNode) {
  if (parent.children.length === 0) {
    parent.addChild(new pixi.Container())
  }
  return patch(parent, 0, vnode)
}
