import { h, patch } from '../../../../src/vdom'
import { PIXIComponent } from '../../../../src/vdom/pixi/'
import * as pixi from 'pixi.js'
import Textures from '../textures'

import getPixiApp, { stats } from '../pixi-app'
import * as Utils from './utils'

let addBunnies
class Bunny extends pixi.Sprite implements Utils.BunnyState {
  gravity= 0.75
  speedX = Math.random() * 10
  speedY= Math.random() * 10 - 5
  bounds= {
    left: 0,
    top: 0,
    right: getPixiApp().renderer.width / getPixiApp().renderer.resolution,
    bottom: getPixiApp().renderer.height / getPixiApp().renderer.resolution,
  }
  anchorX: 0
  anchorY: 0
  constructor(len: number) {
    super()
    Object.assign(
      this,
      Utils.initBunnyState(
        Textures.rabbits[len % Textures.rabbits.length]
      ),
    )
  }
}
class App extends pixi.Container {
  bunnies = [] as Utils.BunnyState[]
  constructor() {
    super()
    this.addBunnies(1000)
    addBunnies = (count) => this.addBunnies(count)
    getPixiApp().ticker.add(
      () => this.update()
    )
  }
  update() {
    stats.begin()
    Utils.updateBunnies(this.children as any as Bunny[])
    stats.end()
  }
  addBunnies(count = 300) {
    console.time('addBunnies')
    for (let i = 0; i < count; i++) {
      this.addChild(
        new Bunny(i)
      )
    }
    console.timeEnd('addBunnies')
    document.querySelector('#counter')!.innerHTML = this.children.length + ''
  }
}

export default {
  addBunnies(count = 300) {
    addBunnies(count)
  },
  async start() {
    getPixiApp().stage.addChild(new App())
  },
}
