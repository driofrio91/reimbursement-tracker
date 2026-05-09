# MVP Scope

> Documento historico de cierre V1. Referencia de baseline, no version activa.

## Objetivo

Definir el recorte operativo de V1 para sustituir el Excel sin sobredimensionar.

## V1 incluida

### Entidades

- `User`
- `Insurer`
- `Person`
- `ReimbursableService`
- `Invoice`

### Flujo funcional

1. login
2. crear servicio reembolsable
3. autogenerar facturas del servicio
4. listar servicios
5. ver detalle de servicio
6. listar y buscar facturas
7. ver detalle de factura
8. completar informacion de factura
9. completar `claimReference`
10. resolver factura como `PAID` o `REJECTED`
11. ver resumen operativo de facturado, esperado y pagado

### Buscador de facturas V1

Filtros iniciales acordados:

- `invoiceNumber`
- `claimReference`
- `status`

Reglas funcionales de V1 para esta vista:

- filtros combinados con AND
- `invoiceNumber` y `claimReference` con busqueda parcial case-insensitive
- `status` opcional de seleccion unica
- orden por defecto por `updatedAt` descendente
- sin paginacion en esta primera iteracion

### Detalle de factura V1

- ruta: `/invoices/[id]`
- alcance inicial: lectura operativa de la factura
- debe incluir enlace directo a `/services/[id]` para operar el ciclo por etapas

### Configuracion por servicio

- `invoiceBilledAmount` (default `55`)
- `invoiceExpectedAmount` (default `49.5`)

### Regla de cantidad de facturas

- `invoiceCount = ceil(actualAmount / invoiceExpectedAmount)`
- siempre igualar o superar
- si se supera, mostrar aviso sin bloquear

### Estados persistidos de V1

#### `ReimbursableService`

- `REGISTERED`
- `SUBMITTED`
- `REIMBURSED`

#### `Invoice`

- `CREATED`
- `INFORMATION_COMPLETED`
- `CLAIM_REFERENCE_COMPLETED`
- `PAID`
- `REJECTED`

### Reglas de transicion de estado de factura V1

| Estado actual | Accion | Estado destino | Permitida | Regla |
|---|---|---|---|---|
| `CREATED` | completar informacion | `INFORMATION_COMPLETED` | si | requiere `invoiceNumber`, `invoiceDate`, `issuerName` |
| `CREATED` | registrar referencia | `CLAIM_REFERENCE_COMPLETED` | no | no se permite salto de etapa |
| `CREATED` | marcar pagada/rechazada | `PAID`/`REJECTED` | no | no se permite salto de etapa |
| `INFORMATION_COMPLETED` | completar informacion | `INFORMATION_COMPLETED` | no | no se permite re-confirmacion de etapa |
| `INFORMATION_COMPLETED` | registrar referencia | `CLAIM_REFERENCE_COMPLETED` | si | mantiene validacion de datos de factura completos |
| `INFORMATION_COMPLETED` | marcar pagada/rechazada | `PAID`/`REJECTED` | no | no se permite salto de etapa |
| `CLAIM_REFERENCE_COMPLETED` | completar informacion | `INFORMATION_COMPLETED` | no | no se permite retroceso de etapa |
| `CLAIM_REFERENCE_COMPLETED` | registrar referencia | `CLAIM_REFERENCE_COMPLETED` | no | no se permite re-confirmacion de etapa |
| `CLAIM_REFERENCE_COMPLETED` | marcar pagada | `PAID` | si | requiere `paidAmount > 0` y `paidAt` |
| `CLAIM_REFERENCE_COMPLETED` | marcar rechazada | `REJECTED` | si | `rejectionReason` opcional |
| `PAID` | corregir estado final | `REJECTED` | si | requiere `correctionReason` |
| `REJECTED` | corregir estado final | `PAID` | si | requiere `correctionReason`, `paidAmount > 0`, `paidAt` |
| `PAID`/`REJECTED` | acciones normales de etapa | cualquier otro | no | solo se permite cambio por correccion final |

### Matriz de escenarios limite para estado global de servicio

Regla operativa vigente:

- `REGISTERED`: existe al menos una factura en `CREATED` o `INFORMATION_COMPLETED`
- `SUBMITTED`: no hay facturas en etapas iniciales y el caso no esta totalmente cerrado
- `REIMBURSED`: todas las facturas estan en `PAID` o `REJECTED`

| Caso | Estados de facturas (entrada) | Estado esperado |
|---|---|---|
| `A1` | `[]` | `REGISTERED` |
| `A2` | `[CREATED]` | `REGISTERED` |
| `A3` | `[INFORMATION_COMPLETED]` | `REGISTERED` |
| `A4` | `[CLAIM_REFERENCE_COMPLETED]` | `SUBMITTED` |
| `A5` | `[PAID]` | `REIMBURSED` |
| `A6` | `[REJECTED]` | `REIMBURSED` |
| `A7` | `[PAID, REJECTED]` | `REIMBURSED` |
| `A8` | `[CLAIM_REFERENCE_COMPLETED, PAID]` | `SUBMITTED` |
| `A9` | `[CLAIM_REFERENCE_COMPLETED, REJECTED]` | `SUBMITTED` |
| `A10` | `[PAID, INFORMATION_COMPLETED]` | `REGISTERED` |
| `A11` | `[REJECTED, CREATED]` | `REGISTERED` |
| `A12` | `[CLAIM_REFERENCE_COMPLETED, CLAIM_REFERENCE_COMPLETED]` | `SUBMITTED` |
| `A13` | `[PAID, PAID, REJECTED]` | `REIMBURSED` |
| `A14` | `[CREATED, CLAIM_REFERENCE_COMPLETED, PAID]` | `REGISTERED` |

### Matriz de escenarios limite para resultado economico

Regla vigente para `reimbursementOutcome`:

- `FULL`: `totalPaidAmount >= totalExpectedAmount` y `totalExpectedAmount > 0`
- `PARTIAL`: `totalPaidAmount > 0` y `totalPaidAmount < totalExpectedAmount`
- `NONE`: `totalPaidAmount === 0` y todas las facturas resueltas (`PAID`/`REJECTED`)
- fallback operativo: `PARTIAL`

| Caso | `totalExpectedAmount` | `totalPaidAmount` | Todas resueltas | Resultado esperado |
|---|---:|---:|---|---|
| `B1` | 100 | 100 | si | `FULL` |
| `B2` | 90 | 100 | si | `FULL` |
| `B3` | 100 | 20 | si | `PARTIAL` |
| `B4` | 100 | 20 | no | `PARTIAL` |
| `B5` | 100 | 0 | si | `NONE` |
| `B6` | 100 | 0 | no | `PARTIAL` |
| `B7` | 0 | 0 | si | `NONE` |
| `B8` | 0 | 10 | si | `PARTIAL` |
| `B9` | 150 | 74.99 | si | `PARTIAL` |
| `B10` | 150 | 150.01 | si | `FULL` |

### Regla de referencia

- `claimReference` vive en `Invoice`
- varias facturas pueden compartir la misma `claimReference`

### Regla de pago

- `paidAmount` se propone con el esperado por defecto
- `paidAmount` es editable

## V1 excluida

- importacion historica desde Excel
- adjuntos
- notas estructuradas como entidad separada
- dashboard analitico avanzado
- auditoria avanzada
- permisos finos y gestion avanzada de usuarios

## V2 orientativa

- ampliar trazabilidad avanzada
- importacion y limpieza asistida de historico
