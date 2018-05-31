import './types'
import * as Hydux from 'hydux'
import withPixi from '../../../src/index'
import * as App from './App'
import * as Utils from './utils'
import * as Textures from './textures'
import * as pixi from 'pixi.js'

const Cmd = Hydux.Cmd

let app = withPixi<State, Actions, PIXI.Container>(Utils.pixiApp.stage, { stats: Utils.stats })(Hydux.app)
if (__DEV__) {
  const hmr = require('hydux/lib/enhancers/hmr').default
  app = hmr()(app)
}

let initState = () => {
  return {
    app: App.initState(),
  }
}

let initCmd = () => {
  if (Utils.pixiApp['initCmd']) {
    return Cmd.none
  }
  Utils.pixiApp['initCmd'] = true
  return Cmd.batch(
    Cmd.map((_: Actions) => _.app, App.initCmd()),
  )
}

let actions = {
  app: App.actions,
}

type State = ReturnType<typeof initState>

type Actions = typeof actions

export default function main() {
  console.log('main')
  app({
    init: () => [initState(), initCmd()],
    actions,
    view: (s, a) => {
      return App.view(s.app, a.app)
    },
  })
}

Textures.onload(main)
