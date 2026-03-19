import type { Decal } from '../core/types'
import { COLORS } from '../app/config'

export function drawDecals(ctx: CanvasRenderingContext2D, decals: readonly Decal[], tileSize: number) {
  for (const d of decals) {
    ctx.save()
    ctx.globalAlpha = d.alpha
    ctx.translate(d.x * tileSize, d.y * tileSize)

    // Simple geometric splats: small rounded blobs.
    ctx.fillStyle = COLORS.splat
    ctx.beginPath()
    const r = d.variant === 'death' ? tileSize * 0.45 : tileSize * 0.30
    ctx.roundRect(tileSize * 0.5 - r * 0.5, tileSize * 0.5 - r * 0.5, r, r, r * 0.25)
    ctx.fill()

    ctx.restore()
  }
}

