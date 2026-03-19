import type { Direction, GameInputAction } from '../core/types'

function keyToDirection(key: string): Direction | null {
  switch (key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      return 'up'
    case 'ArrowDown':
    case 's':
    case 'S':
      return 'down'
    case 'ArrowLeft':
    case 'a':
    case 'A':
      return 'left'
    case 'ArrowRight':
    case 'd':
    case 'D':
      return 'right'
    default:
      return null
  }
}

export class KeyboardController {
  private readonly queue: GameInputAction[] = []
  private readonly onKeyDown: (e: KeyboardEvent) => void

  constructor(target: Window = window) {
    this.onKeyDown = (e) => {
      // Prototype rule: one move per keypress.
      if (e.repeat) return

      const dir = keyToDirection(e.key)
      if (dir) {
        e.preventDefault()
        this.queue.push({ type: 'move', direction: dir })
        return
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        this.queue.push({ type: 'restart' })
        return
      }

      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault()
        this.queue.push({ type: 'undo' })
        return
      }
    }

    target.addEventListener('keydown', this.onKeyDown)
  }

  pollActions(): GameInputAction[] {
    const actions = this.queue.splice(0, this.queue.length)
    return actions
  }
}

