import type { Direction, LevelData, PlayerState } from './types'
import { canFormUseTile } from './constants'
import { getOccupiedCellsTopLeft } from './footprint'
import { isGoalTile, isHazardTile, isPassageTile, isSolidTileForPlayer, tileAt } from './tileRules'

export type SlideStopReason =
  | { readonly type: 'blocked' }
  | { readonly type: 'passage' }
  | { readonly type: 'goal' }
  | { readonly type: 'hazard' }
  | { readonly type: 'maxSteps' }
  | { readonly type: 'none' }

type BlockEntity = { readonly id: string; readonly type: 'block'; readonly x: number; readonly y: number }

export interface SlideResult {
  readonly player: PlayerState
  readonly entities: readonly BlockEntity[]
  readonly reason: SlideStopReason
  readonly steps: number
}

export interface SlideContext {
  readonly level: LevelData
  readonly entities: readonly BlockEntity[]
  readonly player: PlayerState
}

function dirDelta(dir: Direction): { dx: number; dy: number } {
  switch (dir) {
    case 'left':
      return { dx: -1, dy: 0 }
    case 'right':
      return { dx: 1, dy: 0 }
    case 'up':
      return { dx: 0, dy: -1 }
    case 'down':
      return { dx: 0, dy: 1 }
  }
}

function findBlockAt(
  entities: readonly BlockEntity[],
  x: number,
  y: number,
) {
  return entities.find((e) => e.x === x && e.y === y)
}

function canPlayerOccupy(ctx: SlideContext, player: PlayerState): boolean {
  const occupied = getOccupiedCellsTopLeft(player.x, player.y, player.form)
  for (const cell of occupied) {
    const tile = tileAt(ctx.level, cell.x, cell.y)
    if (isSolidTileForPlayer(tile)) return false
    if (!canFormUseTile(player.form, tile)) return false
    if (findBlockAt(ctx.entities, cell.x, cell.y)) return false
  }
  return true
}

function detectInteraction(level: LevelData, player: PlayerState): SlideStopReason {
  const occupied = getOccupiedCellsTopLeft(player.x, player.y, player.form)
  let sawPassage = false
  let sawGoal = false
  for (const c of occupied) {
    const t = tileAt(level, c.x, c.y)
    if (isHazardTile(t)) return { type: 'hazard' }
    if (isGoalTile(t)) sawGoal = true
    if (isPassageTile(t)) sawPassage = true
  }
  if (sawGoal) return { type: 'goal' }
  if (sawPassage) return { type: 'passage' }
  return { type: 'none' }
}

function attemptPushBlocks(
  level: LevelData,
  entities: readonly BlockEntity[],
  player: PlayerState,
  dir: Direction,
): readonly BlockEntity[] | null {
  const { dx, dy } = dirDelta(dir)
  const occupied = getOccupiedCellsTopLeft(player.x, player.y, player.form)
  const blocksToPush: { id: string; x: number; y: number }[] = []

  for (const cell of occupied) {
    const fx = cell.x + dx
    const fy = cell.y + dy
    const hit = findBlockAt(entities, fx, fy)
    if (hit) {
      if (!blocksToPush.some((b) => b.id === hit.id)) blocksToPush.push({ id: hit.id, x: hit.x, y: hit.y })
    }
  }

  if (blocksToPush.length === 0) return entities

  const toPushIds = new Set(blocksToPush.map((b) => b.id))
  for (const b of blocksToPush) {
    const destX = b.x + dx
    const destY = b.y + dy
    const destTile = tileAt(level, destX, destY)
    if (isSolidTileForPlayer(destTile)) return null
    const occupant = findBlockAt(entities, destX, destY)
    if (occupant && !toPushIds.has(occupant.id)) return null
  }

  return entities.map((e) => (toPushIds.has(e.id) ? { ...e, x: e.x + dx, y: e.y + dy } : e))
}

export function resolveSlide(ctx: SlideContext, dir: Direction): SlideResult {
  const maxSteps = Math.max(1, ctx.level.width * ctx.level.height + 5)
  let player = ctx.player
  let entities = ctx.entities
  let steps = 0

  for (let i = 0; i < maxSteps; i++) {
    const { dx, dy } = dirDelta(dir)

    // Before attempting to step, see if a push is required for this step.
    const pushed = attemptPushBlocks(ctx.level, entities, player, dir)
    if (pushed === null) {
      return { player, entities, reason: { type: 'blocked' }, steps }
    }
    entities = pushed

    const candidate: PlayerState = { ...player, x: player.x + dx, y: player.y + dy }
    const nextCtx: SlideContext = { level: ctx.level, entities, player: candidate }
    if (!canPlayerOccupy(nextCtx, candidate)) {
      return { player, entities, reason: { type: 'blocked' }, steps }
    }

    player = candidate
    steps++

    const interaction = detectInteraction(ctx.level, player)
    if (interaction.type !== 'none') {
      return { player, entities, reason: interaction, steps }
    }
  }

  return { player, entities, reason: { type: 'maxSteps' }, steps }
}

