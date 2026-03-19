import type { GameState } from '../core/types'
import { HUD, COLORS } from '../app/config'

export function drawHud(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasH: number,
) {
  ctx.save()
  ctx.font = HUD.font
  ctx.textBaseline = 'top'

  const levelLabel = `Nivel ${state.levelIndex + 1}`
  const movesLabel = `Movimientos: ${state.moveCount}`

  ctx.fillStyle = COLORS.textDim
  ctx.fillText(levelLabel, 10, 8)
  ctx.fillStyle = COLORS.text
  ctx.fillText(movesLabel, 10, 26)

  if (state.status === 'dying') {
    ctx.fillStyle = 'rgba(67, 255, 122, 0.95)'
    ctx.fillText('Muriendo...', 10, 46)
  } else if (state.status === 'won') {
    ctx.fillStyle = 'rgba(255, 221, 120, 0.95)'
    ctx.fillText('Salida alcanzada', 10, 46)
  } else if (state.status === 'transition') {
    ctx.fillStyle = COLORS.textDim
    ctx.fillText('Siguiente...', 10, 46)
  }

  // Tiny hint.
  ctx.fillStyle = 'rgba(216, 226, 255, 0.55)'
  ctx.fillText('Flechas/WASD: mover  |  R: reiniciar  |  Z: deshacer', 10, canvasH - 18)

  ctx.restore()
}

