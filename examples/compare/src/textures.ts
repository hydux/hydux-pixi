import * as pixi from 'pixi.js'
import bunnyAssets from './assets/bunny'

export const Assets = {
  animals: require('./assets/animals.png'),
}

export type Textures = {
  animals: pixi.Texture,
  rabbits: pixi.Texture[],
  // animals: {
  //   cat: pixi.Texture
  //   hedgehog: pixi.Texture
  //   tiger: pixi.Texture
  // }
}

export const Textures: Textures = (() => {
  let t = {
    rabbits: [] as pixi.Texture[]
  } as Textures
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
  for (const key in bunnyAssets) {
    pixi.loader.add(`rabbit_${key}`, bunnyAssets[key])

    Object.defineProperty(t.rabbits, key, {
      get() {
        return pixi.loader.resources[`rabbit_${key}`].texture
      },
    })
  }
  return t
})()

export async function onload() {
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
