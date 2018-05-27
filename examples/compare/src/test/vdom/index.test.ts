import { render, h } from '../../vdom'
import domApi from '../../vdom/dom-api'
import * as assert from 'assert'
import * as fs from 'fs'
import * as Utils from './utils'

const testTrees = Utils.testTrees

describe('desc', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  it('positional string/number children', () => {
    assert.deepEqual(h('div', {}, 'foo', 'bar', 'baz'), {
      type: 2,
      name: 'div',
      attributes: {},
      children: [{ type: 1, name: 'foo' }, { type: 1, name: 'bar' }, { type: 1, name: 'baz' }],
    })
    assert.deepEqual(h('div', {}, 0, 'foo', 1, 'baz', 2), {
      type: 2,
      name: 'div',
      attributes: {},
      children: [
        { type: 1, name: '0' },
        { type: 1, name: 'foo' },
        { type: 1, name: '1' },
        { type: 1, name: 'baz' },
        { type: 1, name: '2' },
      ],
    })
    assert.deepEqual(h('div', {}, 'foo', h('div', {}, 'bar'), 'baz', 'quux'), {
      type: 2,
      name: 'div',
      attributes: {},
      children: [
        { type: 1, name: 'foo' },
        { type: 2, name: 'div', attributes: {}, children: [{ type: 1, name: 'bar' }] },
        { type: 1, name: 'baz' },
        { type: 1, name: 'quux' },
      ],
    })
  })
  it('skip null and boolean children', () => {
    const expected = { type: 2, name: 'div', attributes: {}, children: [] }
    assert.deepEqual(h('div', {}, true), expected)
    assert.deepEqual(h('div', {}, false), expected)
    assert.deepEqual(h('div', {}, null), expected)
  })
  testTrees('replace element', [
    { node: h('main', {}), html: `<main></main>` },
    { node: h('div', {}), html: `<div></div>` },
  ])
  testTrees('insert children on top', [
    {
      node: h('main', {}, [h('div', { key: 'a', id: 'a' }, 'A')]),
      html: `<main>
              <div id="a">A</div>
            </main>`,
    },
    {
      node: h('main', {}, [
        h('div', { key: 'b', id: 'b' }, 'B'),
        h('div', { key: 'a', id: 'a' }, 'A'),
      ]),
      html: `
        <main>
          <div id="b">B</div>
          <div id="a">A</div>
        </main>      `,
    },
    {
      node: h('main', {}, [
        h('div', { key: 'c', id: 'c' }, 'C'),
        h('div', { key: 'b', id: 'b' }, 'B'),
        h('div', { key: 'a', id: 'a' }, 'A'),
      ]),
      html: `<main>
              <div id="c">C</div>
              <div id="b">B</div>
              <div id="a">A</div>
            </main>      `,
    },
  ])
  testTrees('remove text node', [
    {
      node: h('main', {}, [h('div', {}, ['foo']), 'bar']),
      html: `<main>
              <div>foo</div>
              bar
            </main>      `,
    },
    {
      node: h('main', {}, [h('div', {}, ['foo'])]),
      html: `<main>
              <div>foo</div>
            </main>      `,
    },
  ])
  testTrees('failed', [
    {
      node: h('main', {}, [
        h('div', { key: 'a', id: 'a' }, 'A'),
        h('div', { key: 'c', id: 'c' }, 'C'),
        h('div', { key: 'd', id: 'd' }, 'B'),
        h('div', { key: 'b', id: 'b' }, 'D'),
        h('div', { key: 'e', id: 'e' }, 'E'),
      ]),
      html: `
        <main>
          <div id="a">A</div>
          <div id="c">C</div>
          <div id="d">B</div>
          <div id="b">D</div>
          <div id="e">E</div>
        </main>      `,
    },
    {
      node: h('main', {}, [
        h('div', { key: 'd', id: 'd' }, 'D'),
        h('div', { key: 'c', id: 'c' }, 'C'),
        h('div', { key: 'b', id: 'b' }, 'B'),
        h('div', { key: 'a', id: 'a' }, 'A'),
      ]),
      html: `
          <main>
            <div id="d">D</div>
            <div id="c">C</div>
            <div id="b">B</div>
            <div id="a">A</div>
          </main>      `,
    },
  ])
  testTrees('keyed', [
    {
      node: h('main', {}, [
        h('div', { key: 'a', id: 'a' }, 'A'),
        h('div', { key: 'b', id: 'b' }, 'B'),
        h('div', { key: 'c', id: 'c' }, 'C'),
        h('div', { key: 'd', id: 'd' }, 'D'),
        h('div', { key: 'e', id: 'e' }, 'E'),
      ]),
      html: `
            <main>
              <div id="a">A</div>
              <div id="b">B</div>
              <div id="c">C</div>
              <div id="d">D</div>
              <div id="e">E</div>
            </main>      `,
    },
    {
      node: h('main', {}, [
        h('div', { key: 'a', id: 'a' }, 'A'),
        h('div', { key: 'c', id: 'c' }, 'C'),
        h('div', { key: 'd', id: 'd' }, 'D'),
      ]),
      html: `
        <main>
          <div id="a">A</div>
          <div id="c">C</div>
          <div id="d">D</div>
        </main>      `,
    },
    {
      node: h('main', {}, [h('div', { key: 'd', id: 'd' }, 'D')]),
      html: `
      <main>
        <div id="d">D</div>
      </main>      `,
    },
    {
      node: h('main', {}, [
        h('div', { key: 'a', id: 'a' }, 'A'),
        h('div', { key: 'b', id: 'b' }, 'B'),
        h('div', { key: 'c', id: 'c' }, 'C'),
        h('div', { key: 'd', id: 'd' }, 'D'),
        h('div', { key: 'e', id: 'e' }, 'E'),
      ]),
      html: `
        <main>
          <div id="a">A</div>
          <div id="b">B</div>
          <div id="c">C</div>
          <div id="d">D</div>
          <div id="e">E</div>
        </main>      `,
    },
    {
      node: h('main', {}, [
        h('div', { key: 'a', id: 'a' }, 'A'),
        h('div', { key: 'c', id: 'c' }, 'C'),
        h('div', { key: 'b', id: 'b' }, 'B'),
        h('div', { key: 'd', id: 'd' }, 'D'),
        h('div', { key: 'e', id: 'e' }, 'E'),
      ]),
      html: `
        <main>
          <div id="a">A</div>
          <div id="c">C</div>
          <div id="b">B</div>
          <div id="d">D</div>
          <div id="e">E</div>
        </main>      `,
    },
    {
      node: h('main', {}, [
        h('div', { key: 'a', id: 'a' }, 'A'),
        h('div', { key: 'c', id: 'c' }, 'C'),
        h('div', { key: 'd', id: 'd' }, 'B'),
        h('div', { key: 'b', id: 'b' }, 'D'),
        h('div', { key: 'e', id: 'e' }, 'E'),
      ]),
      html: `
        <main>
          <div id="a">A</div>
          <div id="c">C</div>
          <div id="d">B</div>
          <div id="b">D</div>
          <div id="e">E</div>
        </main>      `,
    },
    {
      node: h('main', {}, [
        h('div', { key: 'd', id: 'd' }, 'D'),
        h('div', { key: 'c', id: 'c' }, 'C'),
        h('div', { key: 'b', id: 'b' }, 'B'),
        h('div', { key: 'a', id: 'a' }, 'A'),
      ]),
      html: `
          <main>
            <div id="d">D</div>
            <div id="c">C</div>
            <div id="b">B</div>
            <div id="a">A</div>
          </main>      `,
    },
  ])
  testTrees('mixed keyed/non-keyed', [
    {
      node: h('main', {}, [
        h('div', { key: 'a', id: 'a' }, 'A'),
        h('div', {}, 'B'),
        h('div', {}, 'C'),
        h('div', { key: 'd', id: 'd' }, 'D'),
        h('div', { key: 'e', id: 'e' }, 'E'),
      ]),
      html: `
          <main>
            <div id="a">A</div>
            <div>B</div>
            <div>C</div>
            <div id="d">D</div>
            <div id="e">E</div>
          </main>      `,
    },
    {
      node: h('main', {}, [
        h('div', { key: 'e', id: 'e' }, 'E'),
        h('div', {}, 'C'),
        h('div', {}, 'B'),
        h('div', { key: 'd', id: 'd' }, 'D'),
        h('div', { key: 'a', id: 'a' }, 'A'),
      ]),
      html: `
          <main>
            <div id="e">E</div>
            <div>C</div>
            <div>B</div>
            <div id="d">D</div>
            <div id="a">A</div>
          </main>      `,
    },
    {
      node: h('main', {}, [
        h('div', {}, 'C'),
        h('div', { key: 'd', id: 'd' }, 'D'),
        h('div', { key: 'a', id: 'a' }, 'A'),
        h('div', { key: 'e', id: 'e' }, 'E'),
        h('div', {}, 'B'),
      ]),
      html: `
        <main>
          <div>C</div>
          <div id="d">D</div>
          <div id="a">A</div>
          <div id="e">E</div>
          <div>B</div>
        </main>      `,
    },
    {
      node: h('main', {}, [
        h('div', { key: 'e', id: 'e' }, 'E'),
        h('div', { key: 'd', id: 'd' }, 'D'),
        h('div', {}, 'B'),
        h('div', {}, 'C'),
      ]),
      html: `
          <main>
            <div id="e">E</div>
            <div id="d">D</div>
            <div>B</div>
            <div>C</div>
          </main>      `,
    },
    {
      node: h('main', {},
        h('div', { key: 'e', id: 'e' }, 'E'),
        h('div', { key: 'd', id: 'd' }, 'D'),
        h('div', {}, 'B'),
        h('div', {}, 'C'),
      ),
      html: `
          <main>
            <div id="e">E</div>
            <div id="d">D</div>
            <div>B</div>
            <div>C</div>
          </main>      `,
    },
  ])
  testTrees('removeAttribute', [
    { node: h('div', { id: 'foo', class: 'bar' }), html: `<div id="foo" class="bar"></div>` },
    { node: h('div', null), html: `<div></div>` },
  ])
  testTrees('skip setAttribute for functions', [
    {
      node: h('div', {
        onclick() {
          // ignore
        },
      }),
      html: `<div></div>`,
    },
  ])
  testTrees('setAttribute true', [
    { node: h('div', { enabled: true }), html: `<div enabled="true"></div>` },
  ])
  testTrees('update element with dynamic props', [
    { node: h('input', { type: 'text', value: 'foo' }), html: `<input type="text">` },
    {
      node: h('input', { type: 'text', value: 'bar' }),
      html: `<input type="text">`,
      assert() {
        assert.equal(document.querySelector('input')!.value, 'bar')
      },
    },
  ])
  testTrees('input list attribute', [
    { node: h('input', { list: 'foobar' }), html: `<input list="foobar">` },
  ])
  it('event handlers', () => {
    render(
      h('button', {
        onclick(event) {
          //
        },
      })!,
      document.body,
      domApi,
    )
  })
})
