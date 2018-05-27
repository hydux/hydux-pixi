
import { BuiltinWrapper, Is, patch, Component } from '.'
import * as pixi from 'pixi.js'

const CompKey = '@gl-vdom/comp'
function makeComponentRoot<T extends typeof PIXIComponent>(CompClass: T) {
  return class PIXIComponentRoot extends BuiltinWrapper {
    getRawClass() { return PIXI.Container }
    update<P>(node: pixi.Container, key: string, val: any, props: P) {
      node[CompKey].props[key] = val
    }
    updateAll<P>(node: pixi.Container, props: P) {
      const comp = node[CompKey] as Component
      if (!comp.shouldUpdate(comp.state, props)) {
        return
      }
      super.updateAll(node, props)
      node[CompKey].forceRender()
    }
    create<P>(props: P | null) {
      const comp = new CompClass()
      const el: PIXI.Container = new PIXI.Container()
      el[CompKey] = comp
      comp.container = el
      comp.forceUpdate()
      el.on('added', () => comp.onDidMount())
      el.on('removed', () => comp.onDidUnmount())
      return el
    }
  }
}
export class PIXIComponent<P = {}, S = {}> extends Component {
  container: PIXI.Container
  _builtin: any
  getBuiltin() {
    if (!this._builtin) {
      this._builtin = makeComponentRoot(this.constructor as typeof PIXIComponent)
    }
    return this._builtin
  }
}
