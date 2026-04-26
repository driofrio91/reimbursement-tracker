# MVP Scope

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
6. completar informacion de factura
7. completar `claimReference`
8. resolver factura como `PAID` o `REJECTED`
9. ver resumen operativo de facturado, esperado y pagado

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

### Reglas de solicitud

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
