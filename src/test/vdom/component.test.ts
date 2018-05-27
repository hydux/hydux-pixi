// import { render, h, Component, Is } from '../../vdom'
// import * as assert from 'assert'
// import * as fs from 'fs'
// import * as Utils from './utils'

// const testTrees = Utils.testTrees

// describe('component', () => {
//   describe('SimpleComp', () => {
//     beforeEach(() => {
//       document.body.innerHTML = ''
//     })
//     let mountCount = 0
//     let unmountCount = 0
//     let renderCount = 0
//     let initProps = {
//       text: 'init',
//       children: null as any,
//     }
//     class SimpleComp extends Component<typeof initProps> {
//       onDidMount() {
//         mountCount++
//         assert(this.rootElement, 'rootElementMounted')
//       }
//       onWillUnmount() {
//         unmountCount++
//       }
//       render() {
//         renderCount++
//         return h('div', { 'class': 'SimpleComp' }, `SimpleComp:${this.props.text} `, this.props.children)
//       }
//     }
//     it('is', () => {
//       console.log('SimpleComp.proto', SimpleComp.prototype)
//       assert(Is.comp(SimpleComp), 'Is.comp')
//     })
//     testTrees('simple', [{
//       node: h(SimpleComp, initProps, 'children'),
//       html: '<div class="SimpleComp">SimpleComp:init children</div>',
//       assert: () => {
//         assert.equal(mountCount, 1)
//         assert.equal(renderCount, 1)
//         assert.equal(unmountCount, 0)
//       }
//     }, {
//       node: h(SimpleComp, initProps, 'children'),
//       html: '<div class="SimpleComp">SimpleComp:init children</div>',
//       assert: () => {
//         assert.equal(mountCount, 1)
//         assert.equal(renderCount, 2)
//         assert.equal(unmountCount, 0)
//       }
//     }, {
//       node: h(SimpleComp, { ...initProps, text: '2' }, 'children'),
//       html: '<div class="SimpleComp">SimpleComp:2 children</div>',
//       assert: () => {
//         assert.equal(mountCount, 1)
//         assert.equal(renderCount, 3)
//         assert.equal(unmountCount, 0)
//       }
//     }, {
//       node: h('div', null),
//       html: '<div></div>',
//       assert: () => {
//         assert.equal(mountCount, 1, 'mountCount')
//         assert.equal(renderCount, 3, 'renderCount')
//         assert.equal(unmountCount, 1, 'unmountCount')
//       }
//     }])
//   })

//   describe('NestComp', () => {
//     let mountCount = 0
//     let unmountCount = 0
//     let renderCount = 0
//     let initProps = {
//       a: 1,
//       children: null as any
//     }
//     function FnComp(props: any) {
//       return h(
//         'div',
//         { class: props.class },
//         h(
//           'span',
//           null,
//           `FnComp: ${props.aa}`
//         ),
//         h('div', { class: 'children' }, props.children)
//       )
//     }
//     class NestComp extends Component<typeof initProps> {
//       onDidMount() {
//         mountCount++
//         assert(this.rootElement, 'rootElementMounted')
//       }
//       onWillUnmount() {
//         unmountCount++
//       }
//       render() {
//         renderCount++
//         return h('div', { 'class': 'SimpleComp' }, `SimpleComp:${this.props.a} `, this.props.children)
//       }
//     }

//     testTrees('NestedComp', [{
//       node: h('div', null,
//         h(NestComp, {
//           a: 1,
//         },
//         h(FnComp, { aa: 2 }, h(NestComp, { a: 3 })))
//       ),
//       html: `<div><div class="SimpleComp">SimpleComp:1 <div><span>FnComp: 2</span><div class="children"><div class="SimpleComp">SimpleComp:3 </div></div></div></div></div>`,
//       assert: () => {
//         assert.equal(mountCount, 2, 'mountCount')
//         assert.equal(renderCount, 2, 'renderCount')
//         assert.equal(unmountCount, 0, 'unmountCount')
//       }
//     }, {
//       node: h('div', null,
//         h(NestComp, {
//           a: 2,
//         },
//         h(FnComp, { aa: 2 }, h(NestComp, { a: 3 })))
//       ),
//       html: `<div><div class="SimpleComp">SimpleComp:2 <div><span>FnComp: 2</span><div class="children"><div class="SimpleComp">SimpleComp:3 </div></div></div></div></div>`,
//       assert: () => {
//         assert.equal(mountCount, 2, 'mountCount')
//         assert.equal(renderCount, 4, 'renderCount')
//         assert.equal(unmountCount, 0, 'unmountCount')
//       }
//     }, {
//       node: h('div', null,
//         h(NestComp, {
//           a: 2,
//         },
//         h(FnComp, { aa: 2 }, h(NestComp, { a: 4 })))
//       ),
//       html: `<div><div class="SimpleComp">SimpleComp:2 <div><span>FnComp: 2</span><div class="children"><div class="SimpleComp">SimpleComp:4 </div></div></div></div></div>`,
//       assert: () => {
//         assert.equal(mountCount, 2, 'mountCount')
//         assert.equal(renderCount, 6, 'renderCount')
//         assert.equal(unmountCount, 0, 'unmountCount')
//       }
//     }, {
//       node: h('div', null,
//       ),
//       html: `<div></div>`,
//       assert: () => {
//         assert.equal(mountCount, 2, 'mountCount')
//         assert.equal(renderCount, 6, 'renderCount')
//         assert.equal(unmountCount, 2, 'unmountCount')
//       }
//     }])
//   })

// })
