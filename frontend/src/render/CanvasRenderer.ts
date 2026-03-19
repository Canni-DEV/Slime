import type { Decal, GameState } from '../core/types'
import { getFootprintSize } from '../core/footprint'
import { COLORS } from '../app/config'
import { drawDecals } from './decals'
import { drawHud } from './hud'
import { drawTransitionOverlay } from './transitions'
import { getTileFill } from './palette'
import { tileAt, isSolidTileForPlayer } from '../core/tileRules'
import { drawFineFloorTile } from './floor'
import { drawThickWallTile } from './walls'
import { drawTorchLights } from './lights'

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

function drawGoal(ctx: CanvasRenderingContext2D, state: GameState, x: number, y: number, tileSize: number) {
  ctx.save()
  ctx.translate(x * tileSize, y * tileSize)

  // Exit: hole embedded in the wall. We infer "embedding direction" by checking
  // which neighbor is solid (wall/stone/closed door/void).
  const leftSolid = isSolidTileForPlayer(tileAt(state.level, x - 1, y))
  const rightSolid = isSolidTileForPlayer(tileAt(state.level, x + 1, y))
  const upSolid = isSolidTileForPlayer(tileAt(state.level, x, y - 1))
  const downSolid = isSolidTileForPlayer(tileAt(state.level, x, y + 1))

  // Hole body (dark).
  ctx.fillStyle = COLORS.goal
  ctx.fillRect(tileSize * 0.16, tileSize * 0.20, tileSize * 0.68, tileSize * 0.60)

  // Rim (slightly lighter) with thicker stroke on the embedded edge.
  const base = Math.max(1, Math.floor(tileSize * 0.06))
  const thick = Math.max(base + 1, Math.floor(tileSize * 0.11))
  const rim = COLORS.goalRim

  // Top rim
  ctx.fillStyle = rim
  ctx.fillRect(tileSize * 0.12, tileSize * 0.16, tileSize * 0.76, upSolid ? thick : base)
  // Bottom rim
  ctx.fillRect(tileSize * 0.12, tileSize * 0.84 - (downSolid ? thick : base), tileSize * 0.76, downSolid ? thick : base)
  // Left rim
  ctx.fillRect(tileSize * 0.12, tileSize * 0.16, leftSolid ? thick : base, tileSize * 0.68)
  // Right rim
  ctx.fillRect(tileSize * 0.88 - (rightSolid ? thick : base), tileSize * 0.16, rightSolid ? thick : base, tileSize * 0.68)

  // Inner shadow to create depth, biased away from the wall side.
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  const sh = Math.floor(tileSize * 0.07)
  const biasX = leftSolid ? 1 : rightSolid ? -1 : 0
  const biasY = upSolid ? 1 : downSolid ? -1 : 0
  ctx.fillRect(tileSize * 0.16 + sh * 0.5 + biasX * sh, tileSize * 0.20 + sh * 0.5 + biasY * sh, tileSize * 0.68 - sh, tileSize * 0.60 - sh)

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

function drawTorch(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number) {
  ctx.save()
  ctx.translate(x * tileSize, y * tileSize)
  // Base bracket.
  ctx.fillStyle = 'rgba(20, 26, 36, 0.75)'
  ctx.fillRect(tileSize * 0.38, tileSize * 0.40, tileSize * 0.24, tileSize * 0.18)
  // Flame.
  ctx.fillStyle = 'rgba(255, 196, 92, 0.95)'
  ctx.beginPath()
  ctx.moveTo(tileSize * 0.5, tileSize * 0.26)
  ctx.quadraticCurveTo(tileSize * 0.64, tileSize * 0.40, tileSize * 0.5, tileSize * 0.54)
  ctx.quadraticCurveTo(tileSize * 0.36, tileSize * 0.40, tileSize * 0.5, tileSize * 0.26)
  ctx.fill()
  // Ember core.
  ctx.fillStyle = 'rgba(255, 120, 40, 0.85)'
  ctx.beginPath()
  ctx.arc(tileSize * 0.5, tileSize * 0.40, tileSize * 0.07, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawSign(ctx: CanvasRenderingContext2D, value: number | undefined, x: number, y: number, tileSize: number) {
  ctx.save()
  ctx.translate(x * tileSize, y * tileSize)
  ctx.fillStyle = 'rgba(20, 26, 36, 0.85)'
  ctx.fillRect(tileSize * 0.18, tileSize * 0.22, tileSize * 0.64, tileSize * 0.56)
  ctx.strokeStyle = 'rgba(255, 221, 120, 0.35)'
  ctx.lineWidth = Math.max(1, Math.floor(tileSize * 0.06))
  ctx.strokeRect(tileSize * 0.18 + 0.5, tileSize * 0.22 + 0.5, tileSize * 0.64 - 1, tileSize * 0.56 - 1)
  const label = typeof value === 'number' ? String(value) : '?'
  ctx.fillStyle = 'rgba(255, 221, 120, 0.85)'
  ctx.font = `${Math.max(10, Math.floor(tileSize * 0.32))}px system-ui, Segoe UI, Roboto, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(label, tileSize * 0.5, tileSize * 0.50)
  ctx.restore()
}

function drawPlayer(ctx: CanvasRenderingContext2D, state: GameState, tileSize: number) {
  const { player } = state
  ctx.save()
  ctx.globalAlpha = player.alive ? 1 : 0.75

  // Important: use footprint size directly, so we can animate using fractional x/y.
  const fp = getFootprintSize(player.form)
  const w = fp.w * tileSize
  const h = fp.h * tileSize
  const px = player.x * tileSize
  const py = player.y * tileSize

  const rBase = Math.max(4, Math.floor(tileSize * 0.26))
  const squeeze = player.form.axis === 'square' ? 0 : (3 - player.form.thickness) // 0..2
  const insetUnit = Math.floor(tileSize * 0.08)
  const inset = squeeze * insetUnit

  const insetL = player.lastWallHitDir === 'left' ? inset : 0
  const insetR = player.lastWallHitDir === 'right' ? inset : 0
  const insetT = player.lastWallHitDir === 'up' ? inset : 0
  const insetB = player.lastWallHitDir === 'down' ? inset : 0

  const outlinePad = 2
  const bodyPad = 4

  const ox = px + outlinePad + insetL
  const oy = py + outlinePad + insetT
  const ow = w - outlinePad * 2 - insetL - insetR
  const oh = h - outlinePad * 2 - insetT - insetB

  // Outline (darker).
  ctx.fillStyle = COLORS.slimeDark
  ctx.beginPath()
  ctx.roundRect(ox, oy, ow, oh, rBase)
  ctx.fill()

  // Body (brighter).
  ctx.fillStyle = COLORS.slime
  ctx.beginPath()
  ctx.roundRect(ox + (bodyPad - outlinePad), oy + (bodyPad - outlinePad), ow - (bodyPad - outlinePad) * 2, oh - (bodyPad - outlinePad) * 2, rBase * 0.9)
  ctx.fill()

  // Face (simple eyes + mouth), centered in current body rect.
  const cx = ox + ow * 0.5
  const cy = oy + oh * 0.55
  const eyeDx = Math.min(tileSize * 0.22, ow * 0.18)
  const eyeR = Math.max(2, Math.floor(Math.min(ow, oh) * 0.06))

  ctx.fillStyle = 'rgba(8, 10, 14, 0.7)'
  ctx.beginPath()
  ctx.arc(cx - eyeDx, cy - eyeR, eyeR, 0, Math.PI * 2)
  ctx.arc(cx + eyeDx, cy - eyeR, eyeR, 0, Math.PI * 2)
  ctx.fill()

  // Mouth: changes with thickness (more stressed when thinner).
  const mouthW = Math.min(ow * 0.38, tileSize * 0.55)
  const mouthH = Math.max(2, Math.floor((2 + squeeze) * 1.6))
  const mouthY = cy + eyeR * 1.6
  ctx.fillRect(cx - mouthW * 0.5, mouthY, mouthW, mouthH)

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
      // Floor gets its own fine pattern to match reference "dense grid".
      if (tile === 'floor' || tile === 'goal' || tile === 'passage_h' || tile === 'passage_v' || tile === 'passage_1x1') {
        drawFineFloorTile(ctx, x, y, tileSize)
      } else {
        const fill = getTileFill(tile)
        ctx.fillStyle = fill
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
      }

      if (tile === 'wall') drawThickWallTile(ctx, state.level, x, y, tileSize)
      if (tile === 'stone') drawStone(ctx, x, y, tileSize)
      if (tile === 'spike') drawSpikes(ctx, x, y, tileSize)
      if (tile === 'plant') drawPlant(ctx, x, y, tileSize)
      if (tile === 'goal') drawGoal(ctx, state, x, y, tileSize)
      if (tile === 'passage_h' || tile === 'passage_v' || tile === 'passage_1x1') drawPassage(ctx, x, y, tileSize)
    }
  }

  // 2) decals (non-blocking, por debajo de entidades).
  drawDecals(ctx, decals, tileSize)

  // 3) blocks.
  for (const e of state.entities) {
    if (e.type === 'block') drawBlock(ctx, e.x, e.y, tileSize)
  }

  // 3.5) decor entities.
  for (const e of state.entities) {
    if (e.type === 'torch') drawTorch(ctx, e.x, e.y, tileSize)
    if (e.type === 'sign') drawSign(ctx, e.value, e.x, e.y, tileSize)
  }

  // 4) player.
  drawPlayer(ctx, state, tileSize)

  // 5) HUD.
  drawHud(ctx, state, canvasH)

  // 5.5) warm light pools (must not obscure geometry).
  drawTorchLights(ctx, state, tileSize)

  // 6) overlay transitions.
  drawTransitionOverlay(ctx, state.status, canvasW, canvasH, transitionProgress01)
}

