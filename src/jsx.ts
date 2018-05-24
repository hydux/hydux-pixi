import * as Vdom from './vdom'

declare global {
  namespace JSX {
    type Element = Vdom.VNode

    interface ElementClass extends Vdom.Component<any> {}

    interface ElementAttributesProperty {
      props: any
    }
  }
}
