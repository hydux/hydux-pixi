import _ from 'lodash'
import process from 'process';
const bc = require('benchmark')
const Benchmark = bc.runInContext({ _, process });
window['Benchmark'] = Benchmark;
import * as pixi from 'pixi.js'

const Sprite = pixi.Sprite
const TextureCache = pixi.utils.TextureCache
const resources = pixi.loader.resources


let type = pixi.utils.isWebGLSupported() ? 'WebGL' : 'canvas'

let a = { aa: 1, bb: 2, cc: 3 }

let b = {
  aa: a.aa,
  bb: a.bb,
}

pixi.utils.sayHello(type)
let app = new pixi.Application(
  { width: 256,
    height: 256,
    antialias: true,
    transparent: false,
    resolution: 1,
    autoStart: false,
  })
// app.renderer.autoResize = true
// app.renderer.resize(512, 512)

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.ticker.autoStart = false
app.ticker.stop()
// app.renderer.resize(window.innerWidth, window.innerHeight)
document.body.appendChild(app.view)

const assets = {
  images_cat: 'images/cat.png'
}

pixi.loader
  .add(assets.images_cat)
  .on('progress', (loader, res) => {
    console.log(`loading: ${res.url}`)
    console.log(`progress: ${loader.progress}%`)
  })
  .load(setup)

function setup() {
  let cat = new Sprite(
    resources[assets.images_cat].texture
  )
  cat.x = 96
  cat.y = 96

  // app.stage.addChild(cat)

}

const async = false

const suitOptions = {
  onCycle(event) {
    console.log(String(event.target))
  },
  onComplete () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
    console.log('\n')
  },
  onStart(bench) {
    console.log('Start Suit:', bench.currentTarget.name)
  },
  onError(err) {
    console.error(err)
  },
}
const sprits1 = Array(10).fill(0).map(() => new Sprite())
let sprits2 = Array(10).fill(0).map(() => new Sprite())
let sp = new Sprite()
sp.texture
window['start'] = function start() {
    // add tests
  new Benchmark.Suite('base ops', Object.assign({}, suitOptions, {
    onStart(bench) {
      suitOptions.onStart(bench)
    },
  }))
    .add('new pixi.Sprite()', function() {
      new pixi.Sprite()
    })
    .add('new pixi.Sprite(texture)', function() {
      new Sprite(
        resources[assets.images_cat].texture
      )
    })
    .add('new pixi.Container', function() {
      new pixi.Container()
    })
    .add('new empty', function() {
      let a = { aa: 1 }
    })
    .add('fori', function() {
      for (let i = 0; i < sprits1.length; i++) {
        const s = sprits1[i];
        s === sprits1[i + 1]
      }
    })
    .add('splice', function() {
      sprits2.splice(0, 0, sp)
      sprits2.shift()
    })
    .add('unshift', function() {
      sprits2.unshift(sp)
      sprits2.shift()
    })
    .add('copy', function() {
      const sprits3 = [...sprits1]
    })
    .add('compare', function() {
      sp.height === sp.height
    })
    .add('set', function() {
      sp.height = 100
    })
    .add('empty', function() {
    })
    // run async
    .run({ async })
}
// 循环比较 / splice ~= 100
// 循环比较 / unshift ~= 30
//
/*
Start Suit: base ops
new pixi.Sprite() x 1,039,744 ops/sec ±1.47% (59 runs sampled)
new pixi.Sprite(texture) x 1,072,376 ops/sec ±2.67% (55 runs sampled)
new pixi.Container x 2,078,432 ops/sec ±2.47% (58 runs sampled)
fori x 89,154,059 ops/sec ±1.56% (57 runs sampled)
splice x 871,640 ops/sec ±1.05% (59 runs sampled)
unshift x 3,598,394 ops/sec ±0.88% (58 runs sampled)
copy x 482,108 ops/sec ±2.83% (36 runs sampled)
compare x 826,539,219 ops/sec ±0.84% (59 runs sampled)
set x 116,375,890 ops/sec ±1.81% (60 runs sampled)
empty x 829,68,5620 ops/sec ±0.84% (59 runs sampled)
Fastest is empty,get

Conclusion:
  `new Sprite` + splice is very fast, the fatest diff algorithm(O(nlogn)) is not suitable in pixi, prefix/suffix optimize + O(n)-diffing is enough.
*/
