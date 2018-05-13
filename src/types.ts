import * as Hydux from 'hydux'

interface InternalComp {
  _ctx: Hydux.Context<any, any, any>
}

export abstract class Component<Msg = any, P = any, S = any> {
  props: P
  actions = {
    aa: (a: number) => (s, a) => s,
  }
  private _ctx: Hydux.Context<S, this['actions'], any>
  constructor(props: P) {
    this._ctx = Hydux.app({
      init: () => this.init(props),
      actions: this.actions,
      view: (s, a: any) => this.view(props, s, a),
      onRender(view) {
        // diff any apply the view
      }
    }) as any
  }
  init(props: P) {
    return {
      ...props as any
    }
  }
  view(props: P, state: S, actions: this['actions']): JSX.Element {
    return null as any
  }
}
