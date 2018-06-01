export interface ICustomAPI<Node> {
    getChildAt(parent: Node, i: number): Node | undefined;
    getChildrenCount(parent: Node): number;
    addChild(parent: Node, child: Node): any;
    replaceChildAt(parent: Node, i: number, child: Node): any;
    removeChildAt(parent: Node, i: number): any;
}
export interface BaseAttributes<Node> {
    oncreate?: (el: Node) => void;
    onupdate?: (el: Node, attrs: Attributes<Node>) => boolean | void;
    children?: VNode[];
}
export declare type Attributes<Node> = BaseAttributes<Node> & {};
export interface ComponentConstructor<P = {}> {
    displayName?: string;
    new (props?: P): Component<P> | NativeWrapper<P>;
}
export interface FunctionalComponent<P = {}> {
    (props: P, children: VNode[]): VNode;
    displayName?: string;
    defaultProps?: Partial<P>;
}
export declare type ComponentFactory<P> = ComponentConstructor<P> | FunctionalComponent<P>;
export declare type Child = VNode | null | undefined;
export declare function h<P>(name: ComponentFactory<P>, attrs: null | (Attributes<any> & P), ...children: (Child | Child[])[]): VNode;
/**
 * RawObjectWrapper is used for wrap raw pixi objects,
 * we only use it as class.prototype in diff function,
 * the constructor/class field won't work.
 */
export declare abstract class NativeWrapper<P = {}> {
    props: P;
    abstract getRawClass(): any;
    abstract create(props: P | null): any;
    abstract update(node: any, key: string, val: any, props: P): void;
    updateAll(node: any, attrs: P): void;
}
export declare abstract class Component<P = {}, S = {}> {
    props: P & Attributes<P>;
    state: S;
    container: any;
    abstract _api: ICustomAPI<any>;
    private _rafId;
    constructor(props: P);
    abstract getBuiltin(): typeof NativeWrapper;
    shouldUpdate(nextProps: P, nextState: S): boolean;
    updateState(): void;
    setState(state?: Partial<S>): void;
    forceUpdate(): void;
    onDidMount(): void;
    onWillUnmount(): void;
    render(): null | VNode | boolean;
}
export declare const Is: {
    array(v: any): v is any[];
    fn(v: any): v is Function;
    str(v: any): v is string;
    def<T>(v: T | undefined): v is T;
};
export declare type VNode<P = any> = [ComponentFactory<P>, null | object, [ComponentFactory<P>, null | object, any[]][]];
export declare function patch<Node>(parent: Node, i: number, vnode: VNode, api: ICustomAPI<Node>): any;
