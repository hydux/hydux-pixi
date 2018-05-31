import * as pixi from 'pixi.js'
import '../modules'
import * as Hydux from '../../../../../hydux'
import Textures from '../textures'

const { Cmd } = Hydux
import getPixiApp, { stats } from '../pixi-app'
import * as Utils from './utils'
import * as React from 'react/cjs/react.production.min.js'
import { Stage, Container, Sprite, render } from 'react-pixi-fiber/cjs/react-pixi-fiber.production.min.js'

const h = React.createElement
let addBunnies
class App extends React.Component {

  state = {
    bunnies: [] as Utils.BunnyState[]
  }

  componentDidMount() {
    this.addBunnies(1000)
    addBunnies = (count) => this.addBunnies(count)
    getPixiApp().ticker.add(
      () => {
        stats.begin()
        this.update()
        stats.end()
      }
    )
    console.log('mount react-pixi-fiber')
    window['app'] = this
  }

  update() {
    this.setState((s: this['state']) => {
      Utils.updateBunnies(s.bunnies)
      return { ...s as any }
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
    this.setState({ ...this.state })
  }

  render() {
    return (
      h(Container, null, this.state.bunnies.map(
        (bunny, i) => (
          h(Sprite, {
            key: i,
            x: bunny.x,
            y: bunny.y,
            texture: bunny.texture,
          })
        )))
    )
  }
}

export default {
  addBunnies(count = 300) {
    addBunnies(count)
  },
  async start() {
    render((
      h(App, null)
    ), getPixiApp().stage)
  },
}
