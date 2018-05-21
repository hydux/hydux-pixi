import { VNodeType, ICustomAPI, mountComp, Is, flatten1 } from './'
import * as Hydux from 'hydux'

export const ComponentKey = '##__component'
export const domApi: ICustomAPI<Node> = {
  getComponent(node) {
    return node[ComponentKey]
  },
  setComponent(node, comp) {
    node[ComponentKey] = comp
  },
  createElement(node): Node {
    if (!Is.def(node)) {
      return document.createElement('')
    }
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
        return mountComp(node, domApi)
      default:
        return Hydux.never(node)
    }
  },
  setAttributes(node, attrs) {
    if (attrs !== null) {
      for (const key in attrs) {
        let val = attrs[key]

        if (Is.fn(val) || !Is.def(val)) {
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
  getChildCount(node) {
    return node.childNodes.length
  },
  getParent(node) {
    return node.parentNode
  },
  removeChildAt(node, i) {
    let child = node.childNodes[i]
    return node.removeChild(child)
  },
  setTextContent(node, text) {
    (node as HTMLElement).innerText = text
  }
}

export default domApi
