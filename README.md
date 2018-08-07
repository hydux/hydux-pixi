# hydux-pixi


[![Build Status](https://travis-ci.org/hydux/hydux-pixi.svg?branch=master)](https://travis-ci.org/hydux/hydux-pixi) [![npm](https://img.shields.io/npm/v/hydux-pixi.svg)](https://www.npmjs.com/package/hydux-pixi) [![npm](https://img.shields.io/npm/dm/hydux-pixi.svg)](https://www.npmjs.com/package/hydux-pixi)

[PIXI.js](https://pixijs.io/) renderer for [Hydux<sup style="font-size: 10px;">TM</sup>](https://github.com/hydux/hydux).

This package contains two part, the first one is a high-performance vdom library optimized for graphic libraries, currently support pixi.js; the second one is the hydux binding for this vdom.

## Why not react-pixi?

React-pixi has really pool performance, not only just the overhead of the vdom diffing, but also React is mainly optimized for DOM. DOM is slow, so vdom libraries like react should reduce the DOM operations as much as possible.

But objects in graphics libraries(GL) like PIXI.js or three.js are just normal JS objects, mutating or creating these objects are quite fast because they won't trigger relayout & repaiting, and GL will rendering these objects each [animation frame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) (60fps).

### Bunny mark

The results of bunny mark on my laptop(macOS Sierra, 2.7 GHz Intel Core i5, 16 GB 1867 MHz DDR3, Intel Iris Graphics 6100 1536 MB) show it's almost the same performance of raw PIXI.js, and about **3x-4x** faster then libraries like react-pixi.

![](https://github.com/hydux/hydux-pixi/raw/master/docs/media/compare.png)

(The second one is ours.)

You can test it online: https://hydux.github.io/hydux-pixi/compare/?type=pixi-raw


## Install

```sh
yarn add hydux hydux-pixi # or npm i hydux hydux-pixi
```

## Usage

### Use the vdom directly

We support a simple React-like stateful component system, here is the methods that we support

```tsx
import { PIXIComponent, render } from 'hydux-pixi/lib/vdom/pixi/index'
class App extends PIXIComponent<P, S> {
  onDidMount(): void
  shouldUpdate(nextProps: P, nextState: S): boolean
  setState(s: Partial<S>): void
  forceUpdate(): void
  render(): void
  onWillUnmount(): void
}

```

Here is a simple example:

```tsx

import { h } from 'hydux-pixi/lib/vdom'
import { PIXIComponent, render } from 'hydux-pixi/lib/vdom/pixi/index'
import * as pixi from 'pixi.js'
import { Container, Sprite, Graphics, Text } from 'hydux-pixi/lib/vdom/pixi/components/core'

const pixiApp = new pixi.Application({
  width: 500,
  height: 500,
})

document.body.appendChild(pixiApp.view)

const bunnyImage = PIXI.Texture.fromImage('https://pixijs.io/examples/required/assets/basics/bunny.png')

class App extends PIXIComponent {
  state = {
    rotate: 0
  }
  onDidMount() {
    pixiApp.ticker.add(
      () => this.update()
    )
  }
  update() {
    this.setState({
      rotate: this.state.rotate + .5
    })
  }
  render() {
    return (
      <Container>
        <Sprite
          texture={bunnyImage}
          x={pixiApp.view.width / 2}
          y={pixiApp.view.height / 2}
          anchorX={.5}
          anchorY={.5}
        />
      </Container>
    )
  }
}

render(pixiApp.stage, <App />)
```

### Use with hydux

```tsx
import { h } from 'hydux-pixi/lib/vdom'
import withPixi from 'hydux-pixi'
import { Container, Sprite, Graphics, Text } from 'hydux-pixi/lib/vdom/pixi/components'
import * as Hydux from 'hydux'
const { Cmd } = Hydux

let app = withPixi()(Hydux.app)


const pixiApp = new pixi.Application({
  width: 500,
  height: 500,
})
document.body.appendChild(pixiApp.view)
const bunnyImage = PIXI.Texture.fromImage('https://pixijs.io/examples/required/assets/basics/bunny.png')

export const initState = () => {
  return {
    rotate: 0
  }
}

export const initCmd = () =>
  Cmd.ofSub<Actions>(_ => _.update())
export const actions = {
  update: () => (state: State, actions: Actions): Hydux.AR<State, Actions> => {
    state = {...state, rotate: state.rotate + .5}
    return [state, Cmd.none]
  },
}
export const view = (state: State, actions: Actions) => {
  return (
      <Container>
        <Sprite
          texture={bunnyImage}
          x={pixiApp.view.width / 2}
          y={pixiApp.view.height / 2}
          anchorX={.5}
          anchorY={.5}
        />
      </Container>
  )
}
export type Actions = typeof actions
export type State = ReturnType<typeof initState>

app({
  init: () => [initState(), initCmd()],
  actions,
  view,
})
```

### Dig deeper

TL;NR;

After some digging and experiment, I find the main issue of vdom for graphics is not the diffing, but the GC. Js is really fast, you won'd even notice it, but GC might slow down the fps because of "stop-the-world". This will delay the animation frame and cause frame drop.

Well the vdom algorithm will create lots of small objects, this seems unavoidable. But most GC algorithm would divides the heap into several generations, allocation/collection in new spaces are very cheap, but not for old spaces(if you want to read more about GC in v8, you can take this post: <http://www.jayconrod.com/posts/55/a-tour-of-v8-garbage-collection>).

Most vdom libraries (including react) are diffing the vdom with last one, this is right(for most case), because it's fast, controllable, and well engineered. But the reference of old vdom will cause this big object live longer (for graphics rendering it will be collect in next animation frame), until it moved to old spaces, and puts much more pressure to v8's GC.

In this vdom, instead of keeping the reference of last vdom, we directly diff the vdom to PIXI.js objects, although we still create lots of small objects, but they live much shorter, with this optimization it speed up a lot! It's almost the same as raw PIXI.js, and about 3x-4x then before. For the future, we can even create three.js bindings!

## Example App

```sh
git clone https://github.com/hydux/hydux-pixi.git
yarn
cd examples/flappyfunny
yarn # or npm i
npm start
```

Now open http://localhost:8080 and hack! -->

## License

MIT
