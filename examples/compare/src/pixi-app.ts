import * as pixi from 'pixi.js'

pixi.utils.sayHello(pixi.utils.isWebGLSupported() ? 'WebGL' : 'canvas')

export let pixiApp = new pixi.Application({
  width: 512,
  height: 512,
  resolution: 2,
})
pixiApp.renderer.autoResize = true
pixiApp.renderer.resize(512, 512)

pixiApp.renderer.view.style.position = 'absolute'
pixiApp.renderer.view.style.display = 'block'
pixiApp.renderer.autoResize = true

pixiApp.view.id = 'canvas'
pixiApp.view['pixiApp'] = pixiApp
// app.renderer.resize(window.innerWidth, window.innerHeight)
window['pixiApp'] = pixiApp

document.body.appendChild(pixiApp.view)

export default function getPixiApp() {
  return pixiApp
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
