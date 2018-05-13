import * as pixi from 'pixi.js'

export interface Props extends pixi.ApplicationOptions {
  app?: pixi.Application
}

export class Stage {
  constructor(props: Props) {
    let app = props.app || new pixi.Application(props)
  }
}
