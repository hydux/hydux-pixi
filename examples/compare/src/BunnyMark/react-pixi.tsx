import * as pixi from 'pixi.js'
import '../modules'
import { Container, withPixiApp, Stage, Sprite, render } from '@inlet/react-pixi/dist/react-pixi.production.es5.js'

import Textures from '../textures'
import getPixiApp, { stats } from '../pixi-app'
import * as Utils from './utils'
import * as React from 'react/cjs/react.production.min.js'
const h = React.createElement
let addBunnies
class App extends React.Component {
  props: any
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
    console.log('mount gl-vdom')
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
      <Container>
        {this.state.bunnies.map(
          (bunny, i) => (
            <Sprite
              key={i}
              x={bunny.x}
              y={bunny.y}
              texture={bunny.texture}
            />
          ))}
      </Container>
    )
  }
}

export default {
  addBunnies(count = 300) {
    addBunnies(count)
  },
  async start() {
    render(<App />, getPixiApp().stage)
  },
}
