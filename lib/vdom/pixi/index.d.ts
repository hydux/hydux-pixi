/// <reference types="pixi.js" />
import { Component, VNode, ICustomAPI } from '../';
import * as pixi from 'pixi.js';
export declare class PIXIComponent<P = {}, S = {}> extends Component<P> {
    container: PIXI.Container;
    _builtin: any;
    _api: ICustomAPI<pixi.Container>;
    getBuiltin(): any;
}
export declare const api: ICustomAPI<PIXI.Container>;
export declare function render<Node extends PIXI.Container>(parent: Node, vnode: VNode): any;
