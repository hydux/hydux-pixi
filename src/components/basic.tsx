import * as pixi from 'pixi.js'
import { PIXIComponent } from 'vdom/pixi-api'

export interface ContainerProps {
  scaleX?: number
  scaleY?: number
  pivotX?: number
  pivotY?: number
  skewX?: number
  skewY?: number
  worldTransform?: number[];
  localTransform?: number[];

  x?: number
  y?: number
  buttonMode?: boolean
  rotation?: number;
  worldVisible?: boolean;
  mask?: PIXI.Graphics | PIXI.Sprite | null;
  filters?: Array<PIXI.Filter<any>> | null;
  width?: number;
  height?: number;

  accessible?: boolean;
  accessibleTitle?: string | null;
  accessibleHint?: string | null;
  tabIndex?: number;
  // end accessible target

  // begin interactive target
  interactive?: boolean;
  interactiveChildren?: boolean;
  hitArea?: PIXI.Rectangle | PIXI.Circle | PIXI.Ellipse | PIXI.Polygon | PIXI.RoundedRectangle | PIXI.HitArea;
  cursor?: string;

  alpha?: number;
  visible?: boolean;
  renderable?: boolean;
  worldAlpha?: number;
  filterArea?: pixi.Rectangle | null
}

const updateMap = {
  scaleX: (node: pixi.Container, val: number) => node.scale.x = val,
  scaleY: (node: pixi.Container, val: number) => node.scale.y = val,
  pivotX: (node: pixi.Container, val: number) => node.pivot.x = val,
  pivotY: (node: pixi.Container, val: number) => node.pivot.y = val,
  skewX: (node: pixi.Container, val: number) => node.skew.x = val,
  skewY: (node: pixi.Container, val: number) => node.skew.y = val,
  worldTransform: (node: pixi.Container, val: number[]) => node.worldTransform.fromArray(val),
  localTransform: (node: pixi.Container, val: number[]) => node.localTransform.fromArray(val),
}

export function updateContainer(node: pixi.Container, props: ContainerProps) {
  const keys = Object.keys(props)
  let i = keys.length
  while (i--) {
    let key = keys[i]
    let val = props[key]
    if (typeof val === 'undefined') {
      continue
    }
    let update = updateMap[key]
    if (
      typeof update !== 'undefined'
    ) {
      update(node, props[key])
    } else {
      node[key] = val
    }
  }
}

export interface StageProps extends pixi.ApplicationOptions {
  app?: pixi.Application
}

export class Stage extends PIXIComponent<StageProps, pixi.Container> {
  app: pixi.Application
  constructor(props: StageProps) {
    super()
    this.app = props.app || new pixi.Application(props)
  }
  create(props: StageProps) {
    return this.app.stage
  }
  update(node: pixi.Container, props: StageProps): void {
    updateContainer(node, props)
  }
}

export class Container extends PIXIComponent<ContainerProps, pixi.Container> {
  create(props: any) {
    return new pixi.Container()
  }
  update(node: pixi.Container, props: ContainerProps): void {
    updateContainer(node, props)
  }
}

export interface SpriteProps extends ContainerProps {
  tint?: number
  blendMode?: number
  pluginName?: string
  texture?: pixi.Texture
  vertexData?: Float32Array
}

export class Sprite extends PIXIComponent<SpriteProps, pixi.Sprite> {
  create(props: any) {
    return new pixi.Sprite()
  }
  update(node: pixi.Sprite, props: SpriteProps): void {
    updateContainer(node, props)
  }
}

export interface GraphicsProps extends ContainerProps {
  draw: (g: pixi.Graphics) => void
}

export class Graphics extends PIXIComponent<GraphicsProps, pixi.Graphics> {
  create(props: any) {
    return new pixi.Graphics()
  }
  update(node: pixi.Graphics, props: GraphicsProps): void {
    updateContainer(node, props)
    if (props.draw) {
      props.draw(node)
    }
  }
}
