import * as pixi from 'pixi.js'
import { Textures as T } from './textures'

pixi.utils.sayHello(pixi.utils.isWebGLSupported() ? 'WebGL' : 'canvas')

let width = window.innerWidth
let height = window.innerHeight

if (window.innerHeight / window.innerWidth < 6 / 4) {
  height = window.innerHeight
  width = 375 / 667 * window.innerHeight
}
export { width, height }

export let app = new pixi.Application({
  width,
  height,
  resolution: 1,
  antialias: true,
})
app.renderer.autoResize = true
app.renderer.resize(width, height)

app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'
app.renderer.autoResize = true

app.view.id = 'canvas'
app.view['pixiApp'] = app
// app.renderer.resize(window.innerWiadth, window.innerHeight)

if (__DEV__) {
  console.log(`window['pixiApp']`, window['pixiApp'])
  if (window['pixiApp']) {
    let oldApp: pixi.Application = window['pixiApp']
    oldApp.ticker.stop()
    oldApp.ticker.destroy()
    oldApp.destroy(true)
    console.log('aa')
  }
  window['pixiApp'] = app
}

document.body.appendChild(app.view)
declare var Stats
export let stats =
  window['stats'] ||
  (() => {
    let stats = window['stats'] = new Stats()
    stats.domElement.id = 'stats'
    document.body.appendChild(stats.domElement)
    return stats
  })()

export const landHeight = () => T.land.height - 20
export const SpaceHeight = 120
export const skyHeight = () => height - landHeight()
