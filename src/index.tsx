import * as Vdom from './vdom'
import * as Hydux from 'hydux'
const React = { createElement: Vdom.h }

const { h } = Vdom

export { React, h }

export interface Options<E> {
  stats: any,
}

const __HYDUX_RENDER_NODE__ = '__HYDUX_RENDER_NODE__'
export default function withVdom<State, Actions, E = Node>(container: E, options: Partial<Options<E>> = {}): (app: Hydux.App<State, Actions>) => Hydux.App<State, Actions> {
  let rafId
  let _options = {
    ...options
  }
  return app => props => app({
    ...props,
    view: (s, a) => {
      return [props.view, s, a]
    },
    onRender(view) {
      props.onRender && props.onRender(view)

      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }

      // fix duplicate node in hmr
      const render = () => {
        if (typeof options.stats !== 'undefined') {
          options.stats.begin()
          // vdom
          // if (!window['logged']) {
          //   console.log('vdom', view[0](view[1], view[2]))
          //   window['logged'] = true
          // }
          // Vdom.render(view[0](view[1], view[2]), container, _options.api)

          // mutate
          // view[0](view[1], view[2], container as any)

          // pixi-vdom
          Vdom.patch(container as any, view[0](view[1], view[2]))
          options.stats.end()
        } else {
          throw new Error('xx')
          // Vdom.render(view[0](view[1], view[2]), container, _options.api)
        }
      }
      rafId = window.requestAnimationFrame(render)
    }
  })
}
