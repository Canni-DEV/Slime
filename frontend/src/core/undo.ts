import type { GameState } from './types'

export function canUndo(state: GameState): boolean {
  return state.status === 'playing' && state.history.length > 0
}

export function undoOneStep(state: GameState): GameState {
  if (!canUndo(state)) return state
  const history = state.history.slice(0, -1)
  const snapshot = state.history[state.history.length - 1]
  return {
    ...state,
    player: snapshot.player,
    entities: snapshot.entities,
    status: 'playing',
    moveCount: Math.max(0, state.moveCount - 1),
    history,
  }
}

