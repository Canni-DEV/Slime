import type { LevelData } from '../core/types'
import { COLORS } from '../app/config'
import { tileAt } from '../core/tileRules'

function isWallLike(level: LevelData, x: number, y: number): boolean {
  const t = tileAt(level, x, y)
  return t === 'wall' || t === 'stone' || t === 'door_closed' || t === 'void'
}

export function drawThickWallTile(
  ctx: CanvasRenderingContext2D,
  level: LevelData,
  x: number,
  y: number,
  tileSize: number,
) {
  ctx.save()
  const px = x * tileSize
  const py = y * tileSize

  // Core block.
  ctx.fillStyle = COLORS.wall
  ctx.fillRect(px, py, tileSize, tileSize)

  const capH = Math.max(3, Math.floor(tileSize * 0.16))
  const faceW = Math.max(3, Math.floor(tileSize * 0.18))

  const n = isWallLike(level, x, y - 1)
  const s = isWallLike(level, x, y + 1)
  const w = isWallLike(level, x - 1, y)
  const e = isWallLike(level, x + 1, y)

  // Top cap highlight (gives thickness).
  if (!n) {
    ctx.fillStyle = COLORS.wallEdge
    ctx.fillRect(px, py, tileSize, capH)
    // bevel line
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.beginPath()
    ctx.moveTo(px + 0.5, py + capH + 0.5)
    ctx.lineTo(px + tileSize - 0.5, py + capH + 0.5)
    ctx.stroke()
  }

  // Left/right faces (darker) when exposed.
  if (!w) {
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    ctx.fillRect(px, py, faceW, tileSize)
  }
  if (!e) {
    ctx.fillStyle = 'rgba(0,0,0,0.14)'
    ctx.fillRect(px + tileSize - faceW, py, faceW, tileSize)
  }

  // Bottom shadow lip when exposed.
  if (!s) {
    ctx.fillStyle = 'rgba(0,0,0,0.22)'
    ctx.fillRect(px, py + tileSize - Math.max(2, Math.floor(tileSize * 0.10)), tileSize, Math.max(2, Math.floor(tileSize * 0.10)))
  }

  // Corner hints.
  ctx.fillStyle = 'rgba(0,0,0,0.10)'
  if (!n && !w) ctx.fillRect(px, py, faceW, capH)
  if (!n && !e) ctx.fillRect(px + tileSize - faceW, py, faceW, capH)

  ctx.restore()
}

