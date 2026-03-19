import { Game } from './Game'

export function startGame() {
  const appEl = document.querySelector<HTMLDivElement>('#app')
  assert(appEl, 'No se encontró el contenedor #app')

  // Limpieza total del template Vite, para que el juego ocupe toda la vista.
  appEl.innerHTML = '<canvas id="game"></canvas>'

  const canvas = appEl.querySelector<HTMLCanvasElement>('#game')
  assert(canvas, 'No se encontró el canvas #game')
  const ctx = canvas.getContext('2d')
  assert(ctx, 'No se pudo obtener el contexto 2D del canvas')

  // Estilo: mantenemos el canvas centrado y con borde suave.
  canvas.style.display = 'block'
  canvas.style.margin = '0 auto'
  canvas.style.background = '#0000'

  // El Game ajusta el tamaño y pinta.
  const game = new Game({ canvas, ctx })

  const frame = (nowMs: number) => {
    game.update(nowMs)
    game.render(nowMs)
    window.requestAnimationFrame(frame)
  }

  window.requestAnimationFrame(frame)

  // Evitamos que el navegador haga zoom/pinch raro en canvas.
  canvas.tabIndex = 0
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

