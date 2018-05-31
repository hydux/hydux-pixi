import { h } from '../../../src/vdom'
import { render as renderPixi } from '../../../src/vdom/pixi'
import '../../../src/jsx'
import * as pixi from 'pixi.js'
import { Container, Sprite, Graphics, Text, TilingSprite } from '../../../src/vdom/pixi/components'
import * as Hydux from '../../../../hydux'
import { Textures as T } from './textures'

const { Cmd } = Hydux
import * as Utils from './utils'
export const initState = () => {
  const size = 30
  return {
    width: size,
    height: size,
    rotation: 0,
    anchorX: .5,
    anchorY: .5,
    x: (Utils.width) / 2,
    y: (Utils.height) / 2,
    vy: 0,
    gravityY: .1,
    dead: false,
  }
}

let ticker
let addBunnies
export const initCmd = () =>
  Cmd.ofSub<Actions>(actions => {
    Utils.pixiApp.ticker.add(actions.update)
  })

export const actions = {
  update: (delta: number, started = true) => (state: State, actions: Actions): Hydux.AR<State, Actions> => {
    state = { ...state }
    if (state.y + state.width / 2 < Utils.skyHeight()) {
      state.rotation += delta * .2
      if (started) {
        state.y += state.vy
        state.vy += state.gravityY
      }
    }
    return [state, Cmd.none]
  },
  jump: () => (state: State, actions: Actions): Hydux.AR<State, Actions> => {// jump
    if (!state.dead) {
      state = { ...state }
      state.vy = -2
    }
    return [state, Cmd.none]
  },
  dead: () => (state: State, actions: Actions): Hydux.AR<State, Actions> => {
    state = { ...state, dead: true }
    return [state, Cmd.none]
  },
}

export const view = (state: State, actions: Actions) => {
  return (
    <Sprite
      texture={T.funface}
      x={state.x}
      y={state.y}
      width={state.width}
      height={state.height}
      anchorX={state.anchorX}
      anchorY={state.anchorY}
      rotation={state.rotation}
    />
  )
}

export type Actions = typeof actions
export type State = ReturnType<typeof initState>
