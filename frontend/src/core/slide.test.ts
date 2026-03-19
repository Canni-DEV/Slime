import { describe, expect, it } from 'vitest'
import { resolveSlide } from './slide'
import type { LevelData, PlayerState } from './types'

function makeEmptyRoom(w: number, h: number): LevelData {
  const tiles: LevelData['tiles'] = []
  for (let y = 0; y < h; y++) {
    const row: LevelData['tiles'][number] = []
    for (let x = 0; x < w; x++) {
      const isEdge = x === 0 || y === 0 || x === w - 1 || y === h - 1
      row.push(isEdge ? 'wall' : 'floor')
    }
    tiles.push(row)
  }

  const playerStart: PlayerState = {
    x: 1,
    y: 1,
    form: { axis: 'square', thickness: 3 },
    alive: true,
    lastWallHitDir: null,
  }

  return { id: 'test', width: w, height: h, tiles, entities: [], playerStart }
}

describe('resolveSlide', () => {
  it('se mueve hasta bloquear contra pared', () => {
    const level = makeEmptyRoom(7, 7)
    const r = resolveSlide({ level, entities: [], player: level.playerStart }, 'right')
    expect(r.reason.type).toBe('blocked')
    expect(r.steps).toBeGreaterThan(0)
    // Debe terminar con el cuerpo pegado a la pared derecha interior (wall en x=6).
    // Como el slime square ocupa 2x2, su top-left máximo en x es 4 (ocupa x=4..5).
    expect(r.player.x).toBe(4)
    expect(r.player.y).toBe(1)
  })

  it('se detiene si pisa hazard', () => {
    const level = makeEmptyRoom(7, 7)
    level.tiles[1][3] = 'spike'
    const r = resolveSlide({ level, entities: [], player: level.playerStart }, 'right')
    expect(r.reason).toEqual({ type: 'hazard' })
    expect(r.player.x).toBe(2) // top-left en x=2 hace que ocupe x=2..3 (incluye spike x=3)
  })

  it('se detiene si pisa goal', () => {
    const level = makeEmptyRoom(7, 7)
    // Goal de 2x2, encaja con square.
    level.tiles[3][3] = 'goal'
    level.tiles[3][4] = 'goal'
    level.tiles[4][3] = 'goal'
    level.tiles[4][4] = 'goal'
    const player = { ...level.playerStart, x: 1, y: 3 }
    const r = resolveSlide({ level, entities: [], player }, 'right')
    expect(r.reason).toEqual({ type: 'goal' })
    // `resolveSlide` se detiene al tocar cualquier celda goal (la victoria completa
    // se valida en `simulateMove.isExitReached`).
    expect(r.player.x).toBe(2)
    expect(r.player.y).toBe(3)
  })

  it('empuja bloques si hay espacio', () => {
    const level = makeEmptyRoom(8, 6)
    const player = { ...level.playerStart, x: 1, y: 2 }
    const entities = [{ id: 'b1', type: 'block' as const, x: 4, y: 2 }]
    const r = resolveSlide({ level, entities, player }, 'right')
    // El jugador debe avanzar hasta quedar bloqueado por pared; el bloque se desplaza.
    expect(r.entities.find((e) => e.id === 'b1')?.x).toBeGreaterThan(4)
    expect(r.reason.type).toBe('blocked')
  })
})

