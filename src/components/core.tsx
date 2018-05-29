import * as pixi from 'pixi.js'
import { Is, Component, BuiltinWrapper, h, Attributes } from '../vdom'

export type UserEventHandler = (event: pixi.interaction.InteractionEvent) => void
export type PixiEventHander = (displayObject: pixi.DisplayObject) => void

export type UserEventTypes =
  | pixi.interaction.InteractionPointerEvents
  | pixi.interaction.InteractionTouchEvents
  | pixi.interaction.InteractionMouseEvents
export type PixiEventTypes = pixi.interaction.InteractionPixiEvents

export interface Events {
  // InteractionPointerEvents
  onPointerdown?: UserEventHandler
  onPointercancel?: UserEventHandler
  onPointerup?: UserEventHandler
  onPointertap?: UserEventHandler
  onPointerupoutside?: UserEventHandler
  onPointermove?: UserEventHandler
  onPointerover?: UserEventHandler
  onPointerout?: UserEventHandler
  // InteractionTouchEvents
  onTouchstart?: UserEventHandler
  onTouchcancel?: UserEventHandler
  onTouchend?: UserEventHandler
  onTouchendoutside?: UserEventHandler
  onTouchmove?: UserEventHandler
  onTap?: UserEventHandler
  // InteractionMouseEvents
  onRightdown?: UserEventHandler
  onMousedown?: UserEventHandler
  onRightup?: UserEventHandler
  onMouseup?: UserEventHandler
  onRightclick?: UserEventHandler
  onClick?: UserEventHandler
  onRightupoutside?: UserEventHandler
  onMouseupoutside?: UserEventHandler
  onMousemove?: UserEventHandler
  onMouseout?: UserEventHandler
  onMouseover?: UserEventHandler
  // InteractionPixiEvents
  onAdded?: PixiEventHander
  onRemoved?: PixiEventHander
  onceAdded?: PixiEventHander
  onceRemoved?: PixiEventHander
  // general
  on?: [UserEventTypes, UserEventHandler]
  once?: [UserEventTypes, UserEventHandler]
}

// type A = 'aaa'
// type B = 'BBB'
// type C = A + B

export interface ContainerProps extends Events, Attributes<PIXI.Container> {
  ref?: (c: any) => any
  scaleX?: number
  scaleY?: number
  pivotX?: number
  pivotY?: number
  skewX?: number
  skewY?: number
  worldTransform?: number[]
  localTransform?: number[]

  x?: number
  y?: number
  buttonMode?: boolean
  rotation?: number
  worldVisible?: boolean
  mask?: PIXI.Graphics | PIXI.Sprite | null
  filters?: Array<PIXI.Filter<any>> | null
  width?: number
  height?: number

  accessible?: boolean
  accessibleTitle?: string | null
  accessibleHint?: string | null
  tabIndex?: number
  // end accessible target

  // begin interactive target
  interactive?: boolean
  interactiveChildren?: boolean
  hitArea?:
    | PIXI.Rectangle
    | PIXI.Circle
    | PIXI.Ellipse
    | PIXI.Polygon
    | PIXI.RoundedRectangle
    | PIXI.HitArea
  cursor?: string

  alpha?: number
  visible?: boolean
  renderable?: boolean
  worldAlpha?: number
  filterArea?: pixi.Rectangle | null
}

const updateMap = {
  scaleX: (node: pixi.Container, val: number) => (node.scale.x = val),
  scaleY: (node: pixi.Container, val: number) => (node.scale.y = val),
  pivotX: (node: pixi.Container, val: number) => (node.pivot.x = val),
  pivotY: (node: pixi.Container, val: number) => (node.pivot.y = val),
  skewX: (node: pixi.Container, val: number) => (node.skew.x = val),
  skewY: (node: pixi.Container, val: number) => (node.skew.y = val),
  worldTransform: (node: pixi.Container, val: number[]) => node.worldTransform.fromArray(val),
  localTransform: (node: pixi.Container, val: number[]) => node.localTransform.fromArray(val),
}

function addEvent(node: pixi.DisplayObject, type: 'on' | 'once', name: string, listener: Function) {
  const eventsKey = `_${type}Events`
  if (!Is.def(node[eventsKey])) {
    node[eventsKey] = {}
  }
  let events: { [k: string]: Function[] } = node[eventsKey]
  if (!Is.def(events[name])) {
    let lsns = events[name] = [] as Function[]
    node[type](name as pixi.interaction.InteractionEventTypes, e => {
      if (lsns.length > 0) {
        lsns[0](e)
      }
    })
  }
  if (events[name][0] !== listener) {
    events[name][0] = listener
  }
}

export function updateContainer(node: pixi.Container, key: string, val: any, props: ContainerProps) {
  if (typeof val === 'undefined') {
    return
  }
  let update = updateMap[key]
  if (typeof update !== 'undefined') {
    update(node, props[key])
  } else if (key[0] === 'o' && key[1] === 'n') {
    if (key[2] === 'c' && key[3] === 'e') {
      addEvent(node, 'once', key[4].toLowerCase() + key.slice(5), val)
    } else {
      addEvent(node, 'on', key[2].toLowerCase() + key.slice(3), val)
    }
  } else if (node[key] !== val) {
  // } else {
    node[key] = val
  }
}

function updateObjectProp<Node>(node: Node, key: string, val: object, props: object) {
  for (const k in val) {
    let v = val[k]
    if (v !== node[key][k]) {
      node[key][k] = v
    }
  }
}

export class Container extends BuiltinWrapper<ContainerProps> {
  getRawClass() { return pixi.Container }
  create(props: any) {
    return new pixi.Container()
  }
  update(node: pixi.Container, key: string, val: any, props: ContainerProps): void {
    updateContainer(node, key, val, props)
  }
}

export interface SpriteProps extends ContainerProps {
  tint?: number
  blendMode?: number
  pluginName?: string
  texture?: pixi.Texture
  vertexData?: Float32Array
}

export class Sprite extends BuiltinWrapper<SpriteProps> {
  getRawClass() { return pixi.Sprite }
  create(props: any) {
    return new pixi.Sprite()
  }
  update(node: pixi.Sprite, key: string, val: any, props: SpriteProps): void {
    updateContainer(node, key, val, props)
  }
}

export interface GraphicsProps extends ContainerProps {
  draw: (g: pixi.Graphics) => void
}

export class Graphics extends BuiltinWrapper<GraphicsProps> {
  getRawClass() { return pixi.Graphics }
  create(props: any) {
    return new pixi.Graphics()
  }
  update(node: pixi.Graphics, key: string, val: any, props: GraphicsProps): void {
    updateContainer(node, key, val, props)
    if (props.draw) {
      props.draw(node)
    }
  }
}

export interface TextProps extends ContainerProps {
  resolution?: number
  style?: pixi.TextStyleOptions
  text?: string
  dirty?: boolean
}

export class Text extends BuiltinWrapper<TextProps> {
  private static _skips = ['style']
  private static _skipsSet = new Set(Text._skips)
  getRawClass() { return pixi.Text }
  create(props: any) {
    return new pixi.Text()
  }
  update(node: pixi.Text, key: string, val: any, props: TextProps): void {
    if (Text._skipsSet.has(key)) {
      updateObjectProp(node, key, val, props)
    } else {
      updateContainer(node, key, val, props)
    }
  }
}
