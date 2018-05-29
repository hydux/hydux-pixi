
export interface ICustomAPI<Node> {
  getChildAt(parent: Node, i: number): Node | undefined
  getChildrenCount(parent: Node): number
  addChild(parent: Node, child: Node)
  replaceChildAt(parent: Node, i: number, child: Node)
  removeChildAt(parent: Node, i: number)
}

export interface BaseAttributes<Node> {
  oncreate?: (el: Node) => void
  onupdate?: (el: Node, attrs: Attributes<Node>) => boolean | void
}

export type Attributes<Node> = BaseAttributes<Node> & {
  [k: string]: any
}

export function h(vnode: typeof Component | typeof BuiltinWrapper, attrs: null | Attributes<Node>, ...children: (VNode | VNode[] | undefined | null)[])
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
        key[0] === 'oncreate'
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
  abstract _api: ICustomAPI<any>
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
        this._api,
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

export type VNode =
[typeof BuiltinWrapper | ((attrs: object, children: any[]) => any), null | object, [typeof BuiltinWrapper, null | object, any[]][]]

function createElement<Node>(vnode: VNode): Node {
  const node = vnode[0].prototype.create(vnode[1])
  const attrs = vnode[1] as { oncreate?: Function } | null
  if (attrs && attrs.oncreate) {
    attrs.oncreate(node)
  }
  return node
}
export function patch<Node>(parent: Node, i: number, vnode: VNode, api: ICustomAPI<Node>) {
  let [Comp, attrs, children] = vnode
  let node = api.getChildAt(parent, i) as Node | undefined
  let proto = Comp.prototype
  if (Is.def((proto as BuiltinWrapper).getRawClass)) {
    // ignore
  } else if (Is.def((proto as Component).getBuiltin)) { // stateful component
    Comp = vnode[0] = (proto as Component).getBuiltin()
    vnode[1] = attrs = attrs || {}
    proto = Comp.prototype
    attrs['children'] = children
  } else {
    return patch(parent, i, (Comp as any)(attrs, children), api)
  }
  if (typeof node === 'undefined') {
    node = createElement<Node>(vnode)
    api.addChild(parent, node)
  } else if (node.constructor !== (proto as BuiltinWrapper).getRawClass()) {
    node = createElement(vnode)
    api.replaceChildAt(parent, i, node!)
  }
  if (attrs !== null) {
    let onupdate = attrs['onupdate']
    if (onupdate && onupdate(node, attrs)) {
      return
    }
    (proto as BuiltinWrapper).updateAll(node, attrs)
  }
  patchChildren(node!, children, api)
}

function patchChildren<Node>(node: Node, children: VNode[], api: ICustomAPI<Node>) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    patch<Node>(node, i, child, api)
  }
  for (
    let i = api.getChildrenCount(node) - 1;
    i >= children.length;
    i--
  ) {
    api.removeChildAt(node, i)
  }
}
