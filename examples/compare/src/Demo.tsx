import { h, React } from '../../../src'
import * as Vdom from '../../../src/vdom'
import '../../../src/jsx'
import * as pixi from 'pixi.js'
import { Container, Sprite, Graphics, Text } from '../../../src/components/core'
import * as Hydux from 'hydux'
import Textures from './textures'
const { Cmd } = Hydux

export const initState = () => ({})
export const actions = {}

// https://github.com/inlet/react-pixi/blob/master/src/components/Container.js

export const view = (state: State, actions: Actions) => (
  <Container>
    <Text text="text" x={100} y={100} style={{ fill: 'white' }} />
    <Sprite x={1} y={1} texture={Textures.animals} />
  </Container>
)

export default {
  initState: () => initState,
  initCmd: () => Cmd.none,
  actions,
  view,
}
export type Actions = typeof actions
export type State = ReturnType<typeof initState>
