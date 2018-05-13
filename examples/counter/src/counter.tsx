import { Cmd, noop } from 'hydux'
import { React } from 'hydux/lib/enhancers/picodom-render'
import Loadable from '../../../src/index'

const asyncApi = {
  fetchCount(count: number, failed = false) {
    return new Promise<number>(
      (resolve, reject) =>
        setTimeout(
          () => {
            failed
              ? reject(new Error(`Fetch ${count} failed!`))
              : resolve(count)
          },
          1600,
        )
    )
  },
}

const loadableApi = Loadable({
  fetchCount: {
    init: 0,
    api: asyncApi.fetchCount,
  },
})

const initState = {
  ...loadableApi.state,
  count: 0,
}

export const init = () => initState
export const actions = {
  ...loadableApi.actions,
  down: () => state => ({ count: state.count - 1 }),
  up: () => state => ({ count: state.count + 1 }),
  upN: n => state => ({ count: state.count + n }),
}
export const view = (state: State, actions: Actions) => (
  <div>
    <div>
      <h1>Counter</h1>
      <h2>{state.count}</h2>
      <button onClick={_ => actions.down()}>–</button>
      <button onClick={_ => actions.up()}>+</button>
    </div>
    <div>
      <h1>Data-driven demo</h1>
      {state.fetchCount.isLoading
        ? (
          <div>Loading...</div>
        )
        : state.fetchCount.error
        ? (
          <p style={{ color: 'red' }}>{state.fetchCount.error}</p>
        ) : (
          <h2>{state.fetchCount.data}</h2>
        )}
      <button onClick={_ => actions.fetchCount(100)}>fetch 100 succeed</button>
      <button onClick={_ => actions.fetchCount(100, true)}>fetch 100 failed</button>
    </div>
  </div>
)
export type Actions = typeof actions
export type State = typeof initState
