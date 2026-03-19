import type { Direction, SlimeAxis, SlimeForm, SlimeThickness } from './types'

function oppositeDir(dir: Direction): Direction {
  switch (dir) {
    case 'left':
      return 'right'
    case 'right':
      return 'left'
    case 'up':
      return 'down'
    case 'down':
      return 'up'
  }
}

function axisForWallHit(dir: Direction): Exclude<SlimeAxis, 'square'> {
  return dir === 'left' || dir === 'right' ? 'vertical' : 'horizontal'
}

function clampThickness(t: number): SlimeThickness {
  if (t <= 1) return 1
  if (t >= 3) return 3
  return 2
}

export function deformOnWallHit(params: {
  current: SlimeForm
  lastWallHitDir: Direction | null
  hitDir: Direction
}): { next: SlimeForm; nextLastWallHitDir: Direction } {
  const targetAxis = axisForWallHit(params.hitDir)

  // Entering squeeze mode or switching axis always sets thickness=2.
  if (params.current.axis === 'square' || params.current.axis !== targetAxis || params.lastWallHitDir === null) {
    return {
      next: { axis: targetAxis, thickness: 2 },
      nextLastWallHitDir: params.hitDir,
    }
  }

  // Same-axis behavior depends on repeating side vs opposite side.
  if (params.lastWallHitDir === params.hitDir) {
    const nextThickness = clampThickness(params.current.thickness - 1)
    return { next: { axis: targetAxis, thickness: nextThickness }, nextLastWallHitDir: params.hitDir }
  }

  if (oppositeDir(params.lastWallHitDir) === params.hitDir) {
    // Restore is gradual: 2 -> 3 (still elongated), then only the *next* opposite hit returns to square.
    if (params.current.thickness === 3) {
      return { next: { axis: 'square', thickness: 3 }, nextLastWallHitDir: params.hitDir }
    }
    const nextThickness = clampThickness(params.current.thickness + 1)
    return { next: { axis: targetAxis, thickness: nextThickness }, nextLastWallHitDir: params.hitDir }
  }

  // Shouldn't happen, but keep deterministic behavior.
  return {
    next: { axis: targetAxis, thickness: 2 },
    nextLastWallHitDir: params.hitDir,
  }
}

