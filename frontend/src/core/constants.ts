import type { Cell, Direction, SlimeShape, TileType } from './types'

export const SHAPE_FOOTPRINTS: Record<SlimeShape, Cell[]> = {
  normal: [{ x: 0, y: 0 }],
  horizontal: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ],
  vertical: [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
  ],
}

export const SHAPE_WALL_HIT_TRANSITIONS: Record<Direction, SlimeShape> = {
  left: 'vertical',
  right: 'vertical',
  up: 'horizontal',
  down: 'horizontal',
}

export const PASSAGE_SHAPE_ALLOWED: Partial<
  Record<Extract<TileType, 'passage_h' | 'passage_v' | 'passage_1x1'>, SlimeShape>
> = {
  passage_h: 'horizontal',
  passage_v: 'vertical',
  passage_1x1: 'normal',
}

export function getOccupiedCells(
  x: number,
  y: number,
  shape: SlimeShape,
): Cell[] {
  return SHAPE_FOOTPRINTS[shape].map((c) => ({ x: x + c.x, y: y + c.y }))
}

export function nextShapeOnWallHit(current: SlimeShape, dir: Direction): SlimeShape {
  // The prototype rule: any left/right "wall" tends to make slime vertical,
  // and any up/down "wall" tends to make slime horizontal.
  return SHAPE_WALL_HIT_TRANSITIONS[dir] ?? current
}

export function canShapeUseTile(shape: SlimeShape, tile: TileType): boolean {
  const allowed = PASSAGE_SHAPE_ALLOWED[tile as keyof typeof PASSAGE_SHAPE_ALLOWED]
  if (!allowed) return true
  return shape === allowed
}

