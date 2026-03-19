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

  private moveAnim:
    | null
    | {
        readonly from: GameState
        readonly to: GameState
        readonly startMs: number
        readonly durationMs: number
      } = null

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
    if (this.moveAnim) {
      const elapsed = nowMs - this.moveAnim.startMs
      if (elapsed >= this.moveAnim.durationMs) this.moveAnim = null
    }

    const actions = this.input.pollActions()
    for (const action of actions) {
      if (action.type === 'restart') {
        this.restartLevel()
        continue
      }

      if (action.type === 'undo') {
        // Undo solo en estado estable.
        if (!this.moveAnim && canUndo(this.state)) {
          this.decalReset()
          this.state = undoOneStep(this.state)
        }
        continue
      }

      if (action.type === 'move') {
        // No encadenar inputs mientras una animación está en curso.
        if (this.moveAnim) continue

        const from = this.state
        const result = tryApplyMove(this.state, action)
        const to = result.nextState

        // Si no hubo cambio, no animamos.
        if (to === from) continue

        this.state = to
        this.decals = this.decals.concat(result.decals).slice(-250)
        this.moveAnim = { from, to, startMs: nowMs, durationMs: TRANSITION.slideMs }
      }
    }

    // Al final, avanzamos/transicionamos por tiempo. Así las entradas de un frame
    // se evalúan con el estado anterior (si no era `playing`, el move se ignora).
    if (this.moveAnim) return
    this.updateTransition(nowMs)
  }

  private getMoveAnimProgress01(nowMs: number): number {
    if (!this.moveAnim) return 1
    const elapsed = nowMs - this.moveAnim.startMs
    return Math.max(0, Math.min(1, elapsed / this.moveAnim.durationMs))
  }

  private buildRenderState(nowMs: number): GameState {
    if (!this.moveAnim) return this.state
    const t = this.getMoveAnimProgress01(nowMs)
    const from = this.moveAnim.from
    const to = this.moveAnim.to

    // During movement we keep the *from* form until the end, so the slime feels
    // like a mass sliding, then reshaping at impact.
    const player = {
      ...to.player,
      x: from.player.x + (to.player.x - from.player.x) * t,
      y: from.player.y + (to.player.y - from.player.y) * t,
      form: t >= 1 ? to.player.form : from.player.form,
      lastWallHitDir: t >= 1 ? to.player.lastWallHitDir : from.player.lastWallHitDir,
    }

    // Interpolate blocks too (only those that moved).
    const byIdFrom = new Map(from.entities.map((e) => [e.id, e] as const))
    const entities = to.entities.map((e) => {
      const prev = byIdFrom.get(e.id)
      if (!prev || prev.type !== e.type) return e
      if (t >= 1) return e
      return { ...e, x: prev.x + (e.x - prev.x) * t, y: prev.y + (e.y - prev.y) * t }
    })

    return { ...to, player, entities }
  }

  render(nowMs: number) {
    const progress01 = this.getTransitionProgress01(nowMs)
    const renderState = this.buildRenderState(nowMs)
    renderFrame({
      ctx: this.ctx,
      state: renderState,
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

