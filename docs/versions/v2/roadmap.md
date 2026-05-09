# V2 Roadmap

## Objetivo

Evolucionar la operativa de facturas desde correccion final unica hacia trazabilidad historica completa de correcciones.

## Estado

- version activa: `v2`
- baseline funcional previa: `docs/versions/v1/`

## Backlog prioritario

1. trazabilidad historica de correcciones de estado final en factura
2. consulta de historial en UI movil-first con lectura clara
3. preparacion de flujo de prerelease a staging/preview sin afectar produccion

## Primer bloque en ejecucion

- pasar de "ultima correccion" a historial completo por factura
- definir modelo de eventos de correccion con auditoria
- mantener compatibilidad con flujo actual de resolucion

## Definition of Done por US

- caso de uso implementado en capa `application`
- reglas de negocio en `domain` o `application`, no en UI
- actualizacion de estado en `docs/09-current-status.md`
- actualizacion de roadmap V2 si cambia prioridad o alcance
