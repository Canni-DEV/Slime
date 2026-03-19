import type {
  Decal,
  GameState,
  GameStatus,
  LevelData,
  MoveAction,
  PlayerState,
} from './types'
import { canFormUseTile } from './constants'
import { getFootprintRect, getOccupiedCellsTopLeft, getTopLeftAfterResizeKeepingContact } from './footprint'
import { cloneEntities, clonePlayer } from '../util/clone'
import { resolveSlide } from './slide'
import { deformOnWallHit } from './deform'
import { isGoalTile, isHazardTile, isSolidTileForPlayer, tileAt } from './tileRules'

function findBlockAt(entities: GameState['entities'], x: number, y: number) {
  return entities.find((e) => e.type === 'block' && e.x === x && e.y === y)
}

function areOccupiedCellsValidForPlayer(
  level: LevelData,
  entities: GameState['entities'],
  player: PlayerState,
): boolean {
  const occupied = getOccupiedCellsTopLeft(player.x, player.y, player.form)
  for (const cell of occupied) {
    const tile = tileAt(level, cell.x, cell.y)
    if (isSolidTileForPlayer(tile)) return false
    if (!canFormUseTile(player.form, tile)) return false
    const block = findBlockAt(entities, cell.x, cell.y)
    if (block) return false
  }
  return true
}

function areOccupiedCellsTouchingHazard(
  level: LevelData,
  player: PlayerState,
): boolean {
  const occupied = getOccupiedCellsTopLeft(player.x, player.y, player.form)
  for (const cell of occupied) {
    if (isHazardTile(tileAt(level, cell.x, cell.y))) return true
  }
  return false
}

function isExitReached(level: LevelData, player: PlayerState): boolean {
  const occupied = getOccupiedCellsTopLeft(player.x, player.y, player.form)
  let sawGoal = false
  for (const cell of occupied) {
    const t = tileAt(level, cell.x, cell.y)
    if (!isGoalTile(t)) return false
    sawGoal = true
  }
  return sawGoal
}

// Pushing logic moved into `core/slide.ts`.

function makeSplatDecal(x: number, y: number, variant: Decal['variant']): Decal {
  // Deterministic tiny variation so traces feel less stamped.
  const r = ((x * 73856093) ^ (y * 19349663) ^ (variant === 'hit' ? 1 : variant === 'slide' ? 2 : 3)) >>> 0
  const rot = (r % 360) * (Math.PI / 180)
  return {
    x,
    y,
    variant,
    rotation: rot,
    alpha: variant === 'death' ? 0.9 : 0.55,
  }
}

function contactDecalCell(player: PlayerState, dir: MoveAction['direction']): { x: number; y: number } {
  const r = getFootprintRect(player.x, player.y, player.form)
  switch (dir) {
    case 'left':
      return { x: r.left, y: Math.floor((r.top + r.bottom) / 2) }
    case 'right':
      return { x: r.right, y: Math.floor((r.top + r.bottom) / 2) }
    case 'up':
      return { x: Math.floor((r.left + r.right) / 2), y: r.top }
    case 'down':
      return { x: Math.floor((r.left + r.right) / 2), y: r.bottom }
  }
}

export function tryApplyMove(state: GameState, action: MoveAction): { nextState: GameState; decals: Decal[] } {
  if (state.status !== 'playing') return { nextState: state, decals: [] }
  if (action.type !== 'move') return { nextState: state, decals: [] }

  const snapshot = {
    player: clonePlayer(state.player),
    entities: cloneEntities(state.entities),
  }

  let player = clonePlayer(state.player)
  let entities = cloneEntities(state.entities)
  let decals: Decal[] = []

  // Turn resolution order:
  // 1) Save undo snapshot already done.
  // 2..4) Resolve slide-until-interaction.
  const slide = resolveSlide(
    {
      level: state.level,
      entities: entities.filter((e) => e.type === 'block') as unknown as { id: string; type: 'block'; x: number; y: number }[],
      player,
    },
    action.direction,
  )
  player = slide.player
  entities = slide.entities.slice() as unknown as typeof entities

  if (slide.steps > 0) {
    // Trail marker: use current top-left as a proxy for the end of the slide.
    decals = decals.concat([makeSplatDecal(player.x, player.y, 'slide')])
  }

  if (slide.reason.type === 'blocked') {
    const deform = deformOnWallHit({
      current: player.form,
      lastWallHitDir: player.lastWallHitDir,
      hitDir: action.direction,
    })
    const newForm = deform.next
    const topLeft = getTopLeftAfterResizeKeepingContact({
      oldX: player.x,
      oldY: player.y,
      oldForm: player.form,
      newForm,
      contactDir: action.direction,
    })
    const transitioned: PlayerState = {
      ...player,
      x: topLeft.x,
      y: topLeft.y,
      form: newForm,
      lastWallHitDir: deform.nextLastWallHitDir,
    }
    if (areOccupiedCellsValidForPlayer(state.level, entities, transitioned)) {
      player = transitioned
      const c = contactDecalCell(player, action.direction)
      decals = decals.concat([makeSplatDecal(c.x, c.y, 'hit')])
    }
  }

  // 5) Resolve hazards.
  let status: GameStatus = 'playing'
  if (areOccupiedCellsTouchingHazard(state.level, player)) {
    player = { ...player, alive: false }
    status = 'dying'
    const c = contactDecalCell(player, action.direction)
    decals = decals.concat([makeSplatDecal(c.x, c.y, 'death')])
  } else {
    // 6) Resolve exit.
    if (isExitReached(state.level, player)) status = 'won'
  }

  const nextState: GameState = {
    ...state,
    player,
    entities,
    status,
    moveCount: state.moveCount + 1,
    history: [...state.history, snapshot],
  }

  return { nextState, decals }
}

