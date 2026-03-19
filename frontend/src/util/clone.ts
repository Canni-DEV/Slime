import type { EntityState, PlayerState } from '../core/types'

export function clonePlayer(player: PlayerState): PlayerState {
  return {
    x: player.x,
    y: player.y,
    shape: player.shape,
    alive: player.alive,
  }
}

export function cloneEntities(entities: EntityState[]): EntityState[] {
  return entities.map((e) => ({
    id: e.id,
    type: e.type,
    x: e.x,
    y: e.y,
  }))
}

