import type { Decal, GameState, LevelData } from '../core/types'
import { cloneEntities, clonePlayer } from '../util/clone'
import { loadAllLevels } from '../core/levelLoader'
import { canUndo, undoOneStep } from '../core/undo'
import { tryApplyMove } from '../core/simulateMove'
import { KeyboardController } from '../input/KeyboardController'
import { TILE_SIZE, TRANSITION } from './config'
import { renderFrame } from '../render/CanvasRenderer'

export class Game {
  private readonly levels: LevelData[]
  private readonly input: KeyboardController

  private state: GameState
  private decals: Decal[] = []

  private transitionStartMs: number | null = null
  private transitionDurationMs: number = 0

  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D

  private tileSize: number = TILE_SIZE
  private canvasW: number = 0
  private canvasH: number = 0
  private hudExtraPx: number = 64

  constructor(params: { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }) {
    this.canvas = params.canvas
    this.ctx = params.ctx

    this.levels = loadAllLevels()
    assert(this.levels.length > 0, 'No hay niveles cargados.')

    this.input = new KeyboardController(window)

    this.state = this.buildInitialState(0, this.levels[0])
    this.recomputeCanvasSize()
  }

  private buildInitialState(levelIndex: number, level: LevelData): GameState {
    return {
      levelIndex,
      level,
      player: {
        ...clonePlayer(level.playerStart),
        lastWallHitDir: null,
      },
      entities: cloneEntities(level.entities),
      status: 'playing',
      moveCount: 0,
      history: [],
    }
  }

  private recomputeCanvasSize() {
    this.canvasW = this.state.level.width * this.tileSize
    this.canvasH = this.state.level.height * this.tileSize + this.hudExtraPx
    this.canvas.width = this.canvasW
    this.canvas.height = this.canvasH
  }

  restartLevel() {
    this.decalReset()
    this.transitionStartMs = null
    this.transitionDurationMs = 0
    this.state = this.buildInitialState(this.state.levelIndex, this.state.level)
  }

  private decalReset() {
    this.decals = []
  }

  private loadLevelByIndex(nextIndex: number) {
    const level = this.levels[nextIndex]
    assert(level, `Nivel fuera de rango: ${nextIndex}`)
    this.decalReset()
    this.transitionStartMs = null
    this.transitionDurationMs = 0
    this.state = this.buildInitialState(nextIndex, level)
    this.recomputeCanvasSize()
  }

  private advanceLevel() {
    const nextIndex = this.state.levelIndex + 1
    if (nextIndex >= this.levels.length) {
      // Fin de campaña: dejamos el estado won en el último nivel.
      this.transitionStartMs = null
      this.transitionDurationMs = 0
      return
    }
    this.loadLevelByIndex(nextIndex)
  }

  private updateTransition(nowMs: number) {
    if (this.state.status === 'dying') {
      if (this.transitionStartMs === null) {
        this.transitionStartMs = nowMs
        this.transitionDurationMs = TRANSITION.deathMs
      }
      const elapsed = nowMs - this.transitionStartMs
      const progress01 = Math.min(1, elapsed / this.transitionDurationMs)
      if (progress01 >= 1) this.restartLevel()
      return
    }

    if (this.state.status === 'won') {
      if (this.transitionStartMs === null) {
        this.transitionStartMs = nowMs
        this.transitionDurationMs = TRANSITION.winMs
      }
      const elapsed = nowMs - this.transitionStartMs
      const progress01 = Math.min(1, elapsed / this.transitionDurationMs)
      if (progress01 >= 1) this.advanceLevel()
      return
    }

    this.transitionStartMs = null
    this.transitionDurationMs = 0
  }

  private getTransitionProgress01(nowMs: number): number {
    if (this.transitionStartMs === null || this.transitionDurationMs <= 0) return 0
    return Math.min(1, (nowMs - this.transitionStartMs) / this.transitionDurationMs)
  }

  update(nowMs: number) {
    const actions = this.input.pollActions()
    for (const action of actions) {
      if (action.type === 'restart') {
        this.restartLevel()
        continue
      }

      if (action.type === 'undo') {
        // Undo solo en estado estable.
        if (canUndo(this.state)) {
          this.decalReset()
          this.state = undoOneStep(this.state)
        }
        continue
      }

      if (action.type === 'move') {
        const result = tryApplyMove(this.state, action)
        this.state = result.nextState
        this.decals = this.decals.concat(result.decals).slice(-250)
      }
    }

    // Al final, avanzamos/transicionamos por tiempo. Así las entradas de un frame
    // se evalúan con el estado anterior (si no era `playing`, el move se ignora).
    this.updateTransition(nowMs)
  }

  render(nowMs: number) {
    const progress01 = this.getTransitionProgress01(nowMs)
    renderFrame({
      ctx: this.ctx,
      state: this.state,
      decals: this.decals,
      tileSize: this.tileSize,
      transitionProgress01: progress01,
      canvasW: this.canvasW,
      canvasH: this.canvasH,
    })
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

