
export type Attributes = {
  [k: string]: any
}

const VNodeType = {
  text: 1 as 1,
  element: 2 as 2,
}

export type VNodeType = (typeof VNodeType)[keyof (typeof VNodeType)]
export type ElementVNode = {
  type: typeof VNodeType.element
  name: string
  attributes: {[k: string]: any} | null
  children: VNode[]
  key: string | number | undefined
}
export type TextVNode = {
  type: typeof VNodeType.text
  text: string
}
export type VNode =
| ElementVNode
| TextVNode

export interface DOMApi<Node> {
  createElement: (node: VNode) => Node
  setAttributes: (node: Node, attrs: { [k: string]: any } | null) => void
  insertAt: (parentNode: Node, newNode: Node, i: number) => void
  insertBefore: (parentNode: Node, newNode: Node, referenceNode: Node | null) => void
  getChildAt: (node: Node, i: number) => Node | undefined
  getChildren: (node: Node) => Node[]
  removeChild: (node: Node, child: Node) => void
  removeChildAt: (node: Node, i: number) => void
  appendChild: (node: Node, child: Node) => void
  setTextContent: (node: Node, text: string | undefined) => void
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

export function h(name: string, attributes: null | {[k: string]: any}, ...args: Child[]): VNode {
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
          text: child + '',
        })
      } else {
        children.push(child)
      }
    }
  }
  return {
    type: VNodeType.element,
    name,
    attributes,
    children,
    key: attributes && attributes.key,
  }
}

function diffProps(prevProps: Attributes | null, nextProps: Attributes | null): Attributes | null {
  if (!prevProps) {
    return nextProps
  }
  nextProps = { ...nextProps, key: void 0 }
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
    return newElement
  }
  if (!Is.defined(oldNode)) {
    return replaceNode()
  }
  if (
    oldNode.type === VNodeType.text ||
    node.type === VNodeType.text
  ) {
    if (oldNode.type !== node.type) {
      return replaceNode()
    }
    api.setTextContent(parent, (node as TextVNode).text)
    return element
  }
  if (oldNode.name !== node.name || oldNode.key !== node.key) {
    return replaceNode()
  }

  api.setAttributes(element, diffProps(oldNode.attributes, node.attributes))

  updateChildren(element, oldNode.children, node.children, api)
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
        api.appendChild(element, api.createElement(child))
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
const KEY = '__node'
export function render<Node>(node: VNode, container: Node, api: DOMApi<Node>) {
  let child = api.getChildAt(container, 0)
  if (!child) {
    child = api.createElement(node)
    api.appendChild(container, child)
  }
  let oldNode: VNode | undefined = child[KEY]
  child[KEY] = node
  return patch(container, child, oldNode, node, api)
}
export const domApi: DOMApi<Node> = {
  createElement(node) {
    if (node.type === VNodeType.text) {
      return document.createTextNode(node.text)
    } else {
      const el = document.createElement(node.name)
      domApi.setAttributes(el, node.attributes)
      node.children
      .map(domApi.createElement)
      .forEach(child => {
        el.appendChild(child)
      })
      return el
    }
  },
  setAttributes(node, attrs) {
    if (attrs !== null) {
      for (const key in attrs) {
        if (key === 'key') {
          continue
        }
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
    if (Is.defined(text)) {
      (node as HTMLElement).innerText = text
    }
  }
}
