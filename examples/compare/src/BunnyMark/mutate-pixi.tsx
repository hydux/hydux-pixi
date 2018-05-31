import * as Vdom from '../../../../src/vdom'
import '../../../../src/jsx'
import * as pixi from 'pixi.js'
import { Container, Sprite, Graphics, Text } from '../../../../src/vdom/pixi/components/core'
import * as Hydux from 'hydux'
import Textures from '../textures'

const { Cmd } = Hydux
import getPixiApp, { stats } from '../pixi-app'

export interface Bound {
  right: number
  top: number
  left: number
  bottom: number
}

export const initBunnyState = (
  texture: PIXI.Texture,
  x = 10,
  y = 10,
) => ({
  x,
  y,
  texture,
  gravity: 0.75,
  speedX: Math.random() * 10,
  speedY: Math.random() * 10 - 5,
  bounds: {
    left: 0,
    top: 0,
    right: getPixiApp().renderer.width / getPixiApp().renderer.resolution,
    bottom: getPixiApp().renderer.height / getPixiApp().renderer.resolution,
  },
  anchorX: 0.5,
  anchorY: 1,
})

export const initState = () => ({
  bunnies: Array<ReturnType<typeof initBunnyState>>()
})

let ticker
let addBunnies
export const initCmd = (count: number) => Cmd.ofSub<Actions>(
    actions => {
      actions.addBunnies(count)
      getPixiApp().ticker.add(
        (ticker = (delta) => actions.update())
      )
      addBunnies = (...args) => actions.addBunnies(...args)
    }
  )

export const actions = {
  update: () => (state: State, actions: Actions): Hydux.AR<State, Actions> => {
    state = { ...state }
    for (let i = 0; i < state.bunnies.length; i++) {
      const bunnyState = state.bunnies[i]
      bunnyState.x += bunnyState.speedX
      bunnyState.y += bunnyState.speedY
      bunnyState.speedY += bunnyState.gravity

      if (bunnyState.x > bunnyState.bounds.right) {
        bunnyState.speedX *= -1
        bunnyState.x = bunnyState.bounds.right
      } else if (bunnyState.x < bunnyState.bounds.left) {
        bunnyState.speedX *= -1
        bunnyState.x = bunnyState.bounds.left
      }

      if (bunnyState.y > bunnyState.bounds.bottom) {
        bunnyState.speedY *= -0.85
        bunnyState.y = bunnyState.bounds.bottom
        if (Math.random() > 0.5) {
          bunnyState.speedY -= Math.random() * 6
        }
      } else if (bunnyState.y < bunnyState.bounds.top) {
        bunnyState.speedY = 0
        bunnyState.y = bunnyState.bounds.top
      }
    }
    return [state, Cmd.none]
  },
  addBunnies: (count = 300) => (state: State, actions: Actions): Hydux.AR<State, Actions> => {
    console.time('addBunnies')
    for (let i = 0; i < count; i++) {
      state.bunnies.push(
        initBunnyState(
          Textures.rabbits[state.bunnies.length % Textures.rabbits.length],
        )
      )
    }
    console.timeEnd('addBunnies')
    document.querySelector('#counter')!.innerHTML = state.bunnies.length + ''
    return [state, Cmd.none]
  },
}

export const view = (state: State, actions: Actions, c: PIXI.Container) => {
  let el = c.children[0] as PIXI.Container
  if (!el) {
    el = new PIXI.Container()
    c.addChild(el)
  }
  for (let i = 0; i < state.bunnies.length; i++) {
    const bunny = state.bunnies[i]
    let sprit = el.children[i]
    if (!sprit) {
      sprit = new PIXI.Sprite(bunny.texture)
      el.addChild(sprit)
    }
    sprit.x = bunny.x
    sprit.y = bunny.y
  }
  return el
}

export type Actions = typeof actions
export type State = ReturnType<typeof initState>

export default {
  addBunnies(count = 300) {
    addBunnies(count)
  },
  async start() {
    let rafId
    window['ctx'] = Hydux.app({
      init: () => [initState(), initCmd(1000)],
      actions,
      mutable: true,
      view: (s, a) => {
        return [view, s, a]
      },
      onRender(view) {
        if (rafId) {
          window.cancelAnimationFrame(rafId)
        }

        // fix duplicate node in hmr
        const render = () => {
          stats.begin()
          view[0](view[1], view[2], getPixiApp().stage)
          stats.end()
        }
        rafId = window.requestAnimationFrame(render)
      }
    } as any)
  }
}
