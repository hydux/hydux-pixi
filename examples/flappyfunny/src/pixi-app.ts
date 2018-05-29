import * as pixi from 'pixi.js'

pixi.utils.sayHello(pixi.utils.isWebGLSupported() ? 'WebGL' : 'canvas')

let width = window.innerWidth
let height = window.innerHeight

if (window.innerHeight < window.innerWidth) {
  height = window.innerHeight
  width = 375 / 667 * window.innerHeight
}

export { width, height }

export let app = new pixi.Application({
  width,
  height,
  resolution: 2,
})
app.renderer.autoResize = true
app.renderer.resize(width, height)

app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'
app.renderer.autoResize = true

app.view.id = 'canvas'
app.view['pixiApp'] = app
// app.renderer.resize(window.innerWiadth, window.innerHeight)
window['pixiApp'] = app

if (!document.getElementById('canvas')) {
  document.body.appendChild(app.view)
}
declare var Stats
export let stats =
  window['stats'] ||
  (() => {
    let stats = window['stats'] = new Stats()
    stats.domElement.id = 'stats'
    document.body.appendChild(stats.domElement)
    return stats
  })()
