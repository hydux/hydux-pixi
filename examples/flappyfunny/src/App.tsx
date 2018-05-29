import { h } from '../../../src/vdom'
import { render as renderPixi } from '../../../src/vdom/pixi'
import '../../../../src/jsx'
import * as pixi from 'pixi.js'
import { Container, Sprite, Graphics, Text } from '../../../src/components/core'
import * as Hydux from '../../../../hydux'
import { Textures } from './textures'
import ImmuList from 'hydux-mutator/lib/collections/list'
const { Cmd } = Hydux
import * as pixiApp from './pixi-app'

export const initState = () => ({
  pipePairs: Array(10).fill(0).map((_, i) => {

  })
})

let ticker
let addBunnies
export const initCmd = (count: number) =>
  Cmd.ofSub<Actions>(actions => {
  })

export const actions = {
}

export const view = (state: State, actions: Actions) => {
}

export type Actions = typeof actions
export type State = ReturnType<typeof initState>

