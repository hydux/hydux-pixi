import { h } from '../../../src/vdom'
import { render as renderPixi } from '../../../src/vdom/pixi'
import '../../../src/jsx.d'
import * as pixi from 'pixi.js'
import { Container, Sprite, Graphics, Text, TilingSprite } from '../../../src/components'
import * as Hydux from '../../../../hydux'
import { Textures as T } from './textures'
import ImmuList from 'hydux-mutator/lib/collections/list'
const { Cmd } = Hydux
import * as pixiApp from './pixi-app'
import * as FunnyFace from './FunnyFace'

const landHeight = pixiApp.landHeight
const SpaceHeight = pixiApp.SpaceHeight

function PipePair({ x, y }: { x: number, y: number }, children: any) {
  const baseY = (T.pipeDown.height + T.pipeUp.height + SpaceHeight - (pixiApp.height - landHeight())) / 2
  return (
    <Container>
      <Sprite texture={T.pipeDown} x={x} y={-baseY + y} />
      <Sprite texture={T.pipeUp} x={x} y={-baseY + SpaceHeight + T.pipeDown.height + y} />
    </Container>
  )
}
export const initState = () => {
  let last = { x: 0, y: 0 }
  let pipeMargin = T.pipeUp.width + 80.
  const pipePairs = Array(
    (pixiApp.width / pipeMargin + 1) | 0
  ).fill(0).map(
    (_, i, arr) => (
      last = {
        x: i * (pipeMargin + T.pipeUp.width) + pixiApp.width + 10,
        y: last.y + Math.random() * 200 - 100,
      }
    )
  )
  return {
    face: FunnyFace.initState(),
    pipePairs,
    pipeWidth: pipePairs.length * (T.pipeUp.width + pipeMargin),
    offsetX: 0,
    started: false,
    score: 0,
  }
}

export const initCmd = () =>
  Cmd.batch(
    Cmd.ofSub<Actions>(actions => {
      pixiApp.app.ticker.add(actions.update)
      document.addEventListener('keydown', e => {
        if (e.key === ' ') {
          actions.start()
          actions.face.up()
        }
      })
    }),
    Cmd.map((_: Actions) => _.face, FunnyFace.initCmd())
  )

export const actions = {
  face: {
    ...FunnyFace.actions,
    update: (delta) => (s: FunnyFace.State, a: FunnyFace.Actions, ps: State) => {
      return FunnyFace.actions.update(delta, ps.started)(s, a)
    }
  } as FunnyFace.Actions,
  start: () => (state: State, actions: Actions): Hydux.AR<State, Actions> => {
    state = { ...state, started: true }
    return [state, Cmd.none]
  },
  click: () => (state: State, actions: Actions): Hydux.AR<State, Actions> => {
    return [state, Cmd.ofSub(_ => {
      actions.start()
      actions.face.up()
    })]
  },
  update: (delta: number) => (state: State, actions: Actions): Hydux.AR<State, Actions> => {
    if (!state.started || state.face.dead) {
      return
    }
    let deltaX = delta * .5
    state = { ...state, offsetX: state.offsetX - deltaX }
    state.pipePairs.forEach(
      pipe => {
        const face = state.face
        if (
          pipe.x > pixiApp.width / 2 - face.width / 2 - T.pipeUp.width / 2 &&
          pipe.x - deltaX < pixiApp.width / 2 - face.width / 2 - T.pipeUp.width / 2
        ) {
          state.score += 1
        }
        pipe.x -= deltaX
        if (pipe.x < -T.pipeUp.width) {
          pipe.x += state.pipeWidth
        }
        if (
          Math.abs(pipe.x + T.pipeUp.width / 2 - face.x) < T.pipeUp.width / 2 &&
          Math.abs(face.y - pipe.y - pixiApp.skyHeight() / 2) > SpaceHeight / 2
        ) {
          face.dead = true
        } else if (
          face.y + face.height / 2 > pixiApp.skyHeight()
        ) {
          face.dead = true
        }
      }
    )
    return [state, Cmd.none]
  },
}

export const view = (state: State, actions: Actions) => {
  return (
    <Container interactive interactiveChildren onPointertap={actions.click}>
      <Sprite texture={T.sky} />
      {state.pipePairs.map(
        s => <PipePair x={s.x} y={s.y} />
      )}
      <TilingSprite
        texture={T.land}
        width={pixiApp.width}
        x={0}
        y={pixiApp.height - landHeight()}
        tilePositionX={state.offsetX}
      />
      {FunnyFace.view(state.face, actions.face)}
      <Text x={pixiApp.width - 130} y={30} text={state.score + '分'} />
    </Container>
  )
}

export type Actions = typeof actions
export type State = ReturnType<typeof initState>
