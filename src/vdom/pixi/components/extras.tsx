import * as pixi from 'pixi.js'
import { Is, Component, NativeWrapper, h, Attributes } from '../../'
import * as core from './core'

export interface BitmapTextProps extends core.ContainerProps {
  text: string
  font?:
    | string
    | { name?: string; size?: number }
  align?: string
  tint?: number
  textWidth?: number
  textHeight?: number
  maxWidth?: number
  maxLineHeight?: number
  dirty?: boolean
  anchor?: PIXI.Point | number
}

export class BitmapText extends NativeWrapper<BitmapTextProps> {
  getRawClass() {
    return pixi.Sprite
  }
  create(props: BitmapTextProps) {
    return new pixi.extras.BitmapText(props.text)
  }
  update(node: pixi.extras.BitmapText, key: string, val: any, props: BitmapTextProps): void {
    core.baseUpdate(node, key, val, props)
  }
}

export interface AnimatedSpriteProps extends core.SpriteProps {
  textures: pixi.Texture[] | pixi.extras.AnimatedSpriteTextureTimeObject[]
  autoUpdate?: boolean
  animationSpeed?: number
  loop?: boolean
  playing?: boolean
  totalFrames?: number
  currentFrame?: number
}

export class AnimatedSprite extends NativeWrapper<AnimatedSpriteProps> {
  getRawClass() {
    return pixi.Sprite
  }
  create(props: AnimatedSpriteProps) {
    return new pixi.extras.AnimatedSprite(props.textures, props.autoUpdate)
  }
  update(
    node: pixi.extras.AnimatedSprite,
    key: string,
    val: any,
    props: AnimatedSpriteProps,
  ): void {
    if (key === 'playing' && val !== node.playing) {
      if (val) {
        node.play()
      } else {
        node.stop()
      }
    }
    core.baseUpdate(node, key, val, props)
  }
}

export interface TilingSpriteProps extends core.SpriteProps {
  texture: pixi.Texture
  tileTransform?: pixi.TransformStatic
  uvTransform?: pixi.TextureMatrix
  uvRespectAnchor?: boolean
  clampMargin?: number
  tileScaleX?: number
  tileScaleY?: number
  tilePositionX?: number
  tilePositionY?: number
  tileScale?: pixi.Point | pixi.ObservablePoint
  tilePosition?: pixi.Point | pixi.ObservablePoint
  width?: number
  height?: number
}

export class TilingSprite extends NativeWrapper<TilingSpriteProps> {
  private static _updateMap = {
    tileScaleX: (node: pixi.extras.TilingSprite, val: number) => (node.tileScale.x = val),
    tileScaleY: (node: pixi.extras.TilingSprite, val: number) => (node.tileScale.y = val),
    tilePositionX: (node: pixi.extras.TilingSprite, val: number) => (node.tilePosition.x = val),
    tilePositionY: (node: pixi.extras.TilingSprite, val: number) => (node.tilePosition.y = val),
  }
  getRawClass() {
    return pixi.Sprite
  }
  create(props: TilingSpriteProps) {
    return new pixi.extras.TilingSprite(props.texture)
  }
  update(node: pixi.extras.TilingSprite, key: string, val: any, props: TilingSpriteProps): void {
    core.baseUpdate(node, key, val, props, TilingSprite._updateMap)
  }
}
