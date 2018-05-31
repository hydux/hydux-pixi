# hydux-pixi


[![Build Status](https://travis-ci.org/hydux/hydux-pixi.svg?branch=master)](https://travis-ci.org/hydux/hydux-pixi) [![npm](https://img.shields.io/npm/v/hydux-pixi.svg)](https://www.npmjs.com/package/hydux-pixi) [![npm](https://img.shields.io/npm/dm/hydux-pixi.svg)](https://www.npmjs.com/package/hydux-pixi)

A light-weight High performance

## Install

```sh
yarn add hydux-pixi # or npm i hydux-pixi
```

## Usage

This package can make your daily work easier. When you get lot's of views which just rendering some data from server, with less user interaction, this package will add isLoading flag and fetch error handler automatically for your each fetch function.

Let's say we already get an api function, like this fake one, it takes some parameters and return a promise can resolve as a data, or reject as an error (`message` propertie is required and would be used later).

```ts
const asyncApi = {
  fetchCount(count: number, failed = false) {
    return new Promise<number>(
      (resolve, reject) =>
        setTimeout(
          () => {
            failed
              ? reject(new Error(`Fetch ${count} failed!`))
              : resolve(count)
          },
          10,
        )
    )
  },
}
```

Now we can make a loadable api to generate some state and actions.

```ts
import Loadable from 'hydux-pixi'
const loadableApi = Loadable({
  fetchCount: {
    init: 0, // initial state
    api: asyncApi.fetchCount,
    // Custom actions to handleing fetch start/resolved/rejected event
    // handleStart: (key: string) => (state, actions) => {/*...*/}
    // handleSuccess: (key: string, data: Data) => (state, actions) => {/*...*/}
    // handleError: (key: string, err: Error) => (state, actions) => {/*...*/}
  },
})
const ctx = Hydux.app<typeof loadableApi.state, typeof loadableApi.actions>({
  init: () => loadableApi.state,
  actions: loadableApi.actions,
  view: (state, actions) => {
    // here we can access the fetch state and actions
    return //
  },
})

```

Here is the generated state and actions

```ts
state = {
  fetchCount: {
    isLoading: false, // whether is loading know
    data: 0, // initial data from `param.init`, if fetch success it would be the the data from api
    error: '', // rawError.message
    rawError: null, // the raw error from fetch function
  }
}

actions = {
  fetchCount: (count: number, failed = false) => any // a generated action with same signature of fetch function
  disableLoadingFlag: () => any // just as the name says, some times we don't want the loading animation, so we can simply disable them all!
  enableLoadingFlag: () => any // just as the name says
}
```

## Example App

```sh
git clone https://github.com/hydux/hydux-pixi.git
cd examples/counter
yarn # or npm i
npm start
```

Now open http://localhost:8080 and hack! -->

## License

MIT
