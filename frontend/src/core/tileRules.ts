import type { LevelData, TileType } from './types'

export function tileAt(level: LevelData, x: number, y: number): TileType {
  if (x < 0 || y < 0 || x >= level.width || y >= level.height) return 'void'
  return level.tiles[y][x]
}

export function isSolidTileForPlayer(tile: TileType): boolean {
  return tile === 'wall' || tile === 'stone' || tile === 'door_closed' || tile === 'void'
}

export function isHazardTile(tile: TileType): boolean {
  return tile === 'spike' || tile === 'plant'
}

export function isPassageTile(tile: TileType): boolean {
  return tile === 'passage_h' || tile === 'passage_v' || tile === 'passage_1x1'
}

export function isGoalTile(tile: TileType): boolean {
  return tile === 'goal'
}

