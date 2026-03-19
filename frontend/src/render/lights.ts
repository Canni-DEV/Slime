import type { GameState } from '../core/types'

export function drawTorchLights(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  tileSize: number,
) {
  const torches = state.entities.filter((e) => e.type === 'torch')
  if (torches.length === 0) return

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  for (const t of torches) {
    const cx = (t.x + 0.5) * tileSize
    const cy = (t.y + 0.5) * tileSize
    const baseR = tileSize * 2.2
    const strength = typeof t.value === 'number' ? Math.max(0.2, Math.min(1.2, t.value)) : 1
    const r = baseR * strength
    const g = ctx.createRadialGradient(cx, cy, tileSize * 0.15, cx, cy, r)
    g.addColorStop(0, 'rgba(255, 196, 92, 0.42)')
    g.addColorStop(0.35, 'rgba(255, 160, 72, 0.18)')
    g.addColorStop(1, 'rgba(255, 120, 40, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

