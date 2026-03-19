export type Direction = 'up' | 'down' | 'left' | 'right'

export type SlimeAxis = 'square' | 'horizontal' | 'vertical'

export type SlimeThickness = 1 | 2 | 3

export interface SlimeForm {
  readonly axis: SlimeAxis
  readonly thickness: SlimeThickness
}

export type TileType =
  | 'void'
  | 'floor'
  | 'wall'
  | 'goal'
  | 'spike'
  | 'plant'
  | 'stone'
  | 'passage_h'
  | 'passage_v'
  | 'passage_1x1'
  | 'switch'
  | 'door_closed'
  | 'door_open'

export type EntityType = 'player' | 'block'

export interface Cell {
  readonly x: number
  readonly y: number
}

export interface PlayerState {
  readonly x: number
  readonly y: number
  readonly form: SlimeForm
  readonly alive: boolean
  readonly lastWallHitDir: Direction | null
}

export interface EntityState {
  readonly id: string
  readonly type: EntityType
  readonly x: number
  readonly y: number
}

export interface LevelData {
  readonly id: string
  readonly width: number
  readonly height: number
  readonly tiles: TileType[][]
  readonly entities: EntityState[]
  readonly playerStart: PlayerState
}

export interface Snapshot {
  readonly player: PlayerState
  readonly entities: EntityState[]
}

export type GameStatus = 'playing' | 'dying' | 'won' | 'transition'

export interface GameState {
  readonly levelIndex: number
  readonly level: LevelData
  readonly player: PlayerState
  readonly entities: EntityState[]
  readonly status: GameStatus
  readonly moveCount: number
  readonly history: Snapshot[]
}

export interface Decal {
  readonly x: number
  readonly y: number
  readonly variant: 'hit' | 'slide' | 'death'
  readonly rotation: number
  readonly alpha: number
}

export type MoveAction = {
  readonly type: 'move'
  readonly direction: Direction
}

export type RestartAction = {
  readonly type: 'restart'
}

export type UndoAction = {
  readonly type: 'undo'
}

export type GameInputAction = MoveAction | RestartAction | UndoAction

