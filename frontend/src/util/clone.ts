import type { EntityState, PlayerState } from '../core/types'

export function clonePlayer(player: PlayerState): PlayerState {
  return {
    x: player.x,
    y: player.y,
    form: {
      axis: player.form.axis,
      thickness: player.form.thickness,
    },
    alive: player.alive,
    lastWallHitDir: player.lastWallHitDir,
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

