/// <reference types="pixi.js" />
import * as pixi from 'pixi.js';
import { NativeWrapper, Attributes } from '../../';
export declare type UserEventHandler = (event: pixi.interaction.InteractionEvent) => void;
export declare type PixiEventHander = (displayObject: pixi.DisplayObject) => void;
export declare type UserEventTypes = pixi.interaction.InteractionPointerEvents | pixi.interaction.InteractionTouchEvents | pixi.interaction.InteractionMouseEvents;
export declare type PixiEventTypes = pixi.interaction.InteractionPixiEvents;
export interface Events {
    onPointerdown?: UserEventHandler;
    onPointercancel?: UserEventHandler;
    onPointerup?: UserEventHandler;
    onPointertap?: UserEventHandler;
    onPointerupoutside?: UserEventHandler;
    onPointermove?: UserEventHandler;
    onPointerover?: UserEventHandler;
    onPointerout?: UserEventHandler;
    onTouchstart?: UserEventHandler;
    onTouchcancel?: UserEventHandler;
    onTouchend?: UserEventHandler;
    onTouchendoutside?: UserEventHandler;
    onTouchmove?: UserEventHandler;
    onTap?: UserEventHandler;
    onRightdown?: UserEventHandler;
    onMousedown?: UserEventHandler;
    onRightup?: UserEventHandler;
    onMouseup?: UserEventHandler;
    onRightclick?: UserEventHandler;
    onClick?: UserEventHandler;
    onRightupoutside?: UserEventHandler;
    onMouseupoutside?: UserEventHandler;
    onMousemove?: UserEventHandler;
    onMouseout?: UserEventHandler;
    onMouseover?: UserEventHandler;
    onAdded?: PixiEventHander;
    onRemoved?: PixiEventHander;
    onceAdded?: PixiEventHander;
    onceRemoved?: PixiEventHander;
    on?: [UserEventTypes, UserEventHandler];
    once?: [UserEventTypes, UserEventHandler];
}
export interface ContainerProps extends Events, Attributes<PIXI.Container> {
    ref?: (c: any) => any;
    scaleX?: number;
    scaleY?: number;
    pivotX?: number;
    pivotY?: number;
    skewX?: number;
    skewY?: number;
    worldTransform?: number[];
    localTransform?: number[];
    x?: number;
    y?: number;
    buttonMode?: boolean;
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
    interactive?: boolean;
    interactiveChildren?: boolean;
    hitArea?: PIXI.Rectangle | PIXI.Circle | PIXI.Ellipse | PIXI.Polygon | PIXI.RoundedRectangle | PIXI.HitArea;
    cursor?: string;
    alpha?: number;
    visible?: boolean;
    renderable?: boolean;
    worldAlpha?: number;
    filterArea?: pixi.Rectangle | null;
}
export declare function baseUpdate(node: pixi.Container, key: string, val: any, props: ContainerProps, _map?: {
    [k: string]: (node: pixi.Container, val: any) => void;
}): void;
export declare class Container extends NativeWrapper<ContainerProps> {
    getRawClass(): typeof pixi.Container;
    create(props: any): pixi.Container;
    update(node: pixi.Container, key: string, val: any, props: ContainerProps): void;
}
export interface SpriteProps extends ContainerProps {
    anchor?: PIXI.ObservablePoint;
    anchorX?: number;
    anchorY?: number;
    tint?: number;
    blendMode?: number;
    pluginName?: string;
    texture?: pixi.Texture;
    vertexData?: Float32Array;
}
export declare class Sprite extends NativeWrapper<SpriteProps> {
    getRawClass(): typeof pixi.Sprite;
    create(props: any): pixi.Sprite;
    update(node: pixi.Sprite, key: string, val: any, props: SpriteProps): void;
}
export interface GraphicsProps extends ContainerProps {
    draw: (g: pixi.Graphics) => void;
}
export declare class Graphics extends NativeWrapper<GraphicsProps> {
    getRawClass(): typeof pixi.Graphics;
    create(props: any): pixi.Graphics;
    update(node: pixi.Graphics, key: string, val: any, props: GraphicsProps): void;
}
export interface TextProps extends ContainerProps {
    resolution?: number;
    style?: pixi.TextStyleOptions;
    text?: string;
    dirty?: boolean;
}
export declare class Text extends NativeWrapper<TextProps> {
    private static _skips;
    private static _skipsSet;
    getRawClass(): typeof pixi.Text;
    create(props: any): pixi.Text;
    update(node: pixi.Text, key: string, val: any, props: TextProps): void;
}
