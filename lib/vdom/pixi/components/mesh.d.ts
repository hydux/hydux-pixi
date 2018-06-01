/// <reference types="pixi.js" />
import * as pixi from 'pixi.js';
import { NativeWrapper } from '../../';
import * as core from './core';
export interface MeshProps extends core.ContainerProps {
    texture: pixi.Texture;
    uvs?: Float32Array;
    vertices?: Float32Array;
    indices?: Uint16Array;
    dirty?: number;
    indexDirty?: number;
    dirtyVertex?: boolean;
    blendMode?: number;
    pluginName?: string;
    canvasPadding?: number;
    drawMode?: number;
    tintRgb?: Float32Array;
    uploadUvTransform?: boolean;
    tint?: number;
}
export declare class Mesh extends NativeWrapper<MeshProps> {
    getRawClass(): typeof pixi.mesh.Mesh;
    create(props: MeshProps): pixi.mesh.Mesh;
    update(node: pixi.mesh.Mesh, key: string, val: any, props: MeshProps): void;
}
export interface PlaneProps extends MeshProps {
    verticesX?: number;
    verticesY?: number;
}
export declare class Plane extends NativeWrapper<PlaneProps> {
    getRawClass(): typeof pixi.mesh.Plane;
    create(props: PlaneProps): pixi.mesh.Plane;
    update(node: pixi.mesh.Plane, key: string, val: any, props: PlaneProps): void;
}
export interface NineSlicePlaneProps extends PlaneProps {
    width?: number;
    height?: number;
    leftWidth?: number;
    rightWidth?: number;
    topHeight?: number;
    bottomHeight?: number;
}
export declare class NineSlicePlane extends NativeWrapper<NineSlicePlaneProps> {
    getRawClass(): typeof pixi.mesh.NineSlicePlane;
    create(props: NineSlicePlaneProps): pixi.mesh.NineSlicePlane;
    update(node: pixi.mesh.NineSlicePlane, key: string, val: any, props: NineSlicePlaneProps): void;
}
export interface RopeProps extends PlaneProps {
    points: pixi.Point[];
    colors?: number[];
    autoUpdate?: boolean;
}
export declare class Rope extends NativeWrapper<RopeProps> {
    getRawClass(): typeof pixi.mesh.Rope;
    create(props: RopeProps): pixi.mesh.Rope;
    update(node: pixi.mesh.Rope, key: string, val: any, props: RopeProps): void;
}
