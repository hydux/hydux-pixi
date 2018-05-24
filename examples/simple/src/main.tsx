import _app from 'hydux'
import withPersist from 'hydux/lib/enhancers/persist'
import withVdom from '../../../src/index'
import pixiApi from '../../../src/vdom/pixi-api'
import { ActionsType } from 'hydux/lib/types'
import './polyfill.js'
import * as Demo from './Demo'
import * as pixi from 'pixi.js'
import { onload } from './textures'

// let app = withPersist<State, Actions>({
//   key: 'time-game/v1'
// })(_app)

pixi.utils.sayHello(pixi.utils.isWebGLSupported() ? 'WebGL' : 'canvas')
let pixiApp = new pixi.Application({
  width: 256,
  height: 256,
  antialias: true,
  transparent: false,
  resolution: 2,
})
pixiApp.renderer.autoResize = true
pixiApp.renderer.resize(256, 256)

pixiApp.renderer.view.style.position = 'absolute'
pixiApp.renderer.view.style.display = 'block'
pixiApp.renderer.autoResize = true
// app.renderer.resize(window.innerWidth, window.innerHeight)
let canvas = document.querySelector('canvas')
if (canvas) {
  canvas.remove()
}
document.body.appendChild(pixiApp.view)

let app = withVdom<State, Actions, PIXI.DisplayObject>(pixiApp.stage, { api: pixiApi })(_app)

if (process.env.NODE_ENV === 'development') {
  const devTools = require('hydux/lib/enhancers/devtools').default
  const logger = require('hydux/lib/enhancers/logger').default
  const hmr = require('hydux/lib/enhancers/hmr').default
  app = logger()(app)
  app = devTools()(app)
  app = hmr()(app)
}

const actions = {
  demo: Demo.actions,
}

const state = {
  demo: Demo.initState(),
}

type Actions = typeof actions
type State = typeof state
const view = (state: State, actions: Actions) => Demo.view(state.demo, actions.demo)

onload(() => {
  app({
    init: () => state,
    actions,
    view,
  })
})

window['pixiApp'] = pixiApp
