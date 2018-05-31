
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
  children?: VNode[]
}

export type Attributes<Node> = BaseAttributes<Node> & {
}

export interface ComponentConstructor<P = {}> {
  displayName?: string
  new (props?: P): Component<P> | NativeWrapper<P>
}
export interface FunctionalComponent<P = {}> {
  (props: P, children: VNode[]): VNode
  displayName?: string
  defaultProps?: Partial<P>
}

type ComponentFactory<P> = ComponentConstructor<P> | FunctionalComponent<P>
export type Child = VNode | null | undefined
export function h<P>(name: ComponentFactory<P>, attrs: null | (Attributes<any> & P), ...children: (Child | Child[])[]): VNode
export function h(name, attrs): VNode {
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

  return [name, attrs, children]
}

/**
 * RawObjectWrapper is used for wrap raw pixi objects,
 * we only use it as class.prototype in diff function,
 * the constructor/class field won't work.
 */
export abstract class NativeWrapper<P = {}> {
  props: P
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
  props: P & Attributes<P> = {} as P
  state: S = {} as S
  container: any
  abstract _api: ICustomAPI<any>
  private _rafId = 0
  constructor(props: P) {
    this.props = props
  }
  abstract getBuiltin(): typeof NativeWrapper
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
    if (view != null && typeof (view) !== 'boolean') {
      patch(
        this.container,
        0,
        view,
        this._api,
      )
    }
  }
  onDidMount() {
    // ignore
  }
  onWillUnmount() {
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

export type VNode<P = any> =
[ComponentFactory<P>, null | object, [ComponentFactory<P>, null | object, any[]][]]

function createElement<Node>(vnode: VNode): Node {
  const node = (vnode[0].prototype as NativeWrapper).create(vnode[1])
  const attrs = vnode[1] as { oncreate?: Function } | null
  if (attrs && attrs.oncreate) {
    attrs.oncreate(node)
  }
  return node
}

function mountComponent<Node>(parent: Node, i, api: ICustomAPI<Node>) {
  const node = api.getChildAt(parent, i)
  if (Is.def(node) && Is.def(node[CompKey])) {
    try {
      (node[CompKey] as Component).onDidMount()
    } catch (error) {
      console.error(error)
    }
  }
}

function unmountComponent<Node>(node: Node, api: ICustomAPI<Node>) {
  if (Is.def(node[CompKey])) {
    try {
      (node[CompKey] as Component).onWillUnmount()
    } catch (error) {
      console.error(error)
    }
  }
  for (let i = 0; i < api.getChildrenCount(node); i++) {
    unmountComponent(api.getChildAt(node, i), api)
  }
}

function update<Node>(node: Node, attrs: Attributes<any> | null, proto: NativeWrapper) {
  if (attrs !== null) {
    let onupdate = attrs['onupdate']
    if (onupdate && onupdate(node, attrs)) {
      return
    }
    proto.updateAll(node, attrs)
  }
}

export function patch<Node>(parent: Node, i: number, vnode: VNode, api: ICustomAPI<Node>) {
  let [Comp, attrs, children] = vnode
  let node = api.getChildAt(parent, i) as Node | undefined
  let proto = Comp.prototype
  let isComponent = false
  let isCreate = false
  if (Is.def((proto as NativeWrapper).getRawClass)) {
    // ignore
  } else if (Is.def((proto as Component).getBuiltin)) { // stateful component
    vnode[0] = (proto as Component).getBuiltin() as any
    proto = vnode[0].prototype
    vnode[1] = attrs = attrs || {}
    attrs['children'] = children
    isComponent = true
  } else {
    return patch(parent, i, (Comp as any)(attrs, children), api)
  }
  if (typeof node === 'undefined') {
    node = createElement<Node>(vnode)
    api.addChild(parent, node)
    mountComponent(parent, api.getChildrenCount(parent) - 1, api)
    isCreate = true
  } else {
    const isNotSameNode = node.constructor !== (proto as NativeWrapper).getRawClass()
    const isNotSameComp =
      (!Is.def(node[CompKey]) && isComponent) ||
      (Is.def(node[CompKey]) && (
        !isComponent ||
        node[CompKey] as Component).constructor !== Comp
      )
    if (isNotSameNode || isNotSameComp) {
      node = createElement<Node>(vnode)
      unmountComponent(api.getChildAt(parent, i), api)
      api.replaceChildAt(parent, i, node!)
      mountComponent(parent, i, api)
      isCreate = true
    }
  }
  if (!isComponent || !isCreate) {
    update(node, attrs, proto)
  }
  if (!isComponent) {
    patchChildren(node!, children, api)
  }
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
    unmountComponent(node, api)
    api.removeChildAt(node, i)
  }
}
