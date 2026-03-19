# Slime — Trazabilidad funcional (doc → implementación)

Este archivo mapea los requerimientos funcionales/identitarios de `Slime-functional-implementation.md` a la implementación actual del proyecto (frontend TS + Canvas 2D), e indica brechas y puntos de mejora.

## Mecánica central: deslizamiento automático
- **Requerimiento (doc)**: cada input dispara un deslizamiento completo hasta colisión/stopper; no hay control continuo durante el slide.
- **Implementación**:
  - `frontend/src/app/Game.ts`: input discreto (`pollActions`) → `tryApplyMove`.
  - `frontend/src/core/slide.ts`: `resolveSlide()` itera pasos hasta interacción (`blocked`, `goal`, `hazard`, `passage`).
- **Brechas**:
  - No existe animación de slide por tiempo (hoy es instantáneo; `TRANSITION.slideMs` está definido pero no aplicado al movimiento).

## Mecánica central: deformación por impacto con memoria
- **Requerimiento (doc)**:
  - golpear un lado comprime ese eje y estira el perpendicular
  - repetir el mismo lado comprime más
  - golpear el lado opuesto restaura grosor hasta volver a estado “cuadrado”
  - la forma tiene “memoria” del orden de impactos
- **Implementación**:
  - `frontend/src/core/deform.ts`: `deformOnWallHit({ current, lastWallHitDir, hitDir })`
    - cambia `axis` según el lado impactado
    - repitiendo mismo `hitDir` reduce `thickness`
    - impactando lado opuesto aumenta `thickness` y vuelve a `square` en `thickness=3`
  - `frontend/src/core/simulateMove.ts`: si el slide termina en `blocked`, aplica deformación y reajusta top-left manteniendo contacto vía `getTopLeftAfterResizeKeepingContact()`.
- **Brechas**:
  - El modelo de forma es discreto (`thickness` 1..3). Puede ser suficiente para el feel, pero no representa estados “intermedios” observados (si se buscan).

## Objetivo del cuarto: salida con validación de forma
- **Requerimiento (doc)**: llegar a la salida con la orientación/dimensiones correctas; la salida “valida” la forma.
- **Implementación**:
  - `frontend/src/core/simulateMove.ts`: `isExitReached()` exige que todas las celdas ocupadas por el slime sean `goal`.
  - `frontend/src/core/constants.ts`: pasajes `passage_*` limitan por forma (p.ej `passage_1x1` solo square thickness=3).
- **Brechas**:
  - Visualmente la salida no “lee” como abertura empotrada en pared (hoy es un rectángulo oscuro en el piso).

## Claridad single-screen y legibilidad
- **Requerimiento (doc)**: el cuarto entero visible; geometría legible; estado del slime legible de un vistazo.
- **Implementación**:
  - `frontend/src/render/CanvasRenderer.ts`: render de tiles, entidades, slime (con cara) y HUD.
  - `frontend/src/render/hud.ts`: nivel y contador de movimientos + hints.
- **Brechas**:
  - Piso sin “grilla fina” (hoy es plano por tile).
  - Paredes sin grosor modular (hoy wall tile plano con highlight).

## Identidad estética: mazmorra de piedra + contraste frío/cálido
- **Requerimiento (doc)**:
  - piso con grilla fina de losas pequeñas
  - paredes gruesas con trims y esquinas
  - luz cálida (antorchas) sobre piedra fría
  - salida tipo tubo/desagüe empotrado
  - señalética (placas/labels)
  - trazas verdes del slime en impacto/corners
- **Implementación**:
  - Paleta base en `frontend/src/app/config.ts`.
  - Decals básicos (`hit/slide/death`) desde `frontend/src/core/simulateMove.ts` y render en `frontend/src/render/decals.ts`.
- **Brechas**:
  - No hay antorchas/iluminación.
  - No hay señalética in-world (solo HUD).
  - Decals no están orientados/anclados al punto real de impacto.

## Principios de diseño de niveles (geometría como puzzle)
- **Requerimiento (doc)**: cada pared importa; 1 idea principal por cuarto; open space con restricciones quirúrgicas; pasillos angostos como “checks”.
- **Implementación**:
  - Niveles en `frontend/src/content/levels/*.json` con `tiles` + `entities` + `playerStart`.
- **Brechas**:
  - Requiere auditoría: asegurar progresión e intención (sin “laberinto genérico”).

