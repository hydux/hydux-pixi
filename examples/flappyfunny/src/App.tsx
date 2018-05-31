import { h } from '../../../src/vdom'
import * as pixi from 'pixi.js'
import { Container, Sprite, Graphics, Text, TilingSprite } from '../../../src/vdom/pixi/components'
import * as Hydux from 'hydux'
import { Textures as T } from './textures'

const { Cmd } = Hydux
import * as Utils from './utils'
import * as FunnyFace from './FunnyFace'

const landHeight = Utils.landHeight
const SpaceHeight = Utils.SpaceHeight

function PipePair({ x, y1, y2 }: { x: number, y1: number, y2: number }, children: any) {
  return (
    <Container>
      <Sprite texture={T.pipeDown} x={x} y={y1} />
      <Sprite texture={T.pipeUp} x={x} y={y2} />
    </Container>
  )
}

function createPipePair(x: number) {
  const baseY = (T.pipeDown.height + T.pipeUp.height + SpaceHeight - (Utils.skyHeight())) / 2
  const offsetY = Math.random() * 200 - 100
  return {
    x,
    y1: -baseY + offsetY,
    y2: -baseY + SpaceHeight + T.pipeDown.height + offsetY,
    width: T.pipeDown.width,
    height: T.pipeDown.height,
  }
}

const copy = Object.assign

export const initState = () => {
  let pipeMargin = T.pipeUp.width + 80.
  const pipePairs = Array(
    (Utils.width / pipeMargin + 1) | 0
  ).fill(0).map(
    (_, i, arr) => {
      const x = i * (pipeMargin + T.pipeUp.width) + Utils.width + 10
      return createPipePair(x)
    }
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
      Utils.pixiApp.ticker.add(actions.update)
      document.addEventListener('keydown', e => {
        if (e.key === ' ') {
          actions.start()
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
    if (state.face.dead) {
      state = initState()
    } else if (!state.started) {
      state = { ...state, started: true }
    }
    return [state, Cmd.ofSub(_ => _.face.jump())]
  },
  click: () => (state: State, actions: Actions): Hydux.AR<State, Actions> => {
    return [state, Cmd.ofSub(_ => {
      actions.start()
    })]
  },
  update: (delta: number) => (state: State, actions: Actions): Hydux.AR<State, Actions> => {
    if (!state.started || state.face.dead) {
      return
    }
    let deltaX = delta * 1
    state = { ...state, offsetX: state.offsetX - deltaX }
    state.pipePairs.forEach(
      (pipe, i) => {
        const face = state.face
        const faceRect = { // anchor
          x: face.x - face.width / 2,
          y: face.y - face.height / 2,
          width: face.width,
          height: face.height,
        }
        if (// Add score
          Utils.hitRect(faceRect, {
            x: pipe.x + pipe.width / 2,
            y: pipe.y1 + T.pipeDown.height,
            width: 0,
            height: SpaceHeight,
          }) &&
          !Utils.hitRect(faceRect, {
            x: pipe.x + deltaX + pipe.width / 2,
            y: pipe.y1 + T.pipeDown.height,
            width: 0,
            height: SpaceHeight,
          })
        ) {
          state.score += 1
        }
        pipe.x -= deltaX
        if (pipe.x < -T.pipeUp.width) {// reuse pipe
          state.pipePairs[i] = pipe = createPipePair(pipe.x + state.pipeWidth)
        }
        if (
          Utils.hitRect(faceRect, {
            x: pipe.x,
            y: pipe.y1,
            width: pipe.width,
            height: pipe.height,
          }) ||
          Utils.hitRect(faceRect, {
            x: pipe.x,
            y: pipe.y2,
            width: pipe.width,
            height: pipe.height,
          })
        ) {// hit pipe
          face.dead = true
        } else if (// hit land
          face.y + face.height / 2 > Utils.skyHeight()
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
        s => <PipePair x={s.x} y1={s.y1} y2={s.y2} />
      )}
      <TilingSprite
        texture={T.land}
        width={Utils.width}
        x={0}
        y={Utils.height - landHeight()}
        tilePositionX={state.offsetX}
      />
      {FunnyFace.view(state.face, actions.face)}
      <Text x={Utils.width - 130} y={30} text={'score: ' + state.score} style={{ fill: 'white' }} />
    </Container>
  )
}

export type Actions = typeof actions
export type State = ReturnType<typeof initState>
