import * as Vdom from './vdom'

declare global {
  namespace JSX {
    type Element = any

    interface ElementClass {

    }

    interface ElementAttributesProperty {
      props: any
    }
  }
}
