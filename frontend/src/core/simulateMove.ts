import type {
  Decal,
  GameState,
  GameStatus,
  LevelData,
  MoveAction,
  PlayerState,
  TileType,
} from './types'
import { canFormUseTile } from './constants'
import { getOccupiedCellsTopLeft, getTopLeftAfterResizeKeepingContact } from './footprint'
import { cloneEntities, clonePlayer } from '../util/clone'
import { resolveSlide } from './slide'
import { deformOnWallHit } from './deform'

function tileAt(level: LevelData, x: number, y: number): TileType {
  if (x < 0 || y < 0 || x >= level.width || y >= level.height) return 'void'
  return level.tiles[y][x]
}

function isHazardTile(tile: TileType): boolean {
  return tile === 'spike' || tile === 'plant'
}

function isSolidTileForPlayer(tile: TileType): boolean {
  return tile === 'wall' || tile === 'stone' || tile === 'door_closed' || tile === 'void'
}

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
    if (t !== 'goal') return false
    sawGoal = true
  }
  return sawGoal
}

// Pushing logic moved into `core/slide.ts`.

function makeSplatDecal(x: number, y: number, variant: Decal['variant']): Decal {
  return {
    x,
    y,
    variant,
    rotation: 0,
    alpha: variant === 'death' ? 0.9 : 0.55,
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
      decals = decals.concat([makeSplatDecal(player.x, player.y, 'hit')])
    }
  }

  // 5) Resolve hazards.
  let status: GameStatus = 'playing'
  if (areOccupiedCellsTouchingHazard(state.level, player)) {
    player = { ...player, alive: false }
    status = 'dying'
    decals = decals.concat([makeSplatDecal(player.x, player.y, 'death')])
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

