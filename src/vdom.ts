import * as Hydux from 'hydux'

const flatten1 = <T>(args: (T | T[])[]) => ([] as T[]).concat(...args)

export type Attributes = {
  [k: string]: any
}

const VNodeType = {
  text: 1 as 1,
  element: 2 as 2,
  component: 3 as 3,
  fragment: 4 as 4,
}

function mountComp<Node>(parent: Node, node: Node, vnode: VNode, api: DOMApi<Node>) {
  if (vnode.type === VNodeType.text) {
    return
  }
  let ref: Ref | null = (node as any).ref ? (node as any).ref : null
  let comp = api.getComponent(node)
  if (comp) {
    comp._$parentElement = parent
    comp._$rootElement = node
    comp._$api = api
    comp._onMount()
  }
  if (ref) {
    ref(comp ? comp : node)
  }
}

export abstract class Component<P = any, Msg = any, S = any> {
  // @internal
  props: P
  actions: any

  // @internal
  _$rootElement: any
  // @internal
  _$parentElement: any
  // @internal
  _$api: DOMApi<any>

  ctx: Hydux.Context<S, any, any>
  // @internal
  _$lastView: VNode | undefined
  // @internal
  _onMount() {
    this.ctx = Hydux.app({
      init: () => this.init(),
      actions: this.actions,
      view: (s, a) => this.view(s, a),
      onRender: (view) => {
        patch(this._$parentElement, this._$rootElement, this._$lastView, view, this._$api)
        this._$lastView = view
      },
    })
  }
  abstract init(): S | Hydux.ActionCmdResult<S, any>
  view(state: S, actions: any): VNode | boolean | null {
    return null
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
}

export interface FragmentVNode extends BaseVNode {
  type: typeof VNodeType.fragment
  attributes: {[k: string]: any} | null
  name: 'fragment'
}
export type VNode =
| ComponentVNode<any>
| ElementVNode
| TextVNode
| FragmentVNode

export interface DOMApi<Node> {
  getComponent: (node: Node) => Component | void
  createElement: (node: VNode) => Node
  setAttributes: (node: Node, attrs: { [k: string]: any } | null) => void
  insertAt: (parentNode: Node, newNode: Node, i: number) => void
  insertBefore: (parentNode: Node, newNode: Node, referenceNode: Node | null) => void
  getChildAt: (node: Node, i: number) => Node | undefined
  getChildren: (node: Node) => Node[]
  removeChild: (node: Node, child: Node) => void
  removeChildAt: (node: Node, i: number) => void
  appendChild: (node: Node, child: Node) => void
  setTextContent: (node: Node, text: string) => void
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
  }
}

export function h(name: string | typeof Component, attributes: null | {[k: string]: any}, ...args: Child[]): VNode {
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
    if (!Is.defined(nextProps[key])) {
      nextProps[key] = null
    }
    const val = prevProps[key]
  }
  return nextProps
}

export function patch<Node>(parent: Node, element: Node, oldNode: VNode | undefined, node: VNode, api: DOMApi<Node>) {
  if (node === oldNode) {
    return element
  }
  const replaceNode = () => {
    const newElement = api.createElement(node)
    api.insertBefore(parent, newElement, element)
    api.removeChild(parent, element)
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
    api.setTextContent(parent, (node as TextVNode).name)
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
    comp.ctx.render()
  } else {
    api.setAttributes(element, diffProps(oldNode.attributes, attributes))
    updateChildren(element, oldNode.children, node.children, api)
  }
}

function updateChildren<Node>(element: Node, oldChildren: VNode[], children: VNode[], api: DOMApi<Node>) {
  let oldKeyed = {} as {[k: string]: [number, VNode, Node]}
  for (let i = 0; i < oldChildren.length; i++) {
    let child = oldChildren[i]
    if (
      child.type === VNodeType.element &&
      Is.defined(child.key)
    ) {
      const oldEl = api.getChildAt(element, i)
      if (Is.defined(oldEl)) {
        oldKeyed[child.key] = [i, child, oldEl]
      }
    }
  }
  for (let i = 0; i < children.length; i++) {
    let oldChild = oldChildren[i] as VNode | undefined
    let child = children[i]
    let childEl = api.getChildAt(element, i)
    const patchChild = () => {
      if (Is.defined(childEl)) {
        patch<Node>(element, childEl, oldChild, child, api)
      } else {
        let newChildEl = api.createElement(child)
        api.appendChild(element, newChildEl)
        mountComp(element, newChildEl, child, api)
      }
    }
    if (
      child.type === VNodeType.element &&
      Is.defined(child.key)
    ) {
      let old = oldKeyed[child.key] as [number, VNode, Node] | undefined
      if (!old) {
        patchChild()
        break
      }
      // FIXME: oldIdx is changed
      let [oldIdx, oldNode, oldEl] = old
      if (oldIdx === i) {
        patchChild()
      } else {
        api.removeChildAt(element, oldIdx)
        if (Is.defined(childEl)) {
          api.insertBefore(element, oldEl, childEl)
        } else {
          api.appendChild(element, oldEl)
        }
      }
    } else {
      patchChild()
    }
  }
  let newLen = api.getChildren(element).length
  for (let i = children.length; i < newLen; i++) {
    api.removeChildAt(element, i)
  }
}
const NodeKey = '__node'
const ComponentKey = '__component'
export function render<Node>(node: VNode, container: Node, api: DOMApi<Node>) {
  let child = api.getChildAt(container, 0)
  if (!child) {
    child = api.createElement(node)
    api.appendChild(container, child)
    mountComp(container, child, node, api)
  }
  let oldNode: VNode | undefined = child[NodeKey]
  child[NodeKey] = node
  return patch(container, child, oldNode, node, api)
}
export const domApi: DOMApi<Node> = {
  getComponent(node) {
    return node[ComponentKey]
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
        comp.props = node.attributes
        let view = comp.ctx.view(comp.ctx.state, comp.ctx.actions)
        if (view && typeof view !== 'boolean') {
          let el = domApi.createElement(view)
          el[ComponentKey] = comp
          comp._$rootElement = el
          return el
        }
        return document.createTextNode('')
      case VNodeType.fragment:
        let f = document.createDocumentFragment()
        return f
      default:
        return Hydux.never(node)
    }
  },
  setAttributes(node, attrs) {
    if (attrs !== null) {
      for (const key in attrs) {
        let val = attrs[key]

        if (Is.fn(val)) {
          continue
        } else if (key === 'style') {
          Object.assign((node as HTMLElement).style, val)
          continue
        }
        if (val == null) {
          val = ''
        }
        (node as HTMLElement).setAttribute(key, val)
      }
    }
  },
  insertAt(parentNode, newNode, i) {
    const node = parentNode.childNodes[i]
    parentNode.insertBefore(newNode, node)
  },
  insertBefore(parentNode, newNode, node) {
    parentNode.insertBefore(newNode, node)
  },
  getChildAt(node, i) {
    return node.childNodes[i]
  },
  getChildren(node) {
    return [].concat.call(node.childNodes)
  },
  removeChild(node, child) {
    return node.removeChild(child)
  },
  removeChildAt(node, i) {
    let child = node.childNodes[i]
    return node.removeChild(child)
  },
  appendChild(node, child) {
    node.appendChild(child)
  },
  setTextContent(node, text) {
    (node as HTMLElement).innerText = text
  }
}
