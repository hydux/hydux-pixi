/// <reference types="pixi.js" />
export declare const document: any;
import { VNode } from '../../vdom';
import * as pixi from 'pixi.js';
export interface RenderTree {
    node: VNode;
    pixidom: any[];
    assert?: () => void;
}
export declare function serializePixiDom(root: pixi.Container | pixi.DisplayObject, attrKeys: string[]): any[];
export declare function testTrees(name: string, trees: RenderTree[], attrKeys?: string[]): void;
