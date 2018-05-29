import * as pixi from 'pixi.js'

export const Assets = {
  birds: require('./assets/birds.png'),
  funface: require('./assets/funface.png'),
  land: require('./assets/land.png'),
  pipeDown: require('./assets/pipeDown.png'),
  pipeUp: require('./assets/pipeUp.png'),
}

export const Textures = (() => {
  let t = { } as { [k in keyof typeof Assets]: PIXI.Texture }
  for (const key in Assets) {
    pixi.loader.add(key, Assets[key])
    Object.defineProperty(t, key, {
      get() {
        return pixi.loader.resources[key]
      },
    })
  }
  return t
})()

export async function load() {
  return new Promise(
    res => {
      pixi.loader
        .on('complete', () => {
          console.log('loaded')
        })
        .load(res)
    }
  )
}

export default Textures
