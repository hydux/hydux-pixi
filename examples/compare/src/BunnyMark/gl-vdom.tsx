import { h } from '../../../../src/vdom'
import { PIXIComponent, render } from '../../../../src/vdom/pixi'
import '../../../../src/jsx'
import * as pixi from 'pixi.js'
import { Container, Sprite, Graphics, Text } from '../../../../src/components/core'
import * as Hydux from '../../../../../hydux'
import Textures from '../textures'
import ImmuList from 'hydux-mutator/lib/collections/list'
const { Cmd } = Hydux
import getPixiApp, { stats } from '../pixi-app'
import * as Utils from './utils'

export function Bunny(texture: PIXI.Texture, x = 0, y = 0) {
  return <Sprite x={x} y={y} texture={texture} />
}
let addBunnies
class App extends PIXIComponent {
  state = {
    bunnies: [] as Utils.BunnyState[]
  }
  onDidMount() {
    this.addBunnies(1000)
    addBunnies = (count) => this.addBunnies(count)
    getPixiApp().ticker.add(
      () => this.update()
    )
    console.log('mount gl-vdom')
    window['app'] = this
  }
  update() {
    this.setState((s: this['state']) => {
      Utils.updateBunnies(s.bunnies)
    })
  }
  addBunnies(count = 300) {
    console.time('addBunnies')
    for (let i = 0; i < count; i++) {
      this.state.bunnies.push(
        Utils.initBunnyState(
          Textures.rabbits[this.state.bunnies.length % Textures.rabbits.length]
        ),
      )
    }
    console.timeEnd('addBunnies')
    document.querySelector('#counter')!.innerHTML = this.state.bunnies.length + ''
    this.setState()
  }
  forceUpdate() {
    stats.begin()
    super.forceUpdate()
    stats.end()
  }
  render() {
    return (
    <Container>
      {this.state.bunnies.map(bunny => Bunny(bunny.texture, bunny.x, bunny.y))}
    </Container>
    )
  }
}

export default {
  addBunnies(count = 300) {
    addBunnies(count)
  },
  async start() {
    render(getPixiApp().stage as any, <App />)
  },
}
