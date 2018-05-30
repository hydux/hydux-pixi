import * as Vdom from './vdom'

declare global {
  namespace JSX {
    interface ElementAttributesProperty {
      props: any
    }
  }
}
