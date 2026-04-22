# Start Here

## Objetivo de este documento

Este documento es el punto de entrada unico para retomar el proyecto en un hilo nuevo o por otro modelo sin perder contexto.

Su funcion es resumir:

- que es el proyecto
- que decisiones ya estan cerradas
- que entra en V1
- que queda para V2
- como debe arrancar la implementacion

Si alguien nuevo entra a trabajar en este repositorio, debe leer primero este archivo.

## Proyecto

- Nombre: `reimbursement-tracker`
- Tipo: aplicacion interna de backoffice
- Objetivo principal: sustituir el Excel actual por una aplicacion web para controlar servicios, facturas, solicitudes de reembolso y su resolucion

## Problema que resuelve

Actualmente el control se hace en Excel y presenta estas limitaciones:

- dificultad para seguir estados reales
- dificultad para agrupar varias facturas dentro de un mismo servicio
- dificultad para agrupar varias facturas dentro de una misma solicitud
- trazabilidad pobre de rechazos, pagos y reenvios
- poca visibilidad de pendientes y casos abiertos

La aplicacion debe convertirse en la fuente de verdad operativa.

## Regla principal del proyecto

Si una pieza no ayuda de forma directa a sustituir el Excel en la operativa diaria, no entra en V1.

## Estado actual de decisiones

Todo esto ya esta decidido y no debe reabrirse salvo necesidad real:

### Stack aprobado

- `Next.js`
- `TypeScript`
- `Auth.js`
- `Prisma`
- `PostgreSQL`
- `Neon`
- `Vercel`
- `shadcn/ui`

### Criterios tecnicos aprobados

- arquitectura limpia ligera por modulos
- dominio desacoplado del framework y de Prisma
- autenticacion minima con `email + password`
- dos usuarios fijos inicialmente
- auditoria basica
- coste minimo usando free tiers
- interfaz inicial en espanol

### Decisiones de alcance aprobadas

- adjuntos fuera del MVP
- importacion historica fuera de la primera iteracion
- no sobredimensionar V1
- V1 centrada en sustituir el Excel de forma operativa

## Estado actual implementado

La base tecnica del proyecto ya no esta vacia. A dia de hoy ya existe:

- proyecto `Next.js` inicializado en la raiz
- estructura base bajo `src/`
- `Prisma` conectado a `Neon`
- migracion inicial aplicada
- seed de desarrollo disponible
- `Auth.js` con `email + password`
- `/login` publica y `/` protegida
- flujo de servicios cerrado (`crear`, `listar`, `detalle`)
- primer flujo de facturas activo: alta de factura en `/services/[id]`
- feedback de operaciones con toast en el area privada

La referencia operativa para este estado es `docs/09-current-status.md`.

El orden detallado de casos de uso a implementar a partir de aqui vive en `docs/10-use-cases-roadmap.md`.

## Modelo mental del dominio

El dominio distingue entre tres piezas principales que no deben confundirse:

### 1. Servicio reembolsable

Es el gasto real o tratamiento original.

Ejemplo:

- tratamiento de `200 EUR`

### 2. Factura

Es cada documento individual emitido para cubrir parte o todo el importe del servicio.

Cada factura sigue su propio ciclo. Si una factura es rechazada, no se reutiliza.

### 3. Solicitud de reembolso

Es la presentacion real en el portal.

Una solicitud puede agrupar una o varias facturas.

## Relaciones clave del negocio

- un servicio puede tener varias facturas
- varias facturas pueden agruparse en una misma solicitud
- una factura solo puede estar en una unica solicitud
- si una factura es rechazada, se crea otra factura nueva para seguir cubriendo el servicio

## V1 aprobada

La V1 no implementa todo el sistema documentado. Implementa el minimo necesario para operar mejor que el Excel.

### Entidades de V1

- `User`
- `Insurer`
- `Person`
- `ReimbursableService`
- `Invoice`
- `ReimbursementRequest`

### Entidades fuera de V1

- `Attachment`
- `Note`
- `PolicyHolder` como entidad separada
- `StatusHistory` completo

### Estados persistidos en V1

#### `ReimbursableService`

- `registered`
- `submitted`
- `reimbursed`

#### `Invoice`

- `received`
- `submitted`
- `rejected`
- `reimbursed`

#### `ReimbursementRequest`

- `submitted`
- `reimbursed`
- `rejected`

### Estados derivados solo en UI o logica

- parcialmente facturado
- sobrefacturado
- parcialmente reembolsado

### Funcionalidad incluida en V1

- login
- crear servicio reembolsable
- listar servicios
- ver detalle de servicio
- crear o vincular factura
- calcular importe pendiente por cubrir
- mostrar aviso de sobrefacturacion
- crear solicitud con una o varias facturas
- registrar referencia externa
- marcar facturas como reembolsadas o rechazadas
- crear una nueva factura si una anterior fue rechazada y sigue faltando importe por cubrir
- filtros basicos por estado, persona y fecha

## V2 aprobada

Todo esto queda explicitamente para despues:

- importacion historica desde Excel
- adjuntos
- notas estructuradas
- dashboard analitico avanzado
- auditoria avanzada
- estados persistidos mas ricos
- gestion de usuarios desde la app
- recuperacion de contrasena
- permisos mas finos

### Importante

La V2 sigue respetando estas reglas ya cerradas:

- una factura solo puede estar en una unica solicitud
- una factura rechazada no se reutiliza
- si un servicio sigue necesitando cubrir importe, se crea una factura nueva

La V2 anade capacidad y comodidad, pero no reintroduce el modelo descartado de reutilizacion de facturas.

## Arquitectura aprobada

La arquitectura elegida es limpia ligera por modulos.

### Regla de capas

- `ui` puede depender de `application`
- `application` puede depender de `domain`
- `infrastructure` puede depender de `application` y `domain`
- `domain` no depende de ninguna otra capa

### Regla importante

No meter logica de negocio en:

- componentes React
- paginas de Next.js
- server actions
- route handlers
- consultas Prisma en bruto

### Papel de Prisma

Prisma es infraestructura.

Sirve para:

- definir persistencia
- ejecutar consultas
- implementar repositorios

No representa:

- el dominio
- los casos de uso
- la logica de negocio

### Estructura prevista

```text
src/
  app/
  modules/
    reimbursement/
      domain/
      application/
      infrastructure/
      ui/
  lib/
    db/
    auth/
    config/
```

## Primera iteracion aprobada

La primera iteracion tecnica debe incluir solo:

1. login
2. creacion de servicio reembolsable
3. listado de servicios
4. detalle de servicio

### Estado de esa primera iteracion

- `login`: ya implementado
- `creacion de servicio reembolsable`: ya implementado
- `listado de servicios`: ya implementado
- `detalle de servicio`: ya implementado

Esto se eligio para validar de forma controlada:

- autenticacion
- arquitectura
- persistencia
- primer caso de uso real

## Orden recomendado de implementacion

1. inicializar proyecto `Next.js`
2. montar estructura de carpetas de la arquitectura
3. configurar `Prisma` y conexion con `Neon`
4. definir `schema.prisma` de V1
5. montar `Auth.js`
6. crear seed de los 2 usuarios
7. implementar primer caso de uso: creacion de servicio
8. implementar listado y detalle
9. continuar con facturas, solicitudes y resolucion

### Estado del orden de implementacion

- pasos `1` a `8`: ya completados
- siguiente paso real: `9. continuar con facturas, solicitudes y resolucion`

## Testing aprobado

### Si entra en V1

- tests de casos de uso
- tests de funcionalidad critica

### Si no entra en V1

- e2e completos
- estrategia de testing mas pesada

### Funcionalidad critica identificada

- creacion de servicio reembolsable
- calculo de importes facturados
- deteccion de sobrefacturacion
- creacion de solicitud con varias facturas
- resolucion de solicitud y actualizacion de estados
- creacion de una nueva factura cuando exista rechazo y siga faltando importe por cubrir

## Coste y despliegue

### Objetivo

Mantener coste cero inicial usando free tiers.

### Plataforma aprobada

- app: `Vercel`
- base de datos: `Neon`

### Realidad asumida

El proyecto busca coste cero inicial, pero no se documenta como garantia eterna.

Los tiers gratuitos pueden cambiar.

## Documentos de referencia

Leer estos documentos en este orden:

1. `README.md`
2. `09-current-status.md`
3. `10-use-cases-roadmap.md`
4. `sessions/README.md`
5. ultimo archivo de `sessions/`
6. `07-mvp-scope.md`
7. `06-technical-decisions.md`
8. `05-system-architecture.md`
9. `08-engineering-guidelines.md`
10. `04-data-model.md`
11. `03-user-flows.md`
12. `02-business-rules.md`
13. `01-product-vision.md`
14. `00-overview.md`

## Instrucciones para un nuevo hilo

Si este proyecto se retoma en un hilo nuevo, usar este prompt base:

```md
Proyecto: `reimbursement-tracker`

Lee primero:
- `docs/START-HERE.md`
- `docs/09-current-status.md`
- `docs/10-use-cases-roadmap.md`
- ultimo archivo de `docs/sessions/`
- `docs/07-mvp-scope.md`
- `docs/06-technical-decisions.md`
- `docs/05-system-architecture.md`

Contexto obligatorio:
- No sobredimensionar.
- V1 solo debe sustituir el Excel a nivel operativo.
- Si una pieza no ayuda directamente a ese objetivo, no entra en V1.
- Mantener la arquitectura limpia ligera ya aprobada.
- No reabrir decisiones ya cerradas salvo necesidad real.

Continua la implementacion siguiendo el alcance minimo definido y propon el siguiente paso tecnico concreto a partir del estado actual del repositorio.
```

## Decision final

El proyecto ya tiene requisitos, arquitectura, stack y alcance cerrados.

La primera iteracion funcional de servicios ya esta cerrada y el primer caso de uso de facturas (`CreateInvoiceForServiceUseCase`) tambien esta implementado.

El siguiente foco es `ListInvoicesByServiceUseCase` y la visibilidad operativa de importes pendientes/sobrefacturacion, manteniendo la disciplina de testing por caso de uso.
