import * as pixi from 'pixi.js'
import { Is, Component, NativeWrapper, h, Attributes } from '../vdom'
import * as core from './core'

export interface MeshProps extends core.ContainerProps {
  texture: pixi.Texture
  uvs?: Float32Array
  vertices?: Float32Array
  indices?: Uint16Array
  dirty?: number
  indexDirty?: number
  dirtyVertex?: boolean
  blendMode?: number
  pluginName?: string
  canvasPadding?: number
  drawMode?: number
  tintRgb?: Float32Array
  uploadUvTransform?: boolean
  tint?: number
}

export class Mesh extends NativeWrapper<MeshProps> {
  getRawClass() {
    return pixi.mesh.Mesh
  }
  create(props: MeshProps) {
    return new pixi.mesh.Mesh(props.texture)
  }
  update(node: pixi.mesh.Mesh, key: string, val: any, props: MeshProps): void {
    core.baseUpdate(node, key, val, props)
  }
}

export interface PlaneProps extends MeshProps {
  verticesX?: number
  verticesY?: number
}

export class Plane extends NativeWrapper<PlaneProps> {
  getRawClass() {
    return pixi.mesh.Plane
  }
  create(props: PlaneProps) {
    return new pixi.mesh.Plane(props.texture)
  }
  update(node: pixi.mesh.Plane, key: string, val: any, props: PlaneProps): void {
    core.baseUpdate(node, key, val, props)
  }
}

export interface NineSlicePlaneProps extends PlaneProps {
  width?: number
  height?: number
  leftWidth?: number
  rightWidth?: number
  topHeight?: number
  bottomHeight?: number
}

export class NineSlicePlane extends NativeWrapper<NineSlicePlaneProps> {
  getRawClass() {
    return pixi.mesh.NineSlicePlane
  }
  create(props: NineSlicePlaneProps) {
    return new pixi.mesh.NineSlicePlane(props.texture)
  }
  update(node: pixi.mesh.NineSlicePlane, key: string, val: any, props: NineSlicePlaneProps): void {
    core.baseUpdate(node, key, val, props)
  }
}

export interface RopeProps extends PlaneProps {
  points: pixi.Point[]
  colors?: number[]
  autoUpdate?: boolean
}

export class Rope extends NativeWrapper<RopeProps> {
  getRawClass() {
    return pixi.mesh.Rope
  }
  create(props: RopeProps) {
    return new pixi.mesh.Rope(props.texture, props.points)
  }
  update(node: pixi.mesh.Rope, key: string, val: any, props: RopeProps): void {
    core.baseUpdate(node, key, val, props)
  }
}
