"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var process_1 = require("process");
var bc = require('benchmark');
var Benchmark = bc.runInContext({ _: lodash_1.default, process: process_1.default });
window['Benchmark'] = Benchmark;
var pixi = require("pixi.js");
var Sprite = pixi.Sprite;
var TextureCache = pixi.utils.TextureCache;
var resources = pixi.loader.resources;
var type = pixi.utils.isWebGLSupported() ? 'WebGL' : 'canvas';
var a = { aa: 1, bb: 2, cc: 3 };
var b = {
    aa: a.aa,
    bb: a.bb,
};
pixi.utils.sayHello(type);
var app = new pixi.Application({ width: 256,
    height: 256,
    antialias: true,
    transparent: false,
    resolution: 1,
    autoStart: false,
});
// app.renderer.autoResize = true
// app.renderer.resize(512, 512)
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.ticker.autoStart = false;
app.ticker.stop();
// app.renderer.resize(window.innerWidth, window.innerHeight)
document.body.appendChild(app.view);
var assets = {
    images_cat: 'images/cat.png'
};
pixi.loader
    .add(assets.images_cat)
    .on('progress', function (loader, res) {
    console.log("loading: " + res.url);
    console.log("progress: " + loader.progress + "%");
})
    .load(setup);
function setup() {
    var cat = new Sprite(resources[assets.images_cat].texture);
    cat.x = 96;
    cat.y = 96;
    // app.stage.addChild(cat)
}
var async = false;
var suitOptions = {
    onCycle: function (event) {
        console.log(String(event.target));
    },
    onComplete: function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
        console.log('\n');
    },
    onStart: function (bench) {
        console.log('Start Suit:', bench.currentTarget.name);
    },
    onError: function (err) {
        console.error(err);
    },
};
var sprits1 = Array(10).fill(0).map(function () { return new Sprite(); });
var sprits2 = Array(10).fill(0).map(function () { return new Sprite(); });
var sp = new Sprite();
sp.texture;
window['start'] = function start() {
    // add tests
    new Benchmark.Suite('base ops', Object.assign({}, suitOptions, {
        onStart: function (bench) {
            suitOptions.onStart(bench);
        },
    }))
        .add('new pixi.Sprite()', function () {
        new pixi.Sprite();
    })
        .add('new pixi.Sprite(texture)', function () {
        new Sprite(resources[assets.images_cat].texture);
    })
        .add('new pixi.Container', function () {
        new pixi.Container();
    })
        .add('new empty', function () {
        var a = { aa: 1 };
    })
        .add('fori', function () {
        for (var i = 0; i < sprits1.length; i++) {
            var s = sprits1[i];
            s === sprits1[i + 1];
        }
    })
        .add('splice', function () {
        sprits2.splice(0, 0, sp);
        sprits2.shift();
    })
        .add('unshift', function () {
        sprits2.unshift(sp);
        sprits2.shift();
    })
        .add('copy', function () {
        var sprits3 = sprits1.slice();
    })
        .add('compare', function () {
        sp.height === sp.height;
    })
        .add('set', function () {
        sp.height = 100;
    })
        .add('fn', function () {
        var a = function () { return 1; };
    })
        .add('lambda', function () {
        var a = function () { return 1; };
    })
        .add('empty', function () {
    })
        // run async
        .run({ async: async });
};
// 循环比较 / splice ~= 100
// 循环比较 / unshift ~= 30
//
/*
new pixi.Sprite() x 1,045,186 ops/sec ±4.28% (60 runs sampled)
bench.js:20970 new pixi.Sprite(texture) x 1,103,903 ops/sec ±4.29% (60 runs sampled)
bench.js:20970 new pixi.Container x 1,663,066 ops/sec ±3.01% (60 runs sampled)
bench.js:20970 new empty x 544,866,859 ops/sec ±2.21% (59 runs sampled)
bench.js:20970 fori x 6,864,824 ops/sec ±0.76% (63 runs sampled)
bench.js:20970 splice x 3,846,711 ops/sec ±0.52% (56 runs sampled)
bench.js:20970 unshift x 6,327,734 ops/sec ±2.30% (63 runs sampled)
bench.js:20970 copy x 4,966,878 ops/sec ±1.72% (62 runs sampled)
bench.js:20970 compare x 557,024,065 ops/sec ±2.35% (45 runs sampled)
bench.js:20970 set x 92,983,738 ops/sec ±0.84% (64 runs sampled)
bench.js:20970 fn x 63,432,165 ops/sec ±2.01% (62 runs sampled)
bench.js:20970 lambda x 64,968,597 ops/sec ±0.75% (62 runs sampled)
bench.js:20970 empty x 562,940,133 ops/sec ±2.87% (47 runs sampled)
bench.js:20973 Fastest is empty
*/
//# sourceMappingURL=bench.js.map