import * as Vdom from './vdom';
import * as Hydux from 'hydux';
declare const React: {
    createElement: typeof Vdom.h;
};
declare const h: typeof Vdom.h;
export { React, h };
export interface Options<E> {
    stats: any;
}
export default function withPixi<State, Actions, E = Node>(container: E, options?: Partial<Options<E>>): (app: Hydux.App<State, Actions>) => Hydux.App<State, Actions>;
