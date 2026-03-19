import type {
  Decal,
  Direction,
  GameState,
  GameStatus,
  LevelData,
  MoveAction,
  PlayerState,
  TileType,
} from './types'
import {
  canShapeUseTile,
  getOccupiedCells,
  nextShapeOnWallHit,
} from './constants'
import { cloneEntities, clonePlayer } from '../util/clone'

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

function isSolidTileForBlock(tile: TileType): boolean {
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
  const occupied = getOccupiedCells(player.x, player.y, player.shape)
  for (const cell of occupied) {
    const tile = tileAt(level, cell.x, cell.y)
    if (isSolidTileForPlayer(tile)) return false
    if (!canShapeUseTile(player.shape, tile)) return false
    const block = findBlockAt(entities, cell.x, cell.y)
    if (block) return false
  }
  return true
}

function areOccupiedCellsTouchingHazard(
  level: LevelData,
  player: PlayerState,
): boolean {
  const occupied = getOccupiedCells(player.x, player.y, player.shape)
  for (const cell of occupied) {
    if (isHazardTile(tileAt(level, cell.x, cell.y))) return true
  }
  return false
}

function isExitReached(level: LevelData, player: PlayerState): boolean {
  const occupied = getOccupiedCells(player.x, player.y, player.shape)

  const goalCells: { x: number; y: number }[] = []
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      if (level.tiles[y][x] === 'goal') goalCells.push({ x, y })
    }
  }

  // "Fully fit into exit-valid position" interpretation:
  // The slime footprint must match the exit footprint exactly (same number of cells,
  // and all those cells must be goal tiles).
  if (goalCells.length === 0) return false
  if (occupied.length !== goalCells.length) return false

  const occupiedSet = new Set(occupied.map((c) => `${c.x},${c.y}`))
  for (const g of goalCells) {
    if (!occupiedSet.has(`${g.x},${g.y}`)) return false
  }
  return true
}

function attemptPushBlocks(level: LevelData, entities: GameState['entities'], player: PlayerState, dir: Direction) {
  const { dx, dy } = dirDelta(dir)
  const occupied = getOccupiedCells(player.x, player.y, player.shape)
  const blocksToPush: { id: string; x: number; y: number }[] = []

  for (const cell of occupied) {
    const frontX = cell.x + dx
    const frontY = cell.y + dy
    const hit = findBlockAt(entities, frontX, frontY)
    if (hit) {
      if (!blocksToPush.some((b) => b.id === hit.id)) blocksToPush.push({ id: hit.id, x: hit.x, y: hit.y })
    }
  }

  if (blocksToPush.length === 0) {
    return entities
  }

  const toPushIds = new Set(blocksToPush.map((b) => b.id))

  for (const b of blocksToPush) {
    const destX = b.x + dx
    const destY = b.y + dy
    const destTile = tileAt(level, destX, destY)
    if (isSolidTileForBlock(destTile)) return entities

    // If another (non-pushed) block occupies the destination, pushing fails.
    const occupant = findBlockAt(entities, destX, destY)
    if (occupant && !toPushIds.has(occupant.id)) return entities
  }

  // Apply push simultaneously.
  return entities.map((e) => {
    if (!toPushIds.has(e.id)) return e
    return {
      id: e.id,
      type: e.type,
      x: e.x + dx,
      y: e.y + dy,
    }
  })
}

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

  const { dx, dy } = dirDelta(action.direction)
  const snapshot = {
    player: clonePlayer(state.player),
    entities: cloneEntities(state.entities),
  }

  let player = clonePlayer(state.player)
  let entities = cloneEntities(state.entities)
  let decals: Decal[] = []

  // Turn resolution order:
  // 1) Save undo snapshot already done.
  // 2) Attempt push interaction.
  entities = attemptPushBlocks(state.level, entities, player, action.direction)

  // 3) Attempt movement.
  const moved: PlayerState = { ...player, x: player.x + dx, y: player.y + dy }
  if (areOccupiedCellsValidForPlayer(state.level, entities, moved)) {
    player = moved
  } else {
    // 4) If blocked, resolve wall-hit shape transition.
    const nextShape = nextShapeOnWallHit(player.shape, action.direction)
    const transitioned: PlayerState = { ...player, shape: nextShape }
    if (areOccupiedCellsValidForPlayer(state.level, entities, transitioned)) {
      player = transitioned
      decals = [makeSplatDecal(player.x, player.y, 'hit')]
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

