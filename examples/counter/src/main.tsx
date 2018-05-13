import _app from 'hydux'
import withPersist from 'hydux/lib/enhancers/persist'
import withVdom, { React } from 'hydux/lib/enhancers/ultradom-render'
import { ActionsType } from 'hydux/lib/types'
import './polyfill.js'
import * as Counter from './counter'

// let app = withPersist<State, Actions>({
//   key: 'time-game/v1'
// })(_app)
let app = withVdom<State, Actions>()(_app)

if (process.env.NODE_ENV === 'development') {
  const devTools = require('hydux/lib/enhancers/devtools').default
  const logger = require('hydux/lib/enhancers/logger').default
  const hmr = require('hydux/lib/enhancers/hmr').default
  app = logger()(app)
  app = devTools()(app)
  app = hmr()(app)
}

const actions = {
  counter1: Counter.actions,
}

const state = {
  counter1: Counter.init(),
}

type Actions = typeof actions
type State = typeof state
const view = (state: State) => (actions: Actions) =>
    <main>
      {Counter.view(state.counter1, actions.counter1)}
    </main>

export default app({
  init: () => state,
  actions,
  view,
})
