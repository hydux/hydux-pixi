import * as pixi from 'pixi.js'
import * as Consts from 'consts'

export function Container (props, children) {
  return {
    tag: Consts.Container,
    props,
    children,
  }
}

export function Spirit(props, children) {
  return {
    tag: Consts.Spirit,
    props,
    children,
  }
}

// let a = <div key={1}/>
