import type { SlimeForm, TileType } from './types'

export function canFormUseTile(form: SlimeForm, tile: TileType): boolean {
  if (tile === 'passage_1x1') return form.axis === 'square' && form.thickness === 3
  if (tile === 'passage_v') return form.axis === 'vertical'
  if (tile === 'passage_h') return form.axis === 'horizontal'
  return true
}

