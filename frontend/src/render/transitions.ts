import type { GameStatus } from '../core/types'
import { COLORS } from '../app/config'

export function drawTransitionOverlay(
  ctx: CanvasRenderingContext2D,
  status: GameStatus,
  canvasW: number,
  canvasH: number,
  progress01: number,
) {
  if (status !== 'dying' && status !== 'won' && status !== 'transition') return

  ctx.save()
  ctx.fillStyle = COLORS.transitionOverlay
  const alpha = status === 'transition' ? 0.25 : 0.35
  ctx.globalAlpha = alpha * (0.25 + 0.75 * progress01)
  ctx.fillRect(0, 0, canvasW, canvasH)

  // Simple wipe line.
  ctx.globalAlpha = 0.75 * progress01
  ctx.fillStyle = status === 'dying' ? 'rgba(67,255,122,0.25)' : 'rgba(255,221,120,0.25)'
  const h = Math.floor(canvasH * progress01)
  ctx.fillRect(0, 0, canvasW, Math.max(0, h))

  ctx.restore()
}

