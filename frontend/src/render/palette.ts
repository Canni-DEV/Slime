import type { TileType } from '../core/types'
import { COLORS } from '../app/config'

export function getTileFill(tile: TileType): string {
  switch (tile) {
    case 'void':
      return COLORS.voidBg
    case 'floor':
      return COLORS.floor
    case 'wall':
      return COLORS.wall
    case 'goal':
      return COLORS.goal
    case 'spike':
      return COLORS.spike
    case 'plant':
      return COLORS.plant
    case 'stone':
      return COLORS.stone
    case 'passage_h':
    case 'passage_v':
    case 'passage_1x1':
      return COLORS.passage
    case 'switch':
      return COLORS.floor
    case 'door_closed':
      return COLORS.wall
    case 'door_open':
      return COLORS.floor
    default: {
      // Exhaustiveness check.
      const _exhaustive: never = tile
      return _exhaustive
    }
  }
}

