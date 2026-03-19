import { describe, expect, it } from 'vitest'
import { deformOnWallHit } from './deform'
import type { SlimeForm } from './types'

describe('deformOnWallHit', () => {
  it('entra a modo comprimido al primer golpe desde square', () => {
    const current: SlimeForm = { axis: 'square', thickness: 3 }
    const r = deformOnWallHit({ current, lastWallHitDir: null, hitDir: 'left' })
    expect(r.next).toEqual({ axis: 'vertical', thickness: 2 })
    expect(r.nextLastWallHitDir).toBe('left')
  })

  it('repetir el mismo lado comprime más (hasta thickness=1)', () => {
    const current: SlimeForm = { axis: 'vertical', thickness: 2 }
    const r1 = deformOnWallHit({ current, lastWallHitDir: 'left', hitDir: 'left' })
    expect(r1.next).toEqual({ axis: 'vertical', thickness: 1 })
    const r2 = deformOnWallHit({ current: r1.next, lastWallHitDir: r1.nextLastWallHitDir, hitDir: 'left' })
    expect(r2.next).toEqual({ axis: 'vertical', thickness: 1 })
  })

  it('golpear el lado opuesto restaura y vuelve a square al llegar a thickness=3', () => {
    const current: SlimeForm = { axis: 'vertical', thickness: 2 }
    const r1 = deformOnWallHit({ current, lastWallHitDir: 'left', hitDir: 'right' })
    expect(r1.next).toEqual({ axis: 'vertical', thickness: 3 })
    const r2 = deformOnWallHit({ current: r1.next, lastWallHitDir: r1.nextLastWallHitDir, hitDir: 'left' })
    expect(r2.next).toEqual({ axis: 'square', thickness: 3 })
  })

  it('cambiar de eje resetea thickness=2', () => {
    const current: SlimeForm = { axis: 'vertical', thickness: 1 }
    const r = deformOnWallHit({ current, lastWallHitDir: 'left', hitDir: 'up' })
    expect(r.next).toEqual({ axis: 'horizontal', thickness: 2 })
  })
})

