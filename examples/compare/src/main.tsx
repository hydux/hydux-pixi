import * as Hydux from '../../../../hydux'
import withPersist from 'hydux/lib/enhancers/persist'
import withVdom from '../../../src/index'
import { ActionsType } from 'hydux/lib/types'
import './polyfill.js'
import * as Demo from './Demo'
import * as pixi from 'pixi.js'
import { onload } from './textures'
import getPixiApp from './pixi-app'
import HyduxGl from './BunnyMark/index'
import PixiRaw from './BunnyMark/pixi-raw'
import GlVdom from './BunnyMark/gl-vdom'
import HyduxMutate from './BunnyMark/mutate-pixi'
import HyduxVdom from './BunnyMark/vdom-pixi'
import ReactPixi from './BunnyMark/react-pixi'
import ReactPixiFiber from './BunnyMark/react-pixi-fiber'
const Cmd = Hydux.Cmd

// let app = withPersist<State, Actions>({
//   key: 'time-game/v1'
// })(_app)

// Demo.view(state.demo, actions.demo)
let app = HyduxGl
let url = new URL(location.href)
let type = url.searchParams.get('type') || ''
const selectHtml = /* html */`
<option value="none">choose framwork</option>
<option value="pixi-raw">pixi-raw</option>
<option value="gl-vdom">gl-vdom</option>
<option value="@inlet/react-pixi">@inlet/react-pixi</option>
<option value="react-pixi-fiber">react-pixi-fiber</option>
<option value="hydux-gl-vdom">hydux + gl-vdom</option>
<option value="hydux-vdom">hydux + normal vdom</option>
<option value="hydux-mutate">hydux + mutate</option>
`
switch (type) {
  case 'gl-vdom':
    app = GlVdom
    break
  case 'pixi-raw':
    app = PixiRaw
    break
  case '@inlet/react-pixi':
    app = ReactPixi
    break
  case 'react-pixi-fiber':
    app = ReactPixiFiber
    break
  case 'hydux-gl-vdom':
    app = HyduxGl
    break
  case 'hydux-vdom':
    app = HyduxVdom
    break
  case 'hydux-mutate':
    app = HyduxMutate
    break
  case 'none':
  default:
    break
}
document.getElementById('add')!.addEventListener('click', () => {
  app.addBunnies(300)
})
async function main() {
  await onload()
  app.start()
  const sel = document.querySelector('select#choose')! as HTMLSelectElement
  sel.innerHTML = selectHtml
  sel.value = type
  sel.onchange = e => {
    url.searchParams.set('type', sel.value)
    location.href = url.toString()
  }
}
main()
