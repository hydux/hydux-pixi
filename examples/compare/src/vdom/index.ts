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

const ComponentKey = '@hydux-vdom/component'
const RafKey = '@hydux-vdom/rafId'
export function getComponent<Node>(node: Node): Component | undefined {
  return node[ComponentKey]
}

export function setComponent<Node>(params: Node, comp: Component | undefined) {
  params[ComponentKey] = comp
}
/**
 * Don't forget to call `mountComponents` after insert
 * @param node
 * @param api
 */
export function createElement<Node>(node: VNode, api: ICustomAPI<Node>): Node {
  if (node.type === VNodeType.component) {
    const props = { ...node.attributes }
    props['children'] = node.children
    let comp: Component = new node.name(props)
    comp._$internals.api = api
    let view = comp.render()
    let element =
      Is.vnode(view)
      ? createElement(view, api)
      : api.createElement()
    comp.rootElement = element
    comp._$internals.lastVNode = view
    setComponent(element, comp)
    if (Is.def(node.ref)) node.ref(comp)
    return element
  }
  let element = api.createElement(node)
  if (node.type === VNodeType.element) {
    setAttributes(element, node.attributes, api)
    for (const child of node.children) {
      const el = createElement(child, api)
      const i = api.getChildCount(element)
      api.insertAt(element, el, i)
      didMountComponent(el, i)
    }
  }
  return element
}

export function setAttributes<Node>(element: Node, attrs: {[k: string]: any} | null, api: ICustomAPI<Node>) {
  if (attrs === null) return
  for (const key in attrs) {
    let val = attrs[key]
    if (Is.def(val)) {
      api.setAttribute(element, key, val, attrs)
    }
  }
}

function didMountComponent<Node>(element: Node, i: number) {
  let comp = getComponent(element)
  if (Is.def(comp)) {
    try {
      comp._$internals.elementIndex = i
      comp.onDidMount() // TODO: try/catch
    } catch (error) {
      console.error(error)
    }
  }
}

export type RenderReturn = VNode | null | boolean | undefined

export abstract class Component<P = {}, S = {}> {
  props: P
  state: S
  rootElement: any
  _$internals: {
    api: ICustomAPI<any>
    lastVNode: any
    elementIndex: number
    rafId: number
  } = {} as any
  constructor(props) {
    this.props = props
  }
  isComponent() {
    return true
  }
  setState(
    state: Partial<S> | ((s: S) => Partial<S>),
    cb: () => void,
  ) {
    if (this.rootElement == null) { // unmounted
      return
    }
    let raf = this._$internals.api.raf || defaultRaf
    raf(this, () => this.setStateImmediately(state, cb))
  }
  setStateImmediately(
    state: Partial<S> | ((s: S) => Partial<S>),
    cb: () => void,
  ) {
    if (this.rootElement == null) { // unmounted
      return
    }
    const { api: api, lastVNode, elementIndex } = this._$internals
    const parent = api.getParent(this.rootElement)
    if (parent == null) { // unmounted
      return
    }
    if (Is.fn(state)) {
      state = state(this.state)
    }
    this.state = { ...this.state as any, ...state as any }
    const node = this.render()
    if (!Is.vnode(node)) {
      setComponent(this.rootElement, undefined)
      willUnmountComponents(this.rootElement, api)
      const newEl = api.createElement()
      setComponent(newEl, this)
      api.replaceChild(parent, newEl, this.rootElement)
      return
    }
    patch(
      parent,
      this.rootElement,
      lastVNode,
      node,
      api,
    )
  }
  onDidMount() {
    // ignore
  }
  onWillUnmount() {
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
export interface ComponentVNode<T extends typeof Component = any> extends BaseVNode {
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
| ComponentVNode
| ElementVNode
| TextVNode

const defaultRaf = (key: object, cb: () => void) => {
  if (key[RafKey]) {
    cancelAnimationFrame(key[RafKey])
  }
  key[RafKey] = requestAnimationFrame(cb)
}

export interface ICustomAPI<Node> {
  raf?: (key: object, cb: () => void) => void
  updateChildren?: (element: Node, oldChildren: VNode[], children: VNode[], api: ICustomAPI<Node>) => void
  createElement(node?: ElementVNode | TextVNode): Node
  setAttribute(node: Node, key: string, value: any, attrs: { [k: string]: any }): void
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
    attributes = attributes || {}
    attributes['children'] = children
    const n = name(attributes as any)
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
    if (!Is.def(val) && Is.def(val)) {
      nextProps[key] = null
    } else if (val === prevProps[key]) { // only apply changes
      nextProps[key] = undefined
    }
  }
  return nextProps
}

export function insertChild<Node>(parent: Node, i: number, vnode: VNode, api: ICustomAPI<Node>) {
  let newChildEl = createElement(vnode, api)
  api.insertAt(parent, newChildEl, i)
  didMountComponent(newChildEl, i)
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
    const newElement = createElement(node, api)
    if (!Is.def(element)) {
      api.insertAt(parent, newElement, index)
    } else {
      willUnmountComponents(element, api)
      api.replaceChild(parent, newElement, element)
    }
    didMountComponent(newElement, index)
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
        patch(parent, index, comp._$internals.lastVNode, view, comp._$internals.api)
        comp._$internals.lastVNode = view
      } else {
        willUnmountComponents<Node>(element, api)
        api.removeChildAt(parent, index)
      }
    }
  } else {
    const attrs = diffProps(oldNode.attributes, attributes)
    setAttributes(element, attrs, api)
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

function willUnmountComponents<Node>(element: Node | undefined, api: ICustomAPI<Node>) {
  if (!Is.def(element)) {
    return
  }
  let len = api.getChildCount(element)
  for (let i = 0; i < len; i++) {
    const child = api.getChildAt(element, i)
    willUnmountComponents(child, api)
  }
  let comp = getComponent(element)
  if (Is.def(comp)) {
    try {
      comp.onWillUnmount()
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
    willUnmountComponents<Node>(api.getChildAt(element, start), api)
    api.removeChildAt(element, start)
  }
}
export function render<Node>(node: VNode, container: Node, api: ICustomAPI<Node>) {
  const NodeKey = '@hydux-pixi/node'
  let oldNode: VNode | undefined = container[NodeKey]
  container[NodeKey] = node
  return patch<Node>(container, 0, oldNode, node, api)
}
