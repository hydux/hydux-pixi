import * as pixi from 'pixi.js'

export const Assets = {
  birds: require('./assets/birds.png'),
  funface: require('./assets/funface.png'),
  land: require('./assets/land.png'),
  sky: require('./assets/sky.png'),
  pipeDown: require('./assets/pipeDown.png'),
  pipeUp: require('./assets/pipeUp.png'),
}

export const Textures = (() => {
  let t = { } as { [k in keyof typeof Assets]: PIXI.Texture }
  for (const key in Assets) {
    pixi.loader.add(key, Assets[key])
    Object.defineProperty(t, key, {
      get() {
        return pixi.loader.resources[key].texture
      },
    })
  }
  return t
})()

export function onload(cb: () => void) {
  pixi.loader
    .on('complete', () => {
      console.log('loaded')
    })
    .load(cb)
}

export default Textures
