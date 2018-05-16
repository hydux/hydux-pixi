import * as Hydux from 'hydux'

const flatten1 = <T>(args: (T | T[])[]) => ([] as T[]).concat(...args)

export type Attributes = {
  [k: string]: any
}

const VNodeType = {
  text: 1 as 1,
  element: 2 as 2,
  component: 3 as 3,
}

function mountComp<Node>(parent: Node, node: Node, vnode: VNode, api: ICustomAPI<Node>) {
  if (vnode.type === VNodeType.text) {
    return
  }
  let ref: Ref | null = (node as any).ref ? (node as any).ref : null
  let comp: Component | void = api.getComponent(node)
  if (comp) {
    comp.rootElement = node
    comp._$internals.parentElement = parent
    comp._$internals.nativeApi = api
    comp.onMount()
  }
  if (ref) {
    ref(comp ? comp : node)
  }
}

export abstract class Component<P = any> {
  props: P
  rootElement: any
  _$internals: {
    parentElement: any
    nativeApi: any
  }
  onMount() {
    // ignore
  }
  onUnmount() {
    // ignore
  }
  render() {
    // ignore
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
      if (
        Is.defined(this.rootElement) &&
        Is.defined(this._$internals.parentElement)
      ) {
        patch(this._$internals.parentElement, this.rootElement, this._$lastView, view, this._$internals.nativeApi)
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
export type Ref = (node: any) => void
export interface BaseVNode {
  children: VNode[]
  key?: string | number
  ref?: Ref
}
export interface ElementVNode extends BaseVNode {
  type: typeof VNodeType.element
  attributes: {[k: string]: any} | null
  name: string
}
export interface ComponentVNode<T extends typeof Component> extends BaseVNode {
  type: typeof VNodeType.component
  attributes: {[k: string]: any} | null
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
  getComponent(node: Node): Component | undefined
  setComponent(node: Node, comp: Component): void
  createElement(node: VNode): Node
  setAttributes(node: Node, attrs: { [k: string]: any } | null): void
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
  removeChildAt(node: Node, i: number): void
  setTextContent(node: Node, text: string): void
}

type ChildOne = | VNode | number | string | null | boolean | undefined
export type Child = ChildOne | ChildOne[]

export type StatelessComp = (props: any) => any
// export type Name = string | StatelessComp

const Is = {
  array(v: any): v is any[] {
    return v && v.pop
  },
  fn(v: any): v is Function {
    return typeof v === 'function'
  },
  defined<T>(v: T | undefined): v is T {
    return typeof v !== 'undefined'
  },
  sameNode(a: VNode, b: VNode) {
    return a.type === b.type && a.name === b.name && a.key === b.key
  }
}

export interface ComponentConstructor<P = {}> {
  new (props: P, context?: any): Component<P>
}

export function h(name: string | ComponentConstructor, attributes: null | {[k: string]: any}, ...args: Child[]): VNode {
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
  let node: ComponentVNode<any> | ElementVNode =
    typeof name === 'string'
    ? {
      type: VNodeType.element,
      name,
      attributes,
      children,
    }
    : {
      type: VNodeType.component,
      name,
      attributes,
      children,
    }
  if (key) node.key = key
  if (ref) node.ref = ref
  return node
}

function diffProps(prevProps: Attributes | null, nextProps: Attributes | null): Attributes | null {
  if (!prevProps) {
    return nextProps
  }
  nextProps = { ...nextProps }
  for (const key in prevProps) {
    const val = nextProps[key]
    if (!Is.defined(val)) {
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
  mountComp(parent, newChildEl, vnode, api)
  return newChildEl
}

export function patch<Node>(parent: Node, element: Node, oldNode: VNode | undefined, node: VNode, api: ICustomAPI<Node>) {
  if (node === oldNode) {
    return element
  }
  const replaceNode = () => {
    const newElement = api.createElement(node)
    api.replaceChild(parent, newElement, element)
    mountComp(parent, element, node, api)
    return newElement
  }
  if (!Is.defined(oldNode)) {
    return replaceNode()
  }
  if (
    oldNode.type === VNodeType.text &&
    node.type === VNodeType.text
  ) {
    api.setTextContent(parent, node.name)
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
    let comp = api.getComponent(element)
    if (!comp) {
      return replaceNode()
    }
    attributes['children'] = node.children
    comp.props = attributes
    comp.render()
  } else {
    api.setAttributes(element, diffProps(oldNode.attributes, attributes))
    let update =
      Is.defined(api.updateChildren)
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

function updateChildren<Node>(element: Node, oldChildren: VNode[], children: VNode[], api: ICustomAPI<Node>) {
  let oldStartIdx = 0
  let oldEndIdx = oldChildren.length - 1
  let newStartIdx = 0
  let newEndIdx = children.length - 1

  const patchChild = (i: number, oldVnode: VNode | undefined, vnode: VNode) => {
    let childEl = api.getChildAt(element, i)!
    return patch<Node>(element, childEl, oldVnode, vnode, api)
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
    if (Is.defined(child.key)) {
      const oldEl = api.getChildAt(element, i)
      if (Is.defined(oldEl)) {
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
        Is.defined(child.key) &&
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
    let comp = api.getComponent(api.getChildAt(element, start)!)
    api.removeChildAt(element, start)
    if (Is.defined(comp)) {
      comp.onUnmount()
      ;(comp._$internals as any) = null
      comp.rootElement = null
    }
  }
}
export function render<Node>(node: VNode, container: Node, api: ICustomAPI<Node>) {
  const NodeKey = '##__node'
  let child = api.getChildAt(container, 0)
  if (!Is.defined(child)) {
    child = insertChild(container, 0, node, api)
    container[NodeKey] = node
  }
  let oldNode: VNode | undefined = container[NodeKey]
  container[NodeKey] = node
  return patch<Node>(container, child, oldNode, node, api)
}

const ComponentKey = '##__component'
export const domApi: ICustomAPI<Node> = {
  getComponent(node) {
    return node[ComponentKey]
  },
  setComponent(node, comp) {
    node[ComponentKey] = comp
  },
  createElement(node): Node {
    switch (node.type) {
      case VNodeType.text:
        return document.createTextNode(node.name)
      case VNodeType.element:
        const el = document.createElement(node.name)
        domApi.setAttributes(el, node.attributes)
        flatten1<Node>(
          node.children
          .map(domApi.createElement)
        )
        .forEach(child => {
          el.appendChild(child)
        })
        return el
      case VNodeType.component:
        let comp: Component = new node.name()
        comp.props = { ...node.attributes }
        comp.props['children'] = node.children
        let view = comp.render()
        const rootEl = this._internals.nativeApi.createElement(view)
        this._internals.nativeApi.setComponent(this.rootElement, this)
        return comp.rootElement
      default:
        return Hydux.never(node)
    }
  },
  setAttributes(node, attrs) {
    if (attrs !== null) {
      for (const key in attrs) {
        let val = attrs[key]

        if (Is.fn(val) || !Is.defined(val)) {
          // ignore
        } else if (val == null || val === false) {
          (node as HTMLElement).removeAttribute(key)
        } else if (key === 'style') {
          Object.assign((node as HTMLElement).style, val)
        } else if (key in node && key !== 'list' && !('ownerSVGElement' in node)) {
          node[key] = val == null ? '' : val
        } else {
          (node as HTMLElement).setAttribute(key, val)
        }
      }
    }
  },
  insertAt(parentNode, newNode, i) {
    let len = parentNode.childNodes.length
    if (i < parentNode.childNodes.length) {
      const node = parentNode.childNodes[i]
      parentNode.insertBefore(newNode, node)
    } else {
      parentNode.appendChild(newNode)
    }
    return parentNode.childNodes.length - len
  },
  replaceChild(parentNode, newNode, node) {
    parentNode.replaceChild(newNode, node)
  },
  getChildAt(node, i) {
    return node.childNodes[i]
  },
  removeChildAt(node, i) {
    let child = node.childNodes[i]
    return node.removeChild(child)
  },
  setTextContent(node, text) {
    (node as HTMLElement).innerText = text
  }
}
