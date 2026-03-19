import type { Cell, Direction, SlimeForm } from './types'

export interface FootprintSize {
  readonly w: number
  readonly h: number
}

export interface FootprintRect {
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
}

export function getFootprintSize(form: SlimeForm): FootprintSize {
  // Baseline mapping for 3→2→1 (ajustable después con más evidencia del original).
  // square@3: 2x2 (inicio)
  // vertical@2: 1x3, vertical@1: 1x4
  // horizontal@2: 3x1, horizontal@1: 4x1
  if (form.axis === 'square') return { w: 2, h: 2 }
  if (form.axis === 'vertical') return { w: 1, h: form.thickness === 2 ? 3 : 4 }
  return { w: form.thickness === 2 ? 3 : 4, h: 1 }
}

export function getFootprintRect(x: number, y: number, form: SlimeForm): FootprintRect {
  const { w, h } = getFootprintSize(form)
  return { left: x, top: y, right: x + (w - 1), bottom: y + (h - 1) }
}

export function getOccupiedCellsTopLeft(x: number, y: number, form: SlimeForm): Cell[] {
  const { w, h } = getFootprintSize(form)
  const cells: Cell[] = []
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) {
      cells.push({ x: x + xx, y: y + yy })
    }
  }
  return cells
}

export function getTopLeftAfterResizeKeepingContact(params: {
  oldX: number
  oldY: number
  oldForm: SlimeForm
  newForm: SlimeForm
  contactDir: Direction
}): { x: number; y: number } {
  const oldRect = getFootprintRect(params.oldX, params.oldY, params.oldForm)
  const { w: newW, h: newH } = getFootprintSize(params.newForm)

  switch (params.contactDir) {
    case 'left': {
      // Preserve left edge + top edge.
      return { x: oldRect.left, y: oldRect.top }
    }
    case 'right': {
      // Preserve right edge + top edge.
      return { x: oldRect.right - (newW - 1), y: oldRect.top }
    }
    case 'up': {
      // Preserve top edge + left edge.
      return { x: oldRect.left, y: oldRect.top }
    }
    case 'down': {
      // Preserve bottom edge + left edge.
      return { x: oldRect.left, y: oldRect.bottom - (newH - 1) }
    }
  }
}

