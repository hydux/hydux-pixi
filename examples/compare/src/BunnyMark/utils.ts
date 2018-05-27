import getPixiApp, { stats } from '../pixi-app'

export const initBunnyState = (texture: PIXI.Texture, x = 10, y = 10) => ({
  x,
  y,
  texture,
  gravity: 0.75,
  speedX: Math.random() * 10,
  speedY: Math.random() * 10 - 5,
  bounds: {
    left: 0,
    top: 0,
    right: getPixiApp().renderer.width / getPixiApp().renderer.resolution,
    bottom: getPixiApp().renderer.height / getPixiApp().renderer.resolution,
  },
  anchorX: 0.5,
  anchorY: 1,
})

export type BunnyState = ReturnType<typeof initBunnyState>

export function updateBunnies(bunnies: BunnyState[]) {

  for (let i = 0; i < bunnies.length; i++) {
    const bunnyState = bunnies[i]
    bunnyState.x += bunnyState.speedX
    bunnyState.y += bunnyState.speedY
    bunnyState.speedY += bunnyState.gravity

    if (bunnyState.x > bunnyState.bounds.right) {
      bunnyState.speedX *= -1
      bunnyState.x = bunnyState.bounds.right
    } else if (bunnyState.x < bunnyState.bounds.left) {
      bunnyState.speedX *= -1
      bunnyState.x = bunnyState.bounds.left
    }

    if (bunnyState.y > bunnyState.bounds.bottom) {
      bunnyState.speedY *= -0.85
      bunnyState.y = bunnyState.bounds.bottom
      if (Math.random() > 0.5) {
        bunnyState.speedY -= Math.random() * 6
      }
    } else if (bunnyState.y < bunnyState.bounds.top) {
      bunnyState.speedY = 0
      bunnyState.y = bunnyState.bounds.top
    }
  }
}
