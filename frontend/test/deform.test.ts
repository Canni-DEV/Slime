import { describe, expect, it } from 'vitest'
import { deformOnWallHit } from '../src/core/deform'

describe('deformOnWallHit', () => {
  it('square -> vertical@2 on left hit', () => {
    const r = deformOnWallHit({
      current: { axis: 'square', thickness: 3 },
      lastWallHitDir: null,
      hitDir: 'left',
    })
    expect(r.next).toEqual({ axis: 'vertical', thickness: 2 })
    expect(r.nextLastWallHitDir).toBe('left')
  })

  it('repeated same-side hits shrink 2 -> 1', () => {
    const r1 = deformOnWallHit({
      current: { axis: 'vertical', thickness: 2 },
      lastWallHitDir: 'left',
      hitDir: 'left',
    })
    expect(r1.next).toEqual({ axis: 'vertical', thickness: 1 })

    const r2 = deformOnWallHit({
      current: r1.next,
      lastWallHitDir: r1.nextLastWallHitDir,
      hitDir: 'left',
    })
    expect(r2.next).toEqual({ axis: 'vertical', thickness: 1 })
  })

  it('opposite-side hits widen and can return to square@3', () => {
    const r1 = deformOnWallHit({
      current: { axis: 'vertical', thickness: 1 },
      lastWallHitDir: 'left',
      hitDir: 'right',
    })
    expect(r1.next).toEqual({ axis: 'vertical', thickness: 2 })

    const r2 = deformOnWallHit({
      current: r1.next,
      lastWallHitDir: r1.nextLastWallHitDir,
      hitDir: 'left',
    })
    expect(r2.next).toEqual({ axis: 'vertical', thickness: 3 })

    const r3 = deformOnWallHit({
      current: r2.next,
      lastWallHitDir: r2.nextLastWallHitDir,
      hitDir: 'right',
    })
    expect(r3.next).toEqual({ axis: 'square', thickness: 3 })
  })
})

