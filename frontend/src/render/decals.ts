import type { Decal } from '../core/types'
import { COLORS } from '../app/config'

export function drawDecals(ctx: CanvasRenderingContext2D, decals: readonly Decal[], tileSize: number) {
  for (const d of decals) {
    ctx.save()
    ctx.globalAlpha = d.alpha
    const cx = (d.x + 0.5) * tileSize
    const cy = (d.y + 0.5) * tileSize
    ctx.translate(cx, cy)
    ctx.rotate(d.rotation)

    // Simple geometric splats: small rounded blobs, with variant-specific scale.
    ctx.fillStyle = COLORS.splat
    const r = d.variant === 'death' ? tileSize * 0.52 : d.variant === 'hit' ? tileSize * 0.34 : tileSize * 0.28
    const w = r
    const h = d.variant === 'slide' ? r * 0.72 : r
    ctx.beginPath()
    ctx.roundRect(-w * 0.5, -h * 0.5, w, h, Math.min(w, h) * 0.25)
    ctx.fill()

    // Inner darker core for depth.
    ctx.fillStyle = 'rgba(0,0,0,0.10)'
    ctx.beginPath()
    ctx.roundRect(-w * 0.22, -h * 0.22, w * 0.44, h * 0.44, Math.min(w, h) * 0.18)
    ctx.fill()

    ctx.restore()
  }
}

