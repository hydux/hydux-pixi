import * as Hydux from 'hydux'
import withPixi from '../../../src/index'
import * as App from './App'
import * as pixiApp from './pixi-app'
import * as Textures from './textures'

let app = withPixi<State, Actions, PIXI.Container>(pixiApp.app.stage, { stats: pixiApp.stats })(Hydux.app)

let initState = () => {
  return {
    app: App.initState(),
  }
}

let initCmd = () => Hydux.Cmd.none

let actions = {
  app: App.actions,
}

type State = ReturnType<typeof initState>

type Actions = typeof actions

async function main() {
  await Textures.load()
  app({
    init: () => [initState(), initCmd()],
    actions,
    view: (s, a) => {
      return App.view(s.app, a.app)
    },
  })
}

main()
