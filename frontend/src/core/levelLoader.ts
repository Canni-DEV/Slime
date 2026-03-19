import type { EntityState, LevelData, PlayerState, TileType } from './types'

const TILE_TYPES: ReadonlySet<TileType> = new Set([
  'void',
  'floor',
  'wall',
  'goal',
  'spike',
  'plant',
  'stone',
  'passage_h',
  'passage_v',
  'passage_1x1',
  'switch',
  'door_closed',
  'door_open',
])

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function assertIsNumber(n: unknown, path: string): asserts n is number {
  assert(typeof n === 'number' && Number.isFinite(n), `Invalid number at ${path}`)
}

function assertIsString(s: unknown, path: string): asserts s is string {
  assert(typeof s === 'string', `Invalid string at ${path}`)
}

function assertIsTileType(t: unknown, path: string): asserts t is TileType {
  assert(typeof t === 'string' && TILE_TYPES.has(t as TileType), `Invalid tile type at ${path}: ${String(t)}`)
}

function assertIsCellArray(tiles: unknown, width: number, height: number, path: string): asserts tiles is TileType[][] {
  assert(Array.isArray(tiles), `Invalid tiles array at ${path}`)
  assert(tiles.length === height, `Invalid tiles height at ${path}: expected ${height}, got ${tiles.length}`)
  for (let y = 0; y < height; y++) {
    const row = tiles[y]
    assert(Array.isArray(row), `Invalid tiles row at ${path}[${y}]`)
    assert(row.length === width, `Invalid tiles row width at ${path}[${y}]: expected ${width}, got ${row.length}`)
    for (let x = 0; x < width; x++) {
      assertIsTileType(row[x], `${path}[${y}][${x}]`)
    }
  }
}

function assertIsEntity(e: unknown, path: string): asserts e is EntityState {
  assert(e !== null && typeof e === 'object', `Invalid entity at ${path}`)
  const obj = e as Record<string, unknown>
  assertIsString(obj.id, `${path}.id`)
  assert(obj.type === 'block', `Only 'block' entities are supported at ${path}.type`)
  assertIsNumber(obj.x, `${path}.x`)
  assertIsNumber(obj.y, `${path}.y`)
}

function assertIsPlayerStart(p: unknown, path: string): asserts p is PlayerState {
  assert(p !== null && typeof p === 'object', `Invalid playerStart at ${path}`)
  const obj = p as Record<string, unknown>
  assertIsNumber(obj.x, `${path}.x`)
  assertIsNumber(obj.y, `${path}.y`)
  assert(obj.form !== null && typeof obj.form === 'object', `Invalid player form at ${path}.form`)
  const form = obj.form as Record<string, unknown>
  assertIsString(form.axis, `${path}.form.axis`)
  assert(
    form.axis === 'square' || form.axis === 'horizontal' || form.axis === 'vertical',
    `Invalid player axis at ${path}.form.axis`,
  )
  assertIsNumber(form.thickness, `${path}.form.thickness`)
  assert(
    form.thickness === 1 || form.thickness === 2 || form.thickness === 3,
    `Invalid player thickness at ${path}.form.thickness`,
  )
  assert(typeof obj.alive === 'boolean', `Invalid player alive flag at ${path}.alive`)
  // Optional runtime field; Game will override to null on load.
  if ('lastWallHitDir' in obj && obj.lastWallHitDir !== null) {
    assertIsString(obj.lastWallHitDir, `${path}.lastWallHitDir`)
    assert(
      obj.lastWallHitDir === 'left' ||
        obj.lastWallHitDir === 'right' ||
        obj.lastWallHitDir === 'up' ||
        obj.lastWallHitDir === 'down',
      `Invalid lastWallHitDir at ${path}.lastWallHitDir`,
    )
  }
}

function coerceLevelData(raw: unknown, path: string): LevelData {
  assert(raw !== null && typeof raw === 'object', `Invalid level JSON at ${path}`)
  const obj = raw as Record<string, unknown>

  assertIsString(obj.id, `${path}.id`)
  assertIsNumber(obj.width, `${path}.width`)
  assertIsNumber(obj.height, `${path}.height`)

  const width = obj.width
  const height = obj.height

  assert(Array.isArray(obj.entities), `Invalid entities array at ${path}.entities`)
  for (let i = 0; i < obj.entities.length; i++) {
    assertIsEntity(obj.entities[i], `${path}.entities[${i}]`)
  }

  assertIsPlayerStart(obj.playerStart, `${path}.playerStart`)

  assertIsCellArray(obj.tiles, width, height, `${path}.tiles`)

  const tiles = obj.tiles as TileType[][]
  const entities = obj.entities as EntityState[]
  const playerStart = obj.playerStart as PlayerState

  // Normalize optional fields for deterministic state.
  const normalizedPlayerStart: PlayerState = {
    ...playerStart,
    lastWallHitDir: null,
  }

  return {
    id: obj.id,
    width,
    height,
    tiles,
    entities,
    playerStart: normalizedPlayerStart,
  }
}

export function loadAllLevels(): LevelData[] {
  const modules = import.meta.glob('../content/levels/*.json', { eager: true }) as Record<
    string,
    unknown
  >

  const levels: LevelData[] = []
  for (const [path, raw] of Object.entries(modules)) {
    // Vite hands the imported JSON directly as the module default in most setups.
    const levelRaw = raw && typeof raw === 'object' && 'default' in (raw as Record<string, unknown>)
      ? (raw as { default: unknown }).default
      : raw
    levels.push(coerceLevelData(levelRaw, path))
  }

  // Stable ordering: numeric suffix in `level_XX` when present, otherwise lexicographic by id.
  levels.sort((a, b) => {
    const na = parseInt(a.id.replace(/\D+/g, ''), 10)
    const nb = parseInt(b.id.replace(/\D+/g, ''), 10)
    const hasA = Number.isFinite(na)
    const hasB = Number.isFinite(nb)
    if (hasA && hasB) return na - nb
    return a.id.localeCompare(b.id)
  })

  return levels
}

