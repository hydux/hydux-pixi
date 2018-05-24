import * as Vdom from './vdom'
import domAPI from './vdom/dom-api'
import * as Hydux from 'hydux'
const React = { createElement: Vdom.h }

const { h } = Vdom

export { React, h }

export interface Options<E> {
  api: Vdom.ICustomAPI<E>
}

const __HYDUX_RENDER_NODE__ = '__HYDUX_RENDER_NODE__'
export default function withVdom<State, Actions, E = Node>(container: E, options: Partial<Options<E>> = {}): (app: Hydux.App<State, Actions>) => Hydux.App<State, Actions> {
  let rafId
  let _options = {
    api: domAPI as any as Vdom.ICustomAPI<E>,
    ...options
  }
  return app => props => app({
    ...props,
    view: (s, a) => {
      return [props.view, s, a]
    },
    onRender(view) {
      props.onRender && props.onRender(view)
      // fix duplicate node in hmr
      const render = () => {
        Vdom.render(view[0](view[1], view[2]), container, _options.api)
      }

      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
      rafId = window.requestAnimationFrame(render)
    }
  })
}
