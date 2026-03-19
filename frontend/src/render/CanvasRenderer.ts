import type { Decal, GameState } from '../core/types'
import { getOccupiedCells } from '../core/constants'
import { COLORS } from '../app/config'
import { drawDecals } from './decals'
import { drawHud } from './hud'
import { drawTransitionOverlay } from './transitions'
import { getTileFill } from './palette'

function drawSpikes(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number) {
  ctx.save()
  ctx.fillStyle = COLORS.spike
  ctx.translate(x * tileSize, y * tileSize)
  ctx.beginPath()
  ctx.moveTo(tileSize * 0.5, tileSize * 0.15)
  ctx.lineTo(tileSize * 0.15, tileSize * 0.85)
  ctx.lineTo(tileSize * 0.85, tileSize * 0.85)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number) {
  ctx.save()
  ctx.fillStyle = COLORS.plant
  ctx.translate(x * tileSize, y * tileSize)
  const cx = tileSize * 0.5
  const topY = tileSize * 0.2
  const baseY = tileSize * 0.9
  ctx.beginPath()
  ctx.moveTo(cx, baseY)
  ctx.quadraticCurveTo(cx + tileSize * 0.18, tileSize * 0.6, cx, topY)
  ctx.quadraticCurveTo(cx - tileSize * 0.18, tileSize * 0.6, cx, baseY)
  ctx.fill()
  ctx.restore()
}

function drawGoal(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number) {
  ctx.save()
  ctx.translate(x * tileSize, y * tileSize)
  ctx.fillStyle = COLORS.goal
  ctx.fillRect(tileSize * 0.18, tileSize * 0.22, tileSize * 0.64, tileSize * 0.56)
  ctx.strokeStyle = COLORS.goalRim
  ctx.lineWidth = Math.max(1, Math.floor(tileSize * 0.08))
  ctx.strokeRect(tileSize * 0.12 + 0.5, tileSize * 0.16 + 0.5, tileSize * 0.76, tileSize * 0.68)
  ctx.restore()
}

function drawWall(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number) {
  ctx.save()
  ctx.fillStyle = COLORS.wall
  ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
  // Edge highlight for contrast.
  ctx.fillStyle = COLORS.wallEdge
  ctx.fillRect(x * tileSize, y * tileSize, tileSize, Math.max(2, Math.floor(tileSize * 0.12)))
  ctx.restore()
}

function drawStone(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number) {
  ctx.save()
  ctx.fillStyle = COLORS.stone
  ctx.fillRect(x * tileSize + tileSize * 0.1, y * tileSize + tileSize * 0.1, tileSize * 0.8, tileSize * 0.8)
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.strokeRect(x * tileSize + tileSize * 0.1 + 0.5, y * tileSize + tileSize * 0.1 + 0.5, tileSize * 0.8 - 1, tileSize * 0.8 - 1)
  ctx.restore()
}

function drawPassage(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number) {
  ctx.save()
  ctx.fillStyle = 'rgba(67, 255, 122, 0.08)'
  ctx.fillRect(x * tileSize + tileSize * 0.15, y * tileSize + tileSize * 0.15, tileSize * 0.7, tileSize * 0.7)
  ctx.restore()
}

function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number) {
  ctx.save()
  ctx.fillStyle = COLORS.block
  ctx.fillRect(x * tileSize + tileSize * 0.12, y * tileSize + tileSize * 0.12, tileSize * 0.76, tileSize * 0.76)
  ctx.fillStyle = COLORS.blockDark
  ctx.fillRect(x * tileSize + tileSize * 0.18, y * tileSize + tileSize * 0.18, tileSize * 0.64, tileSize * 0.14)
  ctx.restore()
}

function drawPlayer(ctx: CanvasRenderingContext2D, state: GameState, tileSize: number) {
  const { player } = state
  ctx.save()
  ctx.globalAlpha = player.alive ? 1 : 0.75

  const occupied = getOccupiedCells(player.x, player.y, player.shape)
  const minX = Math.min(...occupied.map((c) => c.x))
  const minY = Math.min(...occupied.map((c) => c.y))
  const maxX = Math.max(...occupied.map((c) => c.x))
  const maxY = Math.max(...occupied.map((c) => c.y))

  const w = (maxX - minX + 1) * tileSize
  const h = (maxY - minY + 1) * tileSize
  const px = minX * tileSize
  const py = minY * tileSize

  // Outline.
  ctx.fillStyle = COLORS.slimeDark
  const r = Math.max(4, Math.floor(tileSize * 0.25))
  ctx.beginPath()
  ctx.roundRect(px + 2, py + 2, w - 4, h - 4, r)
  ctx.fill()

  // Body.
  ctx.fillStyle = COLORS.slime
  ctx.beginPath()
  ctx.roundRect(px + 4, py + 4, w - 8, h - 8, r * 0.9)
  ctx.fill()

  ctx.restore()
}

export function renderFrame(params: {
  ctx: CanvasRenderingContext2D
  state: GameState
  decals: readonly Decal[]
  tileSize: number
  transitionProgress01: number
  canvasW: number
  canvasH: number
}) {
  const { ctx, state, decals, tileSize, transitionProgress01, canvasW, canvasH } = params

  ctx.clearRect(0, 0, canvasW, canvasH)
  ctx.fillStyle = COLORS.voidBg
  ctx.fillRect(0, 0, canvasW, canvasH)

  // 1) floor / tiles.
  for (let y = 0; y < state.level.height; y++) {
    for (let x = 0; x < state.level.width; x++) {
      const tile = state.level.tiles[y][x]
      const fill = getTileFill(tile)
      ctx.fillStyle = fill
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)

      if (tile === 'wall') drawWall(ctx, x, y, tileSize)
      if (tile === 'stone') drawStone(ctx, x, y, tileSize)
      if (tile === 'spike') drawSpikes(ctx, x, y, tileSize)
      if (tile === 'plant') drawPlant(ctx, x, y, tileSize)
      if (tile === 'goal') drawGoal(ctx, x, y, tileSize)
      if (tile === 'passage_h' || tile === 'passage_v' || tile === 'passage_1x1') drawPassage(ctx, x, y, tileSize)
    }
  }

  // 2) decals (non-blocking, por debajo de entidades).
  drawDecals(ctx, decals, tileSize)

  // 3) blocks.
  for (const e of state.entities) {
    if (e.type === 'block') drawBlock(ctx, e.x, e.y, tileSize)
  }

  // 4) player.
  drawPlayer(ctx, state, tileSize)

  // 5) HUD.
  drawHud(ctx, state, canvasH)

  // 6) overlay transitions.
  drawTransitionOverlay(ctx, state.status, canvasW, canvasH, transitionProgress01)
}

