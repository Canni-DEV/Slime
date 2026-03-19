import { COLORS } from '../app/config'

function hash2(x: number, y: number): number {
  // Deterministic hash → [0,1)
  let n = x * 374761393 + y * 668265263
  n = (n ^ (n >> 13)) >>> 0
  n = (n * 1274126177) >>> 0
  return (n & 0xfffffff) / 0x10000000
}

export function drawFineFloorTile(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number) {
  ctx.save()
  const px = x * tileSize
  const py = y * tileSize

  // Base fill (cool stone).
  ctx.fillStyle = COLORS.floor
  ctx.fillRect(px, py, tileSize, tileSize)

  // Fine grid lines inside each tile to imply smaller stones.
  const sub = 4
  const step = tileSize / sub
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let i = 1; i < sub; i++) {
    const p = Math.floor(i * step) + 0.5
    ctx.moveTo(px + p, py + 0.5)
    ctx.lineTo(px + p, py + tileSize - 0.5)
    ctx.moveTo(px + 0.5, py + p)
    ctx.lineTo(px + tileSize - 0.5, py + p)
  }
  ctx.stroke()

  // Subtle per-tile variation: tiny specks and a diagonal scratch.
  const r = hash2(x, y)
  ctx.fillStyle = 'rgba(0,0,0,0.10)'
  const specks = 2 + Math.floor(r * 3)
  for (let i = 0; i < specks; i++) {
    const rr = hash2(x + i * 11, y + i * 17)
    const sx = px + Math.floor(rr * (tileSize - 6)) + 3
    const sy = py + Math.floor(hash2(x + i * 29, y + i * 31) * (tileSize - 6)) + 3
    ctx.fillRect(sx, sy, 1, 1)
  }

  if (r > 0.55) {
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'
    ctx.beginPath()
    ctx.moveTo(px + tileSize * 0.18, py + tileSize * 0.74)
    ctx.lineTo(px + tileSize * 0.78, py + tileSize * 0.32)
    ctx.stroke()
  }

  ctx.restore()
}

