import * as Hydux from 'hydux'

export type Attributes = {
  key?: Key
  [k: string]: any
}

export const VNodeType = {
  text: 1 as 1,
  element: 2 as 2,
  component: 3 as 3,
}

const vnodeTypes = Object.keys(VNodeType).map(k => VNodeType[k])
export const flatten1 = <T>(args: (T | T[])[]) => ([] as T[]).concat(...args)

const ComponentKey = '@hydux-pixi/component'
export function getComponent<Node>(node: Node) {
  return node[ComponentKey]
}

export function setComponent<Node>(params: Node, comp: Component) {
  params[ComponentKey] = comp
}

export function mountComp<Node>(vnode: VNode, api: ICustomAPI<Node>, element?: Node) {
  if (vnode.type === VNodeType.component) {
    const props = { ...vnode.attributes }
    props['children'] = vnode.children
    let comp: Component = new vnode.name(props)
    comp._$internals.nativeApi = api
    let view = null as RenderReturn
    if (!Is.def(element)) {
      view = comp.render()
      element =
        Is.vnode(view)
        ? api.createElement(view)
        : api.createElement()
      comp.rootElement = element
    } else {
      comp.rootElement = element
      view = comp.render()
    }
    comp._$internals.lastView = view
    setComponent(element, comp)
    if (Is.def(vnode.ref)) vnode.ref(comp)
    try {
      comp.onMount() // TODO: try/catch
    } catch (error) {
      console.error(error)
    }
    return element
  }
  console.error(vnode)
  throw new Error('vnode is not component')
}

export type RenderReturn = VNode | null | boolean | undefined

export abstract class Component<P = {}> {
  props: P
  rootElement: any
  _$internals: {
    nativeApi: ICustomAPI<any>
    lastView: any
  } = {} as any
  constructor(props) {
    this.props = props
  }
  isComponent() {
    return true
  }
  onMount() {
    // ignore
  }
  onUnmount() {
    // ignore
  }
  shouldRender(nextProps: P): boolean {
    return true
  }
  render(): RenderReturn {
    // ignore
    return null
  }
}

export abstract class HyduxComponent<P = any, S = any> extends Component<P> {
  // @internal
  props: P
  actions: any

  rootElement: any

  protected ctx: Hydux.Context<S, any, any> = Hydux.app({
    init: () => this.init(),
    actions: this.actions,
    view: (s, a) => this.view(s, a),
    onRender: (view) => {
      if (Is.def(this.rootElement)) {
        const api = this._$internals.nativeApi
        patch(api.getParent(this.rootElement), this.rootElement, this._$lastView, view, api)
        this._$lastView = view
      }
      return view
    },
  })
  private _$lastView: VNode | undefined
  abstract init(): S | Hydux.ActionCmdResult<S, any>
  view(state: S, actions: any): VNode | boolean | null {
    return null
  }
  render() {
    return this.ctx.render()
  }
}

export type VNodeType = (typeof VNodeType)[keyof (typeof VNodeType)]
export type Key = string | number
export type Ref = (node: any) => void
export interface BaseVNode {
  children: VNode[]
  key?: Key
  ref?: Ref
}
export interface ElementVNode extends BaseVNode {
  type: typeof VNodeType.element
  attributes: Attributes | null
  name: string
}
export interface ComponentVNode<T extends typeof Component> extends BaseVNode {
  type: typeof VNodeType.component
  attributes: Attributes | null
  name: T
}
export interface TextVNode {
  type: typeof VNodeType.text
  name: string
  key?: string | number
}

export type VNode =
| ComponentVNode<any>
| ElementVNode
| TextVNode
export interface ICustomAPI<Node> {
  updateChildren?: (element: Node, oldChildren: VNode[], children: VNode[], api: ICustomAPI<Node>) => void
  createElement(node?: VNode): Node
  setAttributes(node: Node, attrs: { [k: string]: any }): void
  /**
   *
   * @param parentNode
   * @param newNode
   * @param i
   * @returns modified count
   */
  insertAt(parentNode: Node, newNode: Node, i: number): number
  replaceChild(parentNode: Node, newNode: Node, oldNode: Node): void
  getChildAt(node: Node, i: number): Node | undefined
  getChildCount(node: Node): number
  getParent(node: Node): Node | null
  removeChildAt(node: Node, i: number): void
  setTextContent(node: Node, text: string): void
}

type ChildOne = | VNode | number | string | null | boolean | undefined
export type Child = ChildOne | ChildOne[]

export type StatelessComp = (props: any) => any
// export type Name = string | StatelessComp

export const Is = {
  array(v: any): v is any[] {
    return v && v.pop
  },
  fn(v: any): v is Function {
    return typeof v === 'function'
  },
  vnode(v: any): v is VNode {
    return v != null && Is.def(v.type) && vnodeTypes.indexOf(v.type) >= 0
  },
  comp(v: any): v is ComponentConstructor {
    let proto = v.prototype
    return Is.def((proto as Component).isComponent) &&
      (proto as Component).isComponent()
  },
  str(v: any): v is string {
    return typeof v === 'string'
  },
  def<T>(v: T | undefined): v is T {
    return typeof v !== 'undefined'
  },
  sameNode(a: VNode, b: VNode) {
    return a.type === b.type && a.name === b.name && a.key === b.key
  }
}

export interface ComponentConstructor<P = {}> {
  displayName?: string
  new (props: P, context?: any): Component<P>
}
type RenderableProps<P, RefType = any> = Readonly<
  P & Attributes & { children?: VNode[]; ref?: Ref }
>
export interface FunctionalComponent<P = {}> {
  (props: P, context?: any): Child
  displayName?: string
  defaultProps?: Partial<P>
}

type ComponentFactory<P> = ComponentConstructor<P> | FunctionalComponent<P>

export function h<P>(name: string | ComponentFactory<P>, attributes: null | {[k: string]: any}, ...args: Child[]): VNode | undefined {
  let children: VNode[] = []
  let rest: Child[] = []
  let len = arguments.length
  while (len-- > 2) rest.push(arguments[len])
  while (rest.length) {
    const child: Child = rest.pop()
    if (Is.array(child)) {
      for (let len = child.length; len--;) {
        rest.push(child[len])
      }
    } else if (typeof child !== 'boolean' && child != null && child !== '') {
      if (
        typeof child === 'string' ||
        typeof child === 'number'
      ) {
        children.push({
          type: VNodeType.text,
          name: child + '',
        })
      } else {
        children.push(child)
      }
    }
  }
  let key: string | number | undefined
  let ref: ((n: any) => void) | undefined
  if (attributes) {
    key = attributes.key
    ref = attributes.ref
    attributes = { ...attributes }
    delete attributes.key
    delete attributes.ref
  }
  let node: VNode
  if (Is.str(name)) {
    node = {
      type: VNodeType.element,
      name,
      attributes,
      children,
    }
  } else if (Is.comp(name)) {
    node = {
      type: VNodeType.component,
      name,
      attributes,
      children,
    }
  } else {
    if (children.length > 0) {
      attributes = attributes || {}
      attributes['children'] = children
    }
    const n = name(attributes || {} as any)
    if (!Is.vnode(n)) {
      return
    }
    node = n
  }
  if (key) node.key = key
  if (ref && node.type !== VNodeType.text) node.ref = ref
  return node
}

function diffProps(prevProps: Attributes | null, nextProps: Attributes | null): Attributes | null {
  if (!prevProps) {
    return nextProps
  }
  nextProps = { ...nextProps }
  for (const key in prevProps) {
    const val = nextProps[key]
    if (!Is.def(val)) {
      nextProps[key] = null
    } else if (val === prevProps[key]) { // only apply changes
      nextProps[key] = undefined
    }
  }
  return nextProps
}

export function insertChild<Node>(parent: Node, i: number, vnode: VNode, api: ICustomAPI<Node>) {
  let newChildEl = api.createElement(vnode)
  api.insertAt(parent, newChildEl, i)
  return newChildEl
}

export function patch<Node>(
  parent: Node,
  index: number,
  oldNode: VNode | undefined,
  node: VNode,
  api: ICustomAPI<Node>,
) {
  const element = api.getChildAt(parent, index)
  if (node === oldNode) {
    return element
  }
  const replaceNode = () => {
    const newElement = api.createElement(node)
    if (!Is.def(element)) {
      api.insertAt(parent, newElement, index)
    } else {
      api.replaceChild(parent, newElement, element)
      let comp = getComponent(element)
      if (comp) {
        try {
          comp.onUnmount()
        } catch (error) {
          console.error(error)
        }
      }
    }
    return newElement
  }
  if (!Is.def(oldNode) || !Is.def(element)) {
    return replaceNode()
  }
  if (
    oldNode.type === VNodeType.text &&
    node.type === VNodeType.text
  ) {
    api.setTextContent(element, node.name)
    return element
  } else if (
    oldNode.type === VNodeType.text ||
    oldNode.type !== node.type ||
    oldNode.name !== node.name ||
    oldNode.key !== node.key
  ) {
    return replaceNode()
  }
  const attributes = { ...node.attributes }
  if (
    node.type === VNodeType.component
  ) {
    let comp = getComponent(element)
    if (!comp) {
      return replaceNode()
    }
    attributes['children'] = node.children
    if (comp.shouldRender(attributes)) {
      comp.props = attributes
      const view = comp.render()
      if (Is.vnode(view)) {
        patch(parent, index, comp._$internals.lastView, view, comp._$internals.nativeApi)
      } else {
        unMountComponents<Node>(element, api)
        api.removeChildAt(parent, index)
      }
      comp._$internals.lastView = view
    }
  } else {
    const attrs = diffProps(oldNode.attributes, attributes)
    if (attrs !== null) {
      api.setAttributes(element, attrs)
    }
    let update =
      Is.def(api.updateChildren)
      ? api.updateChildren
      : updateChildren
    update(element, oldNode.children, node.children, api)
  }
}

// import * as util from 'util'
function print(msg, ...objs: any[]) {
  const util = require('util')
  console.log(msg, ...objs.map(obj => util.inspect(obj, {
    colors: true,
    depth: null,
  })))
}

function unMountComponents<Node>(element: Node | undefined, api: ICustomAPI<Node>) {
  if (!Is.def(element)) {
    return
  }
  let len = api.getChildCount(element)
  for (let i = 0; i < len; i++) {
    const child = api.getChildAt(element, i)
    unMountComponents(child, api)
  }
  let comp = getComponent(element)
  if (Is.def(comp)) {
    try {
      comp.onUnmount()
    } catch (error) {
      console.error(error)
    }
    (comp._$internals as any) = null
    comp.rootElement = null
  }
}

function updateChildren<Node>(element: Node, oldChildren: VNode[], children: VNode[], api: ICustomAPI<Node>) {
  let oldStartIdx = 0
  let oldEndIdx = oldChildren.length - 1
  let newStartIdx = 0
  let newEndIdx = children.length - 1

  const patchChild = (i: number, oldVnode: VNode | undefined, vnode: VNode) => {
    return patch<Node>(element, i, oldVnode, vnode, api)
  }
  while (
    oldStartIdx <= oldEndIdx &&
    newStartIdx <= newEndIdx
  ) {
    let oldStart = oldChildren[oldStartIdx]
    let oldEnd = oldChildren[oldEndIdx]
    let newStart = children[newStartIdx]
    let newEnd = children[newEndIdx]
    if (Is.sameNode(oldStart, newStart)) {
      patchChild(oldStartIdx, oldStart, newStart)
      oldStartIdx++
      newStartIdx++
    } else if (Is.sameNode(oldEnd, newEnd)) {
      patchChild(oldEndIdx, oldEnd, newEnd)
      oldEndIdx--
      newEndIdx--
    } else {
      break
    }
  }

  let oldKeyed = {} as {[k: string]: [VNode, Node]}
  for (let i = oldStartIdx; i <= oldEndIdx; i++) {
    let child = oldChildren[i]
    if (Is.def(child.key)) {
      const oldEl = api.getChildAt(element, i)
      if (Is.def(oldEl)) {
        oldKeyed[child.key] = [child, oldEl]
      }
    }
  }
  for (; newStartIdx <= newEndIdx; newStartIdx++, oldStartIdx++) {
    let child = children[newStartIdx]
    if (oldStartIdx > oldEndIdx) {
      insertChild(element, oldStartIdx, child, api)
      oldEndIdx++
    } else {
      if (
        Is.def(child.key) &&
        oldKeyed[child.key]
      ) {
        // insert keyed
        let [oldChild, oldEl] = oldKeyed[child.key]

        // hack: dom.insertBefore would move element, but we need to support pixi objects.
        let added = api.insertAt(element, oldEl, newStartIdx)
        patchChild(newStartIdx, oldChild, child)
        oldEndIdx += added
      } else {
        // replace
        patchChild(newStartIdx, void 0, child)
      }
    }
  }
  let start = newEndIdx + 1
  for (let i = start; i <= oldEndIdx; i++) {
    unMountComponents<Node>(api.getChildAt(element, start), api)
    api.removeChildAt(element, start)
  }
}
export function render<Node>(node: VNode, container: Node, api: ICustomAPI<Node>) {
  const NodeKey = '@hydux-pixi/node'
  let oldNode: VNode | undefined = container[NodeKey]
  container[NodeKey] = node
  return patch<Node>(container, 0, oldNode, node, api)
}
