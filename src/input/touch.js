'use strict'

/**
 * Module dependencies.
 */

import { emitter as TouchPosition } from 'touch-position'
import { registerStat } from '../stats'
import { Command } from '../command'
import events from 'dom-events'
import raf from 'raf'

module.exports = exports = (...args) => new TouchInputCommand(...args)
export class TouchInputCommand extends Command {
  constructor(ctx, {
    touches = null,
    currentX = 0,
    currentY = 0,
    deltaX = 0,
    deltaY = 0,
    prevX = 0,
    prevY = 0,
    touch = TouchPosition({element: ctx.domElement}),
  } = {}) {
    registerStat('TouchInput')

    let hasMovement = false
    let hasTouch = false

    // focus/blur context on mouse down
    events.on(document, 'touchstart', (e) => {
      if (e.target == ctx.domElement) {
        ctx.focus()
      } else {
        ctx.blur()
      }
    })

    events.on(ctx.domElement, 'touchstart', (e) => {
      const x = e.touches[0].clientX
      const y = e.touches[0].clientY
      e.preventDefault()
      hasTouch = true
      touches = e.targetTouches
      currentX = x
      currentY = y
      deltaX = 0
      deltaY = 0
      prevX = 0
      prevY = 0
    })

    events.on(ctx.domElement, 'touchend', (e) => {
      e.preventDefault()
      raf(() => {
        hasMovement = false
        hasTouch = false
        touches = null
        currentX = 0
        currentY = 0
        deltaX = 0
        deltaY = 0
        prevX = 0
        prevY = 0
      })
    })

    touch.on('move', ({clientX, clientY}) => {
      hasMovement = true
      synchronizeTouch(touches, clientX, clientY)
    })

    super((state, block) => {
      if ('function' == typeof state) {
        block = state
        state = {}
      }

      state = state || {}
      block = block || function() {}

      if ('currentX' in state) { currentX = state.currentX }
      if ('currentY' in state) { currentY = state.currentY }

      synchronizeTouch(touches, currentX, currentY)

      block({
        ...state,
        hasMovement,
        hasTouch,
        currentX,
        currentY,
        touches,
        deltaX,
        deltaY,
        prevX,
        prevY,
      })
    })

    function synchronizeTouch(t, x, y) {
      touches = t

      if (currentX == x && currentY == y) {
        return
      }

      prevX = currentX
      prevY = currentY
      deltaX = x - currentX
      deltaY = y - currentY
      currentX = x
      currentY = y

      raf(() => {
        deltaX = 0
        deltaY = 0
      })
    }
  }
}
