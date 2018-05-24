import * as pixi from 'pixi.js'

export const Assets = {
  animals: require('./assets/animals.png'),
}

export const Textures: {
  animals: pixi.Texture
  // animals: {
  //   cat: pixi.Texture
  //   hedgehog: pixi.Texture
  //   tiger: pixi.Texture
  // }
} = (() => {
  let t = {} as any
  for (const key in Assets) {
    pixi.loader.add(key, Assets[key])
    Object.defineProperty(t, key, {
      get() {
        const r = pixi.loader.resources[key]
        if (r) {
          return r.texture
        }
        return
      },
    })
  }
  return t
})()

export function onload(cb: Function) {
  pixi.loader
    .on('complete', () => {
      console.log('loaded')
    })
    .load(cb)
}

export default Textures
