import { describe, expect, it } from 'vitest'
import { resolveSlide } from '../src/core/slide'

const makeEmptyLevel = (w: number, h: number) => {
  const tiles = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => (x === 0 || y === 0 || x === w - 1 || y === h - 1 ? 'wall' : 'floor')),
  )
  return { id: 't', width: w, height: h, tiles, entities: [], playerStart: { x: 1, y: 1, form: { axis: 'square', thickness: 3 }, alive: true, lastWallHitDir: null } }
}

describe('resolveSlide', () => {
  it('slides until blocked by wall', () => {
    const level = makeEmptyLevel(10, 8)
    const r = resolveSlide({
      level,
      entities: [],
      player: { x: 1, y: 2, form: { axis: 'square', thickness: 3 }, alive: true, lastWallHitDir: null },
    }, 'right')

    expect(r.reason.type).toBe('blocked')
    expect(r.steps).toBeGreaterThan(0)
  })

  it('stops on hazard interaction', () => {
    const level = makeEmptyLevel(10, 8)
    level.tiles[2][6] = 'spike'
    const r = resolveSlide({
      level,
      entities: [],
      player: { x: 1, y: 2, form: { axis: 'square', thickness: 3 }, alive: true, lastWallHitDir: null },
    }, 'right')

    expect(r.reason.type).toBe('hazard')
  })
})

