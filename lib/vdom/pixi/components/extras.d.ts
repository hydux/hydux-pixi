/// <reference types="pixi.js" />
import * as pixi from 'pixi.js';
import { NativeWrapper } from '../../';
import * as core from './core';
export interface BitmapTextProps extends core.ContainerProps {
    text: string;
    font?: string | {
        name?: string;
        size?: number;
    };
    align?: string;
    tint?: number;
    textWidth?: number;
    textHeight?: number;
    maxWidth?: number;
    maxLineHeight?: number;
    dirty?: boolean;
    anchor?: PIXI.Point | number;
}
export declare class BitmapText extends NativeWrapper<BitmapTextProps> {
    getRawClass(): typeof pixi.Sprite;
    create(props: BitmapTextProps): pixi.extras.BitmapText;
    update(node: pixi.extras.BitmapText, key: string, val: any, props: BitmapTextProps): void;
}
export interface AnimatedSpriteProps extends core.SpriteProps {
    textures: pixi.Texture[] | pixi.extras.AnimatedSpriteTextureTimeObject[];
    autoUpdate?: boolean;
    animationSpeed?: number;
    loop?: boolean;
    playing?: boolean;
    totalFrames?: number;
    currentFrame?: number;
}
export declare class AnimatedSprite extends NativeWrapper<AnimatedSpriteProps> {
    getRawClass(): typeof pixi.Sprite;
    create(props: AnimatedSpriteProps): pixi.extras.AnimatedSprite;
    update(node: pixi.extras.AnimatedSprite, key: string, val: any, props: AnimatedSpriteProps): void;
}
export interface TilingSpriteProps extends core.SpriteProps {
    texture: pixi.Texture;
    tileTransform?: pixi.TransformStatic;
    uvTransform?: pixi.TextureMatrix;
    uvRespectAnchor?: boolean;
    clampMargin?: number;
    tileScaleX?: number;
    tileScaleY?: number;
    tilePositionX?: number;
    tilePositionY?: number;
    tileScale?: pixi.Point | pixi.ObservablePoint;
    tilePosition?: pixi.Point | pixi.ObservablePoint;
    width?: number;
    height?: number;
}
export declare class TilingSprite extends NativeWrapper<TilingSpriteProps> {
    private static _updateMap;
    getRawClass(): typeof pixi.Sprite;
    create(props: TilingSpriteProps): pixi.extras.TilingSprite;
    update(node: pixi.extras.TilingSprite, key: string, val: any, props: TilingSpriteProps): void;
}
