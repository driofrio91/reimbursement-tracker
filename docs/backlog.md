# Backlog

## Objetivo

Centralizar tareas y mejoras fuera del alcance cerrado de V2 (`P0-P5`) para priorizar V3 o versiones posteriores.

## Estado de referencia

- V2 cerrada funcionalmente con `P0-P5`.
- Fuente de cierre: `docs/versions/v2/roadmap.md`.

## Candidatos para V3+

### 1) Historial completo de correcciones por factura
- Persistir multiples correcciones por factura (no solo la ultima).
- Registrar trazabilidad completa: estado origen, estado destino, actor, fecha, motivo y cambios de importe/fecha.
- Exponer timeline de correcciones en UI de detalle de factura y/o detalle de servicio.
- Cubrir con tests de regresion para correcciones encadenadas.

### 2) Modelo de anualidades por usuario (evaluacion)
- Evaluar si conviene evolucionar de `InsuranceHolderAnnualReimbursementLimit` a modelo por usuario, segun operativa final del producto.
- Definir estrategia de migracion de datos y compatibilidad retroactiva.

### 3) Alertas de sobrepaso de limite anual
- Mostrar alerta preventiva al editar/marcar pagos que puedan sobrepasar limite anual.
- Hacer visible a que anualidad impacta cada factura en los flujos operativos.

### 4) Endurecimiento de seguridad y routing
- Evaluar adopcion de `middleware` para centralizar reglas de acceso al crecer rutas privadas.
- Criterio de activacion: duplicacion de guards o nuevas areas con permisos distintos.

### 5) Mejora de observabilidad de acciones sensibles
- Definir auditoria minima extendida para operaciones criticas (correcciones, limites, catalogos).
- Estandarizar eventos de exito/error para soporte operativo.

### 6) UX y eficiencia operativa en facturas
- Evaluar paginacion o virtualizacion para `/invoices` si crece volumen.
- Mantener criterio de orden por ultima actualizacion en buscador global y revisar filtros avanzados si aplica.

## Regla de mantenimiento

- Todo nuevo item fuera del alcance de la version activa debe registrarse aqui.
- Al planificar una nueva version, mover desde este backlog al roadmap correspondiente.
