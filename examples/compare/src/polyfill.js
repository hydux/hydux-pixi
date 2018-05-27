// @ts-nocheck
const noop = function (){}
window.localStorage = window.localStorage || {
  setItem: noop,
  getItem: noop,
}
