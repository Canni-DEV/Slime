# Slime — Auditoría rápida de niveles (01–10)

Objetivo: asegurar progresión clara, “1 idea principal por sala” y uso de geometría como herramienta (no laberinto genérico), en línea con `Slime-functional-implementation.md`.

## Resumen por nivel
- **Nivel 1**: introducción al deslizamiento + salida 2x2 (encastre básico).
- **Nivel 2**: primeras restricciones internas (columna de paredes) → aprender a usar topes intermedios.
- **Nivel 3**: corredor lateral y bloque de pared parcial → planificación de ruta con “recorte” de espacio.
- **Nivel 4**: estructura interna más “arquitectónica” (bloque de paredes) → orden de impactos para alinearse con salida.
- **Nivel 5**: introduce hazards (spikes) como castigo por trayectoria → lectura de zonas peligrosas.
- **Nivel 6**: introduce empuje de bloques → usar bloque como herramienta de stop/ajuste.
- **Nivel 7**: hazards + corredores → compromiso de trayectoria con castigo (más control espacial).
- **Nivel 8**: sala abierta con salida estándar → (placeholder) espacio para introducir un concepto nuevo (p.ej. pasajes o restauración más explícita).
- **Nivel 9**: empuje de bloque en sala abierta → planificación de secuencia con tool-block.
- **Nivel 10**: introduce “pilares” sólidos (stone) cerca del centro → restricciones quirúrgicas en espacio relativamente abierto.

## Observaciones y próximos ajustes recomendados
- **Nivel 8**: actualmente es muy similar a niveles 1/6/9 (abierto + salida 2x2). Recomendación: convertirlo en “sala de restauración” (forzar volver a square antes del exit) o introducir pasaje `passage_*` como check de forma.
- **Señalética/antorchas**: ya añadidas como entidades decorativas en todos los niveles para reforzar identidad de “dungeon authored”.

